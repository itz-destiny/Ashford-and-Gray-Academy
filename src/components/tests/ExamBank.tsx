"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ChevronDown, EyeOff, Loader2, Search } from "lucide-react";

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

/**
 * Read-only bank of every exam with its questions and answer key, for staff.
 * Drafts are hidden from students until someone publishes them.
 */
// Exam Bank tab: every draft. Tests tab: everything already published to students.
const inTab = (e: { status: string }, t: "exam" | "test") => (t === "exam" ? e.status === "draft" : e.status !== "draft");

export function ExamBank() {
    const [exams, setExams] = useState<BankExam[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState<string | null>(null);
    const [tab, setTab] = useState<"exam" | "test">("exam");

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

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = (exams || []).filter(e => inTab(e, tab)).filter(e => !q || e.title.toLowerCase().includes(q) || e.courseTitle.toLowerCase().includes(q));
        const map = new Map<string, BankExam[]>();
        for (const e of list) map.set(e.courseTitle, [...(map.get(e.courseTitle) || []), e]);
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [exams, query, tab]);

    const count = (t: "exam" | "test") => (exams || []).filter(e => inTab(e, t)).length;

    return (
        <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 gap-6 max-w-4xl">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C8A96A]" />
                    <h1 className="font-serif text-2xl tracking-tight text-[#0B1F3A]">Exam Bank</h1>
                </div>
                <p className="text-sm text-slate-500">
                    {tab === "exam"
                        ? <>Draft exams with their questions and correct answers. Students cannot see drafts.</>
                        : <>Tests already published to students, made by instructors from their portals.</>}
                    {exams && <> {count(tab)} {tab === "exam" ? "drafts" : "tests"}.</>}
                </p>
                <div className="flex gap-1 border-b border-slate-200">
                    {(["exam", "test"] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { setTab(t); setOpen(null); }}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 -mb-px",
                                tab === t ? "border-[#C8A96A] text-[#0B1F3A]" : "border-transparent text-slate-400 hover:text-slate-600",
                            )}
                        >
                            {t === "exam" ? "Exam Bank" : "Tests"}{exams && <span className="tabular-nums"> ({count(t)})</span>}
                        </button>
                    ))}
                </div>
                <label className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={tab === "exam" ? "Search by exam or programme" : "Search by test or programme"}
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </label>
            </div>

            {error ? (
                <p className="flex items-center gap-2 text-sm text-rose-600"><AlertTriangle className="w-4 h-4" /> {error}</p>
            ) : !exams ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
            ) : groups.length === 0 ? (
                <p className="text-sm text-slate-500">No exams found.</p>
            ) : (
                groups.map(([course, list]) => (
                    <section key={course} className="space-y-2">
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-[#1F7A5A]">{course} · {list.length}</h2>
                        {list.map(e => {
                            const isOpen = open === e.id;
                            return (
                                <div key={e.id} className="bg-white border border-slate-200 border-l-4 border-l-[#C8A96A] shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(isOpen ? null : e.id)}
                                        className="w-full flex items-center justify-between gap-4 p-4 text-left"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-serif text-base text-[#0B1F3A] leading-snug">{e.title}</p>
                                            <p className="text-xs text-slate-500 tabular-nums">
                                                {e.questions.length} questions · {e.totalPoints} marks · {e.durationMinutes} min · /exam/{e.slug}
                                            </p>
                                            {tab === "test" && (
                                                <p className="text-xs text-slate-500">
                                                    By {e.createdBy}
                                                    {e.status === "published" && e.closesAt && (new Date(e.closesAt) < new Date()
                                                        ? <> · closed {new Date(e.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
                                                        : <> · open to students until {new Date(e.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {e.status === "draft"
                                                ? <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-100 text-amber-800"><EyeOff className="w-3 h-3" /> Draft</span>
                                                : e.closesAt && new Date(e.closesAt) < new Date()
                                                    ? <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600">Closed</span>
                                                    : <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-800">Published</span>}
                                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <ol className="border-t border-slate-100 p-4 space-y-5">
                                            {e.questions.map((q, i) => (
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
                                    )}
                                </div>
                            );
                        })}
                    </section>
                ))
            )}
        </div>
    );
}
