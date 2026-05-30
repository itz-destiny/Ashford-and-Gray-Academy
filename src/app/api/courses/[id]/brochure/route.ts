import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AuthError, withAuth } from '@/lib/auth-server';
import { STATIC_COURSES } from '@/lib/courses-data';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';

type RouteParams = { params: Promise<{ id: string }> };

export const runtime = 'nodejs';

/**
 * GET /api/courses/[id]/brochure
 *
 * Streams a PDF brochure for a programme. Auth-gated: only signed-in users
 * (any role, including students) can download. The file itself lives at
 * /public/brochures/<brochurePath> but is never exposed publicly — callers
 * must present a valid Firebase ID token.
 */
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { params }) => {
    try {
        const { id } = await params;

        // Resolve brochurePath. Try the static catalogue first; fall back to
        // Mongo for dynamic courses that may store it on the document.
        let brochurePath: string | undefined;
        const staticCourse = STATIC_COURSES.find((c) => c.id === id);
        if (staticCourse?.brochurePath) {
            brochurePath = staticCourse.brochurePath;
        } else if (/^[a-fA-F0-9]{24}$/.test(id)) {
            await dbConnect();
            const course = await Course.findById(id).select('brochurePath').lean<{ brochurePath?: string } | null>();
            brochurePath = course?.brochurePath;
        }

        if (!brochurePath) {
            return NextResponse.json(
                { error: 'A brochure for this programme is not yet available.' },
                { status: 404 }
            );
        }

        // Defensive: strip any leading slash and reject traversal attempts.
        const safeName = brochurePath.replace(/^\/+/, '');
        if (safeName.includes('..') || safeName.includes('/') || safeName.includes('\\')) {
            return NextResponse.json({ error: 'Invalid brochure path.' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'public', 'brochures', safeName);
        let buffer: Buffer;
        try {
            buffer = await readFile(filePath);
        } catch {
            return NextResponse.json(
                { error: 'Brochure is not yet available. Please check back soon.' },
                { status: 404 }
            );
        }

        return new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${safeName}"`,
                'Content-Length': String(buffer.byteLength),
                'Cache-Control': 'private, no-store',
            },
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('brochure route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
