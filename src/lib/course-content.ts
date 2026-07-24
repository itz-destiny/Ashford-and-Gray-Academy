export type NormalizedCourseContent = {
    modules: Array<Record<string, unknown>>;
    lessons: Array<Record<string, unknown>>;
    currentLesson: Record<string, unknown> | null;
};

export function normalizeCourseContent(payload: unknown): NormalizedCourseContent {
    const modules = Array.isArray((payload as any)?.modules) ? (payload as any).modules : [];
    const lessons = Array.isArray((payload as any)?.lessons) ? (payload as any).lessons : [];

    return {
        modules,
        lessons,
        currentLesson: lessons[0] ?? null,
    };
}
