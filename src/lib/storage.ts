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
    document: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/zip',
        'application/x-zip-compressed',
        'text/plain',
    ],
};

export const MAX_BYTES_PER_CATEGORY: Record<UploadCategory, number> = {
    image: 10 * 1024 * 1024,        // 10 MB
    video: 500 * 1024 * 1024,       // 500 MB
    document: 50 * 1024 * 1024,     // 50 MB — also covers slide decks and zipped code bundles.
};

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

// Vercel Blob appends its own random suffix for collision-avoidance
// (`addRandomSuffix`), so this only needs to lay out a readable folder
// structure — not guarantee uniqueness itself.
export function buildObjectPath(uid: string, category: UploadCategory, filename: string): string {
    if (!uid) throw new StorageError(400, 'uid is required');
    return `uploads/${category}/${uid}/${sanitizeFilename(filename)}`;
}
