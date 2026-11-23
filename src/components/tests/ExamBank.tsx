"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, EyeOff, Loader2, Search } from "lucide-react";

interface BankExam {
    id: string;
    slug: string;
    title: string;
    type: "test" | "exam";
    status: "draft" | "published";
    createdBy: string;
    closesAt: string;
    courseTitle: string;
    durationMinutes: number;
    totalPoints: number;
    questions: { text: string; points: number; options: { text: string; isCorrect: boolean }[] }[];
}

type Tab = "exam" | "test";

// Exam Bank tab: every draft. Tests tab: everything already published to students.
const inTab = (e: { status: string }, t: Tab) => (t === "exam" ? e.status === "draft" : e.status !== "draft");

// The module's own name, without the programme prefix or a trailing "Exam".
function moduleName(title: string) {
    return title
        .replace(/^(Hospitality Labour Management|Housekeeping|Business Innovation|Food & Beverage|Events & Protocol|Service Excellence Certification),\s*/, "")
        .replace(/\s+(Exam|Examination)$/, "");
}

// A paper split into "Part 1/2/3" is still one module.
const baseName = (title: string) => moduleName(title).replace(/,\s*Part \d+$/, "");

interface ModuleGroup { name: string; exams: BankExam[] }

function groupModules(list: BankExam[]): ModuleGroup[] {
    const map = new Map<string, BankExam[]>();
    for (const e of list) map.set(baseName(e.title), [...(map.get(baseName(e.title)) || []), e]);
    return [...map.entries()]
        .map(([name, exams]) => ({ name, exams: exams.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true })) }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * Read-only bank of every exam with its questions and answer key, for staff.
 * Programmes are cards; open one to see and search its modules.
 * Drafts are hidden from students until someone publishes them.
 */
