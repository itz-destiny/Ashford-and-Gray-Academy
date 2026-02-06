import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { markAsRead } from '@/lib/notifications';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        // Get user ID from session/auth
        const userId = req.headers.get('x-user-id'); // Replace with actual auth

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await markAsRead(params.id, userId);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
        }

        return NextResponse.json({ success: true, notification: result.notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { Notification } = await import('@/models/Notification');

        await Notification.findOneAndDelete({ _id: params.id, userId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}
