import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex?: number;
    textAnswer?: string;
    // null = not yet graded (always true for short_answer until an instructor grades it).
    pointsAwarded: number | null;
    isCorrect: boolean | null;
}

// Proctoring record for an exam attempt (assessment.type === 'exam').
// `violations` count toward the auto-submit limit; `events` are blocked
// actions (copy, paste, right-click) that are logged but never counted.
export interface IProctorIncident {
    type: string;
    at: Date;
    detail?: string;
}

export interface IProctoring {
    violations: IProctorIncident[];
    events: IProctorIncident[];
    snapshotCount: number;
    lastSnapshotAt?: Date;
    lastSeenAt?: Date;
    lastViolationAt?: Date;
    cameraOk?: boolean;
    autoSubmitted: boolean;
}

export interface IAttempt extends Document {
    assessmentId: mongoose.Types.ObjectId;
    userId: string;
    answers: IAnswer[];
    score: number;
    maxScore: number;
    status: 'in_progress' | 'submitted' | 'graded';
    startedAt: Date;
    submittedAt?: Date;
    gradedAt?: Date;
    submitReason?: 'student' | 'time_up' | 'violations';
    proctoring?: IProctoring;
}

const IncidentSchema = new Schema<IProctorIncident>({
    type: { type: String, required: true },
    at: { type: Date, required: true },
    detail: { type: String },
}, { _id: false });

const ProctoringSchema = new Schema<IProctoring>({
    violations: { type: [IncidentSchema], default: [] },
    events: { type: [IncidentSchema], default: [] },
    snapshotCount: { type: Number, default: 0 },
    lastSnapshotAt: { type: Date },
    lastSeenAt: { type: Date },
    lastViolationAt: { type: Date },
    cameraOk: { type: Boolean },
    autoSubmitted: { type: Boolean, default: false },
}, { _id: false });

const AnswerSchema = new Schema<IAnswer>({
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number },
    textAnswer: { type: String },
    pointsAwarded: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null },
}, { _id: false });

const AttemptSchema: Schema = new Schema({
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    userId: { type: String, required: true, index: true },
    answers: { type: [AnswerSchema], default: [] },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'submitted', 'graded'], default: 'in_progress', index: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
    submitReason: { type: String, enum: ['student', 'time_up', 'violations'] },
    proctoring: { type: ProctoringSchema },
}, { timestamps: true });

export default mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
