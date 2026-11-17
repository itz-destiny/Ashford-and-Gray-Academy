"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { openExamRoomInZoom } from "@/lib/open-exam-room";
import { cn } from "@/lib/utils";
import { Loader2, ShieldAlert, AlertTriangle, Lock, Clock, FileSpreadsheet } from "lucide-react";

interface ExamItem {
    id: string;
    slug: string;
    title: string;
    courseTitle: string;
    opensAt: string;
    closesAt: string;
    durationMinutes: number;
    adminOnly: boolean;
    roomId: string | null;
    writing: number;
    submitted: number;
}

const WAT: Intl.DateTimeFormatOptions = { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit" };

const THEMES = {
    dark: {
        wrap: "items-center py-12",
        title: "text-white",
        sub: "text-white/50",
        card: "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]",
        cardTitle: "text-white",
        meta: "text-white/60",
        muted: "text-white/50",
        link: "text-white/60 hover:text-white",
        closed: "bg-white/10 text-white/50",
        live: "bg-rose-500/20 text-rose-300",
        error: "text-rose-300",
        button: "bg-[#C8A96A] hover:bg-white text-[#0B1F3A]",
    },
    light: {
        wrap: "items-stretch py-8",
        title: "text-[#0B1F3A]",
        sub: "text-slate-500",
        card: "bg-white border border-slate-200 shadow-sm hover:shadow-md",
        cardTitle: "text-[#0B1F3A]",
        meta: "text-slate-600",
        muted: "text-slate-500",
        link: "text-slate-600 hover:text-[#0B1F3A]",
        closed: "bg-slate-100 text-slate-500",
        live: "bg-rose-100 text-rose-700",
        error: "text-rose-600",
        button: "bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white",
    },
} as const;

/**
 * Today's proctored exams, for monitor accounts and the registrar:
 * "Live Proctoring" opens the exam's Zoom room; "Warnings & photos" opens
 * the live proctoring page under `base`.
 */
export function ExamMonitorList({ base, theme, resultsHref }: { base: string; theme: 'dark' | 'light'; resultsHref?: string }) {
    const t = THEMES[theme];
    const [exams, setExams] = useState<ExamItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opening, setOpening] = useState<string | null>(null);
    const [openError, setOpenError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await apiFetch("/api/live-monitor/exams");
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Could not load exams.");
            setExams(data.exams || []);
            setError(null);
        } catch (e: any) {
            setError(e?.message || "Could not load exams.");
        }
    }, []);

    useEffect(() => {
        void load();
        const timer = setInterval(load, 20_000);
        return () => clearInterval(timer);
    }, [load]);

    return (
        <div className={cn("flex-1 flex flex-col px-4 sm:px-6 gap-8", t.wrap)}>
            <div className={cn("space-y-3 max-w-2xl", theme === 'dark' ? "text-center" : "")}>
                <div className={cn("flex items-center gap-3", theme === 'dark' && "justify-center")}>
                    <div className="w-1.5 h-6 bg-[#C8A96A]" />
                    <h1 className={cn("font-serif text-2xl tracking-tight", t.title)}>Exam Monitor</h1>
                </div>
                <p className={cn("text-sm", t.sub)}>Today&apos;s proctored exams. <strong>Live Proctoring</strong> opens the exam&apos;s Zoom room; <strong>Warnings &amp; photos</strong> shows who is writing, warnings, lost connections and photos.</p>
                {resultsHref && (
                    <Link href={resultsHref} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1F7A5A] hover:underline">
                        <FileSpreadsheet className="w-4 h-4" /> Scores and Excel export: Exam Results
                    </Link>
                )}
            </div>

            {error ? (
                <p className={cn("flex items-center gap-2 text-sm", t.error)}><AlertTriangle className="w-4 h-4" /> {error}</p>
            ) : !exams ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
            ) : exams.length === 0 ? (
                <p className={cn("text-sm", t.muted)}>No proctored exams today.</p>
            ) : (
                <div className="w-full max-w-3xl space-y-3">
                    {openError && <p className={cn("flex items-center gap-2 text-sm", t.error)}><AlertTriangle className="w-4 h-4" /> {openError}</p>}
                    {exams.map(e => {
                        const now = Date.now();
                        const open = now >= new Date(e.opensAt).getTime() && now <= new Date(e.closesAt).getTime() + e.durationMinutes * 60_000;
                        return (
                            <div key={e.id} className={cn("group border-l-4 border-l-[#C8A96A] transition-all p-5", t.card)}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <p className={cn("font-serif text-lg leading-snug", t.cardTitle)}>{e.title}</p>
                                        {e.courseTitle && <p className={cn("text-xs truncate", t.muted)}>{e.courseTitle}</p>}
                                        <p className={cn("text-xs flex items-center gap-1.5", t.meta)}>
                                            <Clock className="w-3.5 h-3.5 text-[#C8A96A]" />
                                            Opens {new Date(e.opensAt).toLocaleTimeString("en-GB", WAT)} · last start {new Date(e.closesAt).toLocaleTimeString("en-GB", WAT)} · {e.durationMinutes} min
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        {open
                                            ? <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1", t.live)}>Live</span>
                                            : <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1", t.closed)}>{now < new Date(e.opensAt).getTime() ? "Upcoming" : "Closed"}</span>}
                                        {e.adminOnly && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#C8A96A]"><Lock className="w-3 h-3" /> Admin only</span>}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <span className={cn("tabular-nums", t.meta)}>{e.writing} writing · {e.submitted} submitted</span>
                                    <div className="flex items-center gap-4">
                                        <Link href={`${base}/${e.slug}/proctor`} className={cn("underline font-bold", t.link)}>Warnings &amp; photos</Link>
                                        <button
                                            type="button"
                                            disabled={!e.roomId || opening === e.id}
                                            title={e.roomId ? undefined : "This exam has no Zoom room"}
                                            onClick={async () => {
                                                if (!e.roomId) return;
                                                setOpenError(null);
                                                setOpening(e.id);
                                                const err = await openExamRoomInZoom(e.roomId);
                                                setOpening(null);
                                                if (err) setOpenError(`${e.title}: ${err}`);
                                            }}
                                            className={cn("flex items-center gap-1.5 font-black uppercase tracking-widest px-4 py-2.5 disabled:opacity-50", t.button)}
                                        >
                                            {opening === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />} Live Proctoring
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
