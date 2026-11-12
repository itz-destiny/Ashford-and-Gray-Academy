"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, Video, VideoOff, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { enterFullscreen } from './useExamProctor';

const POLL_MS = 30_000;
/** Consecutive "not in room" readings before it counts — one missed poll shouldn't punish a student. */
const ABSENT_READINGS = 2;

interface Props {
    assessmentId: string;
    /** Called once each time the student is found to have left the room. */
    onLeft: () => void;
    /** True while the student is being sent back to Zoom (violations should pause). */
    onAwayChange: (away: boolean) => void;
    disabled?: boolean;
    /** No dashboard sidebar on the page (direct exam link). */
    standalone?: boolean;
}

/**
 * Keeps a proctored exam tied to its live Zoom exam room: the student joined
 * the room with the normal Zoom link before starting, and this re-checks
 * with Zoom every 30s that they're still in it. If they leave, the exam is
 * blocked until they rejoin.
 */
export function ExamRoomStatus({ assessmentId, onLeft, onAwayChange, disabled, standalone }: Props) {
    const [inRoom, setInRoom] = useState<boolean | null>(null);
    const [away, setAway] = useState(false);
    const [checking, setChecking] = useState(false);
    const [joinUrl, setJoinUrl] = useState<string | null>(null);
    const [zoomName, setZoomName] = useState<string>('');
    const missesRef = useRef(0);
    const awayRef = useRef(false);
    const cb = useRef({ onLeft, onAwayChange });
    cb.current = { onLeft, onAwayChange };

    const check = useCallback(async () => {
        try {
            const res = await apiFetch(`/api/assessments/${assessmentId}/exam-room/presence`);
            const data = await res.json();
            if (!res.ok || !data.hasRoom) return null;
            setJoinUrl(data.joinUrl);
            setZoomName(data.zoomName);
            setInRoom(data.inRoom);
            return data.inRoom as boolean | null;
        } catch {
            return null;
        }
    }, [assessmentId]);

    useEffect(() => {
        if (disabled) return;
        let stop = false;
        const tick = async () => {
            const r = await check();
            if (stop || r === null) return; // Zoom unreachable: never punish for that
            if (r) { missesRef.current = 0; return; }
            missesRef.current += 1;
            if (missesRef.current >= ABSENT_READINGS && !awayRef.current) {
                awayRef.current = true;
                setAway(true);
                cb.current.onLeft();
                cb.current.onAwayChange(true);
            }
        };
        void tick();
        const t = setInterval(() => void tick(), POLL_MS);
        return () => { stop = true; clearInterval(t); };
    }, [check, disabled]);

    const confirmBack = async () => {
        setChecking(true);
        const r = await check();
        setChecking(false);
        if (r !== false) {
            missesRef.current = 0;
            awayRef.current = false;
            setAway(false);
            await enterFullscreen();
            cb.current.onAwayChange(false);
        }
    };

    if (disabled) return null;

    return (
        <>
            <div className={cn(
                "fixed bottom-20 left-4 z-20 rounded-xl shadow-lg border px-3 py-2 text-xs font-bold flex items-center gap-2 bg-white",
                !standalone && "md:left-[19rem]",
                inRoom === false ? "border-red-200 text-red-700" : inRoom ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-500"
            )}>
                {inRoom === false ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {inRoom === null ? 'Checking the Zoom exam room…' : inRoom ? 'In the Zoom exam room · you are being watched live' : 'Not seen in the Zoom exam room'}
            </div>

            {away && (
                <div className="fixed inset-0 z-[60] bg-slate-950/95 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 space-y-5 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <VideoOff className="w-7 h-7 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">You left the exam room</h2>
                        <p className="text-slate-600 font-medium">
                            Zoom no longer shows you in the live exam room, and this has been recorded as a warning. Your exam is paused until you rejoin. The timer keeps running.
                        </p>
                        <ol className="text-left text-sm text-slate-700 font-medium space-y-2 bg-slate-50 rounded-xl p-4 list-decimal pl-8">
                            <li>Click <strong>Rejoin exam room</strong>. Zoom opens: join with your camera <strong>on</strong>{zoomName ? <> as <strong>{zoomName}</strong></> : null}.</li>
                            <li>Come back to this window and click <strong>I&apos;m back in the room</strong>.</li>
                        </ol>
                        {joinUrl && (
                            <Button asChild className="w-full h-12 rounded-xl bg-[#0B1F3A] hover:bg-[#13294a] font-black">
                                <a href={joinUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Rejoin exam room</a>
                            </Button>
                        )}
                        <Button onClick={confirmBack} disabled={checking} variant="outline" className="w-full h-12 rounded-xl font-black">
                            {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} I&apos;m back in the room
                        </Button>
                        {inRoom === false && !checking && (
                            <p className="text-xs text-red-700 font-bold">Zoom doesn&apos;t show you yet. Make sure you joined with your camera on, wait a few seconds, then try again.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
