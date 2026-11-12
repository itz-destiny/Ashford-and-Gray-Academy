"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Loader2, ShieldAlert, AlertTriangle, Lock, Clock } from "lucide-react";

interface ExamItem {
    id: string;
    slug: string;
    title: string;
    courseTitle: string;
    opensAt: string;
    closesAt: string;
    durationMinutes: number;
    adminOnly: boolean;
    writing: number;
    submitted: number;
}

const WAT: Intl.DateTimeFormatOptions = { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit" };

export default function MonitorExamsPage() {
    const [exams, setExams] = useState<ExamItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        const t = setInterval(load, 20_000);
        return () => clearInterval(t);
    }, [load]);

    return (
        <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12 gap-8">
            <div className="space-y-3 text-center max-w-2xl">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C8A96A]" />
                    <h1 className="font-serif text-2xl text-white tracking-tight">Exam Monitor</h1>
                </div>
                <p className="text-white/50 text-sm">Today&apos;s proctored exams. Open one to watch students live: who is writing, warnings, Zoom room presence and photos.</p>
            </div>

            {error ? (
                <p className="flex items-center gap-2 text-rose-300 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</p>
            ) : !exams ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
            ) : exams.length === 0 ? (
                <p className="text-white/50 text-sm">No proctored exams today.</p>
            ) : (
                <div className="w-full max-w-3xl space-y-3">
                    {exams.map(e => {
                        const now = Date.now();
                        const open = now >= new Date(e.opensAt).getTime() && now <= new Date(e.closesAt).getTime() + e.durationMinutes * 60_000;
                        return (
                            <Link
                                key={e.id}
                                href={`/monitor/exams/${e.slug}/proctor`}
                                className="group block bg-white/[0.04] border border-white/10 border-l-4 border-l-[#C8A96A] hover:bg-white/[0.08] transition-colors p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-serif text-lg text-white leading-snug">{e.title}</p>
                                        {e.courseTitle && <p className="text-xs text-white/50 truncate">{e.courseTitle}</p>}
                                        <p className="text-xs text-white/60 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#C8A96A]" />
                                            Opens {new Date(e.opensAt).toLocaleTimeString("en-GB", WAT)} · last start {new Date(e.closesAt).toLocaleTimeString("en-GB", WAT)} · {e.durationMinutes} min
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        {open
                                            ? <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 px-2 py-1">Live</span>
                                            : <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/50 px-2 py-1">{now < new Date(e.opensAt).getTime() ? "Upcoming" : "Closed"}</span>}
                                        {e.adminOnly && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#C8A96A]"><Lock className="w-3 h-3" /> Admin only</span>}
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-white/60 tabular-nums">{e.writing} writing · {e.submitted} submitted</span>
                                    <span className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[#C8A96A] group-hover:text-white"><ShieldAlert className="w-3.5 h-3.5" /> Live Proctoring</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
