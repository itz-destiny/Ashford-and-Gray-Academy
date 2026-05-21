"use client";

import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    limit as fbLimit,
    type Unsubscribe,
} from "firebase/firestore";
import { useDb } from "./provider";

/**
 * Realtime hooks backed by Firestore. The Mongo API endpoints remain the
 * source of truth — we use Firestore purely as the push channel so clients
 * don't have to poll. Every doc here is written by the server via the
 * Admin SDK (see src/lib/realtime-events.ts).
 */

export type RealtimeMessage = {
    id: string;
    conversationId: string | null;
    senderId: string;
    senderName?: string | null;
    receiverId: string;
    content: string;
    courseId?: string | null;
    createdAt: Date | null;
};

export type RealtimeConversation = {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageAt?: Date | null;
    lastSenderId?: string;
};

export type RealtimeNotification = {
    id: string;
    userId: string;
    type: string;
    title: string;
    message?: string | null;
    link?: string | null;
    isRead: boolean;
    createdAt: Date | null;
};

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "object" && value !== null && "toDate" in value) {
        try {
            return (value as { toDate: () => Date }).toDate();
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Subscribe to the live message stream for a single conversation.
 * Passing a null/empty conversationId stops the subscription.
 */
export function useConversationMessages(conversationId: string | null | undefined) {
    const db = useDb();
    const [messages, setMessages] = useState<RealtimeMessage[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setReady(false);
            return;
        }
        setReady(false);
        const q = query(
            collection(db, "messages"),
            where("conversationId", "==", conversationId),
            orderBy("createdAt", "asc"),
            fbLimit(500)
        );
        const unsub: Unsubscribe = onSnapshot(
            q,
            (snap) => {
                const next: RealtimeMessage[] = snap.docs.map((d) => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        conversationId: data.conversationId ?? null,
                        senderId: data.senderId,
                        senderName: data.senderName ?? null,
                        receiverId: data.receiverId,
                        content: data.content,
                        courseId: data.courseId ?? null,
                        createdAt: toDate(data.createdAt),
                    };
                });
                setMessages(next);
                setReady(true);
            },
            (err) => {
                console.warn("useConversationMessages snapshot error:", err);
                setReady(true);
            }
        );
        return () => unsub();
    }, [db, conversationId]);

    return { messages, ready };
}

/**
 * Subscribe to direct messages between the current user and a contact, when
 * we don't have a conversationId yet (e.g. ad-hoc DMs).
 */
export function useDirectMessages(myUid: string | null | undefined, otherUid: string | null | undefined) {
    const db = useDb();
    const [messages, setMessages] = useState<RealtimeMessage[]>([]);

    useEffect(() => {
        if (!myUid || !otherUid) {
            setMessages([]);
            return;
        }
        const convId = [myUid, otherUid].sort().join("::");
        const q = query(
            collection(db, "messages"),
            where("conversationId", "==", convId),
            orderBy("createdAt", "asc"),
            fbLimit(500)
        );
        const unsub = onSnapshot(q, (snap) => {
            setMessages(
                snap.docs.map((d) => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        conversationId: data.conversationId ?? null,
                        senderId: data.senderId,
                        senderName: data.senderName ?? null,
                        receiverId: data.receiverId,
                        content: data.content,
                        courseId: data.courseId ?? null,
                        createdAt: toDate(data.createdAt),
                    };
                })
            );
        });
        return () => unsub();
    }, [db, myUid, otherUid]);

    return messages;
}

/**
 * Subscribe to the conversation summaries that include the current user.
 */
export function useUserConversations(uid: string | null | undefined) {
    const db = useDb();
    const [conversations, setConversations] = useState<RealtimeConversation[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!uid) {
            setConversations([]);
            setReady(false);
            return;
        }
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", uid),
            orderBy("lastMessageAt", "desc"),
            fbLimit(100)
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                setConversations(
                    snap.docs.map((d) => {
                        const data = d.data() as any;
                        return {
                            id: d.id,
                            participants: data.participants || [],
                            lastMessage: data.lastMessage,
                            lastMessageAt: toDate(data.lastMessageAt),
                            lastSenderId: data.lastSenderId,
                        };
                    })
                );
                setReady(true);
            },
            (err) => {
                console.warn("useUserConversations snapshot error:", err);
                setReady(true);
            }
        );
        return () => unsub();
    }, [db, uid]);

    return { conversations, ready };
}

/**
 * Subscribe to the current user's notifications, newest first. Pass
 * unreadOnly to filter to unread.
 */
export function useUserNotifications(uid: string | null | undefined, opts?: { unreadOnly?: boolean; limit?: number }) {
    const db = useDb();
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        const constraints: any[] = [where("userId", "==", uid)];
        if (opts?.unreadOnly) constraints.push(where("isRead", "==", false));
        constraints.push(orderBy("createdAt", "desc"));
        constraints.push(fbLimit(opts?.limit ?? 50));

        const q = query(collection(db, "notifications"), ...constraints);
        const unsub = onSnapshot(
            q,
            (snap) => {
                const all: RealtimeNotification[] = snap.docs.map((d) => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        userId: data.userId,
                        type: data.type,
                        title: data.title,
                        message: data.message ?? null,
                        link: data.link ?? null,
                        isRead: !!data.isRead,
                        createdAt: toDate(data.createdAt),
                    };
                });
                setNotifications(all);
                setUnreadCount(all.filter((n) => !n.isRead).length);
            },
            (err) => {
                console.warn("useUserNotifications snapshot error:", err);
            }
        );
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, uid, opts?.unreadOnly, opts?.limit]);

    return { notifications, unreadCount };
}
