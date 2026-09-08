import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { getCurrentClassForSlot, totalMonitorSlots } from '@/lib/monitor-slots';
import { resolveCourse } from '@/lib/resolve-course';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('live-monitor/current route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/live-monitor/current — for the signed-in dedicated monitor
// account: whatever class is live right now in the one Zoom capacity slot
// this account is permanently bound to (or null if that slot is idle).
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['live_monitor']);
        await dbConnect();

        const me = await User.findOne({ uid: auth.uid }).lean<{ monitorSlotIndex?: number } | null>();
        const slotNumber = me?.monitorSlotIndex;
        const totalSlots = totalMonitorSlots();

        if (!slotNumber) {
            return NextResponse.json({ error: 'This account has no monitor slot assigned yet. Ask an admin to assign one.' }, { status: 400 });
        }

        const liveClass = await getCurrentClassForSlot(slotNumber);
        if (!liveClass) {
            return NextResponse.json({ slotNumber, totalSlots, current: null });
        }

        const course = await resolveCourse(liveClass.courseId);

        return NextResponse.json({
            slotNumber,
            totalSlots,
            current: {
                liveClassId: liveClass._id.toString(),
                topic: liveClass.topic,
                courseTitle: course?.title || 'Unknown course',
                startTime: liveClass.startTime,
                durationMinutes: liveClass.durationMinutes,
                zoomJoinUrl: liveClass.zoomJoinUrl,
            },
        });
    } catch (err) {
        return handleError(err);
    }
});
