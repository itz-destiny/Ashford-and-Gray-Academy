import mongoose, { Schema, Document } from 'mongoose';

/**
 * Singleton document (always looked up by the fixed `key: 'default'`) holding
 * institution-wide settings editable from the Registrar/Admin settings pages.
 */
export interface IPlatformSettings extends Document {
    key: string;
    institutionName: string;
    academicYear: string;
}

const PlatformSettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true, default: 'default' },
    institutionName: { type: String, default: 'Ashford & Gray Fusion Academy' },
    academicYear: { type: String, default: new Date().getFullYear().toString() },
}, { timestamps: true });

export default mongoose.models.PlatformSettings
    || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
