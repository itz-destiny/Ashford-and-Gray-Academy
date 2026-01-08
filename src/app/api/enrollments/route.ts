import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const enrollments = await Enrollment.find({ userId }).populate('courseId').exec();

        // Map to match the previous structure if needed, or adjust frontend
        const formattedEnrollments = enrollments.map(enr => ({
            id: enr._id,
            userId: enr.userId,
            courseId: enr.courseId._id,
            enrolledAt: enr.enrolledAt,
            course: enr.courseId, // This is populated
        }));

        return NextResponse.json(formattedEnrollments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, courseId } = await request.json();
        await dbConnect();

        // Check if already enrolled
        const existing = await Enrollment.findOne({ userId, courseId });
        if (existing) {
            return NextResponse.json({ message: 'Already enrolled' });
        }

        const enrollment = await Enrollment.create({
            userId,
            courseId,
        });

        return NextResponse.json(enrollment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
