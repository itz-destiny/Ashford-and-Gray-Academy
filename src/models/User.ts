import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'student' | 'instructor' | 'admin' | 'registrar' | 'course_registrar' | 'finance';
    bio?: string;
    title?: string;
    school?: string;
    dateOfBirth?: string;
    expertise?: string;
    organization?: string;
}

const UserSchema: Schema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    role: { type: String, enum: ['student', 'instructor', 'admin', 'registrar', 'course_registrar', 'finance'], default: 'student' },
    bio: { type: String },
    title: { type: String },
    school: { type: String },
    dateOfBirth: { type: String },
    expertise: { type: String },
    organization: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
