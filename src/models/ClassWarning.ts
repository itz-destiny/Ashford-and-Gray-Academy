import mongoose, { Schema } from 'mongoose';

// A warning a staff member gives a student during a live class (camera off,
// not participating, misconduct…). The student sees it as a pop-up on their
// own portal until they acknowledge it, and gets it by email too.
export interface IClassWarning {
    liveClassId: string;
    courseId: string;
    classTopic: string;
    courseTitle: string;
    studentUid: string;
    studentName: string;
    studentEmail: string;
    reason: string;
    note?: string;
    issuedByUid: string;
    issuedByName: string;
    issuedByRole: string;
    acknowledgedAt?: Date | null;
    createdAt?: Date;
}

const ClassWarningSchema = new Schema<IClassWarning>({
    liveClassId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    classTopic: { type: String, default: '' },
    courseTitle: { type: String, default: '' },
    studentUid: { type: String, required: true, index: true },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    reason: { type: String, required: true },
    note: { type: String, default: '' },
    issuedByUid: { type: String, required: true },
    issuedByName: { type: String, default: '' },
    issuedByRole: { type: String, default: '' },
    acknowledgedAt: { type: Date, default: null },
}, { timestamps: true });

ClassWarningSchema.index({ studentUid: 1, acknowledgedAt: 1 });

export default (mongoose.models.ClassWarning as mongoose.Model<IClassWarning>) || mongoose.model<IClassWarning>('ClassWarning', ClassWarningSchema);
