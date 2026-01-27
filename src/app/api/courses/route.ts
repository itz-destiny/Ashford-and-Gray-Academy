import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const instructorName = searchParams.get('instructorName');

        const query = instructorName ? { 'instructor.name': instructorName } : {};
        const courses = await Course.find(query);

        const coursesWithId = courses.map(course => ({
            ...course.toObject(),
            id: course._id.toString()
        }));
        return NextResponse.json(coursesWithId);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const course = await Course.create(body);
        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
