import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
    email: string;
    source?: string;
    confirmedAt?: Date;
    unsubscribedAt?: Date;
}

const NewsletterSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        source: { type: String, default: 'landing' },
        confirmedAt: { type: Date },
        unsubscribedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Newsletter ||
    mongoose.model<INewsletterSubscriber>('Newsletter', NewsletterSchema);
