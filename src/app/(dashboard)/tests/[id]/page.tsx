"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, ClipboardCheck, CheckCircle2, ShieldAlert, Camera, AlertTriangle, Video } from "lucide-react";
import { MAX_VIOLATIONS, isProctored } from "@/lib/proctoring";
import { enterFullscreen } from "@/components/tests/useExamProctor";

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

    const ready = hasRoom ? room?.inRoom === true : cameraStatus === 'ok';

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

    const handleStart = async () => {
        setStarting(true);
        if (proctored) {
            // Must run inside the click so the browser allows full screen.
            await enterFullscreen();
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        try {
            const res = await apiFetch(`/api/assessments/${id}/attempts`, { method: 'POST' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Could not start the test.');
            }
            router.push(`/tests/${id}/take`);
        } catch (err: any) {
            if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
            toast({ variant: "destructive", title: "Can't start test", description: err.message });
            setStarting(false);
        }
    };

    const continueTest = async () => {
        if (proctored) await enterFullscreen();
        router.push(`/tests/${id}/take`);
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

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
            <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl">
                <CardContent className="p-10 space-y-6">
                    <Badge variant="outline" className="uppercase text-[10px]">{assessment.type}</Badge>
                    <h1 className="text-3xl font-black text-slate-900">{assessment.title}</h1>
                    {assessment.description && <p className="text-slate-500 font-medium">{assessment.description}</p>}

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                            <p className="text-xl font-black text-slate-900">{assessment.questions.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                            <p className="text-xl font-black text-slate-900">{assessment.durationMinutes} min</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</p>
                            <p className="text-xl font-black text-slate-900">{assessment.totalPoints}</p>
                        </div>
                    </div>

                    {proctored && (!attempt || attempt.status === 'in_progress') && isOpen && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-slate-900 font-black">
                                <ShieldAlert className="w-5 h-5 text-indigo-600" /> This is a proctored exam
                            </div>
                            <ul className="text-sm text-slate-600 font-medium space-y-2 list-disc pl-5">
                                {hasRoom ? (
                                    <>
                                        <li>You sit the exam in a <strong>live Zoom exam room</strong>: your proctor <strong>watches you live</strong> on camera and the room is <strong>recorded</strong>. Join it below before you start, with your <strong>camera on</strong>, and keep Zoom open (you may minimise it) until you submit.</li>
                                        <li>The site checks with Zoom every 30 seconds that you are still in the room. <strong>Leaving the room is a warning</strong> and pauses your exam until you rejoin.</li>
                                    </>
                                ) : (
                                    <li>Your <strong>camera stays on</strong> for the whole exam and takes a photo of you every minute and whenever a warning is recorded.</li>
                                )}
                                <li>The exam runs in <strong>full screen</strong>. Leaving full screen, switching tabs, minimising or opening another app or window is a <strong>warning</strong>.</li>
                                <li>On warning <strong>{MAX_VIOLATIONS}</strong>, your exam is <strong>submitted automatically</strong> with the answers saved so far.</li>
                                <li>Copy, paste and right-click are disabled and recorded.</li>
                                <li>Your answers save automatically. If your connection drops, reopen the exam and continue — the timer keeps running.</li>
                                <li>Sit somewhere quiet and well lit, with your face clearly visible, and close other apps before you start.</li>
                            </ul>

                            {hasRoom ? (
                            <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="w-7 h-7 rounded-full bg-[#0B1F3A] text-white text-sm font-black flex items-center justify-center shrink-0">1</span>
                                    <div className="space-y-2 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">Join the Zoom exam room with your camera on</p>
                                        <p className="text-sm text-slate-600">Zoom opens in a new window or the Zoom app. {room?.zoomName ? <>Join as <strong className="text-slate-900">{room.zoomName}</strong> — keep the code in brackets so we can see it&apos;s you.</> : null} Then come back to this page.</p>
                                        {room?.joinUrl ? (
                                            <Button asChild className="rounded-xl font-bold bg-[#0B1F3A] hover:bg-[#13294a]">
                                                <a href={room.joinUrl} target="_blank" rel="noreferrer"><Video className="w-4 h-4 mr-2" /> Join exam room</a>
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Getting your exam room link…</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-7 h-7 rounded-full bg-[#0B1F3A] text-white text-sm font-black flex items-center justify-center shrink-0">2</span>
                                    <div className="space-y-2 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">Confirm you&apos;re in the room</p>
                                        {room?.inRoom === true ? (
                                            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Zoom shows you in the exam room. You can start.</p>
                                        ) : (
                                            <>
                                                {roomChecked && room?.inRoom === false && (
                                                    <p className="text-sm font-bold text-red-700">Zoom doesn&apos;t show you in the room yet. Join with your camera on, wait a few seconds, then check again.</p>
                                                )}
                                                {roomChecked && room?.inRoom === null && (
                                                    <p className="text-sm font-bold text-amber-700">We couldn&apos;t reach Zoom to check. Try again in a moment.</p>
                                                )}
                                                <Button onClick={async () => { await checkRoom(); setRoomChecked(true); }} disabled={roomChecking} variant="outline" className="rounded-xl font-bold">
                                                    {roomChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} I&apos;ve joined — check
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            ) : (
                            <div className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-40 h-28 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                                    <video ref={videoRef} muted playsInline autoPlay className={cameraStatus === 'ok' ? "w-full h-full object-cover -scale-x-100" : "hidden"} />
                                    {cameraStatus !== 'ok' && <Camera className="w-8 h-8 text-slate-500" />}
                                </div>
                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                    {cameraStatus === 'ok' ? (
                                        <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 justify-center sm:justify-start"><CheckCircle2 className="w-4 h-4" /> Camera working — make sure your face is clearly visible.</p>
                                    ) : cameraStatus === 'denied' ? (
                                        <p className="text-sm font-bold text-red-700 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Camera blocked. Click the camera or lock icon in your address bar, allow the camera for this site, then try again.</p>
                                    ) : cameraStatus === 'unsupported' ? (
                                        <p className="text-sm font-bold text-red-700">This browser can't use a camera. Use Chrome, Edge or Safari on a device with a camera.</p>
                                    ) : (
                                        <p className="text-sm font-medium text-slate-600">Check your camera before starting. Your browser will ask for permission — choose <strong>Allow</strong>.</p>
                                    )}
                                    {cameraStatus !== 'ok' && cameraStatus !== 'unsupported' && (
                                        <Button onClick={checkCamera} disabled={cameraStatus === 'checking'} variant="outline" className="rounded-xl font-bold">
                                            {cameraStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                                            {cameraStatus === 'denied' ? 'Try again' : 'Check my camera'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            )}

                            <label className="flex items-start gap-3 text-sm font-medium text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-indigo-600" />
                                I understand that this exam is monitored by camera and that leaving the exam screen is recorded and can end my exam.
                            </label>
                        </div>
                    )}

                    {attempt && attempt.status !== 'in_progress' ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                            <div>
                                <p className="font-black text-emerald-800">
                                    {attempt.status === 'graded' ? 'Graded' : 'Submitted — pending final grading'}
                                </p>
                                <p className="text-emerald-600 font-bold text-lg">{attempt.score} / {attempt.maxScore} pts</p>
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
                            className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                        >
                            Continue {proctored ? 'Exam' : 'Test'}
                        </Button>
                    ) : isOpen ? (
                        <Button
                            onClick={handleStart}
                            disabled={starting || (proctored && (!ready || !agreed))}
                            className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                        >
                            {starting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
                            Start {proctored ? 'Exam' : 'Test'}
                        </Button>
                    ) : now < new Date(assessment.opensAt).getTime() ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-amber-500" />
                            <p className="font-bold text-amber-700">Opens {new Date(assessment.opensAt).toLocaleString()}</p>
                        </div>
                    ) : (
                        <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 font-bold">
                            This test closed on {new Date(assessment.closesAt).toLocaleString()}.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
