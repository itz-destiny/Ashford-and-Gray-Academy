// Provisioning script that reuses the project's own firebase-admin and Mongo
// setup (so we don't have to re-implement PEM parsing). Run with:
//   npx tsx scratch/provision-test-accounts.ts

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { adminAuth } from '@/lib/firebase-admin';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

const ADMIN_EMAIL = 'ashfordandgrayinstitute@gmail.com';
const ADMIN_PASSWORD = 'j%e^WtshERwoJ9itwk';
const INSTRUCTOR_EMAIL = 'jonathandestiny693@gmail.com';
const INSTRUCTOR_PASSWORD = 'M_yw5SbpvahCS0uv6v';

const ACCOUNTS = [
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: 'Academy Administrator', role: 'admin' as const },
    { email: INSTRUCTOR_EMAIL, password: INSTRUCTOR_PASSWORD, displayName: 'Destiny Jonathan', role: 'instructor' as const },
];

async function main() {
    await dbConnect();
    const auth = adminAuth();
    const results: { role: string; email: string; password: string; portal: string; uid: string }[] = [];

    for (const a of ACCOUNTS) {
        let user;
        try {
            user = await auth.getUserByEmail(a.email);
            await auth.updateUser(user.uid, {
                password: a.password,
                displayName: a.displayName,
                emailVerified: true,
            });
            console.log(`Reset existing Firebase user: ${a.email}`);
        } catch (err: any) {
            if (err?.code !== 'auth/user-not-found') throw err;
            user = await auth.createUser({
                email: a.email,
                password: a.password,
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
        console.log(`Upserted Mongo profile: ${updated.email} (role=${updated.role})`);

        results.push({
            role: a.role,
            email: a.email,
            password: a.password,
            portal: a.role === 'admin' ? '/admin' : '/instructor',
            uid: user.uid,
        });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    console.log('\n=== Login credentials ===');
    for (const r of results) {
        console.log(`${r.role.padEnd(10)}  ${r.email}   pwd=${r.password}   -> ${appUrl}${r.portal}`);
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Provision failed:', err);
    process.exit(1);
});
