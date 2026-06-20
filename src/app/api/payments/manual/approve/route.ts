import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { finalizeSuccessfulPayment } from '@/app/api/payments/verify/route';

const requestSchema = z.object({
    transactionId: z.string().min(1),
    action: z.enum(['approve', 'reject']),
    note: z.string().max(500).optional(),
});

// POST /api/payments/manual/approve
// Admin-only. Approves or rejects a pending manual bank-transfer payment.
// Approval triggers the same finalization as a Paystack payment (enrollment + email).
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'finance']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
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

        const tx = await Transaction.findOne({
            _id: parsed.data.transactionId,
            paymentMethod: 'bank_transfer',
            status: 'pending',
        });

        if (!tx) {
            return NextResponse.json(
                { error: 'Transaction not found or already processed.' },
                { status: 404 }
            );
        }

        if (parsed.data.action === 'reject') {
            await Transaction.findByIdAndUpdate(tx._id, {
                $set: {
                    status: 'cancelled',
                    failureReason: parsed.data.note || 'Rejected by admin',
                    processedAt: new Date(),
                    metadata: {
                        ...tx.metadata,
                        reviewedBy: auth.uid,
                        reviewNote: parsed.data.note,
                    },
                },
            });
            return NextResponse.json({ success: true, action: 'rejected' });
        }

        // Approve — finalize using the same path as Paystack verification.
        await finalizeSuccessfulPayment({
            transactionId: tx._id.toString(),
            verifiedReference: `manual_approval_by_${auth.uid}`,
        });

        // Also store reviewer metadata
        await Transaction.findByIdAndUpdate(tx._id, {
            $set: {
                metadata: {
                    ...tx.metadata,
                    reviewedBy: auth.uid,
                    reviewedAt: new Date(),
                },
            },
        });

        return NextResponse.json({ success: true, action: 'approved', courseId: tx.courseId?.toString() });
    } catch (err: any) {
        console.error('POST /api/payments/manual/approve failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
