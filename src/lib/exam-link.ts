/**
 * Exams can be opened two ways: inside the student dashboard (/tests/:id) or
 * from a direct exam link (/exam/:id) that asks only for email and password
 * and shows the exam on its own, with no dashboard around it. The exam pages
 * are shared, so they keep the student on whichever path they came in by.
 */
export function examBase(pathname: string | null | undefined): '/exam' | '/tests' {
    return pathname?.startsWith('/exam/') ? '/exam' : '/tests';
}

export function examLinkPath(assessmentId: string): string {
    return `/exam/${assessmentId}`;
}
