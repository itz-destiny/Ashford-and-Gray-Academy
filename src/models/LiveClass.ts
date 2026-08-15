import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveClass extends Document {
    courseId: string;
    instructorId: string;
    topic: string;
    description?: string;
    startTime: Date;
    durationMinutes: number;
    zoomMeetingId: string;
    zoomJoinUrl: string;
    zoomStartUrl: string;
    zoomHostEmail?: string;
    zoomAccountKey?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const LiveClassSchema: Schema = new Schema({
    courseId: { type: String, required: true, index: true },
    instructorId: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, default: 60 },
    zoomMeetingId: { type: String, required: true },
    zoomJoinUrl: { type: String, required: true },
    zoomStartUrl: { type: String, required: true },
    // Which licensed Zoom host (and which of the school's Zoom accounts)
    // this meeting was booked under — lets the scheduler compute how many
    // overlapping meetings a given license already has at a given time.
    zoomHostEmail: { type: String },
    zoomAccountKey: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

LiveClassSchema.index({ status: 1, startTime: 1 });

export default mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
