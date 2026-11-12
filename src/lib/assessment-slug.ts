import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';

// Readable exam links: /exam/housekeeping instead of /exam/6af09f11….
// Every exam has a short "link name" (slug). Old ID links keep working.

const FILLER = new Set(['a', 'an', 'the', 'and', 'of', 'for', 'in', 'on', 'to', 'test', 'exam', 'quiz', 'assessment', 'examination']);
/** An ID that can never match, so a bad link name gives a clean 404. */
const NO_MATCH = '000000000000000000000000';

/** "Housekeeping & Domestic Management Exam (Pilot)" -> "housekeeping-domestic-management-pilot" (max ~5 words). */
export function slugify(text: string): string {
    const words = (text || '')
        .toLowerCase()
        .normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .replace(/&/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const kept = words.filter(w => !FILLER.has(w));
    return (kept.length ? kept : words).slice(0, 5).join('-').slice(0, 60).replace(/-+$/, '');
}

/** Valid link name: lowercase letters, digits and single hyphens, 2-60 chars, not a 24-hex ID. */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 60 && !/^[0-9a-f]{24}$/.test(slug);
}

/** `base`, or `base-2`, `base-3`… — the first one no other exam uses. */
export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
    await dbConnect();
    const root = isValidSlug(base) ? base : 'exam';
    for (let n = 1; n < 500; n++) {
        const candidate = n === 1 ? root : `${root}-${n}`;
        const clash = await Assessment.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select('_id').lean();
        if (!clash) return candidate;
    }
    return `${root}-${Date.now().toString(36)}`;
}

/** Route param -> assessment ID. Accepts an ID or a link name. */
export async function resolveAssessmentId(idOrSlug: string): Promise<string> {
    const raw = decodeURIComponent(String(idOrSlug || '')).trim();
    if (mongoose.Types.ObjectId.isValid(raw) && /^[0-9a-f]{24}$/i.test(raw)) return raw;
    await dbConnect();
    const found = await Assessment.findOne({ slug: raw.toLowerCase() }).select('_id').lean<{ _id: unknown } | null>();
    return found ? String(found._id) : NO_MATCH;
}
