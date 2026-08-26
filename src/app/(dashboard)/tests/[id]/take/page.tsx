"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CountdownTimer } from "@/components/tests/CountdownTimer";

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
    durationMinutes: number;
    questions: Question[];
    myAttempt: { _id: string; status: string; startedAt: string } | null;
}

export default function TakeTestPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, { selectedOptionIndex?: number; textAnswer?: string }>>({});
    const submittingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        apiFetch(`/api/assessments/${id}`).then(async res => {
            if (res.ok) {
                const data = await res.json();
                if (!data.myAttempt || data.myAttempt.status !== 'in_progress') {
                    router.replace(`/tests/${id}`);
                    return;
                }
                setAssessment(data);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id, router]);

    const handleSubmit = useCallback(async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const attemptId = assessment?.myAttempt?._id;
            if (!attemptId) return;
            const payload = {
                action: 'submit',
                answers: Object.entries(answers).map(([questionId, a]) => ({ questionId, ...a })),
            };
            const res = await apiFetch(`/api/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify(payload) });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to submit');
            }
            toast({ title: "Test submitted", description: "Your score is ready." });
            router.push(`/tests/${id}`);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Submit failed", description: err.message });
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [answers, assessment, id, router, toast]);

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }
    if (!assessment || !assessment.myAttempt) {
        return <div className="p-10 text-center text-slate-400">Test not found.</div>;
    }

    const deadline = new Date(new Date(assessment.myAttempt.startedAt).getTime() + assessment.durationMinutes * 60 * 1000);

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6 animate-in fade-in duration-700 pb-32">
            <div className="sticky top-0 z-10 bg-[#FAF9F6]/95 backdrop-blur-sm py-4 flex items-center justify-between border-b border-slate-200">
                <h1 className="text-xl font-black text-slate-900">{assessment.title}</h1>
                <CountdownTimer deadline={deadline} onExpire={handleSubmit} />
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
                                className="rounded-xl"
                            />
                        )}
                    </CardContent>
                </Card>
            ))}

            <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white border-t border-slate-200 p-4 flex justify-end">
                <Button onClick={handleSubmit} disabled={submitting} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Test
                </Button>
            </div>
        </div>
    );
}
