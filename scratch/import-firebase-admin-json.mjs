// Read a freshly-downloaded Firebase service-account JSON and rewrite the
// three FIREBASE_ADMIN_* lines in .env.local with the correct values.
// Verifies the key parses cleanly before saving anything.
//
// Run with:  node scratch/import-firebase-admin-json.mjs <path-to-json>

import { readFileSync, writeFileSync } from 'node:fs';
import { createPrivateKey } from 'node:crypto';
import { resolve } from 'node:path';

const jsonPath = process.argv[2];
if (!jsonPath) {
    console.error('Usage: node scratch/import-firebase-admin-json.mjs <path-to-firebase-admin.json>');
    process.exit(1);
}

const raw = readFileSync(resolve(jsonPath), 'utf8');
let sa;
try {
    sa = JSON.parse(raw);
} catch (err) {
    console.error('FAILURE: that file is not valid JSON.', err.message);
    process.exit(1);
}

if (sa.type !== 'service_account' || !sa.private_key || !sa.client_email || !sa.project_id) {
    console.error('FAILURE: this does not look like a Firebase service account JSON. Expected fields: type=service_account, project_id, private_key, client_email.');
    process.exit(1);
}

// Verify the key parses cleanly via Node's crypto BEFORE we touch .env.local.
try {
    const k = createPrivateKey({ key: sa.private_key, format: 'pem' });
    console.log('Key parses cleanly:', k.asymmetricKeyType, k.asymmetricKeySize, 'bits');
} catch (err) {
    console.error('FAILURE: even the new key is unparseable —', err.message);
    process.exit(1);
}

// The .env.local format requires:
//   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// where every real newline is escaped as a literal backslash-n. dotenv will
// re-convert them when loading. JSON.stringify gives us exactly this.
const escapedKey = JSON.stringify(sa.private_key);

const envPath = new URL('../.env.local', import.meta.url);
const envText = readFileSync(envPath, 'utf8');

const updated = envText
    .replace(/^FIREBASE_ADMIN_PROJECT_ID=.*$/m, `FIREBASE_ADMIN_PROJECT_ID=${sa.project_id}`)
    .replace(/^FIREBASE_ADMIN_CLIENT_EMAIL=.*$/m, `FIREBASE_ADMIN_CLIENT_EMAIL=${sa.client_email}`)
    .replace(/^FIREBASE_ADMIN_PRIVATE_KEY=.*$/m, `FIREBASE_ADMIN_PRIVATE_KEY=${escapedKey}`);

if (updated === envText) {
    console.error('FAILURE: no FIREBASE_ADMIN_* lines were updated. Add them manually or check .env.local.');
    process.exit(1);
}

writeFileSync(envPath, updated);
console.log('Updated .env.local with fresh credentials.');
console.log('Project:    ', sa.project_id);
console.log('Client mail:', sa.client_email);
console.log('\nNext: run  node scratch/check-admin-key.mjs  to verify, then  node scratch/deploy-firestore-rules.mjs  to deploy.');
