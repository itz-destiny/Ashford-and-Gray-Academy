import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function getIP(request: Request) {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
}

export async function GET(request: Request) {
    try {
        try {
            await limiter.check(null, 20, getIP(request));
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
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
        try {
            await limiter.check(null, 5, getIP(request)); // 5 per min for enrollments
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
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
