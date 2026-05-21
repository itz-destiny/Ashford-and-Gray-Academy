import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

type ServiceAccount = {
    projectId: string;
    clientEmail: string;
    privateKey: string;
};

function readServiceAccount(): ServiceAccount {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawKey) {
        throw new Error(
            'Firebase Admin SDK is not configured. Set FIREBASE_ADMIN_PROJECT_ID, ' +
            'FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in the environment.'
        );
    }

    // .env files store the multi-line PEM as a single line with literal \n;
    // un-escape so the SDK gets a real PEM.
    const privateKey = rawKey.replace(/\\n/g, '\n');
    return { projectId, clientEmail, privateKey };
}

function getApp(): App {
    const existing = getApps()[0];
    if (existing) return existing;

    return initializeApp({
        credential: cert(readServiceAccount()),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

export const adminAuth = (): Auth => getAuth(getApp());
export const adminStorage = (): Storage => getStorage(getApp());
export const adminFirestore = (): Firestore => getFirestore(getApp());
