import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // Fetch recent activity across all roles
        const activities = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            activities,
            count: activities.length
        });

    } catch (error: any) {
        console.error('Error fetching activity feed:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
