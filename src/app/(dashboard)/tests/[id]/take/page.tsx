"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, usePathname } from "next/navigation";
import { examBase } from "@/lib/exam-link";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Camera, Maximize, AlertTriangle, WifiOff } from "lucide-react";
import { CountdownTimer } from "@/components/tests/CountdownTimer";
import { useExamProctor, enterFullscreen, fullscreenSupported } from "@/components/tests/useExamProctor";
import { ExamRoomStatus } from "@/components/tests/ExamRoomStatus";
import { INCIDENT_LABELS, isProctored } from "@/lib/proctoring";
import { cn } from "@/lib/utils";
import { isPhoneDevice } from "@/lib/device";

interface Question {
    _id: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    text: string;
    points: number;
    options?: { text: string }[];
}

interface Assessment {
    _id: string;
    title: string;
    type: 'test' | 'exam';
    proctorLiveClassId?: string;
    durationMinutes: number;
    questions: Question[];
    myAttempt: {
        _id: string;
        status: string;
        startedAt: string;
        savedAnswers?: { questionId: string; selectedOptionIndex?: number; textAnswer?: string }[];
        violationCount?: number;
    } | null;
}

type AnswerMap = Record<string, { selectedOptionIndex?: number; textAnswer?: string }>;

const toPayload = (answers: AnswerMap) =>
    Object.entries(answers).map(([questionId, a]) => ({ questionId, ...a }));

