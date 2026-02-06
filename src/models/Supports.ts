import mongoose, { Schema, Document } from 'mongoose';

// --- Lesson Model ---
export interface ILesson extends Document {
    moduleId: mongoose.Types.ObjectId;
    title: string;
    content: string; // HTML or Markdown
    videoUrl?: string;
    duration: number; // in minutes
    order: number;
    isLive: boolean;
    scheduledAt?: Date;
}

const LessonSchema: Schema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    duration: { type: Number, default: 0 },
    order: { type: Number, required: true },
    isLive: { type: Boolean, default: false },
    scheduledAt: { type: Date },
}, { timestamps: true });

export const Lesson = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

// --- Module Model ---
export interface IModule extends Document {
    courseId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    order: number;
}

const ModuleSchema: Schema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
}, { timestamps: true });

export const Module = mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);

// --- Assignment Model ---
export interface IAssignment extends Document {
    courseId: mongoose.Types.ObjectId;
    moduleId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate?: Date;
    points: number;
}

const AssignmentSchema: Schema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date },
    points: { type: Number, default: 100 },
}, { timestamps: true });

export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

// --- Submission Model ---
export interface ISubmission extends Document {
    assignmentId: mongoose.Types.ObjectId;
    userId: string; // Firebase UID
    content: string; // Text or link to file
    grade?: number;
    feedback?: string;
    submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    grade: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

// --- Message Model ---
export interface IMessage extends Document {
    senderId: string; // Firebase UID
    receiverId: string; // Firebase UID
    courseId?: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
}

const MessageSchema: Schema = new Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

// --- Conversation Model ---
export interface IConversation extends Document {
    participants: string[]; // Array of User UIDs
    lastMessage?: string;
    lastMessageAt?: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{ type: String, required: true }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

// --- Resource Model ---
export interface IResource extends Document {
    title: string;
    type: 'PDF' | 'Video' | 'Slides' | 'Code' | 'Other';
    courseId?: mongoose.Types.ObjectId;
    url: string;
    fileHint?: string;
}

const ResourceSchema: Schema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'Video', 'Slides', 'Code', 'Other'], default: 'PDF' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    url: { type: String, required: true },
    fileHint: { type: String },
}, { timestamps: true });

export const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
