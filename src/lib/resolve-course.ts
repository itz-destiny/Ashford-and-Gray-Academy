import mongoose from 'mongoose';
import Course from '@/models/Course';
import { STATIC_COURSES } from '@/lib/courses-data';
import type { Course as CatalogCourse } from '@/lib/types';

/**
 * The catalogue is hybrid: some courses are authored in the backend (created by
 * instructors / course-registrars and stored in MongoDB), and others live only
 * in the static catalogue (`courses-data.ts`). Both are sold and enrolled in.
 *
 * These helpers RESOLVE a course's details from whichever source owns it —
 * they never write a Course document. Payment uses {@link resolveCourse} to
 * read the price/title; the enrolment read-side uses {@link resolveCourses} to
 * hydrate "My Courses" for courses that aren't in the DB.
 */

export type ResolvedCourse = {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: string;          // static catalogue courses are always 'published'
    source: 'db' | 'static';
};

function fromStatic(c: CatalogCourse): ResolvedCourse {
    return {
        id: c.id,
        title: c.title,
        price: c.price,
        currency: c.currency || 'NGN',
        status: 'published',
        source: 'static',
    };
}

/** Resolve a single course (DB first, then the static catalogue). */
export async function resolveCourse(courseId: string): Promise<ResolvedCourse | null> {
    if (mongoose.Types.ObjectId.isValid(courseId)) {
        const db = await Course.findById(courseId)
            .select('title price currency status')
            .lean<{ _id: mongoose.Types.ObjectId; title: string; price: number; currency?: string; status: string } | null>();
        if (db) {
            return {
                id: db._id.toString(),
                title: db.title,
                price: db.price,
                currency: db.currency || 'NGN',
                status: db.status,
                source: 'db',
            };
        }
    }
    const stat = STATIC_COURSES.find((c) => c.id === courseId);
    return stat ? fromStatic(stat) : null;
}

/**
 * Batch-hydrate full course objects for a set of ids, resolving each from the
 * DB or the static catalogue. Returns a Map keyed by id. The objects carry an
 * `_id` field so existing UI (which reads `course._id` / `course.id`) works for
 * both sources.
 */
export async function resolveCourses(courseIds: string[]): Promise<Map<string, any>> {
    const out = new Map<string, any>();
    const ids = Array.from(new Set(courseIds.filter(Boolean)));
    if (ids.length === 0) return out;

    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const dbCourses = objectIds.length
        ? await Course.find({ _id: { $in: objectIds } }).lean<any[]>()
        : [];
    for (const c of dbCourses) out.set(c._id.toString(), c);

    // Fill any gaps from the static catalogue.
    for (const id of ids) {
        if (out.has(id)) continue;
        const stat = STATIC_COURSES.find((c) => c.id === id);
        if (stat) out.set(id, { ...stat, _id: id });
    }
    return out;
}
