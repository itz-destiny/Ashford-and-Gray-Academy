"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ClipboardCheck, Users, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Question {
    _id: string;
    type: 'mcq' | 'true_false' | 'short_answer';
    text: string;
    points: number;
    options?: { text: string; isCorrect: boolean }[];
    sampleAnswer?: string;
}

interface Assessment {
    _id: string;
    title: string;
    description?: string;
    type: string;
    status: 'draft' | 'published';
    courseId: string | null;
    questions: Question[];
    totalPoints: number;
    durationMinutes: number;
    opensAt: string;
    closesAt: string;
}

interface Answer {
    questionId: string;
    selectedOptionIndex?: number;
    textAnswer?: string;
    pointsAwarded: number | null;
    isCorrect: boolean | null;
}

interface Attempt {
    _id: string;
    userId: string;
    answers: Answer[];
    score: number;
    maxScore: number;
    status: 'in_progress' | 'submitted' | 'graded';
    student: { displayName: string; email: string } | null;
}

export default function TestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [gradingDrafts, setGradingDrafts] = useState<Record<string, Record<string, string>>>({});
    const [savingGrade, setSavingGrade] = useState<string | null>(null);

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/assessments/${id}`);
            if (res.ok) setAssessment(await res.json());
            const attRes = await apiFetch(`/api/assessments/${id}/attempts`);
            if (attRes.ok) setAttempts(await attRes.json());
        } catch {
            toast({ variant: "destructive", title: "Failed to load test" });
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!assessment) return;
        setPublishing(true);
        try {
            const res = await apiFetch(`/api/assessments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published' }) });
            if (!res.ok) throw new Error();
            await logAudit({ action: AUDIT_ACTIONS.ASSESSMENT_PUBLISHED, resource: AUDIT_RESOURCES.ASSESSMENT, resourceId: id, metadata: { title: assessment.title } });
            toast({ title: "Test published", description: "Eligible students can now see and take it." });
            fetchAll();
        } catch {
            toast({ variant: "destructive", title: "Failed to publish" });
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!assessment) return;
        if (!confirm(`Delete "${assessment.title}" and every attempt on it? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            const res = await apiFetch(`/api/assessments/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            await logAudit({ action: AUDIT_ACTIONS.ASSESSMENT_DELETED, resource: AUDIT_RESOURCES.ASSESSMENT, resourceId: id, metadata: { title: assessment.title } });
            toast({ title: "Test deleted" });
            window.location.href = '/instructor/tests';
        } catch {
            toast({ variant: "destructive", title: "Failed to delete" });
            setDeleting(false);
        }
    };

    const handleGrade = async (attempt: Attempt) => {
        const drafts = gradingDrafts[attempt._id] || {};
        const shortAnswerQuestions = (assessment?.questions || []).filter(q => q.type === 'short_answer');
        const grades = shortAnswerQuestions
            .filter(q => drafts[q._id] !== undefined && drafts[q._id] !== '')
            .map(q => ({ questionId: q._id, pointsAwarded: Number(drafts[q._id]) }));
        if (grades.length === 0) return;

        setSavingGrade(attempt._id);
        try {
            const res = await apiFetch(`/api/attempts/${attempt._id}`, { method: 'PATCH', body: JSON.stringify({ action: 'grade', grades }) });
            if (!res.ok) throw new Error();
            await logAudit({ action: AUDIT_ACTIONS.ATTEMPT_GRADED, resource: AUDIT_RESOURCES.ASSESSMENT, resourceId: attempt._id, metadata: { student: attempt.student?.email } });
            toast({ title: "Grade saved" });
            fetchAll();
        } catch {
            toast({ variant: "destructive", title: "Failed to save grade" });
        } finally {
            setSavingGrade(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }
    if (!assessment) {
        return <div className="p-10 text-center text-slate-400">Test not found.</div>;
    }

    const submittedAttempts = attempts.filter(a => a.status !== 'in_progress');
    const averageScore = submittedAttempts.length
        ? Math.round((submittedAttempts.reduce((s, a) => s + a.score, 0) / submittedAttempts.length) * 10) / 10
        : 0;

    return (
        <div className="space-y-8 p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{assessment.title}</h1>
                        <Badge className={assessment.status === 'published' ? "bg-emerald-100 text-emerald-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                            {assessment.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 font-medium">{assessment.questions.length} questions · {assessment.totalPoints} pts · {assessment.durationMinutes} min</p>
                </div>
                <div className="flex gap-3">
                    {assessment.status === 'draft' && (
                        <Button onClick={handlePublish} disabled={publishing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
                            {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Publish
                        </Button>
                    )}
                    <Button onClick={handleDelete} disabled={deleting} variant="outline" className="rounded-xl font-bold text-red-600 border-red-200 hover:bg-red-50">
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="bg-indigo-500 p-3 rounded-xl text-white"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempts</p>
                            <p className="text-2xl font-black text-slate-900">{attempts.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl text-white"><ClipboardCheck className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Score</p>
                            <p className="text-2xl font-black text-slate-900">{averageScore} / {assessment.totalPoints}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-lg font-black">Results &amp; Grading</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-8">Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="pr-8">Pending Grading</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attempts.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400">No attempts yet.</TableCell></TableRow>
                            ) : (
                                attempts.map(attempt => {
                                    const shortAnswerQs = assessment.questions.filter(q => q.type === 'short_answer');
                                    const pending = attempt.answers.filter(a =>
                                        shortAnswerQs.some(q => q._id === a.questionId) && a.pointsAwarded === null
                                    );
                                    return (
                                        <TableRow key={attempt._id}>
                                            <TableCell className="pl-8">
                                                <div className="font-bold text-slate-900">{attempt.student?.displayName || 'Unknown'}</div>
                                                <div className="text-xs text-slate-400">{attempt.student?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{attempt.status.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">{attempt.score} / {attempt.maxScore}</TableCell>
                                            <TableCell className="pr-8">
                                                {attempt.status === 'in_progress' ? (
                                                    <span className="text-xs text-slate-400">Not submitted</span>
                                                ) : pending.length === 0 ? (
                                                    <span className="text-xs text-emerald-600 font-bold">Fully graded</span>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {pending.map(a => {
                                                            const q = shortAnswerQs.find(q => q._id === a.questionId)!;
                                                            return (
                                                                <div key={a.questionId} className="flex items-center gap-2">
                                                                    <span className="text-xs text-slate-500 max-w-[200px] truncate" title={q.text}>{q.text}</span>
                                                                    <span className="text-xs text-slate-400">Ans: "{a.textAnswer || '—'}"</span>
                                                                    <Input
                                                                        type="number" min={0} max={q.points}
                                                                        placeholder={`/ ${q.points}`}
                                                                        className="h-8 w-20 rounded-lg text-xs"
                                                                        value={gradingDrafts[attempt._id]?.[q._id] ?? ''}
                                                                        onChange={e => setGradingDrafts(prev => ({
                                                                            ...prev,
                                                                            [attempt._id]: { ...prev[attempt._id], [q._id]: e.target.value },
                                                                        }))}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleGrade(attempt)}
                                                            disabled={savingGrade === attempt._id}
                                                            className="h-8 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700"
                                                        >
                                                            {savingGrade === attempt._id ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                                                            Save Grades
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
