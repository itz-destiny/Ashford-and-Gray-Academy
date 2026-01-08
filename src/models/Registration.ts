import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
    userId: string;
    eventId: mongoose.Types.ObjectId;
    registeredAt: Date;
}

const RegistrationSchema: Schema = new Schema({
    userId: { type: String, required: true }, // Firebase UID
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);