export default function TakeTestPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const submittingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const answersRef = useRef<AnswerMap>({});
    const lastSavedRef = useRef('');

    useEffect(() => {
        apiFetch(`/api/assessments/${id}`).then(async res => {
            if (res.ok) {
                const data: Assessment = await res.json();
                if (!data.myAttempt || data.myAttempt.status !== 'in_progress') {
                    router.replace(`${examBase(pathname)}/${id}`);
                    return;
                }
                const restored: AnswerMap = {};
                for (const a of data.myAttempt.savedAnswers || []) {
                    restored[a.questionId] = { selectedOptionIndex: a.selectedOptionIndex ?? undefined, textAnswer: a.textAnswer ?? undefined };
                }
                setAnswers(restored);
                answersRef.current = restored;
                lastSavedRef.current = JSON.stringify(toPayload(restored));
                setAssessment(data);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id, router]);

    const attemptId = assessment?.myAttempt?._id || null;
    const proctored = isProctored(assessment);
    // With a live Zoom exam room the student stays in Zoom for the whole
    // exam and Zoom is the camera; the browser's stays off (on a phone,
    // opening it would take the camera away from Zoom).
    const [phone, setPhone] = useState(false);
    useEffect(() => { setPhone(isPhoneDevice()); }, []);
    // Opened from a direct exam link: there's no dashboard sidebar to make room for.
    const standalone = examBase(pathname) === '/exam';
    // Exam links (/exam/…): the Zoom link is sent separately, so the site
    // doesn't check the Zoom room or use the camera there.
    const hasRoom = !!assessment?.proctorLiveClassId && !standalone;

    const proctor = useExamProctor({
        attemptId,
        enabled: proctored && !!attemptId,
        // With a Zoom exam room, Zoom's camera is the proctor — on a phone the
        // browser must not grab the camera or Zoom's own video drops.
        useCamera: !hasRoom && !standalone,
        phone,
        initialViolations: assessment?.myAttempt?.violationCount || 0,
        onAutoSubmitted: () => {
            submittingRef.current = true;
            proctor.stop();
            toast({
                variant: "destructive",
                title: "Exam submitted automatically",
                description: "You reached the maximum number of warnings, so your exam was submitted with the answers saved so far.",
            });
            router.push(`${examBase(pathname)}/${id}`);
        },
    });

    // Connection: the timer runs from the server's start time whether or not
    // the student is online. A lost connection is shown to the student and,
    // once they're back, logged for the proctor with how long it lasted.
    const [offline, setOffline] = useState(false);
    const offlineSinceRef = useRef<number | null>(null);
    const proctorRef = useRef(proctor);
    proctorRef.current = proctor;
    const markOffline = useCallback(() => {
        if (offlineSinceRef.current === null) offlineSinceRef.current = Date.now();
        setOffline(true);
    }, []);
    const markOnline = useCallback(() => {
        const since = offlineSinceRef.current;
        offlineSinceRef.current = null;
        setOffline(false);
        if (since !== null && proctored) {
            const secs = Math.max(1, Math.round((Date.now() - since) / 1000));
            proctorRef.current.logEvent('connection_lost', `Offline for ${secs >= 60 ? `${Math.floor(secs / 60)} min ${secs % 60} s` : `${secs} s`}`);
        }
    }, [proctored]);

    // Autosave: shortly after each change, and every 20s as a backstop.
    const timeUpRef = useRef<() => void>(() => {});
    const save = useCallback(async () => {
        if (!attemptId || submittingRef.current) return;
        const payload = toPayload(answersRef.current);
        const serialized = JSON.stringify(payload);
        if (serialized === lastSavedRef.current) return;
        let res: Response;
        try {
            res = await apiFetch(`/api/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify({ action: 'save', answers: payload }) });
        } catch {
            markOffline(); // retried on the next change / interval
            return;
        }
        markOnline();
        if (res.ok) {
            lastSavedRef.current = serialized;
        } else if (res.status === 409) {
            const data = await res.json().catch(() => ({}));
            if (data.timeUp) timeUpRef.current();
        }
    }, [attemptId, markOffline, markOnline]);

    useEffect(() => {
        answersRef.current = answers;
        const t = setTimeout(() => void save(), 1500);
        return () => clearTimeout(t);
    }, [answers, save]);

    useEffect(() => {
        const t = setInterval(() => void save(), 20_000);
        return () => clearInterval(t);
    }, [save]);

    // Time up with no internet: answers are frozen at zero and the submit
    // keeps retrying until the connection is back.
    const frozenRef = useRef<ReturnType<typeof toPayload> | null>(null);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [waitingToSubmit, setWaitingToSubmit] = useState(false);
    const sendSubmitRef = useRef<(reason: 'student' | 'time_up') => Promise<void>>(async () => {});

    const sendSubmit = useCallback(async (reason: 'student' | 'time_up') => {
        if (!attemptId) return;
        if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
        const payload = { action: 'submit', reason, answers: frozenRef.current ?? toPayload(answersRef.current) };
        let res: Response;
        try {
            res = await apiFetch(`/api/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        } catch {
            markOffline();
            if (reason === 'time_up') {
                setWaitingToSubmit(true);
                retryRef.current = setTimeout(() => void sendSubmitRef.current(reason), 5000);
                return;
            }
            toast({ variant: "destructive", title: "No internet connection", description: "Your answers are kept on this page. Reconnect, then press Submit again. Your timer is still running." });
            submittingRef.current = false;
            setSubmitting(false);
            return;
        }
        markOnline();
        setWaitingToSubmit(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 409) {
                router.push(`${examBase(pathname)}/${id}`);
                return;
            }
            toast({ variant: "destructive", title: "Submit failed", description: data.error || 'Failed to submit' });
            submittingRef.current = false;
            setSubmitting(false);
            return;
        }
        toast({ title: proctored ? "Exam submitted" : "Test submitted", description: reason === 'time_up' ? "Time is up — your answers were submitted." : "Your score is ready." });
        router.push(`${examBase(pathname)}/${id}`);
    }, [attemptId, id, markOffline, markOnline, pathname, proctored, router, toast]);
    sendSubmitRef.current = sendSubmit;

    const handleSubmit = useCallback(async (reason: 'student' | 'time_up' = 'student') => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        if (reason === 'time_up') frozenRef.current = toPayload(answersRef.current);
        proctor.stop();
        await sendSubmit(reason);
    }, [proctor, sendSubmit]);

    timeUpRef.current = () => void handleSubmit('time_up');

    // Browser connection events: show the banner straight away, and retry a
    // pending time-up submit the moment the connection is back.
    useEffect(() => {
        const goOffline = () => markOffline();
        const goOnline = () => {
            if (frozenRef.current && submittingRef.current) void sendSubmitRef.current('time_up');
            else void save();
        };
        if (typeof navigator !== 'undefined' && navigator.onLine === false) markOffline();
        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
        };
    }, [markOffline, save]);

    useEffect(() => () => { if (retryRef.current) clearTimeout(retryRef.current); }, []);

    const onExpire = useCallback(() => void handleSubmit('time_up'), [handleSubmit]);

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }
    if (!assessment || !assessment.myAttempt) {
        return <div className="p-10 text-center text-slate-400">Test not found.</div>;
    }

    const deadline = new Date(new Date(assessment.myAttempt.startedAt).getTime() + assessment.durationMinutes * 60 * 1000);
    const needsFullscreen = proctored && !phone && fullscreenSupported() && !proctor.isFullscreen;
    const cameraBlocked = proctored && proctor.camera !== 'ok' && proctor.camera !== 'pending';
    const gate = proctored && !submitting && (needsFullscreen || cameraBlocked || !!proctor.warning);

    const answeredCount = assessment.questions.filter(q => {
        const a = answers[q._id];
        return a && (a.selectedOptionIndex !== undefined || (a.textAnswer || '').trim() !== '');
    }).length;
    const totalQ = assessment.questions.length;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 pb-32 space-y-5 animate-in fade-in duration-700 select-none">
            <div className={cn("sticky z-10 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10 bg-[#FAF9F6]/95 backdrop-blur-sm pt-4 pb-3 border-b border-[#0B1F3A]/10", standalone ? "top-16" : "top-0")}>
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                            {proctored ? 'Proctored Examination' : 'Assessment'}
                        </p>
                        <h1 className="font-serif text-lg sm:text-xl text-[#0B1F3A] truncate">{assessment.title}</h1>
                    </div>
                    <CountdownTimer deadline={deadline} onExpire={onExpire} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#0B1F3A]/10 overflow-hidden" aria-hidden>
                        <div className="h-full bg-[#C8A96A] transition-all duration-500" style={{ width: `${totalQ ? (answeredCount / totalQ) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 tabular-nums shrink-0">{answeredCount} of {totalQ} answered</span>
                    {proctored && (
                        <span className={cn(
                            "shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1",
                            proctor.violationCount === 0 ? "bg-[#1F7A5A]/10 text-[#1F7A5A]"
                                : proctor.violationCount < proctor.maxViolations - 1 ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-700"
                        )}>
                            <ShieldAlert className="w-3 h-3" /> {proctor.violationCount}/{proctor.maxViolations}
                        </span>
                    )}
                </div>
            </div>

            {offline && !waitingToSubmit && (
                <div role="status" className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-900">
                    <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold">No internet connection</p>
                        <p>Your timer is still running. Keep answering: your answers stay on this page and are saved as soon as you&apos;re back online. Don&apos;t close or reload this page.</p>
                    </div>
                </div>
            )}

            <fieldset disabled={submitting} className="space-y-5 min-w-0">
                {assessment.questions.map((q, idx) => {
                    const done = (() => { const a = answers[q._id]; return !!a && (a.selectedOptionIndex !== undefined || (a.textAnswer || '').trim() !== ''); })();
                    return (
                        <Card key={q._id} id={`q-${q._id}`} className={cn("rounded-none border-0 border-l-4 shadow-sm bg-white scroll-mt-40", done ? "border-l-[#C8A96A]" : "border-l-[#0B1F3A]/15")}>
                            <CardContent className="p-5 sm:p-6 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="shrink-0 w-7 h-7 flex items-center justify-center bg-[#0B1F3A] text-[#C8A96A] text-xs font-black">{idx + 1}</span>
                                        <p className="font-semibold text-[#0B1F3A] leading-relaxed pt-0.5">{q.text}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 pt-1.5">{q.points} {q.points === 1 ? 'mark' : 'marks'}</span>
                                </div>

                                {(q.type === 'mcq' || q.type === 'true_false') && (
                                    <div className="space-y-2 sm:pl-10">
                                        {(q.options || []).map((o, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className="group flex items-center gap-3 p-3 border border-slate-200 bg-white cursor-pointer transition-colors hover:border-[#C8A96A] has-[:checked]:border-[#0B1F3A] has-[:checked]:bg-[#0B1F3A] has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#C8A96A]"
                                            >
                                                <input
                                                    type="radio"
                                                    name={q._id}
                                                    checked={answers[q._id]?.selectedOptionIndex === oIdx}
                                                    onChange={() => setAnswers(prev => ({ ...prev, [q._id]: { selectedOptionIndex: oIdx } }))}
                                                    className="sr-only"
                                                />
                                                <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-slate-300 text-xs font-black text-slate-500 group-has-[:checked]:border-[#C8A96A] group-has-[:checked]:bg-[#C8A96A] group-has-[:checked]:text-[#0B1F3A]">
                                                    {q.type === 'true_false' ? (oIdx === 0 ? 'T' : 'F') : String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <span className="text-sm font-medium">{o.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'short_answer' && (
                                    <Textarea
                                        value={answers[q._id]?.textAnswer || ''}
                                        onChange={e => setAnswers(prev => ({ ...prev, [q._id]: { textAnswer: e.target.value } }))}
                                        placeholder="Type your answer..."
                                        className="rounded-none border-slate-300 focus-visible:ring-[#C8A96A] select-text min-h-28"
                                        spellCheck={!proctored}
                                        autoComplete="off"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </fieldset>

            {proctored && hasRoom ? (
                <ExamRoomStatus
                    assessmentId={assessment._id}
                    standalone={standalone}
                    disabled={submitting}
                    onLeft={() => void proctor.reportViolation('left_exam_room')}
                    onAwayChange={away => (away ? proctor.pause() : proctor.resume())}
                />
            ) : null}
            {proctored && !hasRoom && !standalone && (
                <div className={cn("fixed z-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-900", phone ? "bottom-24 right-3 w-20 h-28" : cn("bottom-20 left-4 w-32 h-24", !standalone && "md:left-[19rem]"))}>
                    <video ref={proctor.videoRef} muted playsInline autoPlay className="w-full h-full object-cover -scale-x-100" />
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-black text-white bg-black/50 rounded px-1.5 py-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", proctor.camera === 'ok' ? "bg-red-500 animate-pulse" : "bg-slate-400")} />
                        {proctor.camera === 'ok' ? 'REC' : 'NO CAMERA'}
                    </span>
                </div>
            )}

            <div className={cn("fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-[#C8A96A] px-4 py-3 flex items-center justify-between gap-4", !standalone && "md:left-72")}>
                <p className="text-xs text-slate-600 min-w-0">
                    {answeredCount < totalQ
                        ? <><strong className="text-[#0B1F3A]">{totalQ - answeredCount}</strong> unanswered · answer all to submit</>
                        : <span className="text-[#1F7A5A] font-bold">All questions answered</span>}
                    {offline && <span className="ml-2 inline-flex items-center gap-1 text-amber-700 font-bold"><WifiOff className="w-3 h-3" /> Offline</span>}
                </p>
                <Button
                    onClick={() => {
                        if (answeredCount < totalQ) {
                            toast({ variant: "destructive", title: "Answer every question first", description: `${totalQ - answeredCount} question${totalQ - answeredCount === 1 ? '' : 's'} still unanswered.` });
                            const firstOpen = assessment.questions.find(q => { const a = answers[q._id]; return !a || (a.selectedOptionIndex === undefined && !(a.textAnswer || '').trim()); });
                            if (firstOpen) document.getElementById(`q-${firstOpen._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            return;
                        }
                        void handleSubmit('student');
                    }}
                    disabled={submitting}
                    aria-disabled={answeredCount < totalQ}
                    className={cn("h-12 px-6 sm:px-8 rounded-none text-white font-black text-xs uppercase tracking-widest shrink-0", answeredCount < totalQ ? "bg-slate-400 hover:bg-slate-400 cursor-not-allowed" : "bg-[#0B1F3A] hover:bg-[#1F7A5A]")}
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit {proctored ? 'Exam' : 'Test'}
                </Button>
            </div>

            {waitingToSubmit && (
                <div className="fixed inset-0 z-[60] bg-[#0B1F3A]/95 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white border-t-4 border-[#C8A96A] p-8 space-y-4 text-center">
                        <div className="mx-auto w-14 h-14 bg-amber-50 flex items-center justify-center">
                            <WifiOff className="w-7 h-7 text-amber-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Time is up</p>
                        <h2 className="font-serif text-2xl text-[#0B1F3A]">Waiting for internet to submit</h2>
                        <p className="text-sm text-slate-600">
                            Your answers were locked when the timer reached zero. They will be submitted automatically as soon as your connection is back.
                        </p>
                        <p className="text-sm font-bold text-[#0B1F3A] bg-[#FAF9F6] p-3">Don&apos;t close or reload this page.</p>
                        <p className="flex items-center justify-center gap-2 text-xs text-slate-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Trying again every few seconds…</p>
                    </div>
                </div>
            )}

            {gate && !waitingToSubmit && (
                <div className="fixed inset-0 z-50 bg-[#0B1F3A]/95 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white border-t-4 border-[#C8A96A] p-8 space-y-5 text-center">
                        {proctor.warning ? (
                            <>
                                <div className="mx-auto w-14 h-14 bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                </div>
                                <h2 className="font-serif text-2xl text-[#0B1F3A]">
                                    Warning {proctor.warning.count} of {proctor.maxViolations}
                                </h2>
                                <p className="text-slate-600">
                                    <strong>{INCIDENT_LABELS[proctor.warning.type]}</strong> was detected and recorded.
                                </p>
                                <p className="text-sm text-red-700 font-bold bg-red-50 border-l-4 border-red-500 p-3 text-left">
                                    {proctor.maxViolations - proctor.warning.count === 1
                                        ? 'One more warning and your exam will be submitted automatically.'
                                        : `Your exam will be submitted automatically on warning ${proctor.maxViolations}.`}
                                </p>
                                <Button
                                    onClick={async () => { if (!phone) await enterFullscreen(); proctor.dismissWarning(); }}
                                    className="w-full h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest"
                                >
                                    I understand — return to exam
                                </Button>
                            </>
                        ) : cameraBlocked ? (
                            <>
                                <div className="mx-auto w-14 h-14 bg-amber-50 flex items-center justify-center">
                                    <Camera className="w-7 h-7 text-amber-600" />
                                </div>
                                <h2 className="font-serif text-2xl text-[#0B1F3A]">Camera required</h2>
                                <p className="text-slate-600">
                                    {proctor.camera === 'unsupported'
                                        ? 'This browser cannot use a camera. Please take the exam in Chrome, Edge or Safari on a device with a camera.'
                                        : proctor.camera === 'lost'
                                        ? 'Your camera was turned off. Turn it back on to continue your exam.'
                                        : phone
                                        ? 'Camera access was blocked. Tap the icon next to the web address, allow the camera for this site, then tap the button below.'
                                        : 'Camera access was blocked. Click the camera or lock icon in your address bar, allow the camera for this site, then try again.'}
                                </p>
                                {proctor.camera !== 'unsupported' && (
                                    <Button
                                        onClick={async () => { await proctor.startCamera(); if (!phone) await enterFullscreen(); }}
                                        className="w-full h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest"
                                    >
                                        Turn camera on
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-14 h-14 bg-[#FAF9F6] flex items-center justify-center">
                                    <Maximize className="w-7 h-7 text-[#0B1F3A]" />
                                </div>
                                <h2 className="font-serif text-2xl text-[#0B1F3A]">Full screen required</h2>
                                <p className="text-slate-600">
                                    This exam must be taken in full screen. Leaving full screen, switching tabs or opening another window is recorded as a warning.
                                </p>
                                <Button onClick={() => void enterFullscreen()} className="w-full h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest">
                                    Enter full screen and continue
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
