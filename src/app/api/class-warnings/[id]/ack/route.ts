import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { withAuth } from '@/lib/auth-server';
import ClassWarning from '@/models/ClassWarning';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/class-warnings/[id]/ack — the student confirms they have seen the warning.
export const POST = withAuth<RouteParams>(async (_req: NextRequest, { params, auth }) => {
    try {
        await dbConnect();
        const { id } = await params;
        await ClassWarning.updateOne({ _id: id, studentUid: auth.uid, acknowledgedAt: null }, { $set: { acknowledgedAt: new Date() } }).catch(() => null);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('class-warnings ack error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
