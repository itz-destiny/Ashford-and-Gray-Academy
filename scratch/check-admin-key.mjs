// Verify that FIREBASE_ADMIN_PRIVATE_KEY is parseable.
// Run with:  node scratch/check-admin-key.mjs

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import crypto from 'node:crypto';

const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (!raw) {
    console.error('FAILURE: FIREBASE_ADMIN_PRIVATE_KEY missing');
    process.exit(1);
}

const pem = raw.replace(/\\n/g, '\n');

try {
    const key = crypto.createPrivateKey({ key: pem, format: 'pem' });
    console.log('SUCCESS: key parses cleanly');
    console.log('  type:', key.asymmetricKeyType);
    console.log('  size:', key.asymmetricKeySize, 'bits');
    process.exit(0);
} catch (err) {
    console.error('FAILURE: key is corrupted —', err.message);
    console.error('Re-download a fresh JSON from Firebase Console and paste the private_key value exactly.');
    process.exit(1);
}
