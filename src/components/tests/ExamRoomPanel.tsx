"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Loader2, Maximize2, Minimize2, RefreshCw, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomStatus = 'loading' | 'joining' | 'joined' | 'left' | 'error';

interface Props {
    liveClassId: string;
    /** The student pressed Leave inside Zoom (counted as a warning by the page). */
    onLeft: () => void;
    disabled?: boolean;
}

/**
 * The live Zoom exam room, embedded in the proctored exam page. Runs the
 * Zoom SDK in public/zoom-exam-room.html (an isolated document — see the
 * note there) and joins the student with their camera on so the proctor
 * can watch everyone live in gallery view.
 */
export function ExamRoomPanel({ liveClassId, onLeft, disabled }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const infoRef = useRef<any>(null);
    const frameReadyRef = useRef(false);
    const [status, setStatus] = useState<RoomStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const onLeftRef = useRef(onLeft);
    onLeftRef.current = onLeft;

    const sendJoinIfReady = useCallback(() => {
        if (infoRef.current && frameReadyRef.current && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'ZOOM_JOIN', payload: infoRef.current }, window.location.origin);
            setStatus('joining');
        }
    }, []);

    useEffect(() => {
        if (disabled) return;
        let cancelled = false;
        frameReadyRef.current = false;
        infoRef.current = null;
        setStatus('loading');
        setError(null);
        (async () => {
            try {
                const res = await apiFetch(`/api/live-classes/${liveClassId}/sdk-join`);
                const info = await res.json();
                if (!res.ok || !info.success) throw new Error(info.error || 'Could not open the exam room.');
                if (cancelled) return;
                infoRef.current = info;
                sendJoinIfReady();
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Could not open the exam room.');
                    setStatus('error');
                }
            }
        })();
        return () => { cancelled = true; };
    }, [liveClassId, attempt, disabled, sendJoinIfReady]);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.source !== iframeRef.current?.contentWindow) return;
            const data = event.data;
            if (!data || typeof data !== 'object') return;
            if (data.type === 'ZOOM_FRAME_READY') {
                frameReadyRef.current = true;
                sendJoinIfReady();
            } else if (data.type === 'ZOOM_JOINED') {
                setStatus('joined');
            } else if (data.type === 'ZOOM_ERROR') {
                setError(data.message || 'Could not join the exam room.');
                setStatus('error');
            } else if (data.type === 'ZOOM_LEFT') {
                setStatus('left');
                onLeftRef.current();
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [sendJoinIfReady]);

    if (disabled) return null;

    const rejoin = () => setAttempt(a => a + 1);

    return (
        <div
            className={cn(
                "fixed bottom-20 left-4 md:left-[19rem] z-20 rounded-xl overflow-hidden shadow-2xl border-2 border-white bg-[#0B1F3A] flex flex-col transition-all",
                expanded ? "w-[min(92vw,720px)] h-[min(70vh,480px)]" : "w-[min(80vw,340px)] h-[260px]"
            )}
        >
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#0B1F3A] text-white text-[11px] font-bold shrink-0">
                <span className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", status === 'joined' ? "bg-red-500 animate-pulse" : "bg-slate-400")} />
                    <Video className="w-3.5 h-3.5" /> Live exam room
                    <span className="font-medium text-white/70">
                        {status === 'joined' ? '· you are being watched live' : status === 'left' ? '· you left' : status === 'error' ? '· not connected' : '· connecting…'}
                    </span>
                </span>
                <button type="button" onClick={() => setExpanded(e => !e)} className="p-1 rounded hover:bg-white/10" aria-label={expanded ? 'Make smaller' : 'Make larger'}>
                    {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
            </div>
            <div className="relative flex-1 min-h-0">
                <iframe
                    key={attempt}
                    ref={iframeRef}
                    src="/zoom-exam-room.html"
                    className="w-full h-full border-0"
                    allow="camera; microphone; autoplay"
                    title="Live exam room"
                />
                {status !== 'joined' && status !== 'joining' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0B1F3A] text-white text-center p-4">
                        {status === 'loading' ? (
                            <><Loader2 className="w-6 h-6 animate-spin text-[#C8A96A]" /><p className="text-xs">Opening the exam room…</p></>
                        ) : (
                            <>
                                <p className="text-xs font-medium">
                                    {status === 'left' ? 'You left the exam room. Rejoin now — your proctor must be able to see you.' : error}
                                </p>
                                <button type="button" onClick={rejoin} className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#C8A96A] text-[#0B1F3A] text-xs font-black px-3 py-1.5">
                                    <RefreshCw className="w-3.5 h-3.5" /> {status === 'left' ? 'Rejoin exam room' : 'Try again'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
