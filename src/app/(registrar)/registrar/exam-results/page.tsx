"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { exportAssessmentToExcel, exportCourseToExcel, takenOnly } from "@/lib/exam-results-excel";
import { score100 } from "@/lib/score100";
import {
    GraduationCap, Loader2, AlertTriangle, ChevronRight, ChevronLeft, Download, Search, Smartphone, Laptop, FileSpreadsheet, Table2, ListChecks,
} from "lucide-react";

type Status = 'not_taken' | 'in_progress' | 'awaiting_marking' | 'graded';

interface Result {
    uid: string;
    name: string;
    email: string;
    studies: string[];
    status: Status;
    score: number | null;
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

const STATUS_LABEL: Record<Status, string> = {
    not_taken: 'Not taken',
    in_progress: 'Writing now',
    awaiting_marking: 'Awaiting marking',
    graded: 'Submitted',
};

const PASS = 50;
const dateFmt: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric' };
const dateTimeFmt: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
const courseName = (t: string) => t.replace(/^Diploma in /i, '');

/** A student's mark out of 100 (final, or the auto-marked part while written answers wait). */
const mark = (r: Result) => score100(r.score ?? r.scoreSoFar, r.maxScore);

function passRate(a: AssessmentResults) {
    const done = a.results.filter(r => r.status !== 'not_taken' && mark(r) !== null);
    return done.length ? Math.round((done.filter(r => (mark(r) ?? 0) >= PASS).length / done.length) * 100) : null;
}

function ScoreCell({ value, pending }: { value: number | null; pending?: boolean }) {
    if (value === null) return <span className="text-slate-300">—</span>;
    return (
        <span className={cn("font-black tabular-nums", pending ? "text-slate-400" : value >= PASS ? "text-emerald-700" : "text-red-600")} title={pending ? 'Auto-marked part only' : undefined}>
            {value}{pending && '*'}
        </span>
    );
}

export default function RegistrarExamResultsPage() {
    const [courses, setCourses] = useState<CourseGroup[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [courseKey, setCourseKey] = useState<string | null>(null);
    const [moduleId, setModuleId] = useState<string | null>(null);
    const [view, setView] = useState<'modules' | 'grid'>('modules');
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
            })
            .catch(err => setError(err.message));
    }, []);

    // Only modules someone has taken, oldest first; only courses with at least one.
    const takenCourses = useMemo(() => (courses || [])
        .map(c => ({ ...c, assessments: takenOnly(c.assessments).sort((x, y) => +new Date(x.opensAt) - +new Date(y.opensAt)) }))
        .filter(c => c.assessments.length > 0), [courses]);

    const course = takenCourses.find(c => (c.courseId ?? 'none') === courseKey) ?? null;
    const mod = course?.assessments.find(a => a._id === moduleId) ?? null;

    const q = query.trim().toLowerCase();
    const match = (name: string, email: string) => !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);

    // Student × module grid for the open course.
    const grid = useMemo(() => {
        if (!course) return [];
        const byUid = new Map<string, { uid: string; name: string; email: string; cells: Map<string, Result> }>();
        for (const a of course.assessments) for (const r of a.results) {
            if (r.status === 'not_taken') continue;
            if (!byUid.has(r.uid)) byUid.set(r.uid, { uid: r.uid, name: r.name, email: r.email, cells: new Map() });
            byUid.get(r.uid)!.cells.set(a._id, r);
        }
        return [...byUid.values()].sort((x, y) => x.name.localeCompare(y.name));
    }, [course]);

    const openCourse = (key: string) => { setCourseKey(key); setModuleId(null); setView('modules'); setQuery(''); };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-indigo-600" /> Exam Results
                </h1>
                <p className="text-slate-500 font-medium">Pick a course to see the modules that have been taken, then export the whole course or a single module. Every score is out of 100.</p>
            </div>

            {/* Breadcrumb */}
            {course && (
                <nav className="flex items-center gap-1.5 text-sm font-bold flex-wrap">
                    <button type="button" onClick={() => { setCourseKey(null); setModuleId(null); setQuery(''); }} className="text-indigo-600 hover:underline">All courses</button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    {mod ? (
                        <>
                            <button type="button" onClick={() => { setModuleId(null); setQuery(''); }} className="text-indigo-600 hover:underline">{courseName(course.title)}</button>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <span className="text-slate-700">{mod.title}</span>
                        </>
                    ) : <span className="text-slate-700">{courseName(course.title)}</span>}
                </nav>
            )}

            {error ? (
                <div className="flex items-center gap-2 text-rose-600 font-medium"><AlertTriangle className="w-5 h-5" /> {error}</div>
            ) : !courses ? (
                <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : takenCourses.length === 0 ? (
                <div className="text-center text-slate-400 font-medium py-24">No module has been taken yet.</div>
            ) : !course ? (
                /* ───────────── Courses ───────────── */
                <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[720px]">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-5 py-3">Course</th>
                                    <th className="px-3 py-3 text-right">Modules taken</th>
                                    <th className="px-3 py-3 text-right">Students who wrote</th>
                                    <th className="px-3 py-3 text-right">Scripts</th>
                                    <th className="px-3 py-3 text-right">Average</th>
                                    <th className="px-5 py-3 text-right">Export</th>
                                </tr>
                            </thead>
                            <tbody>
                                {takenCourses.map(c => {
                                    const key = c.courseId ?? 'none';
                                    const writers = new Set(c.assessments.flatMap(a => a.results.filter(r => r.status !== 'not_taken').map(r => r.uid))).size;
                                    const scripts = c.assessments.reduce((s, a) => s + a.taken, 0);
                                    const avgs = c.assessments.map(a => a.averagePercent).filter((x): x is number => x !== null);
                                    const avg = avgs.length ? Math.round(avgs.reduce((s, x) => s + x, 0) / avgs.length) : null;
                                    return (
                                        <tr key={key} onClick={() => openCourse(key)} className="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-indigo-50/40">
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-900 flex items-center gap-1.5">{courseName(c.title)} <ChevronRight className="w-4 h-4 text-slate-300" /></span>
                                            </td>
                                            <td className="px-3 py-3.5 text-right tabular-nums font-bold">{c.assessments.length}</td>
                                            <td className="px-3 py-3.5 text-right tabular-nums">{writers}</td>
                                            <td className="px-3 py-3.5 text-right tabular-nums">{scripts}</td>
                                            <td className="px-3 py-3.5 text-right"><ScoreCell value={avg} /></td>
                                            <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                                <Button size="sm" variant="outline" className="rounded-lg font-bold" disabled={exporting !== null}
                                                    onClick={() => void runExport('c:' + key, () => exportCourseToExcel(courseName(c.title), c.assessments))}>
                                                    {exporting === 'c:' + key ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1.5" />} Course
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : !mod ? (
                /* ───────────── One course ───────────── */
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black text-slate-900">{courseName(course.title)}</h2>
                            <p className="text-sm text-slate-500">{course.assessments.length} module{course.assessments.length === 1 ? '' : 's'} taken · {grid.length} student{grid.length === 1 ? '' : 's'} wrote</p>
                        </div>
                        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                            <button type="button" onClick={() => setView('modules')} className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5", view === 'modules' ? "bg-white shadow text-slate-900" : "text-slate-500")}><ListChecks className="w-3.5 h-3.5" /> Modules</button>
                            <button type="button" onClick={() => setView('grid')} className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5", view === 'grid' ? "bg-white shadow text-slate-900" : "text-slate-500")}><Table2 className="w-3.5 h-3.5" /> All results</button>
                        </div>
                        <Button onClick={() => void runExport('course', () => exportCourseToExcel(courseName(course.title), course.assessments))}
                            disabled={exporting !== null} className="rounded-xl font-bold bg-[#1F7A5A] hover:bg-[#17614a] text-white shrink-0">
                            {exporting === 'course' ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1.5" />}
                            Export whole course
                        </Button>
                    </div>

                    {view === 'modules' ? (
                        <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[760px]">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/60">
                                            <th className="px-5 py-3 w-10">#</th>
                                            <th className="px-3 py-3">Module</th>
                                            <th className="px-3 py-3">Date</th>
                                            <th className="px-3 py-3 text-right">Took it</th>
                                            <th className="px-3 py-3 text-right">Average</th>
                                            <th className="px-3 py-3 text-right">Pass rate</th>
                                            <th className="px-5 py-3 text-right">Export</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.assessments.map((a, i) => {
                                            const pr = passRate(a);
                                            return (
                                                <tr key={a._id} onClick={() => { setModuleId(a._id); setQuery(''); }} className="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-indigo-50/40">
                                                    <td className="px-5 py-3.5 text-slate-400 tabular-nums">{i + 1}</td>
                                                    <td className="px-3 py-3.5"><span className="font-bold text-slate-900 flex items-center gap-1.5">{a.title} <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" /></span></td>
                                                    <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap">{new Date(a.opensAt).toLocaleDateString('en-GB', dateFmt)}</td>
                                                    <td className="px-3 py-3.5 text-right tabular-nums font-bold">{a.taken} <span className="text-slate-400 font-medium">/ {a.eligible}</span></td>
                                                    <td className="px-3 py-3.5 text-right"><ScoreCell value={a.averagePercent === null ? null : Math.round(a.averagePercent)} /></td>
                                                    <td className="px-3 py-3.5 text-right tabular-nums text-slate-600">{pr === null ? '—' : `${pr}%`}</td>
                                                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                                        <Button size="sm" variant="outline" className="rounded-lg font-bold" disabled={exporting !== null}
                                                            onClick={() => void runExport(a._id, () => exportAssessmentToExcel(courseName(course.title), a))}>
                                                            {exporting === a._id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />} Module
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
                            <div className="p-3 border-b border-slate-100">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student name or email" className="pl-9 rounded-xl bg-white" />
                                </div>
                            </div>
                            <div className="overflow-auto max-h-[70vh]">
                                <table className="text-sm border-separate border-spacing-0">
                                    <thead className="sticky top-0 z-20">
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 text-left min-w-[14rem] border-b border-r border-slate-200">Student</th>
                                            {course.assessments.map((a, i) => (
                                                <th key={a._id} title={a.title} className="bg-slate-50 px-3 py-3 text-center align-bottom min-w-[7rem] max-w-[9rem] border-b border-slate-200 font-bold normal-case tracking-normal text-[11px] leading-tight">
                                                    <span className="block text-slate-400 font-black">M{i + 1}</span>
                                                    <span className="line-clamp-3">{a.title}</span>
                                                </th>
                                            ))}
                                            <th className="bg-slate-50 px-3 py-3 text-center border-b border-l border-slate-200 min-w-[6rem]">Average</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grid.filter(s => match(s.name, s.email)).map(s => {
                                            const marks = [...s.cells.values()].map(mark).filter((x): x is number => x !== null);
                                            const avg = marks.length ? Math.round(marks.reduce((t, x) => t + x, 0) / marks.length) : null;
                                            return (
                                                <tr key={s.uid} className="hover:bg-indigo-50/30">
                                                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-b border-r border-slate-100">
                                                        <p className="font-bold text-slate-900 leading-tight">{s.name}</p>
                                                        <p className="text-[11px] text-slate-400">{s.email}</p>
                                                    </td>
                                                    {course.assessments.map(a => {
                                                        const r = s.cells.get(a._id);
                                                        return (
                                                            <td key={a._id} className="px-3 py-2.5 text-center border-b border-slate-100">
                                                                {!r ? <span className="text-slate-300">—</span>
                                                                    : r.status === 'in_progress' ? <span className="text-[11px] font-bold text-amber-600">writing</span>
                                                                    : <ScoreCell value={mark(r)} pending={r.status === 'awaiting_marking'} />}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-3 py-2.5 text-center border-b border-l border-slate-100"><ScoreCell value={avg} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <p className="px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-100">Scores out of 100 · — not taken · * awaiting marking of written answers · pass mark {PASS}</p>
                        </Card>
                    )}
                </div>
            ) : (
                /* ───────────── One module ───────────── */
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <button type="button" onClick={() => { setModuleId(null); setQuery(''); }} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"><ChevronLeft className="w-3.5 h-3.5" /> Back to modules</button>
                            <h2 className="text-xl font-black text-slate-900">{mod.title}</h2>
                            <p className="text-sm text-slate-500">
                                {new Date(mod.opensAt).toLocaleDateString('en-GB', dateFmt)} · {mod.taken} of {mod.eligible} took it · average {mod.averagePercent === null ? '—' : Math.round(mod.averagePercent)} / 100
                            </p>
                        </div>
                        <div className="relative md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student" className="pl-9 rounded-xl bg-white" />
                        </div>
                        <Button onClick={() => void runExport(mod._id, () => exportAssessmentToExcel(courseName(course.title), mod))}
                            disabled={exporting !== null} className="rounded-xl font-bold bg-[#1F7A5A] hover:bg-[#17614a] text-white shrink-0">
                            {exporting === mod._id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1.5" />}
                            Export module
                        </Button>
                    </div>
                    <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[760px]">
                                <thead>
                                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/60">
                                        <th className="px-5 py-3 w-10">#</th>
                                        <th className="px-3 py-3">Student</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-3 py-3 text-right">Score / 100</th>
                                        {mod.type === 'exam' && <th className="px-3 py-3">Proctoring</th>}
                                        <th className="px-5 py-3">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mod.results
                                        .filter(r => r.status !== 'not_taken' && match(r.name, r.email))
                                        .sort((x, y) => (mark(y) ?? -1) - (mark(x) ?? -1) || x.name.localeCompare(y.name))
                                        .map((r, i) => (
                                            <tr key={r.uid} className="border-b border-slate-50 last:border-0">
                                                <td className="px-5 py-3 text-slate-400 tabular-nums">{i + 1}</td>
                                                <td className="px-3 py-3">
                                                    <p className="font-bold text-slate-900">{r.name}</p>
                                                    <p className="text-xs text-slate-400">{r.email}</p>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={cn("text-[11px] font-black rounded-full px-2 py-0.5 whitespace-nowrap",
                                                        r.status === 'in_progress' ? "bg-amber-50 text-amber-700" : r.status === 'awaiting_marking' ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700")}>
                                                        {STATUS_LABEL[r.status]}
                                                    </span>
                                                    {r.submitReason === 'violations' && <p className="text-[11px] font-bold text-red-600 mt-1">Auto-submitted (warnings)</p>}
                                                    {r.submitReason === 'time_up' && <p className="text-[11px] font-bold text-amber-700 mt-1">Time ran out</p>}
                                                </td>
                                                <td className="px-3 py-3 text-right text-base"><ScoreCell value={mark(r)} pending={r.status === 'awaiting_marking'} /></td>
                                                {mod.type === 'exam' && (
                                                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                                                        <span className="flex items-center gap-1.5">
                                                            {r.device === 'phone' ? <Smartphone className="w-3.5 h-3.5" /> : r.device === 'computer' ? <Laptop className="w-3.5 h-3.5" /> : null}
                                                            <span className={cn(r.warnings > 0 && "font-bold text-amber-700")}>{r.warnings} warning{r.warnings === 1 ? '' : 's'}</span>
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-GB', dateTimeFmt) : '—'}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
