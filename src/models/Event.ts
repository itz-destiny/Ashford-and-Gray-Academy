import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    category: string;
    date: string;
    location: string;
    price?: number;
    imageUrl: string;
    imageHint: string;
    organizer: string;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    organizer: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
