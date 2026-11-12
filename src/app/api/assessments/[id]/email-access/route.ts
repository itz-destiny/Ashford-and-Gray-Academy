import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import { resolveAssessmentId } from '@/lib/assessment-slug';
import { rateLimit } from '@/lib/rate-limit';

type RouteParams = { params: Promise<{ id: string }> };

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
const bodySchema = z.object({ email: z.string().email().max(200) });

// =============================================================================
// POST /api/assessments/[id]/email-access — exam link sign-in with email only
// (admin's decision, 12 Nov 2026: no password for exam links). Only for a
// student who may take this published exam; returns a Firebase sign-in token.
// Note: anyone who knows an enrolled student's email can open their exam.
// =============================================================================
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 10, ip);
        } catch {
            return NextResponse.json({ error: 'Too many attempts. Wait a minute, then try again.' }, { status: 429 });
        }

        const parsed = bodySchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        const email = parsed.data.email.trim().toLowerCase();

        const id = await resolveAssessmentId((await params).id);
        await dbConnect();
        const assessment = await Assessment.findById(id).select('status courseId openToAnyEmail closesAt').lean<any>();
        if (!assessment || assessment.status !== 'published') {
            return NextResponse.json({ error: 'This exam is not available.' }, { status: 404 });
        }

        const notFound = NextResponse.json({ error: "We couldn't find a student registered for this exam with that email. Use the email you registered with the academy." }, { status: 403 });
        const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let user = await User.findOne({ email: new RegExp(`^${escaped}$`, 'i') }).select('uid role').lean<any>();

        // Open test runs: any email can take the exam. A new email gets a
        // student account (no password) enrolled in the exam's course.
        if (assessment.openToAnyEmail) {
            if (new Date(assessment.closesAt).getTime() < Date.now()) {
                return NextResponse.json({ error: 'This exam has closed.' }, { status: 403 });
            }
            if (user && user.role !== 'student') {
                return NextResponse.json({ error: 'That email belongs to a staff account. Use a different email to take the exam.' }, { status: 403 });
            }
            if (!user) {
                let uid: string;
                try {
                    uid = (await adminAuth().getUserByEmail(email)).uid;
                } catch {
                    const displayName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60) || 'Exam Taker';
                    uid = (await adminAuth().createUser({ email, displayName })).uid;
                }
                const displayName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60) || 'Exam Taker';
                await User.updateOne(
                    { uid },
                    { $setOnInsert: { uid, email, displayName, role: 'student', hasSeenTutorial: true, mustChangePassword: false, source: 'open-exam' } },
                    { upsert: true },
                );
                user = { uid, role: 'student' };
            }
            if (assessment.courseId) {
                await Enrollment.updateOne(
                    { userId: user.uid, courseId: assessment.courseId },
                    { $setOnInsert: { userId: user.uid, courseId: assessment.courseId } },
                    { upsert: true },
                );
            }
            const token = await adminAuth().createCustomToken(user.uid);
            return NextResponse.json({ token });
        }

        if (!user || user.role !== 'student') return notFound;
        if (assessment.courseId) {
            const enrolled = await Enrollment.findOne({ userId: user.uid, courseId: assessment.courseId }).select('_id').lean();
            if (!enrolled) return notFound;
        }

        const token = await adminAuth().createCustomToken(user.uid);
        return NextResponse.json({ token });
    } catch (err) {
        console.error('email-access route error:', err);
        return NextResponse.json({ error: 'Could not sign you in. Please try again.' }, { status: 500 });
    }
}
