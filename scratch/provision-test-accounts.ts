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

const ADMIN_EMAIL = 'jonathandestiny693+admin@gmail.com';
const INSTRUCTOR_EMAIL = 'jonathandestiny693+instructor@gmail.com';
const PASSWORD = 'Academy2026Test!';

const ACCOUNTS = [
    { email: ADMIN_EMAIL, displayName: 'Academy Admin', role: 'admin' as const },
    { email: INSTRUCTOR_EMAIL, displayName: 'Test Instructor', role: 'instructor' as const },
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
                password: PASSWORD,
                displayName: a.displayName,
                emailVerified: true,
            });
            console.log(`Reset existing Firebase user: ${a.email}`);
        } catch (err: any) {
            if (err?.code !== 'auth/user-not-found') throw err;
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
        console.log(`Upserted Mongo profile: ${updated.email} (role=${updated.role})`);

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
        console.log(`${r.role.padEnd(10)}  ${r.email}   pwd=${r.password}   -> http://localhost:9002${r.portal}`);
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Provision failed:', err);
    process.exit(1);
});
