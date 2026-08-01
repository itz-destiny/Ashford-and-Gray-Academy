import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (req, { auth }) => {
    try {
        if (auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const week = searchParams.get('week');
        const instructorUid = searchParams.get('instructorUid');
        const courseId = searchParams.get('courseId');
        const status = searchParams.get('status');

        const filter: Record<string, unknown> = {};
        if (week) filter.weekCode = week;
        if (instructorUid) filter.instructorUid = instructorUid;
        if (courseId) filter.courseId = courseId;
        if (status) filter.status = status;

        const sessions = await TimetableSession.find(filter).sort({ startTime: 1 });
        return NextResponse.json({ success: true, sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
