import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A student may message an instructor only while actively enrolled in one of
 * that instructor's courses — access ends once the course's stated duration
 * (in weeks, counted from the enrollment date) has elapsed.
 */
export async function canStudentMessageInstructor(studentUid: string, instructorUid: string): Promise<boolean> {
    const enrollments = await Enrollment.find({ userId: studentUid }).select('courseId enrolledAt').lean();
    if (enrollments.length === 0) return false;

    const courseIds = enrollments.map((e) => e.courseId).filter(Boolean);
    const courses = await Course.find({ _id: { $in: courseIds }, instructorUid })
        .select('_id duration')
        .lean<{ _id: { toString(): string }; duration: number }[]>();
    if (courses.length === 0) return false;

    const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));
    const now = Date.now();

    return enrollments.some((en) => {
        const course = courseMap.get(en.courseId?.toString());
        if (!course) return false;
        const enrolledAt = new Date(en.enrolledAt).getTime();
        const expiresAt = enrolledAt + (course.duration || 0) * WEEK_MS;
        return now <= expiresAt;
    });
}
