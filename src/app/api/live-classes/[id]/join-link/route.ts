import { NextResponse, type NextRequest } from 'next/server';
import { adminOnlyRoomIds } from '@/lib/exam-access';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { getFreshZoomStartUrl } from '@/lib/zoom';
import { getZoomAccounts } from '@/lib/zoom-hosts';
import { isEligibleForLiveClass } from '@/lib/joint-session';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET /api/live-classes/[id]/join-link — the plain Zoom link for this class,
// so every Join button opens Zoom (app or zoom.us) directly, the same way
// everybody joins from the Zoom link. The host (the class's lecturer or an
// admin) gets a fresh start link so they join as host; everyone else gets the
// normal join link. Students are checked in for attendance here.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const liveClass = await LiveClass.findById(id);
        if (!liveClass) {
            return NextResponse.json({ error: 'This class could not be found.' }, { status: 404 });
        }
        if (liveClass.status === 'cancelled') {
            return NextResponse.json({ error: 'This class was cancelled. Check the timetable for the new time.' }, { status: 410 });
        }

        if (auth.role !== 'admin' && auth.role !== 'student' && (await adminOnlyRoomIds()).has(String(liveClass._id))) {
            return NextResponse.json({ error: 'Only the admin can monitor this exam room.' }, { status: 403 });
        }
        const isHost = auth.role === 'admin' || liveClass.instructorId === auth.uid;
        if (isHost) {
            const account = getZoomAccounts().find((a) => a.key === liveClass.zoomAccountKey);
            if (account) {
                try {
                    const startUrl = await getFreshZoomStartUrl(account, liveClass.zoomMeetingId);
                    return NextResponse.json({ success: true, url: startUrl, role: 'host' });
                } catch (err) {
                    // Fall through to the normal join link rather than blocking the lecturer.
                    console.error('join-link: could not get start link, using join link', err);
                }
            }
            return NextResponse.json({ success: true, url: liveClass.zoomJoinUrl, role: 'host' });
        }

        if (auth.role !== 'live_monitor') {
            const eligible = await isEligibleForLiveClass(auth.uid, id, String(liveClass.courseId));
            if (!eligible) {
                return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
            }
        }

        if (auth.role === 'student') {
            const already = (liveClass.attendees || []).some((a: any) => a.userId === auth.uid);
            if (!already) {
                liveClass.attendees = liveClass.attendees || [];
                liveClass.attendees.push({ userId: auth.uid, email: auth.email, role: auth.role, joinedAt: new Date() } as any);
                await liveClass.save();
            }
        }

        return NextResponse.json({ success: true, url: liveClass.zoomJoinUrl, role: 'participant' });
    } catch (error: any) {
        console.error('GET /api/live-classes/[id]/join-link failed:', error);
        return NextResponse.json({ error: 'Could not open this class. Please try again.' }, { status: 500 });
    }
});
