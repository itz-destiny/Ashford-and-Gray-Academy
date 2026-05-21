import { randomUUID } from 'node:crypto';
import { adminStorage } from './firebase-admin';

export type UploadCategory = 'image' | 'video' | 'document';

export class StorageError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'StorageError';
    }
}

const ALLOWED_CONTENT_TYPES: Record<UploadCategory, readonly string[]> = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    document: ['application/pdf'],
};

export const MAX_BYTES_PER_CATEGORY: Record<UploadCategory, number> = {
    image: 10 * 1024 * 1024,        // 10 MB
    video: 500 * 1024 * 1024,       // 500 MB
    document: 25 * 1024 * 1024,     // 25 MB
};

const UPLOAD_URL_TTL_MS = 15 * 60 * 1000;

export function validateContentType(category: UploadCategory, contentType: string): void {
    const allowed = ALLOWED_CONTENT_TYPES[category];
    if (!allowed.includes(contentType)) {
        throw new StorageError(
            415,
            `Unsupported content type "${contentType}" for ${category}. Allowed: ${allowed.join(', ')}.`
        );
    }
}

export function sanitizeFilename(filename: string): string {
    return filename
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')
        .replace(/_{2,}/g, '_')
        .slice(0, 80) || 'file';
}

export function buildObjectPath(uid: string, category: UploadCategory, filename: string): string {
    if (!uid) throw new StorageError(400, 'uid is required');
    const safe = sanitizeFilename(filename);
    const id = randomUUID();
    return `uploads/${category}/${uid}/${id}_${safe}`;
}

export type SignedUploadInput = {
    uid: string;
    category: UploadCategory;
    contentType: string;
    filename: string;
};

export type SignedUploadResult = {
    uploadUrl: string;
    publicUrl: string;
    path: string;
    maxBytes: number;
    expiresAt: string;
};

export async function createSignedUploadUrl(
    input: SignedUploadInput
): Promise<SignedUploadResult> {
    validateContentType(input.category, input.contentType);
    const path = buildObjectPath(input.uid, input.category, input.filename);

    const bucket = adminStorage().bucket();
    if (!bucket.name) {
        throw new StorageError(500, 'Storage bucket is not configured');
    }

    const expiresAtMs = Date.now() + UPLOAD_URL_TTL_MS;
    const [uploadUrl] = await bucket.file(path).getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: expiresAtMs,
        contentType: input.contentType,
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;

    return {
        uploadUrl,
        publicUrl,
        path,
        maxBytes: MAX_BYTES_PER_CATEGORY[input.category],
        expiresAt: new Date(expiresAtMs).toISOString(),
    };
}
