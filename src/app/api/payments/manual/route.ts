import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { withAuth } from '@/lib/auth-server';
import { resolveCourse } from '@/lib/resolve-course';
import Enrollment from '@/models/Enrollment';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 });

const requestSchema = z.object({
    courseId: z.string().min(1),
    proofUrl: z.string().url({ message: 'proofUrl must be a valid URL' }),
});

// POST /api/payments/manual
// Student submits a manual bank-transfer payment with a proof-of-payment screenshot.
// Creates a pending Transaction — an admin must approve it via /api/payments/manual/approve.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 5, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();

        const course = await resolveCourse(parsed.data.courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        if (course.status !== 'published') {
            return NextResponse.json({ error: 'This course is not currently open for enrolment.' }, { status: 400 });
        }
        if (!course.price || course.price <= 0) {
            return NextResponse.json({ error: 'This course is free — no payment required.' }, { status: 400 });
        }

        // Prevent duplicate submissions
        const alreadyEnrolled = await Enrollment.findOne({ userId: auth.uid, courseId: course.id });
        if (alreadyEnrolled) {
            return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 409 });
        }

        const existingPending = await Transaction.findOne({
            userId: auth.uid,
            courseId: course.id,
            status: 'pending',
            paymentMethod: 'bank_transfer',
        });
        if (existingPending) {
            return NextResponse.json({
                error: 'You already have a pending payment for this course. Please wait for admin approval.',
                transactionId: existingPending._id.toString(),
            }, { status: 409 });
        }

        const tx = await Transaction.create({
            userId: auth.uid,
            userEmail: auth.email,
            userName: auth.displayName,
            courseId: course.id,
            courseName: course.title,
            amount: course.price,
            currency: course.currency || 'NGN',
            type: 'enrollment',
            status: 'pending',
            paymentMethod: 'bank_transfer',
            metadata: {
                manualPayment: true,
                proofUrl: parsed.data.proofUrl,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Payment proof submitted. An admin will review and approve your enrolment shortly.',
            transactionId: tx._id.toString(),
        }, { status: 201 });
    } catch (err: any) {
        console.error('POST /api/payments/manual failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
