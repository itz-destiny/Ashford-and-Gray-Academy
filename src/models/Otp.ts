import mongoose, { Schema, type Document } from 'mongoose';

export type OtpPurpose = 'signup' | 'login_2fa';

export interface IOtp extends Document {
    uid: string;                  // Firebase UID
    email: string;                // sanity check + audit
    purpose: OtpPurpose;
    codeHash: string;             // never store plaintext codes
    expiresAt: Date;
    attempts: number;
    consumedAt?: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        uid: { type: String, required: true, index: true },
        email: { type: String, required: true },
        purpose: { type: String, enum: ['signup', 'login_2fa'], required: true, index: true },
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        consumedAt: { type: Date },
    },
    { timestamps: true }
);

// Auto-delete expired/consumed OTPs after 24h (TTL index).
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });
OtpSchema.index({ uid: 1, purpose: 1, createdAt: -1 });

export default (mongoose.models.Otp as mongoose.Model<IOtp>) ||
    mongoose.model<IOtp>('Otp', OtpSchema);
