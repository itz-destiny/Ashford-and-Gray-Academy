import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { markAllAsRead } from '@/lib/notifications';

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await markAllAsRead(userId);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
    }
}
