import TimetableSession from '@/models/TimetableSession';
import Course from '@/models/Course';

// Course.instructorUid is the legacy single-owner field — it was never
// populated for any course created via the timetable import, where several
// lecturers can teach different modules of the same course across the term.
// The timetable is the real, current source of truth for "who teaches this
// course," so this unions both: whatever a course's own instructorUid says
// (kept for any course that still sets it), plus every course this uid
// appears against in the timetable.
export async function getInstructorCourseIds(uid: string): Promise<string[]> {
    const [ownedCourses, sessions] = await Promise.all([
        Course.find({ instructorUid: uid }).select('_id').lean(),
        TimetableSession.find({ instructorUid: uid, courseId: { $exists: true, $ne: null } }).select('courseId').lean(),
    ]);

    const ids = new Set<string>();
    for (const c of ownedCourses as any[]) ids.add(c._id.toString());
    for (const s of sessions as any[]) if (s.courseId) ids.add(String(s.courseId));

    return [...ids];
}
