import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { withAuth } from '@/lib/auth-server';

const DAYS = 56; // 8 weeks, matches the heatmap's 7x8 grid

function levelFor(total: number): number {
    if (total <= 0) return 0;
    if (total === 1) return 1;
    if (total <= 3) return 2;
    if (total <= 6) return 3;
    return 4;
}

// GET /api/activity/heatmap
// Real per-day engagement for the signed-in user over the last 8 weeks —
// dashboard visits, course visits, and site visits combined — for the
// "Institutional Engagement" heatmap on the student dashboard.
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setUTCDate(start.getUTCDate() - (DAYS - 1));

        const startKey = start.toISOString().slice(0, 10);
        const endKey = end.toISOString().slice(0, 10);

        const logs = await ActivityLog.find({
            userId: auth.uid,
            date: { $gte: startKey, $lte: endKey },
        }).lean<{ date: string; total: number; dashboardVisits: number; courseVisits: number; siteVisits: number }[]>();

        const byDate = new Map(logs.map((l) => [l.date, l]));

        const cells = [];
        for (let i = 0; i < DAYS; i++) {
            const d = new Date(start);
            d.setUTCDate(d.getUTCDate() + i);
            const key = d.toISOString().slice(0, 10);
            const log = byDate.get(key);
            const total = log?.total || 0;
            cells.push({
                date: key,
                total,
                dashboardVisits: log?.dashboardVisits || 0,
                courseVisits: log?.courseVisits || 0,
                siteVisits: log?.siteVisits || 0,
                level: levelFor(total),
            });
        }

        return NextResponse.json({ cells });
    } catch (err: any) {
        console.error('GET /api/activity/heatmap failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
