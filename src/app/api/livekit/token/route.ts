import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import {
    getLiveKitConfig,
    mintAccessToken,
    type LiveKitRole,
} from '@/lib/livekit';

const requestSchema = z.object({
    room: z.string().min(1).max(200),
});

function toLiveKitRole(role: string): LiveKitRole {
    if (role === 'instructor' || role === 'admin') return role;
    return 'student';
}

/**
 * Room naming convention enforced here:
 *   - "course-<courseId>" : the live classroom for that course. Only enrolled
 *     students, the course's instructor, or admins may join.
 *   - "meet-*"            : ad-hoc 1:1 / small-group call (e.g. from the
 *     messages screen). Any authenticated user with the link may join.
 *
 * Any other prefix is rejected, so a malicious client can't invent a room
 * name to side-step access control.
 */
async function assertCanJoinRoom(room: string, auth: AuthContext): Promise<void> {
    if (auth.role === 'admin') return;

    if (room.startsWith('course-')) {
        const courseId = room.slice('course-'.length);
        if (!courseId) throw new Error('Invalid course room.');
        await dbConnect();
        const course = await Course.findById(courseId).select('instructorUid instructor');
        if (!course) throw new Error('Course not found.');
        const isOwner =
            (course.instructorUid && course.instructorUid === auth.uid) ||
            (!course.instructorUid && course.instructor?.name === auth.displayName);
        if (isOwner) return;
        const enrolled = await Enrollment.findOne({
            userId: auth.uid,
            courseId: course._id,
        }).select('_id');
        if (!enrolled) {
            throw new Error('You must be enrolled in this course to join the class.');
        }
        return;
    }

    if (room.startsWith('meet-')) {
        // Any authenticated user can join an ad-hoc meeting if they have the link.
        return;
    }

    throw new Error('Unrecognized room.');
}

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await assertCanJoinRoom(parsed.data.room, auth);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Access denied.';
        return NextResponse.json({ error: message }, { status: 403 });
    }

    try {
        const liveKitRole = toLiveKitRole(auth.role);
        const token = await mintAccessToken({
            identity: auth.uid,
            name: auth.displayName,
            room: parsed.data.room,
            role: liveKitRole,
            metadata: { appRole: auth.role, email: auth.email },
        });
        const { wsUrl } = getLiveKitConfig();
        return NextResponse.json({ token, wsUrl, identity: auth.uid, role: liveKitRole });
    } catch (err) {
        console.error('Failed to mint LiveKit token:', err);
        return NextResponse.json({ error: 'Failed to issue token' }, { status: 500 });
    }
});
