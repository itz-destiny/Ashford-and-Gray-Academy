// One-off provisioning script: creates an admin + instructor pair pre-verified
// so they bypass the signup OTP. Run with `node scratch/provision-test-accounts.mjs`.

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import admin from 'firebase-admin';
import mongoose from 'mongoose';

const ADMIN_EMAIL = 'jonathandestiny693+admin@gmail.com';
const INSTRUCTOR_EMAIL = 'jonathandestiny693+instructor@gmail.com';
const PASSWORD = 'Academy2026Test!';

const ACCOUNTS = [
    { email: ADMIN_EMAIL, displayName: 'Academy Admin', role: 'admin' },
    { email: INSTRUCTOR_EMAIL, displayName: 'Test Instructor', role: 'instructor' },
];

function readPem(raw) {
    if (!raw) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY missing');
    return raw.replace(/\\n/g, '\n');
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: readPem(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    }),
});

const auth = admin.auth();

await mongoose.connect(process.env.MONGODB_URI);

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: String,
    displayName: String,
    role: { type: String, enum: ['student', 'instructor', 'admin', 'registrar', 'course_registrar', 'finance'], default: 'student' },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,
}, { timestamps: true, strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const results = [];

for (const a of ACCOUNTS) {
    let user;
    try {
        user = await auth.getUserByEmail(a.email);
        // Make sure the password matches what we hand out.
        await auth.updateUser(user.uid, { password: PASSWORD, displayName: a.displayName, emailVerified: true });
        console.log(`Reset password on existing Firebase user: ${a.email}`);
    } catch (err) {
        if (err.code !== 'auth/user-not-found') throw err;
        user = await auth.createUser({
            email: a.email,
            password: PASSWORD,
            displayName: a.displayName,
            emailVerified: true,
        });
        console.log(`Created Firebase user: ${a.email}`);
    }

    const updated = await User.findOneAndUpdate(
        { uid: user.uid },
        {
            $set: {
                uid: user.uid,
                email: a.email,
                displayName: a.displayName,
                role: a.role,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted Mongo profile: ${updated.email} (role=${updated.role}, verified=${updated.emailVerified})`);

    results.push({
        role: a.role,
        email: a.email,
        password: PASSWORD,
        portal: a.role === 'admin' ? '/admin' : '/instructor',
        uid: user.uid,
    });
}

console.log('\n=== Login credentials ===');
for (const r of results) {
    console.log(`${r.role.padEnd(10)} ${r.email}   pwd=${r.password}   -> http://localhost:9002${r.portal}`);
}

await mongoose.disconnect();
process.exit(0);
