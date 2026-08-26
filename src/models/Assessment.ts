import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionOption {
    text: string;
    isCorrect: boolean;
}

export interface IQuestion {
    type: 'mcq' | 'true_false' | 'short_answer';
    text: string;
    points: number;
    options?: IQuestionOption[];
    sampleAnswer?: string;
    order: number;
}

export interface IAssessment extends Document {
    title: string;
    description?: string;
    type: 'test' | 'exam';
    // null = cohort-wide, visible to every student regardless of programme.
    courseId?: mongoose.Types.ObjectId | null;
    createdBy: string;
    questions: IQuestion[];
    durationMinutes: number;
    opensAt: Date;
    closesAt: Date;
    status: 'draft' | 'published';
    totalPoints: number;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
}, { _id: false });

const QuestionSchema = new Schema<IQuestion>({
    type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], required: true },
    text: { type: String, required: true },
    points: { type: Number, default: 1, min: 0 },
    options: { type: [QuestionOptionSchema], default: undefined },
    sampleAnswer: { type: String },
    order: { type: Number, default: 0 },
});

const AssessmentSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['test', 'exam'], default: 'test' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', default: null, index: true },
    createdBy: { type: String, required: true, index: true },
    questions: { type: [QuestionSchema], default: [] },
    durationMinutes: { type: Number, required: true, min: 1 },
    opensAt: { type: Date, required: true },
    closesAt: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    totalPoints: { type: Number, default: 0 },
}, { timestamps: true });

AssessmentSchema.pre('save', function (next) {
    const doc = this as unknown as IAssessment;
    doc.totalPoints = (doc.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
    next();
});

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
