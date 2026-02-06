import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    userEmail: string;
    userName: string;
    courseId?: mongoose.Types.ObjectId;
    courseName?: string;
    instructorId?: string;
    instructorName?: string;
    amount: number;
    currency: string;
    type: 'enrollment' | 'refund' | 'payout' | 'chargeback';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod?: string;
    transactionId?: string;
    metadata?: Record<string, any>;
    processedAt?: Date;
    failureReason?: string;
    notes?: string;
}

const TransactionSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    courseName: { type: String },
    instructorId: { type: String, index: true },
    instructorName: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    type: {
        type: String,
        enum: ['enrollment', 'refund', 'payout', 'chargeback'],
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    paymentMethod: { type: String },
    transactionId: { type: String, unique: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
    failureReason: { type: String },
    notes: { type: String }
}, { timestamps: true });

// Compound indexes for financial queries
TransactionSchema.index({ type: 1, status: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ instructorId: 1, type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
