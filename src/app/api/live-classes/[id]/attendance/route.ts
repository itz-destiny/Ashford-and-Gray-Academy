import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

export const POST = withAuth<RouteParams>(async (req: NextRequest, { params, auth }: { params: Promise<{ id: string }>; auth: AuthContext }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const liveClass = await LiveClass.findById(id);
        if (!liveClass) return NextResponse.json({ error: 'Live class not found' }, { status: 404 });

        // Avoid duplicate entries for the same user on repeated clicks
        const existing = (liveClass.attendees || []).find((a: any) => a.userId === auth.uid);
        if (!existing) {
            liveClass.attendees = liveClass.attendees || [];
            liveClass.attendees.push({ userId: auth.uid, email: auth.email, role: auth.role, joinedAt: new Date() } as any);
            await liveClass.save();
        }

        return NextResponse.json({ success: true, attendees: liveClass.attendees });
    } catch (err: any) {
        console.error('POST /api/live-classes/[id]/attendance failed:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
});
