import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { totalMonitorSlots } from '@/lib/monitor-slots';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admin/live-monitor-slots route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/admin/live-monitor-slots — how many real concurrent Zoom capacity
// slots exist right now, and which are already assigned to a dedicated
// monitor account. Powers the slot picker on the Create User dialog.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
        await dbConnect();

        const totalSlots = totalMonitorSlots();
        const assigned = await User.find({ role: 'live_monitor', monitorSlotIndex: { $exists: true } })
            .select('monitorSlotIndex displayName email')
            .lean<{ monitorSlotIndex: number; displayName: string; email: string }[]>();

        return NextResponse.json({ totalSlots, assigned });
    } catch (err) {
        return handleError(err);
    }
});
