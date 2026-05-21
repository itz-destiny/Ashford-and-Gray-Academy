// Deploy firestore.rules + firestore.indexes.json directly to the Firebase
// Rules / Firestore Admin APIs using the project's existing service-account
// credentials — avoids the firebase-tools CLI which insists on the
// serviceusage.services.use IAM role our SDK service account doesn't have.
//
// Run:  node scratch/deploy-firestore-rules.mjs

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { readFileSync } from 'node:fs';
import { google } from 'googleapis';

const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error('FAILURE: FIREBASE_ADMIN_* env vars missing. Check .env.local.');
    process.exit(1);
}

const SCOPES = [
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/datastore',
];

const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: SCOPES,
});

await auth.authorize();
const headers = { Authorization: `Bearer ${auth.credentials.access_token}` };

// ---------- 1. firestore.rules ----------
const rulesContent = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

console.log('Creating ruleset…');
const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source: {
                files: [{ name: 'firestore.rules', content: rulesContent }],
            },
        }),
    }
);
const createBody = await createRes.json();
if (!createRes.ok) {
    console.error('FAILURE creating ruleset:', JSON.stringify(createBody, null, 2));
    process.exit(1);
}
console.log('Ruleset:', createBody.name);

console.log('Pointing release cloud.firestore → new ruleset…');
const releaseName = `projects/${PROJECT_ID}/releases/cloud.firestore`;

async function tryPatchRelease() {
    const res = await fetch(`https://firebaserules.googleapis.com/v1/${releaseName}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            release: { name: releaseName, rulesetName: createBody.name },
        }),
    });
    return { res, body: await res.json().catch(() => ({})) };
}

async function tryCreateRelease() {
    const res = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: releaseName, rulesetName: createBody.name }),
    });
    return { res, body: await res.json().catch(() => ({})) };
}

let { res: relRes, body: relBody } = await tryPatchRelease();
if (relRes.ok) {
    console.log('Release updated:', relBody.name);
} else if (relBody.error?.code === 404) {
    console.log('Release does not exist yet — creating…');
    const created = await tryCreateRelease();
    if (!created.res.ok) {
        console.error('FAILURE creating release:', JSON.stringify(created.body, null, 2));
        process.exit(1);
    }
    console.log('Release created:', created.body.name);
} else {
    console.error('FAILURE updating release:', JSON.stringify(relBody, null, 2));
    process.exit(1);
}

console.log('\nSUCCESS — Firestore rules are now live.\n');

// ---------- 2. firestore.indexes.json ----------
const indexJson = JSON.parse(
    readFileSync(new URL('../firestore.indexes.json', import.meta.url), 'utf8')
);

console.log('Submitting composite indexes (this is async on the server; full build can take minutes)…');
for (const idx of indexJson.indexes || []) {
    const body = {
        queryScope: idx.queryScope || 'COLLECTION',
        fields: idx.fields.map((f) => {
            const out = { fieldPath: f.fieldPath };
            if (f.order) out.order = f.order;
            if (f.arrayConfig) out.arrayConfig = f.arrayConfig;
            return out;
        }),
    };
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/${idx.collectionGroup}/indexes`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const responseBody = await res.json();
    if (res.ok) {
        console.log(`  + ${idx.collectionGroup} [${idx.fields.map((f) => f.fieldPath).join(', ')}]`);
    } else if (responseBody.error?.code === 409 || /already exists/i.test(responseBody.error?.message || '')) {
        console.log(`  = ${idx.collectionGroup} [${idx.fields.map((f) => f.fieldPath).join(', ')}] (already exists)`);
    } else {
        console.warn(`  ! ${idx.collectionGroup}: ${responseBody.error?.message || JSON.stringify(responseBody)}`);
    }
}

console.log('\nDone. Indexes may take a couple of minutes to build server-side.');
process.exit(0);
