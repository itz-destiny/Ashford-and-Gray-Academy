import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { resolveCourse } from '@/lib/resolve-course';
import { WARNING_REASONS, WARNING_STAFF_ROLES } from '@/lib/class-warnings';
import { createNotification } from '@/lib/notifications';
import { sendEmail, emailTemplates } from '@/lib/email';
import LiveClass from '@/models/LiveClass';
import User from '@/models/User';
import ClassWarning from '@/models/ClassWarning';

const HTML_ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESC[c]);

// POST /api/class-warnings — give a student a warning during a live class.
// Body: { liveClassId, studentUid, reason, note? }. The student gets a pop-up
// on their portal (until they acknowledge it), a notification and an email.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, WARNING_STAFF_ROLES);
        await dbConnect();
        const body = await req.json().catch(() => ({}));
        const reason = String(body.reason || '').trim();
        const note = String(body.note || '').trim().slice(0, 500);
        if (!(WARNING_REASONS as readonly string[]).includes(reason)) return NextResponse.json({ error: 'Pick a reason.' }, { status: 400 });
        if (reason === 'Other' && !note) return NextResponse.json({ error: 'Say what the warning is for.' }, { status: 400 });

        const lc: any = await LiveClass.findById(String(body.liveClassId || '')).lean().catch(() => null);
        if (!lc) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        const student = await User.findOne({ uid: String(body.studentUid || ''), role: 'student' }).select('uid displayName email').lean<{ uid: string; displayName?: string; email?: string } | null>();
        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        const course = await resolveCourse(String(lc.courseId));
        const where = lc.topic || course?.title || 'your live class';

        const w = await ClassWarning.create({
            liveClassId: String(lc._id), courseId: String(lc.courseId), classTopic: lc.topic || '', courseTitle: course?.title || '',
            studentUid: student.uid, studentName: student.displayName || student.email || '', studentEmail: student.email || '',
            reason, note, issuedByUid: auth.uid, issuedByName: auth.displayName || auth.email, issuedByRole: auth.role,
        });
        const total = await ClassWarning.countDocuments({ studentUid: student.uid });

        void createNotification({
            userId: student.uid, type: 'system', title: 'Warning during your live class',
            message: `${reason}${note ? ` — ${note}` : ''}. Class: ${where}.`, actionUrl: '/dashboard',
        }).catch(() => {});
        if (student.email) {
            const tpl = emailTemplates.systemAlert({
                userName: esc(student.displayName || 'Student'),
                alertTitle: 'Warning during your live class',
                alertMessage: `You have been given a warning in <b>${esc(where)}</b>.<br><br><b>Reason:</b> ${esc(reason)}${note ? `<br><b>Note:</b> ${esc(note)}` : ''}<br><br>Please correct this straight away. Warnings are recorded on your file.`,
            });
            void sendEmail({ to: student.email, subject: 'Warning during your live class – Ashford & Gray', html: tpl.html }).catch(() => {});
        }
        return NextResponse.json({ ok: true, warningId: String(w._id), totalForStudent: total });
    } catch (err) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('POST class-warnings error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
