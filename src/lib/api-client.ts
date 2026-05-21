"use client";

import { initializeFirebase } from '@/firebase';

/**
 * Browser-side fetch wrapper that attaches the current Firebase user's ID
 * token as `Authorization: Bearer <token>`. JSON request bodies get a default
 * `Content-Type: application/json` header so callers don't have to set it.
 *
 * Throws `ApiAuthError` when called without a signed-in user — UI code can
 * catch that and redirect to /login instead of getting a generic 401.
 */
export class ApiAuthError extends Error {
    constructor(message = 'You must be signed in.') {
        super(message);
        this.name = 'ApiAuthError';
    }
}

export type ApiFetchInit = Omit<RequestInit, 'headers'> & {
    headers?: HeadersInit;
};

export async function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
    const { auth } = initializeFirebase();
    const user = auth.currentUser;
    if (!user) throw new ApiAuthError();

    const token = await user.getIdToken();
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);

    if (!headers.has('Content-Type') && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(path, { ...init, headers });
}

/**
 * Convenience wrapper for JSON POST. Body is auto-stringified.
 */
export async function apiPostJson<T = unknown>(
    path: string,
    body: unknown,
    init: ApiFetchInit = {}
): Promise<T> {
    const res = await apiFetch(path, {
        ...init,
        method: 'POST',
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Convenience wrapper for JSON GET.
 */
export async function apiGetJson<T = unknown>(path: string, init: ApiFetchInit = {}): Promise<T> {
    const res = await apiFetch(path, { ...init, method: 'GET' });
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
    }
    return res.json();
}
