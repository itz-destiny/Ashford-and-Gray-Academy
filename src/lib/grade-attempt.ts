import type { IAttempt } from '@/models/Attempt';

export interface RawAnswer {
    questionId: string;
    selectedOptionIndex?: number;
    textAnswer?: string;
}

// Auto-grades MCQ/true-false against the answer key; short answers stay
// pending (pointsAwarded: null) until an instructor grades them.
export function gradeAnswers(assessment: any, raw: RawAnswer[]) {
    const questionMap = new Map((assessment.questions || []).map((q: any) => [String(q._id), q]));
    let score = 0;
    const answers = raw.map(a => {
        const q: any = questionMap.get(a.questionId);
        if (!q) return { ...a, pointsAwarded: null, isCorrect: null };

        if (q.type === 'mcq' || q.type === 'true_false') {
            const correctIndex = (q.options || []).findIndex((o: any) => o.isCorrect);
            const isCorrect = a.selectedOptionIndex === correctIndex;
            const pointsAwarded = isCorrect ? q.points : 0;
            score += pointsAwarded;
            return { ...a, pointsAwarded, isCorrect };
        }
        return { ...a, pointsAwarded: null, isCorrect: null };
    });
    return { answers, score };
}

// Grades and closes an in-progress attempt. Used by the student's own
// submit and by the server when a proctored exam hits its violation limit.
export async function finalizeAttempt(
    attempt: IAttempt,
    assessment: any,
    raw: RawAnswer[],
    reason: 'student' | 'time_up' | 'violations',
) {
    const { answers, score } = gradeAnswers(assessment, raw);
    attempt.answers = answers as any;
    attempt.score = score;
    attempt.maxScore = assessment.totalPoints;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.submitReason = reason;
    await attempt.save();
    return attempt;
}

// The answers saved on an in-progress attempt (autosave), as plain objects.
export function savedAnswers(attempt: IAttempt): RawAnswer[] {
    return ((attempt.answers || []) as any[]).map(a => ({
        questionId: String(a.questionId),
        selectedOptionIndex: a.selectedOptionIndex ?? undefined,
        textAnswer: a.textAnswer ?? undefined,
    }));
}
