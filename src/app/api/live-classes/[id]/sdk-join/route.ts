import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import Enrollment from '@/models/Enrollment';
import { getFreshZoomStartUrl } from '@/lib/zoom';
import { getZoomAccounts } from '@/lib/zoom-hosts';
import { generateZoomSdkSignature } from '@/lib/zoom-sdk-signature';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET /api/live-classes/[id]/sdk-join — everything the embedded Meeting SDK
// room needs to join without ever showing a Zoom sign-in screen: a signed
// JWT, the meeting number/passcode, and (host only) a fresh ZAK. Callers
// never see a real Zoom account — students join as anonymous participants,
// instructors join as host using the shared seat's ZAK.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const liveClass = await LiveClass.findById(id);
        if (!liveClass) {
            return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
        }

        const isHost = auth.role === 'admin' || liveClass.instructorId === auth.uid;
        if (!isHost) {
            const enrolled = await Enrollment.findOne({ userId: auth.uid, courseId: liveClass.courseId });
            if (!enrolled) {
                return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
            }
        }

        let passcode = '';
        try {
            passcode = new URL(liveClass.zoomJoinUrl).searchParams.get('pwd') || '';
        } catch {
            // no-op — meetings created without a passcode simply join without one
        }

        const role: 0 | 1 = isHost ? 1 : 0;
        const signature = generateZoomSdkSignature(liveClass.zoomMeetingId, role);

        let zak: string | undefined;
        if (isHost) {
            if (!liveClass.zoomAccountKey) {
                return NextResponse.json({ error: 'This class has no Zoom host recorded.' }, { status: 400 });
            }
            const account = getZoomAccounts().find((a) => a.key === liveClass.zoomAccountKey);
            if (!account) {
                return NextResponse.json({ error: 'The Zoom account this class was scheduled under is no longer configured.' }, { status: 500 });
            }
            const startUrl = await getFreshZoomStartUrl(account, liveClass.zoomMeetingId);
            zak = new URL(startUrl).searchParams.get('zak') || undefined;
        }

        return NextResponse.json({
            success: true,
            sdkKey: process.env.ZOOM_SDK_KEY,
            signature,
            meetingNumber: liveClass.zoomMeetingId,
            passcode,
            topic: liveClass.topic,
            userName: auth.displayName || (isHost ? 'Instructor' : 'Student'),
            role,
            zak,
        });
    } catch (error: any) {
        console.error('GET /api/live-classes/[id]/sdk-join failed:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
