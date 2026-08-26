import { NextResponse, type NextRequest } from 'next/server';
import { del } from '@vercel/blob';
import dbConnect from '@/lib/mongodb';
import { Message } from '@/models/Supports';
import { adminFirestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RETENTION_DAYS = 30;
const EXPIRED_TEXT = '[Image expired — attachments are removed after 30 days]';

/**
 * Daily cron: deletes image attachments sent through messaging once they're
 * older than RETENTION_DAYS. Removes the file from Blob storage and replaces
 * the message content (in both Mongo and its Firestore realtime mirror) with
 * an expiry notice, rather than leaving a broken image link in old threads.
 *
 * Vercel Cron hits this with `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(req: NextRequest): Promise<Response> {
    if (!isAuthorizedCronCaller(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const imagePattern = /^https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?\S*)?$/i;

        const candidates = await Message.find({
            createdAt: { $lt: cutoff },
            content: { $regex: imagePattern },
        }).select('_id content').lean();

        let deleted = 0;
        const db = adminFirestore();

        for (const msg of candidates) {
            try {
                await del(msg.content);
            } catch (err) {
                console.warn(`delete-old-attachments: blob delete failed for message ${msg._id}:`, err);
            }

            await Message.findByIdAndUpdate(msg._id, { content: EXPIRED_TEXT });
            try {
                await db.collection('messages').doc(String(msg._id)).set({ content: EXPIRED_TEXT }, { merge: true });
            } catch (err) {
                console.warn(`delete-old-attachments: firestore mirror update failed for message ${msg._id}:`, err);
            }
            deleted++;
        }

        return NextResponse.json({ success: true, checked: candidates.length, deleted });
    } catch (error: any) {
        console.error('delete-old-attachments cron failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function isAuthorizedCronCaller(req: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return process.env.NODE_ENV !== 'production';
    }
    const header = req.headers.get('authorization') ?? '';
    if (header === `Bearer ${secret}`) return true;
    const url = new URL(req.url);
    if (url.searchParams.get('key') === secret) return true;
    return false;
}
