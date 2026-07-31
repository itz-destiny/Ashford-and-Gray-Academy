import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withAuth<RouteParams>(async (req, { params }) => {
    try {
        await dbConnect();
        const { id: courseId } = await params;

        const classes = await LiveClass.find({ courseId }).sort({ startTime: 1 });

        return NextResponse.json({ success: true, classes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
