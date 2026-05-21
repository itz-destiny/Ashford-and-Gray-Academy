import { NextResponse, type NextRequest } from 'next/server';
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
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 500);

        const activities = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
        return NextResponse.json({ success: true, activities, count: activities.length });
    } catch (error: any) {
        console.error('Error fetching activity feed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});
