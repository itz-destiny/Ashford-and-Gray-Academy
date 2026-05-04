import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { getUnreadCount } from '@/lib/notifications';

// Simple memory-based rate limiting (60 requests per minute)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

function rateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 60;

    let record = rateLimitStore.get(ip);
    if (!record || now > record.resetTime) {
        record = { count: 1, resetTime: now + windowMs };
        rateLimitStore.set(ip, record);
        return true;
    }
    
    if (record.count >= maxRequests) {
        return false;
    }
    
    record.count++;
    rateLimitStore.set(ip, record);
    return true;
}

// GET /api/notifications - Fetch user's notifications
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Basic Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        if (!rateLimit(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

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
