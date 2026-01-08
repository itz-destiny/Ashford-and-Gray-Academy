import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET() {
    try {
        await dbConnect();
        const courses = await Course.find({});
        const coursesWithId = courses.map(course => ({
            ...course.toObject(),
            id: course._id.toString()
        }));
        return NextResponse.json(coursesWithId);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
