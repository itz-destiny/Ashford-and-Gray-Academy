import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: string;
    userEmail: string;
    userName: string;
    role: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    role: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    errorMessage: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound indexes for common queries
AuditLogSchema.index({ role: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
