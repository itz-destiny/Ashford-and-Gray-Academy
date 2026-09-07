import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { resolveCourse } from '@/lib/resolve-course';
import { withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET /api/live-classes/[id]/attendance — basic info for the attendance
// check-in page (topic, course, whether this caller has already checked in).
// Any signed-in user may read this; it reveals nothing sensitive.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { params, auth }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const liveClass = await LiveClass.findById(id).lean<{ topic: string; courseId: string; startTime: Date; attendees?: { userId: string }[] } | null>();
        if (!liveClass) return NextResponse.json({ error: 'Live class not found' }, { status: 404 });

        const course = await resolveCourse(liveClass.courseId);
        const alreadyCheckedIn = (liveClass.attendees || []).some((a) => a.userId === auth.uid);

        return NextResponse.json({
            topic: liveClass.topic,
            courseTitle: course?.title || 'Unknown course',
            startTime: liveClass.startTime,
            alreadyCheckedIn,
        });
    } catch (err: any) {
        console.error('GET /api/live-classes/[id]/attendance failed:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
});

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
