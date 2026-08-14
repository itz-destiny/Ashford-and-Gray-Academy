import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { withAuth } from '@/lib/auth-server';

const pingSchema = z.object({
    type: z.enum(['dashboard', 'course', 'site']),
});

const COUNTER_FIELD: Record<string, string> = {
    dashboard: 'dashboardVisits',
    course: 'courseVisits',
    site: 'siteVisits',
};

// POST /api/activity/ping
// Fired once per page load from the dashboard, a course viewer, and the
// public site shell. Increments today's counter for the signed-in user —
// this is what feeds the "Institutional Engagement" heatmap.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = pingSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        await dbConnect();

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const field = COUNTER_FIELD[parsed.data.type];

        await ActivityLog.findOneAndUpdate(
            { userId: auth.uid, date: today },
            { $inc: { [field]: 1, total: 1 } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('POST /api/activity/ping failed:', err);
        // Activity tracking is best-effort — never surface a hard failure to the client.
        return NextResponse.json({ success: false }, { status: 200 });
    }
});
