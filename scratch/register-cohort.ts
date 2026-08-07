import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import xlsx from 'xlsx';

const DRY_RUN = process.argv.includes('--dry-run');
const WORKBOOK_PATH = 'public/AGFA FLAGSHIP COHORT 2026 (1).xlsx';

// Previously held back pending a real instructor assignment for these 3
// programmes (their instructor was listed as an admin-only account with no
// instructor login). Per explicit instruction, register them anyway — the
// course's instructor field stays as-is and gets linked to a real instructor
// account later; don't block student registration on that.
const HELD_BACK_PROGRAMMES = new Set<string>([]);

// Sheet programme name -> real DB course title.
const PROGRAMME_TO_COURSE_TITLE: Record<string, string> = {
    'House Keeping and Domestic Management': 'Housekeeping & Domestic Management',
    'Hospitality Management': 'Hospitality Management',
    'Events and Protocol Management': 'Events & Protocol Management',
    'Hospitality and Global Relationship Management': 'Hospitality & Global Relationship Management',
    'Business Innovation and Entrepreneurship': 'Certificate in Business Innovation & Entrepreneurship',
    'Food and Beverage Management': 'Certificate in Food & Beverage Management',
    'Restaurant and Bar Service': 'Certificate in Restaurant & Bar Service',
    'Executive Assistant Management': 'Executive Assistant Management',
    'Hospitality Labour Management': 'Hospitality Workforce Management',
    'The Silent Standard': 'Professional Excellence & The Silent Standard',
};

type Row = {
    'S/N': number;
    NAMES: string;
    GENDER: string;
    'DATE OF BIRTH': string;
    'PHONE NO': string | number;
    'EMAIL ADDRESS': string;
    PROGRAMME: string;
    'PROGRAMME CODE': string;
    COHORT: string;
    SPONSOR: string;
};

function toTitleCase(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function genPassword(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const tag = parts.length > 1 ? `${parts[0]}-${parts[parts.length - 1]}` : (parts[0] || 'Student');
    return `AGFA-${tag}-2026`;
}

function cleanEmail(raw: string): string {
    return String(raw || '')
        .trim()
        .replace(/^[:;]+\s*/, '')  // stray leading colon/semicolon from copy-paste
        .replace(/\s+/g, '')       // internal spaces (e.g. "name @gmail. com")
        .replace(/[.,]+$/, '')     // stray trailing period/comma
        .replace(/@gamil\.com$/i, '@gmail.com'); // common typo, not a real provider
}

function isValidEmail(email: string): boolean {
    return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
    const { default: dbConnect } = await import('../src/lib/mongodb');
    const { default: User } = await import('../src/models/User');
    const { default: Enrollment } = await import('../src/models/Enrollment');
    const { default: Course } = await import('../src/models/Course');
    const { adminAuth } = await import('../src/lib/firebase-admin');
    const { sendEmail, emailTemplates } = await import('../src/lib/email');
    const { getEmailUrl } = await import('../src/lib/app-url');

    await dbConnect();
    const auth = adminAuth();

    const wb = xlsx.readFile(WORKBOOK_PATH);
    const rows: Row[] = xlsx.utils.sheet_to_json(wb.Sheets['Students'], { defval: '' });

    const courses = await Course.find({}).select('_id title').lean();
    const courseByTitle = new Map(courses.map((c: any) => [c.title, c._id.toString()]));

    const heldBack: Row[] = [];
    const missingEmail: Row[] = [];
    const unmappedProgramme: Row[] = [];
    const toRegister: Row[] = [];

    for (const row of rows) {
        const programme = String(row.PROGRAMME || '').trim();
        if (HELD_BACK_PROGRAMMES.has(programme)) {
            heldBack.push(row);
            continue;
        }
        if (!isValidEmail(cleanEmail(row['EMAIL ADDRESS']))) {
            missingEmail.push(row);
            continue;
        }
        if (!PROGRAMME_TO_COURSE_TITLE[programme]) {
            unmappedProgramme.push(row);
            continue;
        }
        toRegister.push(row);
    }

    console.log(`Total rows: ${rows.length}`);
    console.log(`Held back (pending instructor): ${heldBack.length}`);
    console.log(`Missing/invalid email: ${missingEmail.length}`);
    console.log(`Unmapped programme: ${unmappedProgramme.length}`);
    console.log(`To register: ${toRegister.length}`);
    console.log(DRY_RUN ? '\n--- DRY RUN: no accounts will be created ---\n' : '\n--- LIVE RUN ---\n');

    const results: any[] = [];

    for (const row of toRegister) {
        const rawName = String(row.NAMES || '').trim();
        const name = toTitleCase(rawName);
        const email = cleanEmail(row['EMAIL ADDRESS']).toLowerCase();
        const programme = String(row.PROGRAMME).trim();
        const courseTitle = PROGRAMME_TO_COURSE_TITLE[programme];
        const courseId = courseByTitle.get(courseTitle);

        if (!courseId) {
            results.push({ email, name, status: 'error', reason: `Course not found in DB: ${courseTitle}` });
            continue;
        }

        const phone = String(row['PHONE NO'] || '').replace(/\s+/g, '');
        const password = genPassword(name);

        if (DRY_RUN) {
            const existing = await User.findOne({ email }).lean();
            results.push({
                email, name, courseTitle,
                status: existing ? 'would-skip (already exists)' : 'would-create',
                password,
            });
            continue;
        }

        try {
            let fbUser;
            let isNewAccount = true;
            const existingMongoUser = await User.findOne({ email });

            if (existingMongoUser) {
                isNewAccount = false;
                fbUser = await auth.getUser(existingMongoUser.uid);
            } else {
                fbUser = await auth.createUser({
                    email,
                    password,
                    displayName: name,
                    emailVerified: true,
                });
                await User.create({
                    uid: fbUser.uid,
                    email,
                    displayName: name,
                    role: 'student',
                    phone,
                    country: 'Nigeria',
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    mustChangePassword: true,
                });
            }

            const enrollment = await Enrollment.findOneAndUpdate(
                { userId: fbUser.uid, courseId },
                { $setOnInsert: { userId: fbUser.uid, courseId, enrolledAt: new Date() } },
                { upsert: true, new: true }
            );

            if (isNewAccount) {
                const tpl = emailTemplates.enrollmentWelcome({
                    recipientName: name,
                    email,
                    password,
                    loginUrl: `${getEmailUrl()}/login`,
                    courseName: courseTitle,
                });
                await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
            }

            results.push({
                email, name, courseTitle,
                status: isNewAccount ? 'created' : 'enrolled-existing-account',
                uid: fbUser.uid,
            });

            // Gentle pacing so we don't hammer Resend/Firebase.
            await new Promise((r) => setTimeout(r, 250));
        } catch (err: any) {
            results.push({ email, name, courseTitle, status: 'error', reason: err.message });
        }
    }

    const fs = await import('fs');
    const outPath = `scratch/cohort-registration-results-${DRY_RUN ? 'dryrun-' : ''}${Date.now()}.json`;
    fs.writeFileSync(outPath, JSON.stringify({ heldBack, missingEmail, unmappedProgramme, results }, null, 2));
    console.log(`\nFull results written to ${outPath}`);

    const counts = results.reduce((acc: Record<string, number>, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});
    console.log('Summary:', JSON.stringify(counts, null, 2));

    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
