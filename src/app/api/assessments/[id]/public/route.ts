import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * What the sign-in screen of a direct exam link shows before the student has
 * signed in: the exam's name, course and timing. Nothing else — no questions.
 * Only published assessments are visible.
 */
export async function GET(_req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json({ error: 'This exam link is not valid.' }, { status: 404 });
        }
        await dbConnect();
        const a: any = await Assessment.findById(id)
            .select('title type durationMinutes opensAt closesAt status courseId')
            .lean();
        if (!a || a.status !== 'published') {
            return NextResponse.json({ error: 'This exam is not available.' }, { status: 404 });
        }
        const course: any = a.courseId ? await Course.findById(a.courseId).select('title').lean() : null;
        return NextResponse.json({
            title: a.title,
            type: a.type,
            courseTitle: course?.title ?? null,
            durationMinutes: a.durationMinutes,
            opensAt: a.opensAt,
            closesAt: a.closesAt,
        });
    } catch (err) {
        console.error('assessments/[id]/public error:', err);
        return NextResponse.json({ error: 'Could not load this exam.' }, { status: 500 });
    }
}
