import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

// GET - Fetch audit logs with filtering
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');
        const resource = searchParams.get('resource');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');

        // Build query
        const query: any = {};
        if (role) query.role = role;
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (resource) query.resource = resource;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create audit log entry
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const {
            userId,
            userEmail,
            userName,
            role,
            action,
            resource,
            resourceId,
            metadata,
            status,
            errorMessage
        } = body;

        // Validate required fields
        if (!userId || !userEmail || !userName || !role || !action || !resource) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get IP and user agent from headers
        const ipAddress = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // Create audit log
        const auditLog = await AuditLog.create({
            userId,
            userEmail,
            userName,
            role,
            action,
            resource,
            resourceId,
            metadata,
            ipAddress,
            userAgent,
            status: status || 'success',
            errorMessage,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            log: auditLog
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating audit log:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
