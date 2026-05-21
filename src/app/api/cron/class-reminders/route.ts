import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Lesson, Module } from '@/models/Supports';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Live-class reminder cron.
 *
 * Vercel Cron should hit this every 15 minutes with the standard
 * `Authorization: Bearer ${CRON_SECRET}` header (set CRON_SECRET in env).
 * Locally you can also pass `?key=${CRON_SECRET}` for quick testing.
 *
 * Picks up Lessons where:
 *   isLive=true AND
 *   scheduledAt in (now, now+75min) AND
 *   reminderSentAt is null
 *
 * For each one, finds the parent course, fans out an email to every enrolled
 * student, then stamps reminderSentAt so the next tick is a no-op.
 */
export async function GET(req: NextRequest): Promise<Response> {
    if (!isAuthorizedCronCaller(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const now = new Date();
        const horizon = new Date(now.getTime() + 75 * 60 * 1000);

        const lessons = await Lesson.find({
            isLive: true,
            scheduledAt: { $gte: now, $lte: horizon },
            reminderSentAt: { $exists: false },
        }).lean();

        let emailsSent = 0;
        const lessonsProcessed: string[] = [];

        for (const lesson of lessons as any[]) {
            const mod = await Module.findById(lesson.moduleId).select('courseId').lean<{ courseId?: any } | null>();
            const courseId = mod?.courseId;
            if (!courseId) continue;

            const course = await Course.findById(courseId).select('title').lean<{ title?: string } | null>();
            if (!course?.title) continue;

            const enrollments = await Enrollment.find({ courseId }).select('userId').lean();
            if (enrollments.length === 0) {
                await Lesson.findByIdAndUpdate(lesson._id, { $set: { reminderSentAt: new Date() } });
                lessonsProcessed.push(String(lesson._id));
                continue;
            }

            const userIds = enrollments.map((e: any) => e.userId);
            const users = await User.find({ uid: { $in: userIds } }).select('email displayName emailVerified').lean();

            const { getAppUrl } = await import('@/lib/app-url');
            const appUrl = getAppUrl();
            const joinUrl = `${appUrl}/live-classes/course-${courseId}`;
            const startsAt = new Date(lesson.scheduledAt).toLocaleString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            });

            for (const u of users as any[]) {
                if (!u.email || !u.emailVerified) continue;
                const tpl = emailTemplates.classReminder({
                    recipientName: u.displayName || 'Student',
                    courseName: course.title,
                    lessonTitle: lesson.title,
                    startsAt,
                    joinUrl,
                });
                const r = await sendEmail({ to: u.email, subject: tpl.subject, html: tpl.html });
                if (r.success) emailsSent += 1;
            }

            await Lesson.findByIdAndUpdate(lesson._id, { $set: { reminderSentAt: new Date() } });
            lessonsProcessed.push(String(lesson._id));
        }

        return NextResponse.json({
            success: true,
            lessonsConsidered: lessons.length,
            lessonsProcessed: lessonsProcessed.length,
            emailsSent,
        });
    } catch (err) {
        console.error('class-reminders cron failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function isAuthorizedCronCaller(req: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        // No secret set: in development, allow; in production, refuse.
        return process.env.NODE_ENV !== 'production';
    }
    const header = req.headers.get('authorization') ?? '';
    if (header === `Bearer ${secret}`) return true;
    const url = new URL(req.url);
    if (url.searchParams.get('key') === secret) return true;
    return false;
}
