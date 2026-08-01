import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';
import { PaystackError, verifyTransaction } from '@/lib/paystack';
import { createNotification } from '@/lib/notifications';
import { sendEmail, emailTemplates } from '@/lib/email';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailUrl } from '@/lib/app-url';

/** `AGFA-<First>-<Last>-2026` — same simple, typeable scheme used for staff accounts. */
function generateStudentPassword(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean).map((p) => p.replace(/[^a-zA-Z]/g, ''));
    const tag = parts.length > 1 ? `${parts[0]}-${parts[parts.length - 1]}` : (parts[0] || 'Student');
    return `AGFA-${tag}-2026`;
}

const querySchema = z.object({
    reference: z.string().min(1),
});

/**
 * Client-driven verify (called after Paystack redirects back to /payments/callback).
 * The webhook is the authoritative source, but this gives the user an
 * immediate response. Both paths share `finalizeSuccessfulPayment` so the
 * second-arriving signal is a no-op (idempotent).
 */
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const parsed = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'reference is required' },
            { status: 400 }
        );
    }

    try {
        const verified = await verifyTransaction(parsed.data.reference);
        await dbConnect();
        const tx = await Transaction.findOne({ transactionId: verified.reference });
        if (!tx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }
        if (tx.userId !== auth.uid) {
            return NextResponse.json(
                { error: 'You can only verify your own payments.' },
                { status: 403 }
            );
        }

        if (verified.status !== 'success') {
            await Transaction.findByIdAndUpdate(tx._id, {
                $set: {
                    status: verified.status === 'failed' ? 'failed' : 'cancelled',
                    failureReason: `Paystack returned status=${verified.status}`,
                },
            });
            return NextResponse.json({
                status: verified.status,
                message: 'Payment was not completed.',
            });
        }

        await finalizeSuccessfulPayment({
            transactionId: tx._id.toString(),
            verifiedReference: verified.reference,
        });

        return NextResponse.json({ status: 'success', courseId: tx.courseId?.toString() });
    } catch (err) {
        if (err instanceof PaystackError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('payments/verify failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

/**
 * Marks the transaction completed and creates the Enrollment, exactly once.
 * Safe to call from both the verify route and the webhook route — uses
 * `findOneAndUpdate` with a status guard so a second call is a no-op.
 */
export async function finalizeSuccessfulPayment(params: {
    transactionId: string;
    verifiedReference: string;
}): Promise<void> {
    await dbConnect();

    // Flip the transaction to completed only if still pending; idempotent.
    const tx = await Transaction.findOneAndUpdate(
        { _id: params.transactionId, status: 'pending' },
        { $set: { status: 'completed', processedAt: new Date() } },
        { new: true }
    );
    if (!tx) {
        // Already finalized — nothing more to do.
        return;
    }
    if (!tx.courseId) return;

    const courseId = tx.courseId;
    // This is the user's very first enrollment iff none existed before this
    // payment — that's exactly when their account (created passwordless by
    // /api/applications) needs a real password issued for the first time.
    const isFirstEverEnrollment = (await Enrollment.countDocuments({ userId: tx.userId })) === 0;

    // Idempotent enrollment.
    await Enrollment.findOneAndUpdate(
        { userId: tx.userId, courseId },
        { $setOnInsert: { userId: tx.userId, courseId, enrolledAt: new Date() } },
        { upsert: true, new: true }
    );

    // First-ever enrollment: activate the account with a real, usable
    // password (the applicant never chose or saw one) and require them to
    // change it on first login. Best-effort — must not block the enrollment.
    if (isFirstEverEnrollment) {
        try {
            const password = generateStudentPassword(tx.userName || 'Student');
            await adminAuth().updateUser(tx.userId, { password });
            await User.findOneAndUpdate({ uid: tx.userId }, { $set: { mustChangePassword: true } });
            if (tx.userEmail) {
                const tpl = emailTemplates.enrollmentWelcome({
                    recipientName: tx.userName || 'Student',
                    email: tx.userEmail,
                    password,
                    loginUrl: `${getEmailUrl()}/login`,
                });
                await sendEmail({ to: tx.userEmail, subject: tpl.subject, html: tpl.html });
            }
        } catch (err) {
            console.error('finalizeSuccessfulPayment: password activation failed:', err);
        }
    }

    // Side-effects: in-app notification + receipt email. Best-effort; failures
    // here must NOT roll back the enrollment.
    try {
        // The course title was captured on the Transaction at initialize time,
        // so this works for static-catalogue courses that have no Course doc.
        const courseName = tx.courseName || 'your course';
        await createNotification({
            userId: tx.userId,
            type: 'payment',
            title: 'Payment successful',
            message: `You have been enrolled in ${courseName}.`,
            actionUrl: `/my-courses/${courseId}`,
            metadata: { courseId: courseId.toString(), transactionId: tx._id.toString() },
        });
        if (tx.userEmail) {
            const tpl = emailTemplates.paymentSuccess({
                studentName: tx.userName || 'Student',
                amount: tx.amount,
                courseName,
                transactionId: tx.transactionId || params.verifiedReference,
            });
            await sendEmail({ to: tx.userEmail, subject: tpl.subject, html: tpl.html });
        }

        const adminRecipients = [
            process.env.ADMIN_NOTIFICATION_EMAIL,
            process.env.ADMIN_EMAIL,
            process.env.CONTACT_EMAIL,
        ].filter(Boolean) as string[];

        if (adminRecipients.length > 0) {
            const adminTpl = emailTemplates.adminPaymentReceipt({
                userName: tx.userName || 'Student',
                userEmail: tx.userEmail || 'Unknown',
                courseName,
                courseId: courseId.toString(),
                amount: tx.amount,
                currency: tx.currency,
                transactionId: tx.transactionId || params.verifiedReference,
                paymentMethod: tx.paymentMethod || 'Paystack',
                paymentDate: tx.processedAt?.toISOString(),
            });
            await Promise.allSettled(adminRecipients.map((email) => sendEmail({ to: email, subject: adminTpl.subject, html: adminTpl.html })));
        }
    } catch (err) {
        console.error('finalizeSuccessfulPayment side-effects failed:', err);
    }
}
