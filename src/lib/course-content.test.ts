import { describe, expect, it } from 'vitest';
import { normalizeCourseContent } from './course-content';

describe('normalizeCourseContent', () => {
    it('returns empty arrays and no lesson when the payload is missing', () => {
        expect(normalizeCourseContent(undefined)).toEqual({
            modules: [],
            lessons: [],
            currentLesson: null,
        });
    });

    it('keeps the first lesson as the default current lesson', () => {
        const payload = {
            modules: [{ _id: 'm1', title: 'Module One' }],
            lessons: [{ _id: 'l1', title: 'Lesson One', moduleId: 'm1' }],
        };

        expect(normalizeCourseContent(payload)).toEqual({
            modules: payload.modules,
            lessons: payload.lessons,
            currentLesson: payload.lessons[0],
        });
    });
});
