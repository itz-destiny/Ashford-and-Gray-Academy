import mongoose, { Schema, Document } from 'mongoose';

/**
 * A single timetabled class session imported from the academy's master
 * timetable workbook. Instructors do not invent times — they pick from the
 * sessions already assigned to them here. Admins own the timetable and can
 * reassign the lecturer, course, or time of any session.
 */
export interface ITimetableSession extends Document {
    weekCode: string;           // "W01"
    day: string;                // "SAT" | "SUN" | "WED"
    sessionCode: string;        // "W01-SAT-CR1" — classroom/track slot code
    date: Date;                 // calendar date of the session
    startTime: Date;            // real datetime (date + start time)
    endTime: Date;              // real datetime (date + end time)
    programmeName: string;      // programme name as written in the timetable
    courseId?: string;          // matched Course._id, when resolvable
    courseTitle?: string;       // denormalized matched course title
    module: string;             // the lecture/module topic for this session
    lecturerName: string;       // lecturer name as written in the timetable
    instructorUid?: string;     // Firebase UID once an account is linked
    instructorEmail?: string;   // denormalized for display
    status: 'unassigned' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
    liveClassId?: string;       // LiveClass._id once a Zoom meeting is created
    zoomJoinUrl?: string;       // denormalized for quick display
    zoomStartUrl?: string;
    notes?: string;
}

const TimetableSessionSchema: Schema = new Schema({
    weekCode: { type: String, required: true, index: true },
    day: { type: String, required: true },
    sessionCode: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    programmeName: { type: String, required: true },
    courseId: { type: String, index: true },
    courseTitle: { type: String },
    module: { type: String, required: true },
    lecturerName: { type: String, required: true },
    instructorUid: { type: String, index: true },
    instructorEmail: { type: String },
    status: {
        type: String,
        enum: ['unassigned', 'assigned', 'scheduled', 'completed', 'cancelled'],
        default: 'assigned',
    },
    liveClassId: { type: String },
    zoomJoinUrl: { type: String },
    zoomStartUrl: { type: String },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.models.TimetableSession
    || mongoose.model<ITimetableSession>('TimetableSession', TimetableSessionSchema);
