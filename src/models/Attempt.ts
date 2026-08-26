import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex?: number;
    textAnswer?: string;
    // null = not yet graded (always true for short_answer until an instructor grades it).
    pointsAwarded: number | null;
    isCorrect: boolean | null;
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
}

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
}, { timestamps: true });

export default mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
