import { NextResponse, type NextRequest } from 'next/server';
import { markAllAsRead } from '@/lib/notifications';
import { withAuth } from '@/lib/auth-server';

export const PATCH = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        const result = await markAllAsRead(auth.uid);
        if (!result.success) {
            return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
    }
});
