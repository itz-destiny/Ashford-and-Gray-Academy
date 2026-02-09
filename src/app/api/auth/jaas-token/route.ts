import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// import { currentUser } from '@/lib/auth'; 

export async function GET() {
    try {
        // 1. Get current user (this depends on your auth setup, e.g. Firebase or NextAuth)
        // For now, we'll mock or use a basic check. In a real app, verify the session.
        // const user = await currentUser(); 
        // if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // 2. Get JaaS credentials from env
        const JAAS_API_KEY = process.env.JAAS_API_KEY;
        const JAAS_APP_ID = process.env.JAAS_APP_ID;
        let JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY;

        if (JAAS_PRIVATE_KEY) {
            // Robust PEM formatting for RS256
            // 1. Remove escaped newlines and literals
            let cleanKey = JAAS_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\n/g, '');

            // 2. Remove existing headers/footers and whitespace to get raw base64
            cleanKey = cleanKey
                .replace('-----BEGIN PRIVATE KEY-----', '')
                .replace('-----END PRIVATE KEY-----', '')
                .replace(/\s/g, '');

            // 3. Re-insert line breaks every 64 characters (Standard PEM)
            const matches = cleanKey.match(/.{1,64}/g);
            if (matches) {
                JAAS_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${matches.join('\n')}\n-----END PRIVATE KEY-----`;
            }
        }

        if (!JAAS_API_KEY || !JAAS_APP_ID || !JAAS_PRIVATE_KEY) {
            console.error("Missing JaaS credentials");
            return new NextResponse("Server Configuration Error: Missing JaaS Credentials", { status: 500 });
        }

        // 3. Generate JWT
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 7200; // 2 hours
        const nbf = now - 10;

        const payload = {
            aud: 'jitsi',
            iss: 'chat',
            sub: JAAS_APP_ID,
            room: '*',
            nbf: nbf,
            exp: exp,
            context: {
                features: {
                    livestreaming: true,
                    recording: true,
                    transcription: true,
                    "outbound-call": true
                },
                user: {
                    "moderator": true
                }
            }
        };

        const token = jwt.sign(payload, JAAS_PRIVATE_KEY, {
            algorithm: 'RS256',
            header: {
                kid: JAAS_API_KEY,
                alg: 'RS256'
            }
        });

        return NextResponse.json({ token });

    } catch (error: any) {
        console.error("JaaS Token Generation Error:", error.message);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
