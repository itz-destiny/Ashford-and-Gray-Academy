import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { withAuth } from '@/lib/auth-server';

// GET /api/payments/history
// Returns the authenticated user's own payment/enrollment transactions —
// what they've paid for, what's pending, and what failed. Powers the
// "Billing" tab in the account menu.
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        const transactions = await Transaction.find({ userId: auth.uid, type: 'enrollment' })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            transactions.map((tx: any) => ({
                id: tx._id.toString(),
                courseId: tx.courseId?.toString(),
                courseName: tx.courseName,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status,
                paymentMethod: tx.paymentMethod,
                transactionId: tx.transactionId,
                processedAt: tx.processedAt,
                createdAt: tx.createdAt,
                failureReason: tx.failureReason,
            }))
        );
    } catch (err: any) {
        console.error('GET /api/payments/history failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
