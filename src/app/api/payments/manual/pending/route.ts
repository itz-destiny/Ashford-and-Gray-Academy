import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

// GET /api/payments/manual/pending
// Admin / finance only. Returns all pending manual bank-transfer transactions
// that are awaiting approval, enriched with proof URL from metadata.
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'finance']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);

        const pending = await Transaction.find({
            paymentMethod: 'bank_transfer',
            status: 'pending',
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const shaped = pending.map((tx: any) => ({
            id: tx._id.toString(),
            userId: tx.userId,
            userEmail: tx.userEmail,
            userName: tx.userName,
            courseId: tx.courseId?.toString(),
            courseName: tx.courseName,
            amount: tx.amount,
            currency: tx.currency,
            proofUrl: tx.metadata?.proofUrl || null,
            submittedAt: tx.createdAt,
        }));

        return NextResponse.json({ success: true, pending: shaped, count: shaped.length });
    } catch (err: any) {
        console.error('GET /api/payments/manual/pending failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
