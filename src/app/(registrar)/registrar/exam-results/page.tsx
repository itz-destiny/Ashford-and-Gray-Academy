"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { exportAssessmentToExcel, exportCourseToExcel } from "@/lib/exam-results-excel";
import {
    GraduationCap, Loader2, AlertTriangle, ChevronDown, ChevronUp, Download, Search, Smartphone, Laptop, ShieldAlert, FileSpreadsheet,
} from "lucide-react";

type Status = 'not_taken' | 'in_progress' | 'awaiting_marking' | 'graded';

interface Result {
    uid: string;
    name: string;
    email: string;
    studies: string[];
    status: Status;
    score: number | null;
    /** Auto-marked part only, while written answers wait to be marked. */
    scoreSoFar: number | null;
    maxScore: number;
    percent: number | null;
    submitReason: string | null;
    warnings: number;
    device: 'phone' | 'computer' | null;
    startedAt: string | null;
    submittedAt: string | null;
}

interface AssessmentResults {
    _id: string;
    title: string;
    type: 'test' | 'exam';
    opensAt: string;
    closesAt: string;
    totalPoints: number;
    eligible: number;
    taken: number;
    averagePercent: number | null;
    results: Result[];
}

interface CourseGroup {
    courseId: string | null;
    title: string;
    enrolled: number;
    assessments: AssessmentResults[];
}

type Filter = 'all' | 'taken' | 'not_taken';

const STATUS_LABEL: Record<Status, string> = {
    not_taken: 'Not taken',
    in_progress: 'In progress',
    awaiting_marking: 'Awaiting marking',
    graded: 'Graded',
};