export function ExamBank() {
    const [exams, setExams] = useState<BankExam[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("exam");
    const [course, setCourse] = useState<string | null>(null);
    const [courseQuery, setCourseQuery] = useState("");
    const [moduleQuery, setModuleQuery] = useState("");
    const [open, setOpen] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/api/exam-bank");
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Could not load the exam bank.");
                setExams(data.exams || []);
            } catch (e: any) {
                setError(e?.message || "Could not load the exam bank.");
            }
        })();
    }, []);

    const inThisTab = useMemo(() => (exams || []).filter(e => inTab(e, tab)), [exams, tab]);

    // Programme cards. Searching matches the programme name or any module inside it.
    const cards = useMemo(() => {
        const q = courseQuery.trim().toLowerCase();
        const map = new Map<string, BankExam[]>();
        for (const e of inThisTab) map.set(e.courseTitle, [...(map.get(e.courseTitle) || []), e]);
        return [...map.entries()]
            .map(([title, list]) => {
                const groups = groupModules(list);
                const hits = q && !title.toLowerCase().includes(q) ? groups.filter(g => g.name.toLowerCase().includes(q)) : null;
                return { title, list, groups, hits };
            })
            .filter(c => !q || c.title.toLowerCase().includes(q) || (c.hits && c.hits.length > 0))
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [inThisTab, courseQuery]);

    const modules = useMemo(() => {
        if (!course) return [];
        const q = moduleQuery.trim().toLowerCase();
        return groupModules(inThisTab.filter(e => e.courseTitle === course))
            .filter(g => !q || g.name.toLowerCase().includes(q) || g.exams.some(e => e.questions.some(x => x.text.toLowerCase().includes(q))));
    }, [inThisTab, course, moduleQuery]);

    const count = (t: Tab) => (exams || []).filter(e => inTab(e, t)).length;
    const courseTotal = course ? groupModules(inThisTab.filter(e => e.courseTitle === course)).length : 0;

    const openCourse = (title: string) => {
        setCourse(title);
        setModuleQuery(courseQuery && !title.toLowerCase().includes(courseQuery.trim().toLowerCase()) ? courseQuery : "");
        setOpen(null);
    };

    return (
        <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 gap-6 max-w-5xl w-full">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C8A96A]" />
                    <h1 className="font-serif text-2xl tracking-tight text-[#0B1F3A]">Exam Bank</h1>
                </div>
                <p className="text-sm text-slate-500">
                    {tab === "exam"
                        ? <>Draft exams with their questions and correct answers. Students cannot see drafts.</>
                        : <>Tests already published to students, made by instructors from their portals.</>}
                </p>
                <div className="flex gap-1 border-b border-slate-200">
                    {(["exam", "test"] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { setTab(t); setCourse(null); setOpen(null); }}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 -mb-px",
                                tab === t ? "border-[#C8A96A] text-[#0B1F3A]" : "border-transparent text-slate-400 hover:text-slate-600",
                            )}
                        >
                            {t === "exam" ? "Exam Bank" : "Tests"}{exams && <span className="tabular-nums"> ({count(t)})</span>}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <p className="flex items-center gap-2 text-sm text-rose-600"><AlertTriangle className="w-4 h-4" /> {error}</p>
            ) : !exams ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
            ) : !course ? (
                /* ---------------- Programme cards ---------------- */
                <div className="space-y-4">
                    <SearchBox value={courseQuery} onChange={setCourseQuery} placeholder="Search a programme or module" />
                    {cards.length === 0 ? (
                        <p className="text-sm text-slate-500">Nothing matches “{courseQuery}”.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {cards.map(c => (
                                <button
                                    key={c.title}
                                    type="button"
                                    onClick={() => openCourse(c.title)}
                                    className="group text-left bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <BookOpen className="w-5 h-5 text-[#1F7A5A] shrink-0 mt-0.5" />
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#C8A96A] shrink-0" />
                                    </div>
                                    <p className="font-serif text-lg leading-snug text-[#0B1F3A] text-balance">{c.title}</p>
                                    <div className="mt-auto flex items-baseline gap-2">
                                        <span className="font-serif text-3xl text-[#0B1F3A] tabular-nums">{c.groups.length}</span>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                            {c.groups.length === 1 ? "module" : "modules"}
                                        </span>
                                        <span className="ml-auto text-xs text-slate-400 tabular-nums">
                                            {c.list.reduce((s, e) => s + e.questions.length, 0)} questions
                                        </span>
                                    </div>
                                    {c.hits && (
                                        <p className="text-xs text-[#1F7A5A] font-semibold">
                                            {c.hits.length} matching {c.hits.length === 1 ? "module" : "modules"}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* ---------------- One programme: its modules ---------------- */
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => { setCourse(null); setOpen(null); }}
                        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#0B1F3A]"
                    >
                        <ArrowLeft className="w-4 h-4" /> All programmes
                    </button>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="font-serif text-xl text-[#0B1F3A]">{course}</h2>
                        <span className="text-sm text-slate-500 tabular-nums">
                            {courseTotal} {courseTotal === 1 ? "module" : "modules"}
                        </span>
                    </div>
                    <SearchBox value={moduleQuery} onChange={setModuleQuery} placeholder="Search modules or question text" />
                    {moduleQuery && (
                        <p className="text-xs text-slate-500 tabular-nums">{modules.length} of {courseTotal} modules match.</p>
                    )}
                    {modules.length === 0 ? (
                        <p className="text-sm text-slate-500">No module matches “{moduleQuery}”.</p>
                    ) : (
                        <div className="space-y-2">
                            {modules.map((g, idx) => (
                                <ModuleRow
                                    key={g.name}
                                    group={g}
                                    index={idx + 1}
                                    isOpen={open === g.name}
                                    onToggle={() => setOpen(open === g.name ? null : g.name)}
                                    showOwner={tab === "test"}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <label className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-w-0 text-sm outline-none bg-transparent"
            />
            {value && (
                <button type="button" onClick={() => onChange("")} className="text-xs text-slate-400 hover:text-slate-600">
                    Clear
                </button>
            )}
        </label>
    );
}

function ModuleRow({ group, index, isOpen, onToggle, showOwner }: {
    group: ModuleGroup; index: number; isOpen: boolean; onToggle: () => void; showOwner: boolean;
}) {
    const e = group.exams[0];
    const parts = group.exams.length;
    const questions = group.exams.reduce((n, x) => n + x.questions.length, 0);
    const closed = e.status !== "draft" && e.closesAt && new Date(e.closesAt) < new Date();
    return (
        <div className="bg-white border border-slate-200 border-l-4 border-l-[#C8A96A] shadow-sm">
            <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-black text-slate-400 tabular-nums w-6 shrink-0 mt-1">{index}.</span>
                    <div className="min-w-0 space-y-1">
                        <p className="font-serif text-base text-[#0B1F3A] leading-snug">{group.name}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                            {parts > 1
                                ? <>{parts} parts · {questions} questions · {parts} × {e.durationMinutes} min</>
                                : <>{questions} questions · {e.totalPoints} marks · {e.durationMinutes} min · /exam/{e.slug}</>}
                        </p>
                        {showOwner && (
                            <p className="text-xs text-slate-500">
                                By {e.createdBy}
                                {e.closesAt && (closed ? <> · closed {fmtDate(e.closesAt)}</> : <> · open to students until {fmtDate(e.closesAt)}</>)}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {e.status === "draft"
                        ? <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-100 text-amber-800"><EyeOff className="w-3 h-3" /> Draft</span>
                        : closed
                            ? <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600">Closed</span>
                            : <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-800">Published</span>}
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-slate-100 p-4 space-y-6">
                    {group.exams.map((x, k) => (
                        <div key={x.id} className="space-y-4">
                            {parts > 1 && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#1F7A5A] tabular-nums">
                                    Part {k + 1} · {x.questions.length} questions · /exam/{x.slug}
                                </p>
                            )}
                            <ol className="space-y-5">
                                {x.questions.map((q, i) => (
                                    <li key={i} className="space-y-2">
                                        <p className="text-sm text-[#0B1F3A]"><span className="font-bold mr-1">{i + 1}.</span>{q.text}</p>
                                        <ul className="space-y-1">
                                            {q.options.map((o, j) => (
                                                <li
                                                    key={j}
                                                    className={cn(
                                                        "flex items-start gap-2 text-sm px-3 py-1.5",
                                                        o.isCorrect ? "bg-emerald-50 text-emerald-900 font-semibold" : "text-slate-600",
                                                    )}
                                                >
                                                    <span className="font-bold w-4 shrink-0">{"ABCDEFGH"[j]}</span>
                                                    <span className="flex-1 min-w-0">{o.text}</span>
                                                    {o.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
