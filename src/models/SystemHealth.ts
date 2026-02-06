import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemHealth extends Document {
    metric: string;
    value: number;
    unit?: string;
    status: 'healthy' | 'warning' | 'critical';
    threshold?: {
        warning: number;
        critical: number;
    };
    metadata?: Record<string, any>;
    timestamp: Date;
}

const SystemHealthSchema: Schema = new Schema({
    metric: { type: String, required: true, index: true },
    value: { type: Number, required: true },
    unit: { type: String },
    status: {
        type: String,
        enum: ['healthy', 'warning', 'critical'],
        required: true,
        index: true
    },
    threshold: {
        warning: { type: Number },
        critical: { type: Number }
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound indexes for monitoring queries
SystemHealthSchema.index({ metric: 1, timestamp: -1 });
SystemHealthSchema.index({ status: 1, timestamp: -1 });

export default mongoose.models.SystemHealth || mongoose.model<ISystemHealth>('SystemHealth', SystemHealthSchema);
