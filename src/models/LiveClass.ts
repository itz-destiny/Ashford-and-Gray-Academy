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
    // The real plaintext passcode — for whoever needs to join by manually
    // entering the Meeting ID + Passcode in the Zoom app instead of the
    // direct join link. Distinct from the `pwd` query param on zoomJoinUrl,
    // which is a URL-safe encoded token, not the real passcode.
    zoomPasscode?: string;
    zoomHostEmail?: string;
    zoomAccountKey?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    // Populated by the recording.completed Zoom webhook once cloud
    // recording finishes processing — recordingUrl is Zoom's own hosted
    // playback page, not a file we store ourselves.
    recordingUrl?: string;
    recordingPasscode?: string;
    recordingReadyAt?: Date;
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
    zoomPasscode: { type: String },
    // Which licensed Zoom host (and which of the school's Zoom accounts)
    // this meeting was booked under — lets the scheduler compute how many
    // overlapping meetings a given license already has at a given time.
    zoomHostEmail: { type: String },
    zoomAccountKey: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    recordingUrl: { type: String },
    recordingPasscode: { type: String },
    recordingReadyAt: { type: Date },
    // Attendee records written when a user clicks the class Join button.
    attendees: [
        {
            userId: { type: String },
            email: { type: String },
            role: { type: String },
            joinedAt: { type: Date },
        },
    ],
}, { timestamps: true });

LiveClassSchema.index({ status: 1, startTime: 1 });

export default mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
