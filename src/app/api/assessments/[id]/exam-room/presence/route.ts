import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Enrollment from '@/models/Enrollment';
import LiveClass from '@/models/LiveClass';
import { AuthError, withAuth } from '@/lib/auth-server';
import { isProctored } from '@/lib/proctoring';
import { isStudentInRoom, liveParticipantNames, roomDisplayName, studentJoinUrl, studentRoomCode } from '@/lib/exam-room-presence';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET /api/assessments/[id]/exam-room/presence — for a student sitting a
// proctored exam: their personal join link for the live exam room (their
// name tagged with a short code), and whether Zoom currently shows them in
// the room. `inRoom` is null when Zoom couldn't be checked.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();
        const assessment = await Assessment.findById(id).select('type status courseId proctorLiveClassId').lean<any>();
        if (!assessment || !isProctored(assessment) || assessment.status !== 'published') {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        if (assessment.courseId) {
            const enrolled = await Enrollment.findOne({ userId: auth.uid, courseId: assessment.courseId }).select('_id').lean();
            if (!enrolled) return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
        }
        if (!assessment.proctorLiveClassId) {
            return NextResponse.json({ hasRoom: false });
        }
        const room: any = await LiveClass.findById(assessment.proctorLiveClassId).select('status zoomMeetingId zoomJoinUrl zoomAccountKey').lean();
        if (!room || room.status === 'cancelled') return NextResponse.json({ hasRoom: false });

        const code = studentRoomCode(auth.uid);
        const name = auth.displayName || 'Student';
        const names = await liveParticipantNames(room.zoomMeetingId, room.zoomAccountKey);
        return NextResponse.json({
            hasRoom: true,
            code,
            zoomName: roomDisplayName(name, code),
            joinUrl: studentJoinUrl(room.zoomJoinUrl, name, code),
            meetingId: room.zoomMeetingId,
            inRoom: names === null ? null : isStudentInRoom(names, name, code),
        });
    } catch (err: any) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('exam-room/presence route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
