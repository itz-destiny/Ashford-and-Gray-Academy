import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    category: string;
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
    originalPrice?: number;
    imageUrl: string;
    imageHint: string;
    description: string;
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
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
    originalPrice: { type: Number },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
