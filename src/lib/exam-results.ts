import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';

type ResultStatus = 'not_taken' | 'in_progress' | 'awaiting_marking' | 'graded';

/**
 * Every published test and exam, grouped by course, with each enrolled
 * student's result — score, or "not taken" — and their programmes of study.
 * Used by the registrar's Exam Results page. Caller connects to the DB.
 */
export async function buildExamResults() {
    const assessments = await Assessment.find({ status: 'published' })
        .select('title type courseId opensAt closesAt totalPoints durationMinutes')
        .sort({ opensAt: -1 })
        .lean<any[]>();
    const assessmentIds = assessments.map(a => a._id);

    const [attempts, enrollments] = await Promise.all([
        Attempt.find({ assessmentId: { $in: assessmentIds } })
            .select('assessmentId userId status score maxScore submitReason submittedAt startedAt answers.pointsAwarded proctoring.violations proctoring.device')
            .lean<any[]>(),
        Enrollment.find({}).select('userId courseId').lean<any[]>(),
    ]);

    const courseIds = [...new Set([
        ...assessments.map(a => a.courseId && String(a.courseId)),
        ...enrollments.map(e => String(e.courseId)),
    ].filter(Boolean))] as string[];
    const courses = await Course.find({ _id: { $in: courseIds } }).select('title').lean<any[]>();
    const courseTitle = new Map(courses.map(c => [String(c._id), c.title as string]));

    const userIds = [...new Set([...enrollments.map(e => e.userId), ...attempts.map(a => a.userId)])];
    const users = await User.find({ uid: { $in: userIds } })
        .select('uid displayName email role programmeOfInterest')
        .lean<any[]>();
    const userMap = new Map(users.map(u => [u.uid, u]));
    const isStudent = (uid: string) => {
        const u = userMap.get(uid);
        return !!u && (!u.role || u.role === 'student');
    };

    // Each student's programmes of study = the courses they're enrolled in.
    const studiesByUser = new Map<string, string[]>();
    const studentsByCourse = new Map<string, Set<string>>();
    for (const e of enrollments) {
        const cid = String(e.courseId);
        if (!isStudent(e.userId)) continue;
        if (!studentsByCourse.has(cid)) studentsByCourse.set(cid, new Set());
        studentsByCourse.get(cid)!.add(e.userId);
        const t = courseTitle.get(cid);
        if (t) {
            const list = studiesByUser.get(e.userId) || [];
            if (!list.includes(t)) list.push(t);
            studiesByUser.set(e.userId, list);
        }
    }
    const allStudents = new Set<string>([...studentsByCourse.values()].flatMap(s => [...s]));

    const attemptsByAssessment = new Map<string, any[]>();
    for (const a of attempts) {
        const k = String(a.assessmentId);
        if (!attemptsByAssessment.has(k)) attemptsByAssessment.set(k, []);
        attemptsByAssessment.get(k)!.push(a);
    }

    const groups = new Map<string, { courseId: string | null; title: string; enrolled: number; assessments: any[] }>();
    for (const a of assessments) {
        const cid = a.courseId ? String(a.courseId) : null;
        const key = cid ?? 'all';
        const eligible = cid ? (studentsByCourse.get(cid) || new Set<string>()) : allStudents;
        if (!groups.has(key)) {
            groups.set(key, {
                courseId: cid,
                title: cid ? (courseTitle.get(cid) || 'Unknown course') : 'All students (no specific course)',
                enrolled: eligible.size,
                assessments: [],
            });
        }

        const byUser = new Map((attemptsByAssessment.get(String(a._id)) || []).map(t => [t.userId, t]));
        const uids = new Set<string>([...eligible, ...[...byUser.keys()].filter(isStudent)]);

        const results = [...uids].map(uid => {
            const u = userMap.get(uid);
            const t = byUser.get(uid);
            // Written answers wait for the facilitator to mark them; until
            // then the score is only the auto-marked part, so it isn't final.
            const unmarked = !!t && (t.answers || []).some((x: any) => x.pointsAwarded === null || x.pointsAwarded === undefined);
            const status: ResultStatus = !t ? 'not_taken'
                : t.status === 'in_progress' ? 'in_progress'
                : t.status === 'graded' || !unmarked ? 'graded'
                : 'awaiting_marking';
            const max = t?.maxScore ?? a.totalPoints ?? 0;
            const finished = status === 'graded';
            return {
                uid,
                name: u?.displayName || u?.email || 'Unknown student',
                email: u?.email || '',
                studies: studiesByUser.get(uid) || (u?.programmeOfInterest ? [u.programmeOfInterest] : []),
                status,
                score: finished ? (t.score ?? 0) : null,
                scoreSoFar: status === 'awaiting_marking' ? (t.score ?? 0) : null,
                maxScore: max,
                percent: finished && max > 0 ? Math.round(((t.score ?? 0) / max) * 1000) / 10 : null,
                submitReason: t?.submitReason ?? null,
                warnings: t?.proctoring?.violations?.length ?? 0,
                device: t?.proctoring?.device ?? null,
                startedAt: t?.startedAt ?? null,
                submittedAt: t?.submittedAt ?? null,
            };
        }).sort((x, y) => x.name.localeCompare(y.name));

        const finished = results.filter(r => r.percent !== null);
        groups.get(key)!.assessments.push({
            _id: String(a._id),
            title: a.title,
            type: a.type,
            opensAt: a.opensAt,
            closesAt: a.closesAt,
            totalPoints: a.totalPoints,
            eligible: uids.size,
            taken: results.filter(r => r.status !== 'not_taken').length,
            averagePercent: finished.length
                ? Math.round((finished.reduce((s, r) => s + (r.percent || 0), 0) / finished.length) * 10) / 10
                : null,
            results,
        });
    }

    const list = [...groups.values()].sort((a, b) =>
        a.courseId === null ? 1 : b.courseId === null ? -1 : a.title.localeCompare(b.title));
    return list;
}
