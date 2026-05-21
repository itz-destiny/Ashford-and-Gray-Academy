/**
 * Server-side helpers that mirror messages, conversation summaries, and
 * notifications into Firestore so clients can subscribe with onSnapshot()
 * instead of polling our API every few seconds.
 *
 * Mongo remains the system of record for durability, queryability, and
 * admin reporting. Firestore is purely the real-time push channel.
 *
 * Every helper is fire-and-forget: a Firestore write failure is logged but
 * never blocks the originating API response. Worst case a single push is
 * missed — the next refresh from Mongo will pick it up.
 */

import { adminFirestore } from './firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type RealtimeMessage = {
    messageId: string;
    conversationId?: string;
    senderId: string;
    senderName?: string;
    receiverId: string;
    content: string;
    courseId?: string;
    createdAt: Date;
};

export async function publishMessage(msg: RealtimeMessage): Promise<void> {
    try {
        const db = adminFirestore();
        const data: Record<string, unknown> = {
            conversationId: msg.conversationId ?? null,
            senderId: msg.senderId,
            senderName: msg.senderName ?? null,
            receiverId: msg.receiverId,
            content: msg.content,
            courseId: msg.courseId ?? null,
            createdAt: Timestamp.fromDate(msg.createdAt),
        };
        await db.collection('messages').doc(msg.messageId).set(data);

        // Update both participants' conversation summary so the conversations
        // list updates instantly. Use the smaller-uid::larger-uid as a stable
        // doc id when conversationId is missing.
        const convId = msg.conversationId || [msg.senderId, msg.receiverId].sort().join('::');
        const participants = [msg.senderId, msg.receiverId];

        await db.collection('conversations').doc(convId).set(
            {
                participants,
                lastMessage: msg.content,
                lastMessageAt: Timestamp.fromDate(msg.createdAt),
                lastSenderId: msg.senderId,
            },
            { merge: true }
        );
    } catch (err) {
        console.warn('publishMessage: Firestore mirror failed (non-fatal):', err);
    }
}

export type RealtimeNotification = {
    notificationId: string;
    userId: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
    createdAt: Date;
    isRead?: boolean;
};

export async function publishNotification(n: RealtimeNotification): Promise<void> {
    try {
        const db = adminFirestore();
        await db.collection('notifications').doc(n.notificationId).set({
            userId: n.userId,
            type: n.type,
            title: n.title,
            message: n.message ?? null,
            link: n.link ?? null,
            isRead: !!n.isRead,
            createdAt: Timestamp.fromDate(n.createdAt),
        });
    } catch (err) {
        console.warn('publishNotification: Firestore mirror failed (non-fatal):', err);
    }
}

/**
 * Mark a single notification read on Firestore (mirrors the Mongo write).
 * Best-effort; failures are logged.
 */
export async function markNotificationReadInFirestore(notificationId: string): Promise<void> {
    try {
        const db = adminFirestore();
        await db.collection('notifications').doc(notificationId).set(
            { isRead: true, readAt: FieldValue.serverTimestamp() },
            { merge: true }
        );
    } catch (err) {
        console.warn('markNotificationReadInFirestore failed (non-fatal):', err);
    }
}

export async function markAllNotificationsReadForUser(userId: string): Promise<void> {
    try {
        const db = adminFirestore();
        const batch = db.batch();
        const snap = await db
            .collection('notifications')
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .limit(500)
            .get();
        snap.forEach((doc) => batch.update(doc.ref, { isRead: true, readAt: FieldValue.serverTimestamp() }));
        if (!snap.empty) await batch.commit();
    } catch (err) {
        console.warn('markAllNotificationsReadForUser failed (non-fatal):', err);
    }
}
