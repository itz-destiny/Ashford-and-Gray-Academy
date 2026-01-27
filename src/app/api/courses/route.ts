import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const instructorName = searchParams.get('instructorName');

        const query = instructorName ? { 'instructor.name': instructorName } : {};
        const [courses, enrollments] = await Promise.all([
            Course.find(query),
            Enrollment.find({})
        ]);

        const enrollmentCounts = enrollments.reduce((acc: any, en: any) => {
            const cid = en.courseId.toString();
            acc[cid] = (acc[cid] || 0) + 1;
            return acc;
        }, {});

        const coursesWithData = courses.map(course => ({
            ...course.toObject(),
            id: course._id.toString(),
            enrollmentCount: enrollmentCounts[course._id.toString()] || 0
        }));
        return NextResponse.json(coursesWithData);
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
