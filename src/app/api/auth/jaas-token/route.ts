import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { currentUser } from '@/lib/auth'; // Hypothetical auth helper, or use your existing session logic

export async function GET() {
    try {
        // 1. Get current user (this depends on your auth setup, e.g. Firebase or NextAuth)
        // For now, we'll mock or use a basic check. In a real app, verify the session.
        // const user = await currentUser(); 
        // if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // 2. Get JaaS credentials from env
        const JAAS_API_KEY = process.env.JAAS_API_KEY;
        const JAAS_APP_ID = process.env.JAAS_APP_ID;
        const JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Fix newline issues

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
            room: '*', // Allow access to any room, or scope to specific room
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
                    // id: user.id,
                    // name: user.name,
                    // email: user.email,
                    // avatar: user.image,
                    "moderator": true // Set to true for staff, false for students if desired
                }
            }
        };

        const token = jwt.sign(payload, JAAS_PRIVATE_KEY, {
            algorithm: 'RS256',
            header: {
                kid: JAAS_API_KEY
            }
        });

        return NextResponse.json({ token });

    } catch (error) {
        console.error("JaaS Token Generation Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
