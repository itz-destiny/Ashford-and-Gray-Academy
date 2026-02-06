import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { getUnreadCount } from '@/lib/notifications';

// GET /api/notifications - Fetch user's notifications
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Get user ID from session/auth (you'll need to implement this based on your auth)
        const userId = req.headers.get('x-user-id'); // Temporary - replace with actual auth

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const type = searchParams.get('type');

        // Build query
        const query: any = { userId };
        if (unreadOnly) query.read = false;
        if (type) query.type = type;

        // Fetch notifications
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Get unread count
        const unreadCount = await getUnreadCount(userId);

        // Get total count
        const total = await Notification.countDocuments({ userId });

        return NextResponse.json({
            notifications,
            unreadCount,
            total
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { userId, type, title, message, actionUrl, metadata } = body;

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            actionUrl,
            metadata
        });

        return NextResponse.json({ success: true, notification }, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
