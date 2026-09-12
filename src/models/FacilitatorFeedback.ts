import mongoose, { Schema, Document } from 'mongoose';

const RATING_5 = ['excellent', 'good', 'average', 'poor', 'very_poor'] as const;
const FREQUENCY_5 = ['always', 'often', 'sometimes', 'rarely', 'never'] as const;
const ENGAGEMENT_5 = ['very_engaging', 'engaging', 'average', 'not_very_engaging', 'not_engaging_at_all'] as const;

export interface IFacilitatorFeedback extends Document {
    courseId: string;
    courseTitle: string;
    instructorUid?: string;
    instructorName?: string;
    studentUid: string;
    studentEmail: string;
    overallRating: typeof RATING_5[number];
    clarity: typeof FREQUENCY_5[number];
    approachable: typeof FREQUENCY_5[number];
    timeManagement: typeof RATING_5[number];
    engagement: typeof ENGAGEMENT_5[number];
    likedMost?: string;
    improvement?: string;
    otherComments?: string;
    createdAt: Date;
}

const FacilitatorFeedbackSchema: Schema = new Schema({
    courseId: { type: String, required: true, index: true },
    courseTitle: { type: String, required: true },
    instructorUid: { type: String },
    instructorName: { type: String },
    studentUid: { type: String, required: true },
    studentEmail: { type: String, required: true },
    overallRating: { type: String, enum: RATING_5, required: true },
    clarity: { type: String, enum: FREQUENCY_5, required: true },
    approachable: { type: String, enum: FREQUENCY_5, required: true },
    timeManagement: { type: String, enum: RATING_5, required: true },
    engagement: { type: String, enum: ENGAGEMENT_5, required: true },
    likedMost: { type: String, maxlength: 2000 },
    improvement: { type: String, maxlength: 2000 },
    otherComments: { type: String, maxlength: 2000 },
}, { timestamps: true });

// One submission per student per course — resubmitting isn't blocked at the
// DB level (a student may want to correct an honest mistake), but the API
// checks this to steer the UI toward "already submitted" by default.
FacilitatorFeedbackSchema.index({ courseId: 1, studentUid: 1 });

export default mongoose.models.FacilitatorFeedback
    || mongoose.model<IFacilitatorFeedback>('FacilitatorFeedback', FacilitatorFeedbackSchema);
