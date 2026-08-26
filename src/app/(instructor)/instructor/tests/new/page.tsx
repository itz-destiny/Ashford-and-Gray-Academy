"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionType = 'mcq' | 'true_false' | 'short_answer';

interface QuestionDraft {
    type: QuestionType;
    text: string;
    points: number;
    options: { text: string; isCorrect: boolean }[];
    sampleAnswer: string;
}

interface CourseOption {
    id: string;
    title: string;
}

function newQuestion(type: QuestionType = 'mcq'): QuestionDraft {
    if (type === 'true_false') {
        return { type, text: '', points: 1, options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }], sampleAnswer: '' };
    }
    if (type === 'short_answer') {
        return { type, text: '', points: 1, options: [], sampleAnswer: '' };
    }
    return { type: 'mcq', text: '', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], sampleAnswer: '' };
}

function toLocalInputValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewTestPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'test' | 'exam'>('test');
    const [courseId, setCourseId] = useState<string>('cohort');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [opensAt, setOpensAt] = useState(toLocalInputValue(new Date()));
    const [closesAt, setClosesAt] = useState(toLocalInputValue(new Date(Date.now() + 7 * 24 * 3600 * 1000)));
    const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);

    useEffect(() => {
        apiFetch('/api/courses').then(async res => {
            if (res.ok) {
                const data = await res.json();
                setCourses((data || []).filter((c: any) => !c.title?.trim().toLowerCase().startsWith('diploma')).map((c: any) => ({ id: c.id || c._id, title: c.title })));
            }
        });
    }, []);

    const addQuestion = () => setQuestions(qs => [...qs, newQuestion()]);
    const removeQuestion = (idx: number) => setQuestions(qs => qs.filter((_, i) => i !== idx));
    const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, ...patch } : q));
    };
    const changeQuestionType = (idx: number, t: QuestionType) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? newQuestion(t) : q));
    };
    const addOption = (qIdx: number) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q));
    };
    const removeOption = (qIdx: number, oIdx: number) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q));
    };
    const updateOption = (qIdx: number, oIdx: number, text: string) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text } : o) } : q));
    };
    const setCorrectOption = (qIdx: number, oIdx: number) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) } : q));
    };

    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

    const validate = (): string | null => {
        if (!title.trim()) return 'Give the test a title.';
        if (questions.length === 0) return 'Add at least one question.';
        for (const q of questions) {
            if (!q.text.trim()) return 'Every question needs its text filled in.';
            if ((q.type === 'mcq' || q.type === 'true_false')) {
                if (q.options.length < 2) return `"${q.text.slice(0, 30)}..." needs at least 2 options.`;
                if (q.options.some(o => !o.text.trim())) return `"${q.text.slice(0, 30)}..." has an empty option.`;
                if (!q.options.some(o => o.isCorrect)) return `Mark the correct answer for "${q.text.slice(0, 30)}...".`;
            }
        }
        return null;
    };

    const handleSave = async (publish: boolean) => {
        const error = validate();
        if (error) {
            toast({ variant: "destructive", title: "Can't save yet", description: error });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title,
                description: description || undefined,
                type,
                courseId: courseId === 'cohort' ? null : courseId,
                durationMinutes,
                opensAt: new Date(opensAt).toISOString(),
                closesAt: new Date(closesAt).toISOString(),
                questions: questions.map((q, i) => ({
                    type: q.type,
                    text: q.text,
                    points: Number(q.points) || 1,
                    options: q.type === 'short_answer' ? undefined : q.options,
                    sampleAnswer: q.type === 'short_answer' ? (q.sampleAnswer || undefined) : undefined,
                    order: i,
                })),
            };
            const res = await apiFetch('/api/assessments', { method: 'POST', body: JSON.stringify(payload) });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create test');
            }
            const created = await res.json();
            await logAudit({ action: AUDIT_ACTIONS.ASSESSMENT_CREATED, resource: AUDIT_RESOURCES.ASSESSMENT, resourceId: created._id, metadata: { title } });

            if (publish) {
                const pubRes = await apiFetch(`/api/assessments/${created._id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published' }) });
                if (pubRes.ok) {
                    await logAudit({ action: AUDIT_ACTIONS.ASSESSMENT_PUBLISHED, resource: AUDIT_RESOURCES.ASSESSMENT, resourceId: created._id, metadata: { title } });
                }
            }

            toast({ title: publish ? "Test published" : "Draft saved", description: publish ? "Students can now see and take this test." : "You can publish it whenever it's ready." });
            router.push(`/instructor/tests/${created._id}`);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err.message || "Could not save the test." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-10 max-w-4xl mx-auto animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Test</h1>
                <p className="text-slate-500 font-medium">Build questions, set an answer key, and choose who it's for.</p>
            </div>

            <Card className="border-none shadow-lg shadow-slate-100 rounded-3xl">
                <CardHeader><CardTitle className="text-lg font-black">Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Week 4 Knowledge Check" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="test">Test</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Instructions for students..." className="rounded-xl" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cohort">Whole Cohort (all students)</SelectItem>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input type="number" min={1} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="h-11 rounded-xl" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Opens</Label>
                            <Input type="datetime-local" value={opensAt} onChange={e => setOpensAt(e.target.value)} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Closes</Label>
                            <Input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} className="h-11 rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Questions <span className="text-slate-400 font-bold text-sm">· {totalPoints} pts total</span></h2>
                    <Button onClick={addQuestion} variant="outline" className="rounded-xl font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                </div>

                {questions.map((q, qIdx) => (
                    <Card key={qIdx} className="border-none shadow-lg shadow-slate-100 rounded-3xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <GripVertical className="w-5 h-5 text-slate-300 mt-2.5 shrink-0" />
                                <div className="flex-1 space-y-4">
                                    <div className="grid md:grid-cols-[1fr_180px_100px] gap-3">
                                        <Textarea
                                            value={q.text}
                                            onChange={e => updateQuestion(qIdx, { text: e.target.value })}
                                            placeholder={`Question ${qIdx + 1}`}
                                            className="rounded-xl min-h-[44px]"
                                        />
                                        <Select value={q.type} onValueChange={(v: QuestionType) => changeQuestionType(qIdx, v)}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                                <SelectItem value="true_false">True / False</SelectItem>
                                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number" min={0}
                                            value={q.points}
                                            onChange={e => updateQuestion(qIdx, { points: Number(e.target.value) })}
                                            className="h-11 rounded-xl"
                                            title="Points"
                                        />
                                    </div>

                                    {q.type !== 'short_answer' && (
                                        <div className="space-y-2 pl-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select the correct answer:</p>
                                            {q.options.map((o, oIdx) => (
                                                <div key={oIdx} className={cn(
                                                    "flex items-center gap-3 rounded-xl border px-3 py-1.5 transition-colors",
                                                    o.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-transparent"
                                                )}>
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIdx}`}
                                                            checked={o.isCorrect}
                                                            onChange={() => setCorrectOption(qIdx, oIdx)}
                                                            className="w-4 h-4 accent-emerald-600"
                                                        />
                                                        <span className={cn("text-[10px] font-black uppercase tracking-wide", o.isCorrect ? "text-emerald-700" : "text-slate-400")}>
                                                            Correct
                                                        </span>
                                                    </label>
                                                    <Input
                                                        value={o.text}
                                                        onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                        disabled={q.type === 'true_false'}
                                                        placeholder={`Option ${oIdx + 1}`}
                                                        className="h-10 rounded-xl flex-1"
                                                    />
                                                    {q.type === 'mcq' && q.options.length > 2 && (
                                                        <Button variant="ghost" size="icon" onClick={() => removeOption(qIdx, oIdx)} className="h-8 w-8 rounded-lg">
                                                            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {q.type === 'mcq' && (
                                                <Button variant="ghost" size="sm" onClick={() => addOption(qIdx)} className="text-xs font-bold text-indigo-600">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {q.type === 'short_answer' && (
                                        <div className="space-y-1 pl-1">
                                            <Label className="text-xs text-slate-400">Sample answer (for your reference when grading — optional)</Label>
                                            <Textarea
                                                value={q.sampleAnswer}
                                                onChange={e => updateQuestion(qIdx, { sampleAnswer: e.target.value })}
                                                className="rounded-xl min-h-[60px]"
                                            />
                                        </div>
                                    )}
                                </div>
                                {questions.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)} className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-end gap-3 pb-10">
                <Button variant="outline" disabled={saving} onClick={() => handleSave(false)} className="rounded-xl font-bold h-12 px-8">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save as Draft
                </Button>
                <Button disabled={saving} onClick={() => handleSave(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-12 px-8">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Publish Test
                </Button>
            </div>
        </div>
    );
}
