"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Two ways to land here:
//   /live-classes/{liveClassId}     — every current Start/Join button
//   /live-classes/course-{courseId} — legacy link format baked into
//     already-sent class-reminder emails (see api/cron/class-reminders);
//     resolves to that course's current live class the same way the old
//     MeetingRoom shim did, then joins the same room below.
async function resolveLiveClassId(roomId: string): Promise<string | null> {
    if (!roomId.startsWith('course-')) return roomId;
    const courseId = roomId.slice('course-'.length);
    try {
        const res = await apiFetch(`/api/courses/${courseId}/live-classes`);
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const cls = body?.success && Array.isArray(body.classes) ? body.classes[0] : null;
        return cls?._id ? String(cls._id) : null;
    } catch {
        return null;
    }
}

// The Zoom Meeting SDK runs entirely inside public/zoom-classic-room.html —
// a plain static file, not part of this React tree. Its UI layer throws
// `Cannot read properties of undefined (reading 'ReactCurrentOwner')` when
// loaded alongside React 19 (a known, unresolved Zoom/React-19 conflict) in
// EVERY view mode, so it's kept in a fully isolated document instead.
export default function LiveClassRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const infoRef = useRef<any>(null);
    const frameReadyRef = useRef(false);
    // 'loading': our own setup (fetching join info, waiting for the iframe).
    // 'ready': handed off to Zoom's own pre-join screen (camera/mic check,
    // its "Join" button) — that's Zoom's UI now, so our overlay gets out of
    // the way instead of floating on top of it.
    // 'error': something failed before or during that handoff.
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);

    const sendJoinIfReady = () => {
        if (infoRef.current && frameReadyRef.current && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'ZOOM_JOIN', payload: infoRef.current }, window.location.origin);
            setStatus('ready');
        }
    };

    useEffect(() => {
        if (userLoading || !user || !roomId) return;
        let cancelled = false;

        const run = async () => {
            try {
                const liveClassId = await resolveLiveClassId(roomId);
                if (!liveClassId) {
                    throw new Error('There is no live class here right now. Check the timetable or contact your instructor.');
                }

                const res = await apiFetch(`/api/live-classes/${liveClassId}/sdk-join`);
                const info = await res.json();
                if (!res.ok || !info.success) {
                    throw new Error(info.error || 'Could not load this class.');
                }
                if (cancelled) return;
                setIsHost(info.role === 1);
                infoRef.current = info;
                sendJoinIfReady();
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Could not join this class.');
                    setStatus('error');
                }
            }
        };

        run();

        return () => { cancelled = true; };
    }, [roomId, user, userLoading]);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            if (data.type === 'ZOOM_FRAME_READY') {
                frameReadyRef.current = true;
                sendJoinIfReady();
            } else if (data.type === 'ZOOM_JOINED') {
                const info = infoRef.current;
                if (info?.role === 0) {
                    resolveLiveClassId(String(roomId)).then((id) => {
                        if (id) apiFetch(`/api/live-classes/${id}/attendance`, { method: 'POST' }).catch(() => null);
                    });
                }
            } else if (data.type === 'ZOOM_ERROR') {
                setError(data.message || 'Could not join this class.');
                setStatus('error');
            } else if (data.type === 'ZOOM_LEFT') {
                router.push(infoRef.current?.role === 1 ? '/instructor/schedule' : '/schedule');
            }
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [roomId, router]);

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0B1F3A]">
            {status !== 'ready' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-white bg-[#0B1F3A]">
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-[#C8A96A]" />
                            <p className="font-serif text-lg">Joining your class…</p>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-10 w-10 text-rose-400" />
                            <p className="font-serif text-lg text-center max-w-md px-6">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-2 border-white/30 text-white hover:bg-white/10 gap-2"
                                onClick={() => router.push(isHost ? '/instructor/schedule' : '/schedule')}
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        </>
                    )}
                </div>
            )}
            <iframe
                ref={iframeRef}
                src="/zoom-classic-room.html"
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
            />
        </div>
    );
}
