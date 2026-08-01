import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (_req, { auth }) => {
    try {
        if (!['instructor', 'admin'].includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const sessions = await TimetableSession.find({ instructorUid: auth.uid }).sort({ startTime: 1 });
        return NextResponse.json({ success: true, sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
