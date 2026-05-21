import type { Course, AppEvent } from './types';

/**
 * Seed datasets for /api/seed (dev-only admin endpoint).
 *
 * These arrays were intentionally emptied so the catalogue starts clean —
 * real courses and events are created by instructors and registrars through
 * the production admin UI (/instructor/courses/new and /admin/events).
 *
 * Keep the exported names and types intact so the seed route and any
 * tooling that imports them continues to compile.
 */
export const coursesToSeed: Omit<Course, 'id' | 'progress'>[] = [];

export const eventsToSeed: Omit<AppEvent, 'id'>[] = [];
