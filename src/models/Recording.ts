import mongoose, { Schema, type Document } from 'mongoose';

export type RecordingStatus = 'starting' | 'active' | 'ending' | 'complete' | 'failed' | 'aborted';

export interface IRecording extends Document {
    egressId: string;                 // LiveKit egress identifier
    roomName: string;                 // e.g. "course-<id>"
    courseId?: mongoose.Types.ObjectId | string;
    lessonId?: mongoose.Types.ObjectId | string;
    startedBy: string;                // Firebase UID
    startedByName?: string;
    status: RecordingStatus;
    startedAt: Date;
    endedAt?: Date;
    storagePath?: string;             // path inside Firebase Storage bucket
    fileSize?: number;                // bytes
    durationSec?: number;
    error?: string;
}

const RecordingSchema = new Schema<IRecording>(
    {
        egressId: { type: String, required: true, unique: true, index: true },
        roomName: { type: String, required: true, index: true },
        courseId: { type: Schema.Types.Mixed, index: true },
        lessonId: { type: Schema.Types.Mixed },
        startedBy: { type: String, required: true, index: true },
        startedByName: { type: String },
        status: {
            type: String,
            enum: ['starting', 'active', 'ending', 'complete', 'failed', 'aborted'],
            default: 'starting',
            index: true,
        },
        startedAt: { type: Date, required: true },
        endedAt: { type: Date },
        storagePath: { type: String },
        fileSize: { type: Number },
        durationSec: { type: Number },
        error: { type: String },
    },
    { timestamps: true }
);

RecordingSchema.index({ courseId: 1, status: 1, startedAt: -1 });

export default (mongoose.models.Recording as mongoose.Model<IRecording>) ||
    mongoose.model<IRecording>('Recording', RecordingSchema);
