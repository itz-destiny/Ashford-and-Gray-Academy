import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import ProctorSnapshot from '@/models/ProctorSnapshot';
import LiveClass from '@/models/LiveClass';
import { isStudentInRoom, liveParticipantNames, studentRoomCode } from '@/lib/exam-room-presence';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { MAX_VIOLATIONS } from '@/lib/proctoring';

type RouteParams = { params: Promise<{ id: string }> };

const STAFF_ROLES = ['admin', 'instructor', 'course_registrar'] as const;

// =============================================================================
// GET /api/assessments/[id]/proctor — live proctoring feed for staff who
// manage this exam: every attempt with its proctoring record, latest photo
// id, and progress. Polled by the live proctor page.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, STAFF_ROLES);
        const { id } = await params;
        await dbConnect();

        const assessment = await Assessment.findById(id).select('title type status durationMinutes questions createdBy opensAt closesAt proctorLiveClassId').lean<any>();
        if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        const allowed = auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
        if (!allowed) return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });

        const attempts = await Attempt.find({ assessmentId: id })
            .select('userId status startedAt submittedAt submitReason score maxScore answers proctoring')
            .lean<any[]>();

        const users = await User.find({ uid: { $in: attempts.map(a => a.userId) } }).select('uid displayName email').lean<any[]>();
        const userMap = new Map(users.map(u => [u.uid, u]));

        const latest = await ProctorSnapshot.aggregate([
            { $match: { assessmentId: assessment._id } },
            { $sort: { takenAt: -1 } },
            { $group: { _id: '$attemptId', snapshotId: { $first: '$_id' }, takenAt: { $first: '$takenAt' } } },
        ]);
        const latestMap = new Map(latest.map((l: any) => [String(l._id), l]));

        const answerable = (assessment.questions || []).length;
        const rows = attempts.map(a => {
            const p = a.proctoring || {};
            const snap = latestMap.get(String(a._id));
            const answered = (a.answers || []).filter((x: any) =>
                x.selectedOptionIndex !== undefined && x.selectedOptionIndex !== null || (x.textAnswer || '').trim() !== ''
            ).length;
            const u = userMap.get(a.userId);
            return {
                attemptId: String(a._id),
                student: u ? { displayName: u.displayName, email: u.email } : null,
                status: a.status,
                startedAt: a.startedAt,
                submittedAt: a.submittedAt,
                submitReason: a.submitReason,
                score: a.score,
                maxScore: a.maxScore,
                answered,
                totalQuestions: answerable,
                violations: p.violations || [],
                events: p.events || [],
                snapshotCount: p.snapshotCount || 0,
                cameraOk: p.cameraOk,
                lastSeenAt: p.lastSeenAt,
                autoSubmitted: !!p.autoSubmitted,
                latestSnapshot: snap ? { _id: String(snap.snapshotId), takenAt: snap.takenAt } : null,
            };
        });

        const roomDoc: any = assessment.proctorLiveClassId
            ? await LiveClass.findById(assessment.proctorLiveClassId)
                .select('status startTime durationMinutes zoomMeetingId zoomPasscode zoomAccountKey recordingUrl recordingPasscode')
                .lean()
            : null;

        // Who Zoom currently shows in the live exam room.
        if (roomDoc && roomDoc.status !== 'cancelled') {
            const names = await liveParticipantNames(roomDoc.zoomMeetingId, roomDoc.zoomAccountKey);
            for (const row of rows as any[]) {
                const a = attempts.find(x => String(x._id) === row.attemptId);
                row.inRoom = names === null || !a ? null
                    : isStudentInRoom(names, row.student?.displayName || '', studentRoomCode(a.userId));
            }
        }
        const room = roomDoc && roomDoc.status !== 'cancelled' ? {
            liveClassId: String(roomDoc._id),
            startTime: roomDoc.startTime,
            durationMinutes: roomDoc.durationMinutes,
            meetingId: roomDoc.zoomMeetingId,
            passcode: roomDoc.zoomPasscode,
            recordingUrl: roomDoc.recordingUrl || null,
            recordingPasscode: roomDoc.recordingPasscode || null,
        } : null;

        return NextResponse.json({
            assessment: {
                _id: String(assessment._id), title: assessment.title, type: assessment.type, status: assessment.status,
                durationMinutes: assessment.durationMinutes, opensAt: assessment.opensAt, closesAt: assessment.closesAt,
            },
            room,
            maxViolations: MAX_VIOLATIONS,
            serverTime: new Date(),
            attempts: rows,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('assessments/[id]/proctor route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
