import { describe, it, expect } from 'vitest';
import {
    StorageError,
    buildObjectPath,
    sanitizeFilename,
    validateContentType,
    MAX_BYTES_PER_CATEGORY,
} from './storage';

describe('sanitizeFilename', () => {
    it('keeps alphanumerics, dots, hyphens and underscores', () => {
        expect(sanitizeFilename('my-file_v2.PNG')).toBe('my-file_v2.PNG');
    });

    it('replaces unsafe characters with underscore', () => {
        expect(sanitizeFilename('hello world.jpg')).toBe('hello_world.jpg');
        // Dots are preserved (no traversal possible without slashes); only the
        // slashes themselves are replaced.
        expect(sanitizeFilename('weird/../path.pdf')).toBe('weird_.._path.pdf');
    });

    it('cannot produce a path-traversal sequence', () => {
        const out = sanitizeFilename('../../etc/passwd');
        expect(out).not.toContain('/');
        expect(out).not.toMatch(/^\.\.\//);
    });

    it('collapses runs of underscores', () => {
        expect(sanitizeFilename('a   b')).toBe('a_b');
    });

    it('truncates to 80 characters', () => {
        const long = 'a'.repeat(200) + '.txt';
        expect(sanitizeFilename(long).length).toBeLessThanOrEqual(80);
    });

    it('returns "file" for empty / fully-stripped input', () => {
        expect(sanitizeFilename('')).toBe('file');
        // After normalization, accent codepoints become a separate combining
        // mark and may be stripped — verify we always return something usable.
        const stripped = sanitizeFilename('///');
        expect(stripped.length).toBeGreaterThan(0);
    });
});

describe('validateContentType', () => {
    it('accepts every allowed image type', () => {
        for (const ct of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
            expect(() => validateContentType('image', ct)).not.toThrow();
        }
    });

    it('rejects mismatched category/content-type pairs', () => {
        expect(() => validateContentType('image', 'application/pdf')).toThrow(StorageError);
        expect(() => validateContentType('video', 'image/png')).toThrow(StorageError);
    });

    it('rejects unknown types', () => {
        expect(() => validateContentType('document', 'text/plain')).toThrow(/Unsupported/);
    });

    it('errors as 415 (Unsupported Media Type)', () => {
        try {
            validateContentType('image', 'application/zip');
            expect.unreachable('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(StorageError);
            expect((err as StorageError).status).toBe(415);
        }
    });
});

describe('buildObjectPath', () => {
    it('namespaces uploads by category and uid', () => {
        const path = buildObjectPath('user-123', 'image', 'photo.png');
        expect(path).toMatch(/^uploads\/image\/user-123\/[a-f0-9-]+_photo\.png$/);
    });

    it('sanitizes the filename component', () => {
        const path = buildObjectPath('u', 'document', '../etc/passwd');
        expect(path).not.toContain('../');
        expect(path.startsWith('uploads/document/u/')).toBe(true);
    });

    it('throws when uid is empty', () => {
        expect(() => buildObjectPath('', 'image', 'a.png')).toThrow(StorageError);
    });

    it('generates a fresh id every time', () => {
        const a = buildObjectPath('u', 'image', 'x.png');
        const b = buildObjectPath('u', 'image', 'x.png');
        expect(a).not.toBe(b);
    });
});

describe('MAX_BYTES_PER_CATEGORY', () => {
    it('defines sensible upper bounds', () => {
        expect(MAX_BYTES_PER_CATEGORY.image).toBeGreaterThan(0);
        expect(MAX_BYTES_PER_CATEGORY.video).toBeGreaterThan(MAX_BYTES_PER_CATEGORY.image);
        expect(MAX_BYTES_PER_CATEGORY.document).toBeGreaterThan(0);
    });
});
