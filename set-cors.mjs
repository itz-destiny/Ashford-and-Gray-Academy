import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

/**
 * Script to set CORS policy for Firebase Storage bucket without using gsutil.
 * Usage: node set-cors.mjs
 */

async function setCors() {
    const bucketName = 'studio-6301887284-1e730.firebasestorage.app';

    // Initialize storage
    // Note: This assumes you have local ADC or GOOGLE_APPLICATION_CREDENTIALS set
    // If not, it will try to use active gcloud session.
    const storage = new Storage();

    try {
        console.log(`Setting CORS for bucket: ${bucketName}...`);

        await storage.bucket(bucketName).setCorsConfiguration([
            {
                maxAgeSeconds: 3600,
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                origin: ['http://localhost:9002', 'http://localhost:3000', 'http://localhost:3001'],
                responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
            },
        ]);

        console.log('✅ CORS configuration updated successfully!');
    } catch (err) {
        console.error('❌ Failed to update CORS:', err.message);
        console.log('\nAlternative: Try running the gsutil command from the project root instead of System32:');
        console.log(`gsutil cors set "c:\\Users\\pc\\Desktop\\project\\Ashford-and-Gray-Academy\\cors.json" gs://${bucketName}`);
    }
}

setCors();
