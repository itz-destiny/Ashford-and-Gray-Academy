"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname } from "next/navigation";
import { examBase } from "@/lib/exam-link";
import { ExamResult } from "@/components/tests/ExamResult";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, ClipboardCheck, CheckCircle2, ShieldAlert, Camera, AlertTriangle, Video } from "lucide-react";
import { MAX_VIOLATIONS, isProctored } from "@/lib/proctoring";
import { enterFullscreen } from "@/components/tests/useExamProctor";
import { isPhoneDevice } from "@/lib/device";

interface Assessment {
    _id: string;
    title: string;
    description?: string;
    type: string;
    durationMinutes: number;
    opensAt: string;
    closesAt: string;
    questions: any[];
    totalPoints: number;
    myAttempt: { _id: string; status: string; score: number; maxScore: number; submitReason?: string } | null;
    proctorLiveClassId?: string;
}

interface RoomInfo { joinUrl: string; zoomName: string; inRoom: boolean | null }

export default function TestIntroPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [cameraStatus, setCameraStatus] = useState<'idle' | 'checking' | 'ok' | 'denied' | 'unsupported'>('idle');
    const [agreed, setAgreed] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        apiFetch(`/api/assessments/${id}`).then(async res => {
            if (res.ok) setAssessment(await res.json());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    const proctored = isProctored(assessment);
    // Exams with a live Zoom exam room: the student joins it with the normal
    // Zoom link, and Zoom (not the browser) is the camera.
    // On a phone the student joins the Zoom room first, then comes back to
    // the browser. The browser never opens the camera then: on a phone that
    // takes the camera away from Zoom and drops the student's Zoom video.
    const [phone, setPhone] = useState(false);
    useEffect(() => { setPhone(isPhoneDevice()); }, []);
    const hasRoom = proctored && !!assessment?.proctorLiveClassId;
    const [room, setRoom] = useState<RoomInfo | null>(null);
    const [roomChecking, setRoomChecking] = useState(false);
    const [roomChecked, setRoomChecked] = useState(false);

    const checkRoom = async () => {
        setRoomChecking(true);
        try {
            const res = await apiFetch(`/api/assessments/${id}/exam-room/presence`);
            const data = await res.json();
            if (res.ok && data.hasRoom) setRoom({ joinUrl: data.joinUrl, zoomName: data.zoomName, inRoom: data.inRoom });
        } finally {
            setRoomChecking(false);
        }
    };

    useEffect(() => {
        if (hasRoom) void checkRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasRoom]);

    const ready = hasRoom
        ? room?.inRoom === true
        : cameraStatus === 'ok';

    const checkCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraStatus('unsupported');
            return;
        }
        setCameraStatus('checking');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            setCameraStatus('ok');
        } catch {
            setCameraStatus('denied');
        }
    };

    useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

    const handleStart = async (opts: { auto?: boolean } = {}) => {
        setStarting(true);
        if (proctored) {
            // Must run inside the click so the browser allows full screen.
            // (Auto-start has no click: the exam page asks for full screen.)
            if (!phone && !opts.auto) await enterFullscreen();
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        try {
            const res = await apiFetch(`/api/assessments/${id}/attempts`, { method: 'POST' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Could not start the test.');
            }
            router.push(`${examBase(pathname)}/${id}/take`);
        } catch (err: any) {
            if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
            toast({ variant: "destructive", title: "Can't start test", description: err.message });
            setStarting(false);
        }
    };

    // Exam link (/exam/…): start or continue automatically.
    const standalone = examBase(pathname) === '/exam';
    const autoStartedRef = useRef(false);
    useEffect(() => {
        if (!standalone || !assessment || autoStartedRef.current) return;
        const t = Date.now();
        const open = t >= new Date(assessment.opensAt).getTime() && t <= new Date(assessment.closesAt).getTime();
        const att = assessment.myAttempt;
        if (!open || (att && att.status !== 'in_progress')) return;
        autoStartedRef.current = true;
        if (att) router.replace(`/exam/${id}/take`);
        else void handleStart({ auto: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [standalone, assessment]);

    const continueTest = async () => {
        if (proctored && !phone) await enterFullscreen();
        router.push(`${examBase(pathname)}/${id}/take`);
    };

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }
    if (!assessment) {
        return <div className="p-10 text-center text-slate-400">Test not found.</div>;
    }

    const now = Date.now();
    const isOpen = now >= new Date(assessment.opensAt).getTime() && now <= new Date(assessment.closesAt).getTime();
    const attempt = assessment.myAttempt;

    // Exam link: after submitting, show the score reveal.
    if (standalone && attempt && attempt.status !== 'in_progress') {
        const pendingMarking = assessment.questions.some((q: any) => q.type === 'short_answer') && attempt.status !== 'graded';
        return <ExamResult title={assessment.title} score={attempt.score} maxScore={attempt.maxScore} submitReason={attempt.submitReason as any} pendingMarking={pendingMarking} />;
    }

    // Exam link: straight into the exam once it's open (no instructions page).
    if (standalone && isOpen && (!attempt || attempt.status === 'in_progress')) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
                <p className="font-serif text-lg text-[#0B1F3A]">Opening your exam…</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8 animate-in fade-in duration-700">
            <Card className="rounded-none border-0 border-t-4 border-t-[#C8A96A] shadow-sm bg-white">
                <CardContent className="p-6 sm:p-10 space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">{proctored ? 'Proctored Examination' : assessment.type === 'exam' ? 'Examination' : 'Assessment'}</p>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#0B1F3A] leading-snug">{assessment.title}</h1>
                    {assessment.description && <p className="text-slate-600">{assessment.description}</p>}

                    <div className="grid grid-cols-3 divide-x divide-[#0B1F3A]/10 bg-[#FAF9F6] border border-[#0B1F3A]/10">
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions</p>
                            <p className="font-serif text-2xl text-[#0B1F3A] tabular-nums">{assessment.questions.length}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</p>
                            <p className="font-serif text-2xl text-[#0B1F3A] tabular-nums">{assessment.durationMinutes} min</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks</p>
                            <p className="font-serif text-2xl text-[#0B1F3A] tabular-nums">{assessment.totalPoints}</p>
                        </div>
                    </div>

                    {proctored && (!attempt || attempt.status === 'in_progress') && isOpen && (
                        <div className="space-y-5 pt-2">
                            <div className="flex items-center gap-2 font-serif text-lg text-[#0B1F3A]">
                                <ShieldAlert className="w-5 h-5 text-[#C8A96A]" /> Before you begin
                            </div>
                            <ul className="text-sm text-slate-700 space-y-2.5 list-disc pl-5 marker:text-[#C8A96A]">
                                {hasRoom && phone ? (
                                    <>
                                        <li>You&apos;re taking this exam <strong>on your phone</strong>. First <strong>join the live Zoom exam room</strong> in the Zoom app with your camera on, then come back to this page in your browser. <strong>Do not leave the Zoom meeting</strong> — it keeps running in the background while you write.</li>
                                        <li>Your <strong>Zoom camera is your proctor</strong>: keep it on in the Zoom meeting. This page does <strong>not</strong> use your phone camera, so Zoom keeps it. The site checks with Zoom every 30 seconds that you are still in the room — <strong>leaving the room is a warning</strong>.</li>
                                        <li>Once you start, <strong>stay on this page</strong>. Switching to Zoom, WhatsApp or any other app, answering a call or locking your screen is a <strong>warning</strong>. Turn on <strong>Do Not Disturb</strong>, charge your phone, and prop it up so your <strong>face is clearly visible</strong>.</li>
                                    </>
                                ) : hasRoom ? (
                                    <>
                                        <li>You sit the exam in a <strong>live Zoom exam room</strong>: your proctor <strong>watches you live</strong> on camera and the room is <strong>recorded</strong>. Join it below before you start, with your <strong>camera on</strong>, and keep Zoom open (you may minimise it) until you submit.</li>
                                        <li>The site checks with Zoom every 30 seconds that you are still in the room. <strong>Leaving the room is a warning</strong> and pauses your exam until you rejoin.</li>
                                    </>
                                ) : phone ? (
                                    <>
                                        <li>You&apos;re taking this exam <strong>on your phone</strong>. Your <strong>front camera stays on</strong> for the whole exam and photographs you every 20 seconds and whenever a warning is recorded. Your proctor sees these photos live.</li>
                                        <li><strong>Stay on this page.</strong> Leaving the browser, switching to another app or tab, opening WhatsApp, answering a call or locking your screen is a <strong>warning</strong>.</li>
                                        <li>Before you start: turn on <strong>Do Not Disturb</strong> (or airplane mode with Wi-Fi on) so calls and notifications don&apos;t interrupt you, charge your phone, and prop it up so your <strong>face is clearly visible</strong>.</li>
                                    </>
                                ) : (
                                    <li>Your <strong>camera stays on</strong> for the whole exam and takes a photo of you every minute and whenever a warning is recorded.</li>
                                )}
                                {!phone && (
                                    <li>The exam runs in <strong>full screen</strong>. Leaving full screen, switching tabs, minimising or opening another app or window is a <strong>warning</strong>.</li>
                                )}
                                <li>On warning <strong>{MAX_VIOLATIONS}</strong>, your exam is <strong>submitted automatically</strong> with the answers saved so far.</li>
                                <li>Copy, paste and right-click are disabled and recorded.</li>
                                <li>Your answers save automatically. If your internet goes off, <strong>your timer keeps running</strong>: keep answering and don&apos;t close the page — your answers save when you&apos;re back online, and the lost connection is recorded for your proctor. If time runs out while you&apos;re offline, your answers are locked and submitted the moment you reconnect.</li>
                                <li>Sit somewhere quiet and well lit, with your face clearly visible, and close other apps before you start.</li>
                            </ul>

                            {hasRoom ? (
                            <div className="border border-[#0B1F3A]/15 bg-[#FAF9F6] p-4 sm:p-5 space-y-5">
                                <div className="flex items-start gap-3">
                                    <span className="w-7 h-7 bg-[#0B1F3A] text-[#C8A96A] text-sm font-black flex items-center justify-center shrink-0">1</span>
                                    <div className="space-y-2 min-w-0">
                                        <p className="text-sm font-bold text-[#0B1F3A]">Join the Zoom exam room with your camera on</p>
                                        <p className="text-sm text-slate-600">Zoom opens in a new window or the Zoom app. {room?.zoomName ? <>Join as <strong className="text-slate-900">{room.zoomName}</strong> — keep the code in brackets so we can see it&apos;s you.</> : null} Then come back to this page.</p>
                                        {room?.joinUrl ? (
                                            <Button asChild className="rounded-none h-11 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest">
                                                <a href={room.joinUrl} target="_blank" rel="noreferrer"><Video className="w-4 h-4 mr-2" /> Join exam room</a>
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Getting your exam room link…</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-7 h-7 bg-[#0B1F3A] text-[#C8A96A] text-sm font-black flex items-center justify-center shrink-0">2</span>
                                    <div className="space-y-2 min-w-0">
                                        <p className="text-sm font-bold text-[#0B1F3A]">Confirm you&apos;re in the room</p>
                                        {room?.inRoom === true ? (
                                            <p className="text-sm font-bold text-[#1F7A5A] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Zoom shows you in the exam room. You can start.</p>
                                        ) : (
                                            <>
                                                {roomChecked && room?.inRoom === false && (
                                                    <p className="text-sm font-bold text-red-700">Zoom doesn&apos;t show you in the room yet. Join with your camera on, wait a few seconds, then check again.</p>
                                                )}
                                                {roomChecked && room?.inRoom === null && (
                                                    <p className="text-sm font-bold text-amber-700">We couldn&apos;t reach Zoom to check. Try again in a moment.</p>
                                                )}
                                                <Button onClick={async () => { await checkRoom(); setRoomChecked(true); }} disabled={roomChecking} variant="outline" className="rounded-none h-11 border-[#0B1F3A] text-[#0B1F3A] font-bold">
                                                    {roomChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} I&apos;ve joined — check
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            ) : null}
                            {!hasRoom && (
                            <div className="border border-[#0B1F3A]/15 bg-[#FAF9F6] p-4 flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-40 h-28 bg-[#0B1F3A] overflow-hidden shrink-0 flex items-center justify-center">
                                    <video ref={videoRef} muted playsInline autoPlay className={cameraStatus === 'ok' ? "w-full h-full object-cover -scale-x-100" : "hidden"} />
                                    {cameraStatus !== 'ok' && <Camera className="w-8 h-8 text-slate-500" />}
                                </div>
                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                    {cameraStatus === 'ok' ? (
                                        <p className="text-sm font-bold text-[#1F7A5A] flex items-center gap-1.5 justify-center sm:justify-start"><CheckCircle2 className="w-4 h-4" /> Camera working — make sure your face is clearly visible.</p>
                                    ) : cameraStatus === 'denied' ? (
                                        <p className="text-sm font-bold text-red-700 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Camera blocked. {phone ? 'Tap the icon next to the web address, allow the camera for this site' : 'Click the camera or lock icon in your address bar, allow the camera for this site'}, then try again.</p>
                                    ) : cameraStatus === 'unsupported' ? (
                                        <p className="text-sm font-bold text-red-700">This browser can't use a camera. Use Chrome, Edge or Safari on a device with a camera.</p>
                                    ) : (
                                        <p className="text-sm font-medium text-slate-600">Check your camera before starting. Your browser will ask for permission — choose <strong>Allow</strong>.</p>
                                    )}
                                    {cameraStatus !== 'ok' && cameraStatus !== 'unsupported' && (
                                        <Button onClick={checkCamera} disabled={cameraStatus === 'checking'} variant="outline" className="rounded-none h-11 border-[#0B1F3A] text-[#0B1F3A] font-bold">
                                            {cameraStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                                            {cameraStatus === 'denied' ? 'Try again' : 'Check my camera'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            )}

                            <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer border-l-4 border-[#C8A96A] bg-[#FAF9F6] p-3">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#0B1F3A]" />
                                I understand that this exam is monitored and recorded, and that leaving the exam screen is recorded and can end my exam.
                            </label>
                        </div>
                    )}

                    {attempt && attempt.status !== 'in_progress' ? (
                        <div className="bg-[#1F7A5A]/5 border-l-4 border-[#1F7A5A] p-6 flex items-center gap-4">
                            <CheckCircle2 className="w-8 h-8 text-[#1F7A5A] shrink-0" />
                            <div>
                                <p className="font-black text-[#0B1F3A]">
                                    {attempt.status === 'graded' ? 'Graded' : 'Submitted — pending final grading'}
                                </p>
                                <p className="font-serif text-2xl text-[#1F7A5A] tabular-nums">{attempt.score} / {attempt.maxScore}</p>
                                {attempt.submitReason === 'violations' && (
                                    <p className="text-sm font-bold text-red-700 mt-1">Submitted automatically after {MAX_VIOLATIONS} proctoring warnings.</p>
                                )}
                                {attempt.submitReason === 'time_up' && (
                                    <p className="text-sm font-bold text-amber-700 mt-1">Submitted automatically when time ran out.</p>
                                )}
                            </div>
                        </div>
                    ) : attempt && attempt.status === 'in_progress' ? (
                        <Button
                            onClick={continueTest}
                            disabled={proctored && (!ready || !agreed)}
                            className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-[0.2em]"
                        >
                            Continue {proctored ? 'Exam' : 'Test'}
                        </Button>
                    ) : isOpen ? (
                        <Button
                            onClick={() => void handleStart()}
                            disabled={starting || (proctored && (!ready || !agreed))}
                            className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-[0.2em]"
                        >
                            {starting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
                            Start {proctored ? 'Exam' : 'Test'}
                        </Button>
                    ) : now < new Date(assessment.opensAt).getTime() ? (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-amber-500" />
                            <p className="font-bold text-amber-800">Opens {new Date(assessment.opensAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} (WAT)</p>
                        </div>
                    ) : (
                        <div className="bg-slate-100 border-l-4 border-slate-400 p-6 text-center text-slate-600 font-bold">
                            This {assessment.type === 'exam' ? 'exam' : 'test'} closed on {new Date(assessment.closesAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} (WAT).
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
