import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const instructorId = searchParams.get('instructorId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        // Build query
        const query: any = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (instructorId) query.instructorId = instructorId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [transactions, total, summary] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query),
            Transaction.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            transactions,
            summary: summary[0] || { totalAmount: 0, avgAmount: 0 },
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create transaction
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const transaction = await Transaction.create(body);

        return NextResponse.json({
            success: true,
            transaction
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
