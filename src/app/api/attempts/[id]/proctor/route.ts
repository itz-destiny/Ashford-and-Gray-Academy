import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import { AuthError, withAuth } from '@/lib/auth-server';
import { finalizeAttempt, savedAnswers } from '@/lib/grade-attempt';
import { EVENT_TYPES, MAX_VIOLATIONS, VIOLATION_DEDUPE_MS, VIOLATION_TYPES, isProctored } from '@/lib/proctoring';

type RouteParams = { params: Promise<{ id: string }> };

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('attempts/[id]/proctor route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

const bodySchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('heartbeat'), cameraOk: z.boolean().optional(), device: z.enum(['phone', 'computer']).optional() }),
    z.object({ kind: z.literal('violation'), type: z.enum(VIOLATION_TYPES), detail: z.string().max(200).optional() }),
    z.object({ kind: z.literal('event'), type: z.enum(EVENT_TYPES), detail: z.string().max(200).optional() }),
]);

function stateOf(attempt: any) {
    return {
        status: attempt.status,
        violationCount: attempt.proctoring?.violations?.length || 0,
        maxViolations: MAX_VIOLATIONS,
        autoSubmitted: !!attempt.proctoring?.autoSubmitted,
    };
}

// =============================================================================
// POST /api/attempts/[id]/proctor — the student's own exam page reports a
// heartbeat, a counted violation, or a logged (uncounted) event. Violations
// are counted server-side; on the MAX_VIOLATIONS-th the attempt is submitted
// right here with the last autosaved answers, so a tampered client can't
// skip the auto-submit.
// =============================================================================
export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        const parsed = bodySchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
        const body = parsed.data;

        await dbConnect();
        const attempt = await Attempt.findById(id);
        if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        if (attempt.userId !== auth.uid) return NextResponse.json({ error: 'Not your attempt.' }, { status: 403 });

        const assessment = await Assessment.findById(attempt.assessmentId).lean<any>();
        if (!assessment || !isProctored(assessment)) {
            return NextResponse.json({ error: 'This assessment is not proctored.' }, { status: 400 });
        }
        if (attempt.status !== 'in_progress') {
            return NextResponse.json(stateOf(attempt));
        }

        const now = new Date();

        if (body.kind === 'heartbeat') {
            const set: Record<string, unknown> = { 'proctoring.lastSeenAt': now };
            if (body.cameraOk !== undefined) set['proctoring.cameraOk'] = body.cameraOk;
            if (body.device) set['proctoring.device'] = body.device;
            await Attempt.updateOne({ _id: id }, { $set: set });
            return NextResponse.json(stateOf(attempt));
        }

        if (body.kind === 'event') {
            await Attempt.updateOne(
                { _id: id },
                {
                    $push: { 'proctoring.events': { $each: [{ type: body.type, at: now, detail: body.detail }], $slice: -500 } },
                    $set: { 'proctoring.lastSeenAt': now },
                },
            );
            return NextResponse.json(stateOf(attempt));
        }

        // Counted violation. The filter on lastViolationAt makes the dedupe
        // atomic: two reports of the same incident (alt-tab fires blur AND
        // visibilitychange) arriving together can't both be counted.
        const cutoff = new Date(now.getTime() - VIOLATION_DEDUPE_MS);
        const updated = await Attempt.findOneAndUpdate(
            {
                _id: id,
                status: 'in_progress',
                $or: [
                    { 'proctoring.lastViolationAt': { $exists: false } },
                    { 'proctoring.lastViolationAt': { $lte: cutoff } },
                ],
            },
            {
                $push: { 'proctoring.violations': { type: body.type, at: now, detail: body.detail } },
                $set: { 'proctoring.lastSeenAt': now, 'proctoring.lastViolationAt': now },
            },
            { new: true },
        );
        const current = updated || await Attempt.findById(id);
        if (!current) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

        const count = current.proctoring?.violations?.length || 0;
        if (current.status === 'in_progress' && count >= MAX_VIOLATIONS) {
            current.set('proctoring.autoSubmitted', true);
            await finalizeAttempt(current, assessment, savedAnswers(current), 'violations');
        }

        return NextResponse.json({ ...stateOf(current), counted: !!updated });
    } catch (err) {
        return handleError(err);
    }
});
