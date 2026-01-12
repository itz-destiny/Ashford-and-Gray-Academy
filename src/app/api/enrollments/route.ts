import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If no userId provided, it means we are fetching all (for admin)
    // In a real app, verify admin role from session/token here

    try {
        await dbConnect();
        const query = userId ? { userId } : {};
        const enrollments = await Enrollment.find(query).populate('courseId').exec();

        // Map to match the previous structure
        const formattedEnrollments = enrollments.map(enr => ({
            id: enr._id,
            userId: enr.userId,
            courseId: enr.courseId?._id,
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