const dateFmt: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric' };
const dateTimeFmt: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export default function RegistrarExamResultsPage() {
    const [courses, setCourses] = useState<CourseGroup[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>('');
    const [open, setOpen] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<Filter>('all');
    const [query, setQuery] = useState('');
    const [exporting, setExporting] = useState<string | null>(null);

    const runExport = async (key: string, job: () => Promise<void>) => {
        setExporting(key);
        try { await job(); } catch { alert('Could not create the Excel file. Please try again.'); } finally { setExporting(null); }
    };

    useEffect(() => {
        apiFetch('/api/registrar/exam-results')
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Could not load exam results.');
                setCourses(data.courses || []);
                const first = (data.courses || [])[0];
                if (first) {
                    setSelected(first.courseId ?? 'all');
                    if (first.assessments[0]) setOpen(new Set([first.assessments[0]._id]));
                }
            })
            .catch(err => setError(err.message));
    }, []);

    const course = useMemo(
        () => courses?.find(c => (c.courseId ?? 'all') === selected) ?? null,
        [courses, selected],
    );

    const toggle = (id: string) => setOpen(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const visible = (rows: Result[]) => {
        const q = query.trim().toLowerCase();
        return rows.filter(r =>
            (filter === 'all' || (filter === 'taken' ? r.status !== 'not_taken' : r.status === 'not_taken')) &&
            (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)));
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-indigo-600" /> Exam Results
                </h1>
                <p className="text-slate-500 font-medium">Every published test and exam by course: who took it, their score, and who hasn&apos;t taken it yet.</p>
            </div>

            {error ? (
                <div className="flex items-center gap-2 text-rose-600 font-medium"><AlertTriangle className="w-5 h-5" /> {error}</div>
            ) : !courses ? (
                <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : courses.length === 0 ? (
                <div className="text-center text-slate-400 font-medium py-24">No tests or exams have been published yet.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
                    {/* Course picker */}
                    <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl lg:sticky lg:top-24">
                        <CardContent className="p-2">
                            <p className="px-3 pt-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Courses</p>
                            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1">
                                {courses.map(c => {
                                    const key = c.courseId ?? 'all';
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setSelected(key); setOpen(new Set(c.assessments[0] ? [c.assessments[0]._id] : [])); }}
                                            className={cn(
                                                "text-left rounded-xl px-3 py-2.5 shrink-0 lg:shrink transition-colors",
                                                key === selected ? "bg-indigo-50 text-indigo-900" : "hover:bg-slate-50 text-slate-700"
                                            )}
                                        >
                                            <p className="text-sm font-bold leading-snug">{c.title}</p>
                                            <p className="text-xs text-slate-500">{c.assessments.length} {c.assessments.length === 1 ? 'assessment' : 'assessments'} · {c.enrolled} students</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected course */}
                    <div className="space-y-4 min-w-0">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student name or email" className="pl-9 rounded-xl bg-white" />
                            </div>
                            {course && course.assessments.length > 0 && (
                                <Button
                                    onClick={() => void runExport('course', () => exportCourseToExcel(course.title, course.assessments))}
                                    disabled={exporting !== null}
                                    className="rounded-xl font-bold bg-[#1F7A5A] hover:bg-[#17614a] text-white shrink-0"
                                >
                                    {exporting === 'course' ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1.5" />}
                                    Export course to Excel
                                </Button>
                            )}
                            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                                {(['all', 'taken', 'not_taken'] as Filter[]).map(f => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setFilter(f)}
                                        className={cn("px-3 py-1.5 rounded-lg", filter === f ? "bg-white shadow text-slate-900" : "text-slate-500")}
                                    >
                                        {f === 'all' ? 'Everyone' : f === 'taken' ? 'Took it' : 'Not taken'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {course && course.assessments.map(a => {
                            const isOpen = open.has(a._id);
                            const rows = visible(a.results);
                            return (
                                <Card key={a._id} className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
                                    <button type="button" onClick={() => toggle(a._id)} className="w-full text-left p-5 flex flex-col md:flex-row md:items-center gap-3 hover:bg-slate-50/60">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={cn("uppercase text-[10px]", a.type === 'exam' && "border-indigo-300 text-indigo-700")}>
                                                    {a.type === 'exam' ? <><ShieldAlert className="w-3 h-3 mr-1" /> Exam</> : 'Test'}
                                                </Badge>
                                                <p className="font-black text-slate-900">{a.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {new Date(a.opensAt).toLocaleDateString('en-GB', dateFmt)} · {a.totalPoints} points
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-5 text-sm">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Took it</p>
                                                <p className="font-black text-slate-900 tabular-nums">{a.taken} / {a.eligible}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average</p>
                                                <p className="font-black text-slate-900 tabular-nums">{a.averagePercent === null ? '—' : `${a.averagePercent}%`}</p>
                                            </div>
                                            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-slate-100">
                                            <div className="flex justify-between items-center px-5 py-3 bg-slate-50/60">
                                                <p className="text-xs font-bold text-slate-500">{rows.length} shown</p>
                                                <Button size="sm" variant="outline" className="rounded-lg font-bold" disabled={exporting !== null} onClick={() => void runExport(a._id, () => exportAssessmentToExcel(course.title, a))}>
                                                    {exporting === a._id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />} Download Excel
                                                </Button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm min-w-[760px]">
                                                    <thead>
                                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                            <th className="px-5 py-3">Student</th>
                                                            <th className="px-3 py-3">Programme of study</th>
                                                            <th className="px-3 py-3">Status</th>
                                                            <th className="px-3 py-3 text-right">Score</th>
                                                            <th className="px-3 py-3 text-right">%</th>
                                                            {a.type === 'exam' && <th className="px-3 py-3">Proctoring</th>}
                                                            <th className="px-5 py-3">Submitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.length === 0 ? (
                                                            <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No students match.</td></tr>
                                                        ) : rows.map(r => (
                                                            <tr key={r.uid} className="border-b border-slate-50 last:border-0 align-top">
                                                                <td className="px-5 py-3">
                                                                    <p className="font-bold text-slate-900">{r.name}</p>
                                                                    <p className="text-xs text-slate-400">{r.email}</p>
                                                                </td>
                                                                <td className="px-3 py-3 text-xs text-slate-600 max-w-[16rem]">{r.studies.join(', ') || '—'}</td>
                                                                <td className="px-3 py-3">
                                                                    <span className={cn(
                                                                        "text-[11px] font-black rounded-full px-2 py-0.5 whitespace-nowrap",
                                                                        r.status === 'not_taken' ? "bg-slate-100 text-slate-500"
                                                                            : r.status === 'in_progress' ? "bg-amber-50 text-amber-700"
                                                                            : r.status === 'awaiting_marking' ? "bg-sky-50 text-sky-700"
                                                                            : "bg-emerald-50 text-emerald-700"
                                                                    )}>{STATUS_LABEL[r.status]}</span>
                                                                    {r.submitReason === 'violations' && <p className="text-[11px] font-bold text-red-600 mt-1">Auto-submitted (warnings)</p>}
                                                                    {r.submitReason === 'time_up' && <p className="text-[11px] font-bold text-amber-700 mt-1">Time ran out</p>}
                                                                </td>
                                                                <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900 whitespace-nowrap">{r.score !== null ? `${r.score} / ${r.maxScore}` : r.scoreSoFar !== null ? <span className="text-slate-400 font-medium" title="Auto-marked part only">{r.scoreSoFar} so far</span> : '—'}</td>
                                                                <td className={cn(
                                                                    "px-3 py-3 text-right tabular-nums font-black",
                                                                    r.percent === null ? "text-slate-300" : r.percent >= 50 ? "text-emerald-700" : "text-red-600"
                                                                )}>{r.percent === null ? '—' : `${r.percent}%`}</td>
                                                                {a.type === 'exam' && (
                                                                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                                                                        {r.status === 'not_taken' ? '—' : (
                                                                            <span className="flex items-center gap-1.5">
                                                                                {r.device === 'phone' ? <Smartphone className="w-3.5 h-3.5" /> : r.device === 'computer' ? <Laptop className="w-3.5 h-3.5" /> : null}
                                                                                <span className={cn(r.warnings > 0 && "font-bold text-amber-700")}>{r.warnings} warning{r.warnings === 1 ? '' : 's'}</span>
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                )}
                                                                <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                                                                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-GB', dateTimeFmt) : '—'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
