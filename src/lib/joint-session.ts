import TimetableSession from '@/models/TimetableSession';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

// Some timetable sessions are shared between two cohorts at once — see
// TimetableSession.programmeName, e.g. "Hospitality Management & Food and
// Beverage Management" — but the linked LiveClass only ever carries one
// courseId (whichever programme it was created under). A student enrolled
// only in the *other* half of that pairing would otherwise fail every
// enrollment check for the session: can't sign attendance, can't join via
// the embedded SDK room, doesn't even see it on their own schedule.
//
// This checks the direct enrollment first, and only falls back to the
// joint-programme match when that fails — so it costs nothing extra for
// the (overwhelmingly common) single-programme class.
export async function isEligibleForLiveClass(
    studentUid: string,
    liveClassId: string,
    primaryCourseId: string
): Promise<boolean> {
    const direct = await Enrollment.findOne({ userId: studentUid, courseId: primaryCourseId }).select('_id').lean();
    if (direct) return true;

    const session = await TimetableSession.findOne({ liveClassId })
        .select('programmeName')
        .lean<{ programmeName?: string } | null>();
    if (!session?.programmeName || !session.programmeName.includes('&')) return false;

    const enrollments = await Enrollment.find({ userId: studentUid }).select('courseId').lean<{ courseId: unknown }[]>();
    if (enrollments.length === 0) return false;

    const courses = await Course.find({ _id: { $in: enrollments.map((e) => String(e.courseId)) } })
        .select('title')
        .lean<{ title: string }[]>();
    return courses.some((c) => session.programmeName!.includes(c.title));
}
