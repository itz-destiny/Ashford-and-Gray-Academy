import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { authenticateFirebase } from '@/lib/auth-server';
import { validateContentType, MAX_BYTES_PER_CATEGORY, StorageError, type UploadCategory } from '@/lib/storage';

const CATEGORIES: readonly UploadCategory[] = ['image', 'video', 'document'];

// =============================================================================
// POST /api/upload — token endpoint for @vercel/blob/client's `upload()`.
// The browser calls this first to get a short-lived, scoped client token,
// then uploads the file bytes straight to Vercel Blob — never through our
// own server — so large files (video, up to 500MB here) never hit a
// serverless function's request-body limit.
// =============================================================================
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const identity = await authenticateFirebase(request as any);

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                const payload = clientPayload ? JSON.parse(clientPayload) : {};
                const category: UploadCategory = CATEGORIES.includes(payload.category) ? payload.category : 'document';
                const contentType: string | undefined = payload.contentType;
                if (contentType) validateContentType(category, contentType);

                return {
                    addRandomSuffix: true,
                    allowedContentTypes: contentType ? [contentType] : undefined,
                    maximumSizeInBytes: MAX_BYTES_PER_CATEGORY[category],
                    tokenPayload: JSON.stringify({ uid: identity.uid }),
                };
            },
            // Only fires via a webhook Vercel calls back to a publicly reachable
            // deployment — never in local dev. Usage tracking therefore reads
            // real-time totals straight from Blob's own `list()` instead of
            // relying on this ever having run (see /api/admin/storage-usage).
            onUploadCompleted: async () => {},
        });

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        if (error instanceof StorageError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('POST /api/upload failed:', error);
        return NextResponse.json({ error: error.message || 'Upload authorization failed' }, { status: 400 });
    }
}
