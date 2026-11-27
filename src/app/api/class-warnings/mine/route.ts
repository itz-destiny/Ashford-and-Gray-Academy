import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { withAuth } from '@/lib/auth-server';
import ClassWarning from '@/models/ClassWarning';

// GET /api/class-warnings/mine — the signed-in student's warnings not yet acknowledged.
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const rows = await ClassWarning.find({ studentUid: auth.uid, acknowledgedAt: null }).sort({ createdAt: 1 }).lean();
        const total = await ClassWarning.countDocuments({ studentUid: auth.uid });
        return NextResponse.json({
            total,
            warnings: rows.map((w) => ({
                _id: String(w._id), reason: w.reason, note: w.note, classTopic: w.classTopic, courseTitle: w.courseTitle,
                issuedByName: w.issuedByName, createdAt: w.createdAt,
            })),
        });
    } catch (err) {
        console.error('class-warnings/mine error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
