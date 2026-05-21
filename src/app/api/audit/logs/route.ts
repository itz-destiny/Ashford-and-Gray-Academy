import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const resource = searchParams.get('resource');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500);
        const page = parseInt(searchParams.get('page') || '1', 10) || 1;

        const query: Record<string, unknown> = {};
        if (role) query.role = role;
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (resource) query.resource = resource;
        if (startDate || endDate) {
            query.timestamp = {} as Record<string, Date>;
            if (startDate) (query.timestamp as Record<string, Date>).$gte = new Date(startDate);
            if (endDate) (query.timestamp as Record<string, Date>).$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            AuditLog.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});

// POST is authenticated: the verified user's identity is recorded, not what
// the client claims. This stops impersonation in the audit trail.
const postSchema = z.object({
    action: z.string().min(1).max(120),
    resource: z.string().min(1).max(120),
    resourceId: z.string().max(120).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    status: z.enum(['success', 'failure']).optional(),
    errorMessage: z.string().max(2000).optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const ipAddress =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const auditLog = await AuditLog.create({
            userId: auth.uid,
            userEmail: auth.email,
            userName: auth.displayName,
            role: auth.role,
            action: parsed.data.action,
            resource: parsed.data.resource,
            resourceId: parsed.data.resourceId,
            metadata: parsed.data.metadata,
            ipAddress,
            userAgent,
            status: parsed.data.status || 'success',
            errorMessage: parsed.data.errorMessage,
            timestamp: new Date(),
        });
        return NextResponse.json({ success: true, log: auditLog }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating audit log:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});
