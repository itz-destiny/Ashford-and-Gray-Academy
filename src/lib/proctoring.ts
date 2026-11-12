// Shared between the exam page (client) and the proctoring API routes.
// No server-only imports here.

/** Exams are proctored; ordinary tests/quizzes are not. */
export function isProctored(assessment: { type?: string } | null | undefined): boolean {
    return assessment?.type === 'exam';
}

/** The exam is submitted automatically on this many violations. */
export const MAX_VIOLATIONS = 3;

/** Two violations closer together than this are one incident (e.g. alt-tab fires both blur and visibility). */
export const VIOLATION_DEDUPE_MS = 2000;

export const SNAPSHOT_INTERVAL_MS = 60_000;
/** Phones have no Zoom room watching them, so the phone camera photographs the student more often. */
export const PHONE_SNAPSHOT_INTERVAL_MS = 20_000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
/** A student with no heartbeat for this long shows as offline on the live proctor view. */
export const OFFLINE_AFTER_MS = 45_000;
export const MAX_SNAPSHOT_BYTES = 200 * 1024;

export const VIOLATION_TYPES = ['fullscreen_exit', 'tab_hidden', 'window_blur', 'camera_off', 'left_exam_room'] as const;
export type ViolationType = (typeof VIOLATION_TYPES)[number];

export const EVENT_TYPES = ['copy', 'cut', 'paste', 'right_click', 'blocked_shortcut', 'page_reload', 'connection_lost', 'late_submit'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const INCIDENT_LABELS: Record<string, string> = {
    fullscreen_exit: 'Left full screen',
    tab_hidden: 'Switched tab or minimised',
    window_blur: 'Switched to another window',
    camera_off: 'Camera turned off',
    left_exam_room: 'Left the live exam room',
    copy: 'Tried to copy',
    cut: 'Tried to cut',
    paste: 'Tried to paste',
    right_click: 'Right-clicked',
    blocked_shortcut: 'Used a blocked shortcut',
    page_reload: 'Reloaded the exam page',
    connection_lost: 'Lost internet connection',
    late_submit: 'Submitted after time was up (no connection)',
};

/**
 * The timer always runs from the server's start time, online or not. A
 * submit sent within this long after time is up (the page submits the moment
 * the timer hits zero, but the network may be slow) is accepted as normal.
 */
export const SUBMIT_GRACE_MS = 2 * 60_000;
/**
 * A student whose connection was down when time ran out: the page freezes
 * their answers at zero and keeps retrying. Answers that arrive within this
 * long are accepted (and flagged to the proctor); after that only the
 * answers that were saved before time ran out count.
 */
export const OFFLINE_SUBMIT_LIMIT_MS = 30 * 60_000;
