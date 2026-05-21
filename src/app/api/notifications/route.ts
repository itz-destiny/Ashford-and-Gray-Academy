import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { getUnreadCount } from '@/lib/notifications';
import { withAuth } from '@/lib/auth-server';

// Note: there is intentionally no public POST handler. Notifications are
// created by server code via `lib/notifications.ts`. Allowing arbitrary
// authenticated POSTs would let any user spam in-app + email notifications.

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    try {
        await dbConnect();
        const query: Record<string, unknown> = { userId: auth.uid };
        if (unreadOnly) query.read = false;
        if (type) query.type = type;

        const [notifications, unreadCount, total] = await Promise.all([
            Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
            getUnreadCount(auth.uid),
            Notification.countDocuments({ userId: auth.uid }),
        ]);

        return NextResponse.json({ notifications, unreadCount, total });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
});
