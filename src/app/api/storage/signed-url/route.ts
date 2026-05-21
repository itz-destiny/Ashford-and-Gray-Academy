import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-server';
import { createSignedUploadUrl, StorageError, type UploadCategory } from '@/lib/storage';

const requestSchema = z.object({
    filename: z.string().min(1).max(200),
    contentType: z.string().min(1).max(120),
    category: z.enum(['image', 'video', 'document']),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        const result = await createSignedUploadUrl({
            uid: auth.uid,
            category: parsed.data.category as UploadCategory,
            contentType: parsed.data.contentType,
            filename: parsed.data.filename,
        });
        return NextResponse.json(result);
    } catch (err) {
        if (err instanceof StorageError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Failed to issue signed URL:', err);
        return NextResponse.json({ error: 'Failed to issue signed URL' }, { status: 500 });
    }
});
