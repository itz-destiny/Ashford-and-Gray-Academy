"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, usePathname } from "next/navigation";
import { examBase } from "@/lib/exam-link";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Camera, Maximize, AlertTriangle } from "lucide-react";
import { CountdownTimer } from "@/components/tests/CountdownTimer";
import { useExamProctor, enterFullscreen, fullscreenSupported } from "@/components/tests/useExamProctor";
import { ExamRoomStatus } from "@/components/tests/ExamRoomStatus";
import { INCIDENT_LABELS, isProctored } from "@/lib/proctoring";
import { cn } from "@/lib/utils";

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
    // With a live Zoom exam room, Zoom is the camera — the browser's own camera stays off.
    const hasRoom = !!assessment?.proctorLiveClassId;

    const proctor = useExamProctor({
        attemptId,
        enabled: proctored && !!attemptId,
        useCamera: !hasRoom,
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

    // Autosave: shortly after each change, and every 20s as a backstop.
    const save = useCallback(async () => {
        if (!attemptId || submittingRef.current) return;
        const payload = toPayload(answersRef.current);
        const serialized = JSON.stringify(payload);
        if (serialized === lastSavedRef.current) return;
        try {
            const res = await apiFetch(`/api/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify({ action: 'save', answers: payload }) });
            if (res.ok) lastSavedRef.current = serialized;
        } catch {
            // Retried on the next change / interval.
        }
    }, [attemptId]);

    useEffect(() => {
        answersRef.current = answers;
        const t = setTimeout(() => void save(), 1500);
        return () => clearTimeout(t);
    }, [answers, save]);

    useEffect(() => {
        const t = setInterval(() => void save(), 20_000);
        return () => clearInterval(t);
    }, [save]);

    const handleSubmit = useCallback(async (reason: 'student' | 'time_up' = 'student') => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            if (!attemptId) return;
            proctor.stop();
            const payload = { action: 'submit', reason, answers: toPayload(answersRef.current) };
            const res = await apiFetch(`/api/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify(payload) });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 409) {
                    router.push(`${examBase(pathname)}/${id}`);
                    return;
                }
                throw new Error(data.error || 'Failed to submit');
            }
            toast({ title: proctored ? "Exam submitted" : "Test submitted", description: reason === 'time_up' ? "Time is up — your answers were submitted." : "Your score is ready." });
            router.push(`${examBase(pathname)}/${id}`);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Submit failed", description: err.message });
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [attemptId, id, proctor, proctored, router, toast]);

    const onExpire = useCallback(() => void handleSubmit('time_up'), [handleSubmit]);

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }
    if (!assessment || !assessment.myAttempt) {
        return <div className="p-10 text-center text-slate-400">Test not found.</div>;
    }

    const deadline = new Date(new Date(assessment.myAttempt.startedAt).getTime() + assessment.durationMinutes * 60 * 1000);
    const needsFullscreen = proctored && fullscreenSupported() && !proctor.isFullscreen;
    const cameraBlocked = proctored && proctor.camera !== 'ok' && proctor.camera !== 'pending';
    const gate = proctored && !submitting && (needsFullscreen || cameraBlocked || !!proctor.warning);

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6 animate-in fade-in duration-700 pb-32 select-none">
            <div className="sticky top-0 z-10 bg-[#FAF9F6]/95 backdrop-blur-sm py-4 flex items-center justify-between gap-4 border-b border-slate-200">
                <div className="min-w-0">
                    <h1 className="text-xl font-black text-slate-900 truncate">{assessment.title}</h1>
                    {proctored && (
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> Proctored exam
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full",
                                proctor.violationCount === 0 ? "bg-emerald-50 text-emerald-700"
                                    : proctor.violationCount < proctor.maxViolations - 1 ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                            )}>
                                Warnings {proctor.violationCount}/{proctor.maxViolations}
                            </span>
                        </p>
                    )}
                </div>
                <CountdownTimer deadline={deadline} onExpire={onExpire} />
            </div>

            {assessment.questions.map((q, idx) => (
                <Card key={q._id} className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <p className="font-bold text-slate-900">{idx + 1}. {q.text}</p>
                            <span className="text-xs font-black text-slate-400 shrink-0">{q.points} pts</span>
                        </div>

                        {(q.type === 'mcq' || q.type === 'true_false') && (
                            <div className="space-y-2">
                                {(q.options || []).map((o, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50"
                                    >
                                        <input
                                            type="radio"
                                            name={q._id}
                                            checked={answers[q._id]?.selectedOptionIndex === oIdx}
                                            onChange={() => setAnswers(prev => ({ ...prev, [q._id]: { selectedOptionIndex: oIdx } }))}
                                            className="w-4 h-4 accent-indigo-600"
                                        />
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
                                className="rounded-xl select-text"
                                spellCheck={!proctored}
                                autoComplete="off"
                            />
                        )}
                    </CardContent>
                </Card>
            ))}

            {proctored && hasRoom ? (
                <ExamRoomStatus
                    assessmentId={assessment._id}
                    disabled={submitting}
                    onLeft={() => void proctor.reportViolation('left_exam_room')}
                    onAwayChange={away => (away ? proctor.pause() : proctor.resume())}
                />
            ) : proctored && (
                <div className="fixed bottom-20 left-4 md:left-[19rem] z-20 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-slate-900 w-32 h-24">
                    <video ref={proctor.videoRef} muted playsInline autoPlay className="w-full h-full object-cover -scale-x-100" />
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-black text-white bg-black/50 rounded px-1.5 py-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", proctor.camera === 'ok' ? "bg-red-500 animate-pulse" : "bg-slate-400")} />
                        {proctor.camera === 'ok' ? 'REC' : 'NO CAMERA'}
                    </span>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white border-t border-slate-200 p-4 flex justify-end">
                <Button onClick={() => void handleSubmit('student')} disabled={submitting} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit {proctored ? 'Exam' : 'Test'}
                </Button>
            </div>

            {gate && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 space-y-5 text-center">
                        {proctor.warning ? (
                            <>
                                <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    Warning {proctor.warning.count} of {proctor.maxViolations}
                                </h2>
                                <p className="text-slate-600 font-medium">
                                    <strong>{INCIDENT_LABELS[proctor.warning.type]}</strong> was detected and recorded.
                                </p>
                                <p className="text-sm text-red-700 font-bold bg-red-50 rounded-xl p-3">
                                    {proctor.maxViolations - proctor.warning.count === 1
                                        ? 'One more warning and your exam will be submitted automatically.'
                                        : `Your exam will be submitted automatically on warning ${proctor.maxViolations}.`}
                                </p>
                                <Button
                                    onClick={async () => { await enterFullscreen(); proctor.dismissWarning(); }}
                                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                                >
                                    I understand — return to exam
                                </Button>
                            </>
                        ) : cameraBlocked ? (
                            <>
                                <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Camera className="w-7 h-7 text-amber-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">Camera required</h2>
                                <p className="text-slate-600 font-medium">
                                    {proctor.camera === 'unsupported'
                                        ? 'This browser cannot use a camera. Please take the exam in Chrome, Edge or Safari on a device with a camera.'
                                        : proctor.camera === 'lost'
                                        ? 'Your camera was turned off. Turn it back on to continue your exam.'
                                        : 'Camera access was blocked. Click the camera or lock icon in your address bar, allow the camera for this site, then try again.'}
                                </p>
                                {proctor.camera !== 'unsupported' && (
                                    <Button
                                        onClick={async () => { await proctor.startCamera(); await enterFullscreen(); }}
                                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
                                    >
                                        Turn camera on
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <Maximize className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">Full screen required</h2>
                                <p className="text-slate-600 font-medium">
                                    This exam must be taken in full screen. Leaving full screen, switching tabs or opening another window is recorded as a warning.
                                </p>
                                <Button onClick={() => void enterFullscreen()} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black">
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
