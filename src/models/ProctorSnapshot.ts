import mongoose, { Schema, Document } from 'mongoose';

/**
 * A webcam photo taken during a proctored exam. Stored in Mongo rather than
 * Vercel Blob because the Blob store is public-access only — exam photos of
 * students must only ever be served through an authenticated staff route.
 * Photos are small (~10KB JPEGs) and expire automatically after 90 days.
 */
export interface IProctorSnapshot extends Document {
    attemptId: mongoose.Types.ObjectId;
    assessmentId: mongoose.Types.ObjectId;
    userId: string;
    reason: 'start' | 'interval' | 'violation';
    detail?: string;
    contentType: string;
    data: Buffer;
    takenAt: Date;
}

export const SNAPSHOT_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const ProctorSnapshotSchema: Schema = new Schema({
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    userId: { type: String, required: true },
    reason: { type: String, enum: ['start', 'interval', 'violation'], required: true },
    detail: { type: String },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    takenAt: { type: Date, default: Date.now, expires: SNAPSHOT_RETENTION_SECONDS },
});

export default mongoose.models.ProctorSnapshot
    || mongoose.model<IProctorSnapshot>('ProctorSnapshot', ProctorSnapshotSchema);
