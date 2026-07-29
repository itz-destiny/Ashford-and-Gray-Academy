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
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

export default mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
