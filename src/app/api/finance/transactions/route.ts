import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

const FINANCIAL_ROLES = ['admin', 'finance'] as const;

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, FINANCIAL_ROLES);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const instructorId = searchParams.get('instructorId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 500);
        const page = parseInt(searchParams.get('page') || '1', 10) || 1;

        const query: Record<string, unknown> = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (instructorId) query.instructorId = instructorId;
        if (startDate || endDate) {
            query.createdAt = {} as Record<string, Date>;
            if (startDate) (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
            if (endDate) (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const [transactions, total, summary] = await Promise.all([
            Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Transaction.countDocuments(query),
            Transaction.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' },
                    },
                },
            ]),
        ]);

        return NextResponse.json({
            success: true,
            transactions,
            summary: summary[0] || { totalAmount: 0, avgAmount: 0 },
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});

// POST is admin-only until a real payment gateway is wired up.
// TODO: when integrating Stripe/Paystack/Flutterwave, replace this with a
// webhook handler that verifies the provider's signature and is the ONLY way
// transactions get written.
const createSchema = z.object({
    userId: z.string().min(1),
    userEmail: z.string().email(),
    userName: z.string().min(1),
    courseId: z.string().optional(),
    courseName: z.string().optional(),
    instructorId: z.string().optional(),
    instructorName: z.string().optional(),
    amount: z.number(),
    currency: z.string().min(2).max(8).optional(),
    type: z.enum(['enrollment', 'refund', 'payout', 'chargeback']),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    notes: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const json = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const transaction = await Transaction.create(parsed.data);
        return NextResponse.json({ success: true, transaction }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});
