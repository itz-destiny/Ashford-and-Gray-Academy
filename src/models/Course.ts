import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    category: string;
    instructorUid?: string;        // Firebase UID of the owning instructor.
    instructor: {
        name: string;
        avatarUrl: string;
        verified: boolean;
    };
    rating: number;
    reviews: number;
    duration: number;
    level: string;
    price: number;
    currency: string;              // ISO code, e.g. 'NGN', 'USD'.
    originalPrice?: number;
    imageUrl: string;
    imageHint: string;
    description: string;
    curriculum?: string[];
    status: 'draft' | 'pending' | 'published' | 'archived';
    // Extended fields used by the public detail page. All optional; if a
    // course doesn't populate them, the page hides that section.
    whoFor?: string[];                  // bullet list of target audiences
    learningOutcomes?: { module: string; topics: string[] }[];
    certificationDetails?: string[];    // bullet list of what they receive
    careerOpportunities?: string[];     // bullet list of career options
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    instructorUid: { type: String, index: true },
    instructor: {
        name: { type: String, required: true },
        avatarUrl: { type: String, required: true },
        verified: { type: Boolean, default: false },
    },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    level: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    originalPrice: { type: Number },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    description: { type: String, required: true },
    curriculum: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'draft' },
    whoFor: { type: [String], default: undefined },
    learningOutcomes: {
        type: [{
            module: { type: String, required: true },
            topics: { type: [String], default: [] },
        }],
        default: undefined,
    },
    certificationDetails: { type: [String], default: undefined },
    careerOpportunities: { type: [String], default: undefined },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
