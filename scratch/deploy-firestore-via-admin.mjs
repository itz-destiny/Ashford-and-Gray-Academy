// Fallback: try via firebase-admin's credential -> getAccessToken().
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const cred = admin.app().options.credential;
const tok = await cred.getAccessToken();
console.log('Got access token (len ' + tok.access_token.length + '), expires:', tok.expires_in, 's');
process.exit(0);
