"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import {
    HEARTBEAT_INTERVAL_MS,
    MAX_VIOLATIONS,
    SNAPSHOT_INTERVAL_MS,
    PHONE_SNAPSHOT_INTERVAL_MS,
    VIOLATION_DEDUPE_MS,
    type EventType,
    type ViolationType,
} from '@/lib/proctoring';

export type CameraState = 'pending' | 'ok' | 'denied' | 'lost' | 'unsupported';

interface Options {
    attemptId: string | null;
    enabled: boolean;
    initialViolations: number;
    /** The server closed the attempt (violation limit reached). */
    onAutoSubmitted: () => void;
    /**
     * Use the browser camera for photo snapshots. Off when the exam has a
     * live Zoom exam room — Zoom is the camera then, and some laptops can't
     * share one camera between Zoom and the browser.
     */
    useCamera?: boolean;
    /**
     * Taking the exam on a phone: the phone camera is the proctor (photos
     * every 20s), switching apps is the main thing watched, and full screen
     * isn't required (iPhones don't support it).
     */
    phone?: boolean;
}

export function fullscreenSupported(): boolean {
    return typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
}

export async function enterFullscreen(): Promise<boolean> {
    if (!fullscreenSupported()) return false;
    try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Browser-side proctoring for an exam attempt: full-screen enforcement,
 * tab/window-switch detection, copy/paste blocking, webcam snapshots and a
 * heartbeat. Violations are counted by the server; this hook only reports
 * them and reflects the server's count back.
 */
export function useExamProctor({ attemptId, enabled, initialViolations, onAutoSubmitted, useCamera = true, phone = false }: Options) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [camera, setCamera] = useState<CameraState>('pending');
    const [violationCount, setViolationCount] = useState(initialViolations);
    const [warning, setWarning] = useState<{ type: ViolationType; count: number } | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const activeRef = useRef(enabled);
    const lastViolationAtRef = useRef(0);
    // Violations are ignored until the camera is up plus a few seconds, so
    // the browser's own camera-permission prompt (which takes focus) never
    // counts against the student.
    const armedAtRef = useRef(Number.POSITIVE_INFINITY);
    // While paused (the student was sent back to Zoom to rejoin the exam
    // room), leaving the page is expected and not counted.
    const pausedRef = useRef(false);
    const onAutoSubmittedRef = useRef(onAutoSubmitted);
    onAutoSubmittedRef.current = onAutoSubmitted;

    useEffect(() => { setViolationCount(initialViolations); }, [initialViolations]);
    useEffect(() => { activeRef.current = enabled; }, [enabled]);

    const post = useCallback(async (body: Record<string, unknown>) => {
        if (!attemptId) return null;
        try {
            const res = await apiFetch(`/api/attempts/${attemptId}/proctor`, { method: 'POST', body: JSON.stringify(body) });
            if (!res.ok) return null;
            const data = await res.json();
            if (typeof data.violationCount === 'number') setViolationCount(data.violationCount);
            if (data.status && data.status !== 'in_progress' && activeRef.current) {
                activeRef.current = false;
                onAutoSubmittedRef.current();
            }
            return data;
        } catch {
            return null;
        }
    }, [attemptId]);

    const captureSnapshot = useCallback(async (reason: 'start' | 'interval' | 'violation', detail?: string) => {
        const video = videoRef.current;
        if (!attemptId || !video || !streamRef.current || video.readyState < 2) return;
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));
        if (!blob) return;
        const form = new FormData();
        form.append('image', blob, 'snapshot.jpg');
        form.append('reason', reason);
        if (detail) form.append('detail', detail);
        try {
            await apiFetch(`/api/attempts/${attemptId}/proctor/snapshots`, { method: 'POST', body: form });
        } catch {
            // A missed photo isn't worth interrupting the exam over.
        }
    }, [attemptId]);

    const reportViolation = useCallback(async (type: ViolationType, detail?: string) => {
        if (!activeRef.current || pausedRef.current) return;
        const now = Date.now();
        if (now < armedAtRef.current) return;
        if (now - lastViolationAtRef.current < VIOLATION_DEDUPE_MS) return;
        lastViolationAtRef.current = now;
        void captureSnapshot('violation', type);
        const data = await post({ kind: 'violation', type, detail });
        if (data && data.counted && activeRef.current) {
            setWarning({ type, count: data.violationCount });
        }
    }, [captureSnapshot, post]);

    const reportEvent = useCallback((type: EventType, detail?: string) => {
        if (!activeRef.current) return;
        void post({ kind: 'event', type, detail });
    }, [post]);

    const startCamera = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCamera('unsupported');
            return false;
        }
        try {
            streamRef.current?.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            stream.getVideoTracks().forEach(track => {
                track.onended = () => {
                    setCamera('lost');
                    void reportViolation('camera_off');
                };
            });
            setCamera('ok');
            return true;
        } catch {
            setCamera('denied');
            return false;
        }
    }, [reportViolation]);

    /** Call before submitting so leaving full screen afterwards isn't reported. */
    const stop = useCallback(() => {
        activeRef.current = false;
        streamRef.current?.getTracks().forEach(t => { t.onended = null; t.stop(); });
        streamRef.current = null;
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    }, []);

    // Start the camera and take the opening photo.
    useEffect(() => {
        if (!enabled || !attemptId) return;
        if (!useCamera) {
            armedAtRef.current = Date.now() + 3000;
            return;
        }
        let cancelled = false;
        (async () => {
            const ok = await startCamera();
            armedAtRef.current = Date.now() + 3000;
            if (ok && !cancelled) setTimeout(() => void captureSnapshot('start'), 1500);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, attemptId, useCamera]);

    // Record a reload of the exam page (it re-opens outside full screen).
    useEffect(() => {
        if (!enabled || !attemptId) return;
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (nav?.type === 'reload') reportEvent('page_reload');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, attemptId]);

    // Browser lockdown listeners.
    useEffect(() => {
        if (!enabled || !attemptId) return;

        setIsFullscreen(!!document.fullscreenElement);

        const onFullscreenChange = () => {
            const fs = !!document.fullscreenElement;
            setIsFullscreen(fs);
            if (!fs) void reportViolation('fullscreen_exit');
        };
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') {
                void reportViolation('tab_hidden');
                return;
            }
            // Phones pause the camera while the browser is in the background.
            const stream = streamRef.current;
            if (useCamera && (!stream || !stream.active || stream.getVideoTracks().some(t => t.readyState === 'ended'))) {
                void startCamera();
            } else if (videoRef.current?.paused) {
                void videoRef.current.play().catch(() => {});
            }
        };
        const onBlur = () => {
            if (phone) return;
            // Clicking into the embedded Zoom exam room moves focus into its
            // iframe, which fires a window blur too — that isn't leaving.
            setTimeout(() => {
                if (document.activeElement?.tagName === 'IFRAME') return;
                if (document.visibilityState === 'visible') void reportViolation('window_blur');
            }, 0);
        };
        const block = (type: EventType) => (e: Event) => {
            e.preventDefault();
            reportEvent(type);
        };
        const onCopy = block('copy');
        const onCut = block('cut');
        const onPaste = block('paste');
        const onContext = block('right_click');
        const onKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const mod = e.ctrlKey || e.metaKey;
            const devtools = key === 'f12' || (mod && e.shiftKey && ['i', 'j', 'c'].includes(key));
            const blocked = mod && ['c', 'x', 'v', 'p', 's', 'u'].includes(key);
            if (devtools || blocked) {
                e.preventDefault();
                reportEvent('blocked_shortcut', `${mod ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`);
            }
        };
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!activeRef.current) return;
            e.preventDefault();
            e.returnValue = '';
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('blur', onBlur);
        document.addEventListener('copy', onCopy);
        document.addEventListener('cut', onCut);
        document.addEventListener('paste', onPaste);
        document.addEventListener('contextmenu', onContext);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('cut', onCut);
            document.removeEventListener('paste', onPaste);
            document.removeEventListener('contextmenu', onContext);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [enabled, attemptId, reportViolation, reportEvent, phone, useCamera, startCamera]);

    // Heartbeat and periodic photos.
    useEffect(() => {
        if (!enabled || !attemptId) return;
        const beat = () => {
            if (!activeRef.current) return;
            const device = phone ? 'phone' : 'computer';
            void post(useCamera ? { kind: 'heartbeat', cameraOk: !!streamRef.current?.active, device } : { kind: 'heartbeat', device });
        };
        const first = setTimeout(beat, 2000);
        const hb = setInterval(beat, HEARTBEAT_INTERVAL_MS);
        const snap = setInterval(() => {
            if (activeRef.current && useCamera && document.visibilityState === 'visible') void captureSnapshot('interval');
        }, phone ? PHONE_SNAPSHOT_INTERVAL_MS : SNAPSHOT_INTERVAL_MS);
        return () => { clearTimeout(first); clearInterval(hb); clearInterval(snap); };
    }, [enabled, attemptId, post, captureSnapshot, useCamera, phone]);

    // Release the camera when leaving the page.
    useEffect(() => () => {
        streamRef.current?.getTracks().forEach(t => { t.onended = null; t.stop(); });
    }, []);

    return {
        videoRef,
        isFullscreen,
        camera,
        violationCount,
        maxViolations: MAX_VIOLATIONS,
        warning,
        dismissWarning: () => setWarning(null),
        startCamera,
        stop,
        reportViolation,
        /** Stop counting violations (student sent to Zoom to rejoin). */
        pause: () => { pausedRef.current = true; },
        /** Count violations again, after a short grace for returning to full screen. */
        resume: () => {
            pausedRef.current = false;
            armedAtRef.current = Date.now() + 3000;
        },
    };
}
