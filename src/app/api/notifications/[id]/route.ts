import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { markAsRead } from '@/lib/notifications';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

export const PATCH = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    const { id } = await params;
    try {
        const result = await markAsRead(id, auth.uid);
        if (!result.success || !result.notification) {
            return NextResponse.json(
                { error: 'Notification not found or not yours.' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, notification: result.notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
});

export const DELETE = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    const { id } = await params;
    try {
        await dbConnect();
        const deleted = await Notification.findOneAndDelete({ _id: id, userId: auth.uid });
        if (!deleted) {
            return NextResponse.json(
                { error: 'Notification not found or not yours.' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
});
