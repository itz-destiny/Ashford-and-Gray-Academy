// Every test and exam is reported out of 100, however many questions it has
// (a 9-question exam with 7 correct is 78 / 100). Marks are stored as raw points;
// this converts them for display and export.
export const OUT_OF = 100;

export function score100(score: number | null | undefined, maxScore: number | null | undefined): number | null {
    if (score === null || score === undefined || !maxScore || maxScore <= 0) return null;
    return Math.round((score / maxScore) * 100);
}
