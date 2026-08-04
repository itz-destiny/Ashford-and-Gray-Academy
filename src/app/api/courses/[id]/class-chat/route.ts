import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { Conversation } from '@/models/Supports';
import { AuthError, withAuth, type AuthContext } from '@/lib/auth-server';
import { syncGroupConversation } from '@/lib/realtime-events';

type RouteParams = { params: Promise<{ id: string }> };

const ELEVATED = ['admin', 'course_registrar', 'registrar'];

async function assertCanJoin(courseId: string, auth: AuthContext) {
    if (ELEVATED.includes(auth.role)) return;
    if (auth.role === 'student') {
        const enrolled = await Enrollment.findOne({ courseId, userId: auth.uid }).select('_id');
        if (enrolled) return;
    }
    throw new AuthError(403, 'You must be enrolled in this course to join its class group.');
}

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('class-chat route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/courses/[id]/class-chat
//   Returns (creating if needed) the single group conversation shared by every
//   student currently enrolled in this course — their "class group". Keeps
//   the participant list in sync with Enrollment on every call so newly
//   enrolled students are added automatically, without a dedicated hook into
//   every enrollment-creation call site.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();
        await assertCanJoin(courseId, auth);

        const course = await Course.findById(courseId).select('title');
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        const enrolledUids = (
            await Enrollment.find({ courseId }).select('userId').lean<{ userId: string }[]>()
        ).map((e) => e.userId);

        let convo = await Conversation.findOne({ courseId, type: 'group' });
        if (!convo) {
            convo = await Conversation.create({
                participants: enrolledUids,
                type: 'group',
                courseId,
                title: `${course.title} — Class Group`,
            });
        } else {
            const missing = enrolledUids.filter((uid) => !convo!.participants.includes(uid));
            if (missing.length > 0) {
                convo.participants.push(...missing);
                await convo.save();
            }
        }

        void syncGroupConversation({
            conversationId: String(convo._id),
            participants: convo.participants,
            title: `${course.title} — Class Group`,
        });

        return NextResponse.json({
            conversationId: String(convo._id),
            participants: convo.participants,
            title: `${course.title} — Class Group`,
        });
    } catch (err) {
        return handleError(err);
    }
});
