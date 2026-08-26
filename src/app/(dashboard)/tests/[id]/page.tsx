"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, ClipboardCheck, CheckCircle2 } from "lucide-react";

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
    myAttempt: { _id: string; status: string; score: number; maxScore: number } | null;
}

export default function TestIntroPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        apiFetch(`/api/assessments/${id}`).then(async res => {
            if (res.ok) setAssessment(await res.json());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    const handleStart = async () => {
        setStarting(true);
        try {
            const res = await apiFetch(`/api/assessments/${id}/attempts`, { method: 'POST' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Could not start the test.');
            }
            router.push(`/tests/${id}/take`);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Can't start test", description: err.message });
            setStarting(false);
        }
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

                    {attempt && attempt.status !== 'in_progress' ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                            <div>
                                <p className="font-black text-emerald-800">
                                    {attempt.status === 'graded' ? 'Graded' : 'Submitted — pending final grading'}
                                </p>
                                <p className="text-emerald-600 font-bold text-lg">{attempt.score} / {attempt.maxScore} pts</p>
                            </div>
                        </div>
                    ) : attempt && attempt.status === 'in_progress' ? (
                        <Button onClick={() => router.push(`/tests/${id}/take`)} className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black">
                            Continue Test
                        </Button>
                    ) : isOpen ? (
                        <Button onClick={handleStart} disabled={starting} className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black">
                            {starting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
                            Start Test
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
