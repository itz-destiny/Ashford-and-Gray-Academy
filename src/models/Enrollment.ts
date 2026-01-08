import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
    userId: string;
    courseId: mongoose.Types.ObjectId;
    enrolledAt: Date;
    progress: number;
}

const EnrollmentSchema: Schema = new Schema({
    userId: { type: String, required: true }, // Firebase UID
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
