import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (req, { auth, params }) => {
    try {
        await dbConnect();
        const courseId = params.id as string;

        const classes = await LiveClass.find({ courseId }).sort({ startTime: 1 });

        return NextResponse.json({ success: true, classes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
