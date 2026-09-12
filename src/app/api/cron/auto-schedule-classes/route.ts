import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { findUnscheduledSessions, scheduleClassForSession } from '@/lib/schedule-class';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Runs daily. Creates the real Zoom meeting for every real timetable
// session in the next 24-48h window that hasn't been scheduled yet — the
// academy's programme office no longer has to remember to click "Create
// Zoom Class" for each session by hand. Sessions missing a course, a
// lecturer, or a module (leftover blank/duplicate rows from the timetable
// import) are skipped, not created.
//
// A 24-48h lookahead (not just "tomorrow") means a day that's missed for
// any reason (a deploy, a Zoom outage) still gets caught by the next run.
export async function GET(req: NextRequest): Promise<Response> {
    if (!isAuthorizedCronCaller(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const now = new Date();
        const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const sessions = await findUnscheduledSessions(now, horizon);

        const scheduled: any[] = [];
        const skipped: any[] = [];

        for (const session of sessions) {
            try {
                const result = await scheduleClassForSession(session);
                if (result.ok && !result.alreadyScheduled) {
                    scheduled.push({
                        id: session._id.toString(),
                        programme: session.programmeName,
                        module: session.module,
                        lecturer: session.lecturerName,
                        startTime: session.startTime,
                        zoomJoinUrl: result.liveClass.zoomJoinUrl,
                    });
                } else if (!result.ok) {
                    skipped.push({ id: session._id.toString(), programme: session.programmeName, reason: result.reason });
                }
            } catch (err: any) {
                skipped.push({ id: session._id.toString(), programme: session.programmeName, reason: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            windowStart: now.toISOString(),
            windowEnd: horizon.toISOString(),
            sessionsConsidered: sessions.length,
            scheduled,
            skipped,
        });
    } catch (err: any) {
        console.error('auto-schedule-classes cron failed:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
}

function isAuthorizedCronCaller(req: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return process.env.NODE_ENV !== 'production';
    }
    const header = req.headers.get('authorization') ?? '';
    if (header === `Bearer ${secret}`) return true;
    const url = new URL(req.url);
    if (url.searchParams.get('key') === secret) return true;
    return false;
}
