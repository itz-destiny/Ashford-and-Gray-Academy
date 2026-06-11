import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { withAuth } from '@/lib/auth-server';

/**
 * POST /api/payments/receipt
 * Accepts a multipart form upload with:
 *   - receipt (file): image or PDF of the bank transfer receipt
 *   - note (string): optional payment description
 *   - userId, email, displayName: identifying info
 *
 * For now we persist the metadata to MongoDB. The actual file can be
 * stored in Firebase Storage or on disk — we store the base64 inline
 * for simplicity until a storage bucket is configured.
 */
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        const formData = await req.formData();
        const receiptFile = formData.get('receipt') as File | null;
        const note = (formData.get('note') as string) || '';

        if (!receiptFile) {
            return NextResponse.json({ error: 'No receipt file provided.' }, { status: 400 });
        }

        if (receiptFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
        }

        await dbConnect();

        // Convert file to base64 for storage (small files only)
        const arrayBuffer = await receiptFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Use a dynamic import so this module works even if the model
        // doesn't exist yet — we create a lightweight inline schema.
        const mongoose = (await import('mongoose')).default;

        const PaymentReceiptSchema = mongoose.models.PaymentReceipt || mongoose.model('PaymentReceipt', new mongoose.Schema({
            userId: { type: String, required: true, index: true },
            email: String,
            displayName: String,
            fileName: String,
            fileType: String,
            fileSize: Number,
            fileData: String,
            note: String,
            status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
        }, { timestamps: true }));

        const receipt = await PaymentReceiptSchema.create({
            userId: auth.uid,
            email: auth.email,
            displayName: auth.displayName,
            fileName: receiptFile.name,
            fileType: receiptFile.type,
            fileSize: receiptFile.size,
            fileData: base64,
            note,
            status: 'pending',
        });

        return NextResponse.json({ success: true, receiptId: receipt._id }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/payments/receipt failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
