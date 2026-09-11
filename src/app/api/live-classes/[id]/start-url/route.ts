import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { getFreshZoomStartUrl } from '@/lib/zoom';
import { getZoomAccounts } from '@/lib/zoom-hosts';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET /api/live-classes/[id]/start-url — always issues a freshly-signed Zoom
// start URL rather than a cached one, since the ZAK token embedded in a
// stored start_url expires. The instructor who owns the class, an admin, or
// a live_monitor account may fetch it — a monitor joining via a start_url
// after the instructor is already in gets Zoom's automatic co-host role
// rather than displacing the real host.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const liveClass = await LiveClass.findById(id);
        if (!liveClass) {
            return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
        }
        const canStart = auth.role === 'admin' || auth.role === 'live_monitor' || liveClass.instructorId === auth.uid;
        if (!canStart) {
            return NextResponse.json({ error: 'You can only start a class you are hosting.' }, { status: 403 });
        }
        if (!liveClass.zoomAccountKey) {
            return NextResponse.json({ error: 'This class has no Zoom host recorded.' }, { status: 400 });
        }

        const account = getZoomAccounts().find((a) => a.key === liveClass.zoomAccountKey);
        if (!account) {
            return NextResponse.json({ error: 'The Zoom account this class was scheduled under is no longer configured.' }, { status: 500 });
        }

        const startUrl = await getFreshZoomStartUrl(account, liveClass.zoomMeetingId);
        return NextResponse.json({ success: true, startUrl });
    } catch (error: any) {
        console.error('GET /api/live-classes/[id]/start-url failed:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
