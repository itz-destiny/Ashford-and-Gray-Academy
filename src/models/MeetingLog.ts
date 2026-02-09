import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingLog extends Document {
    meetingId: string;
    conversationId?: string;
    participants: {
        uid: string;
        displayName: string;
        role: string;
    }[];
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    status: 'scheduled' | 'active' | 'completed' | 'canceled';
    metadata: any;
}

const MeetingLogSchema: Schema = new Schema({
    meetingId: { type: String, required: true, unique: true },
    conversationId: { type: String },
    participants: [{
        uid: { type: String, required: true },
        displayName: { type: String, required: true },
        role: { type: String, required: true },
    }],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    status: { type: String, enum: ['scheduled', 'active', 'completed', 'canceled'], default: 'active' },
    metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.models.MeetingLog || mongoose.model<IMeetingLog>('MeetingLog', MeetingLogSchema);
