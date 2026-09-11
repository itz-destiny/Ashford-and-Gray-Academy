import dbConnect from '../src/lib/mongodb';
import { adminAuth } from '../src/lib/firebase-admin';
import User from '../src/models/User';
import Course from '../src/models/Course';
import Enrollment from '../src/models/Enrollment';
import TimetableSession from '../src/models/TimetableSession';
import LiveClass from '../src/models/LiveClass';
import { generateTempPassword } from '../src/lib/generate-password';
import { findAvailableZoomHost } from '../src/lib/zoom-scheduler';
import { createZoomMeeting } from '../src/lib/zoom';

const COURSE_ID = '6a84b93e63123c45d60afc37'; // QA Sandbox Course (Test Only)
const INSTRUCTOR_UID = '53KPNa6LbXaG3v4WkxFfKJhKHIC3'; // test.instructor@ashfordandgrayfusionacademy.com
const INSTRUCTOR_EMAIL = 'test.instructor@ashfordandgrayfusionacademy.com';
const INSTRUCTOR_NAME = 'Test Instructor';

async function upsertFirebaseUser(email: string, displayName: string, password: string) {
    try {
        const existing = await adminAuth().getUserByEmail(email);
        await adminAuth().updateUser(existing.uid, { password, displayName, emailVerified: true });
        return existing.uid;
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            const created = await adminAuth().createUser({ email, password, displayName, emailVerified: true });
            return created.uid;
        }
        throw err;
    }
}

async function main() {
    await dbConnect();

    const results = { students: [] as any[], instructor: {} as any, session: {} as any };

    // 1. Instructor: reset password on the existing test instructor account.
    const instructorPassword = generateTempPassword(INSTRUCTOR_NAME);
    await upsertFirebaseUser(INSTRUCTOR_EMAIL, INSTRUCTOR_NAME, instructorPassword);
    await User.findOneAndUpdate(
        { uid: INSTRUCTOR_UID },
        { $set: { email: INSTRUCTOR_EMAIL, displayName: INSTRUCTOR_NAME, role: 'instructor', mustChangePassword: false } },
        { upsert: true }
    );
    results.instructor = { email: INSTRUCTOR_EMAIL, password: instructorPassword, uid: INSTRUCTOR_UID };

    // 2. Fix course visibility + denormalized instructor name, ensure published.
    await Course.findByIdAndUpdate(COURSE_ID, {
        $set: {
            status: 'published',
            'instructor.name': INSTRUCTOR_NAME,
            instructorUid: INSTRUCTOR_UID,
        },
    });

    // 3. Two student accounts.
    const studentDefs = [
        { email: 'test.student1@ashfordandgrayfusionacademy.com', name: 'Test Student One' },
        { email: 'test.student2@ashfordandgrayfusionacademy.com', name: 'Test Student Two' },
    ];

    for (const s of studentDefs) {
        const password = generateTempPassword(s.name);
        const uid = await upsertFirebaseUser(s.email, s.name, password);
        await User.findOneAndUpdate(
            { uid },
            { $set: { uid, email: s.email, displayName: s.name, role: 'student', mustChangePassword: false } },
            { upsert: true, setDefaultsOnInsert: true }
        );
        const existingEnrollment = await Enrollment.findOne({ userId: uid, courseId: COURSE_ID });
        if (!existingEnrollment) {
            await Enrollment.create({ userId: uid, courseId: COURSE_ID });
        }
        results.students.push({ email: s.email, password, uid });
    }

    // 4. A TimetableSession for this course starting in ~3 minutes, so it's
    // immediately visible in "Upcoming" for both the instructor and students.
    const startTime = new Date(Date.now() + 3 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    let session = await TimetableSession.findOne({ sessionCode: 'QA-LIVE-TEST' });
    if (!session) {
        session = await TimetableSession.create({
            weekCode: 'QA',
            day: 'TEST',
            sessionCode: 'QA-LIVE-TEST',
            date: startTime,
            startTime,
            endTime,
            programmeName: 'QA Sandbox Course (Test Only)',
            courseId: COURSE_ID,
            courseTitle: 'QA Sandbox Course (Test Only)',
            module: 'Live Class Test Session',
            lecturerName: INSTRUCTOR_NAME,
            instructorUid: INSTRUCTOR_UID,
            instructorEmail: INSTRUCTOR_EMAIL,
            status: 'assigned',
        });
    } else {
        session.date = startTime;
        session.startTime = startTime;
        session.endTime = endTime;
        session.status = 'assigned';
        session.liveClassId = undefined;
        session.zoomJoinUrl = undefined;
        session.zoomStartUrl = undefined;
        await session.save();
    }

    // 5. Create a real Zoom meeting for this session (mirrors
    // /api/timetable/[id]/schedule-zoom exactly).
    const durationMinutes = Math.max(15, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
    const topic = `${session.courseTitle}: ${session.module}`;
    const assignment = await findAvailableZoomHost(startTime, durationMinutes);
    if (!assignment) {
        throw new Error('No available Zoom host right now — every license is busy.');
    }

    const zoomResponse = await createZoomMeeting({
        topic,
        agenda: session.programmeName,
        startTime: startTime.toISOString(),
        durationMinutes,
        hostEmail: assignment.hostEmail,
        account: assignment.account,
    });

    const liveClass = await LiveClass.create({
        courseId: COURSE_ID,
        instructorId: INSTRUCTOR_UID,
        topic,
        description: session.module,
        startTime,
        durationMinutes,
        zoomMeetingId: zoomResponse.id.toString(),
        zoomJoinUrl: zoomResponse.join_url,
        zoomStartUrl: zoomResponse.start_url,
        zoomHostEmail: assignment.hostEmail,
        zoomAccountKey: assignment.account.key,
        status: 'scheduled',
    });

    session.status = 'scheduled';
    session.liveClassId = (liveClass._id as any).toString();
    session.zoomJoinUrl = zoomResponse.join_url;
    session.zoomStartUrl = zoomResponse.start_url;
    await session.save();

    results.session = {
        sessionId: session._id.toString(),
        liveClassId: liveClass._id.toString(),
        startTime,
        endTime,
        zoomJoinUrl: zoomResponse.join_url,
        zoomStartUrl: zoomResponse.start_url,
    };

    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
