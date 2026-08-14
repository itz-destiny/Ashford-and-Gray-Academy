import mongoose, { Schema, Document } from 'mongoose';

// One document per (user, calendar day) — powers the "Institutional
// Engagement" GitHub-style heatmap on the student dashboard. Counters are
// incremented via atomic $inc upserts from /api/activity/ping, so concurrent
// pings from the same day never race or overwrite each other.
export interface IActivityLog extends Document {
    userId: string;
    date: string; // 'YYYY-MM-DD', local-agnostic (server date)
    dashboardVisits: number;
    courseVisits: number;
    siteVisits: number;
    total: number;
}

const ActivityLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    dashboardVisits: { type: Number, default: 0 },
    courseVisits: { type: Number, default: 0 },
    siteVisits: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
}, { timestamps: true });

ActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
