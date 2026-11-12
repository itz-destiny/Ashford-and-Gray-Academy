"use client";

/**
 * True on a phone or tablet. Phones can't keep Zoom and the exam open side
 * by side (switching apps would count as leaving the exam), so proctored
 * exams on a phone use the phone's own front camera instead of the live
 * Zoom exam room.
 */
export function isPhoneDevice(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPod|iPad|Mobile|Opera Mini|IEMobile/i.test(ua)) return true;
    // iPadOS reports itself as a Mac; it is the only "Mac" with a touch screen.
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
}
