import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import { withAuth } from '@/lib/auth-server';
import { initializeTransaction, PaystackError } from '@/lib/paystack';
import { resolveCourse } from '@/lib/resolve-course';

const requestSchema = z.object({
    courseId: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
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
        // Resolve from the DB or the static catalogue — catalogue courses are
        // NOT created in the backend. No Course document is written here.
        const course = await resolveCourse(parsed.data.courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        if (course.status !== 'published') {
            return NextResponse.json(
                { error: 'This course is not currently open for enrollment.' },
                { status: 400 }
            );
        }
        if (!course.price || course.price <= 0) {
            return NextResponse.json(
                { error: 'This course is free — no payment required.' },
                { status: 400 }
            );
        }

        const existing = await Enrollment.findOne({ userId: auth.uid, courseId: course.id });
        if (existing) {
            return NextResponse.json(
                { error: 'You are already enrolled in this course.' },
                { status: 409 }
            );
        }

        const amountKobo = Math.round(course.price * 100);
        const currency = course.currency;

        // Record an intent up-front so the verify/webhook path can be idempotent.
        const pending = await Transaction.create({
            userId: auth.uid,
            userEmail: auth.email,
            userName: auth.displayName,
            courseId: course.id,
            courseName: course.title,
            amount: course.price,
            currency,
            type: 'enrollment',
            status: 'pending',
        });

        const reference = `enr_${pending._id.toString()}`;
        const init = await initializeTransaction({
            email: auth.email,
            amountKobo,
            currency,
            reference,
            metadata: {
                courseId: course.id,
                userId: auth.uid,
                transactionId: pending._id.toString(),
            },
        });

        await Transaction.findByIdAndUpdate(pending._id, {
            $set: { transactionId: init.reference },
        });

        return NextResponse.json({
            authorizationUrl: init.authorizationUrl,
            reference: init.reference,
        });
    } catch (err) {
        if (err instanceof PaystackError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('payments/initialize failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
