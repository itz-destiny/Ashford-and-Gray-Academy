"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { openExamRoomInZoom } from "@/lib/open-exam-room";
import { cn } from "@/lib/utils";
import { Loader2, ShieldAlert, AlertTriangle, Lock, Clock, FileSpreadsheet, ChevronDown, Users, CheckCircle2 } from "lucide-react";

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

type Status = "live" | "upcoming" | "closed";

const WAT: Intl.DateTimeFormatOptions = { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit" };
const time = (iso: string | number) => new Date(iso).toLocaleTimeString("en-GB", WAT);

const THEMES = {
    dark: {
        wrap: "items-center py-12",
        title: "text-white",
        sub: "text-white/50",
        card: "bg-white/[0.04] border border-white/10",
        head: "hover:bg-white/[0.04]",
        row: "border-t border-white/10",
        cardTitle: "text-white",
        meta: "text-white/60",
        muted: "text-white/50",
        link: "text-white/60 hover:text-white",
        closed: "bg-white/10 text-white/50",
        upcoming: "bg-[#C8A96A]/15 text-[#E8D5A8]",
        live: "bg-rose-500/20 text-rose-300",
        error: "text-rose-300",
        button: "bg-[#C8A96A] hover:bg-white text-[#0B1F3A]",
        ghost: "border border-white/20 text-white/80 hover:bg-white/10",
        stat: "bg-white/[0.04] border border-white/10",
        statNum: "text-white",
    },
    light: {
        wrap: "items-stretch py-8",
        title: "text-[#0B1F3A]",
        sub: "text-slate-500",
        card: "bg-white border border-slate-200 shadow-sm",
        head: "hover:bg-slate-50",
        row: "border-t border-slate-100",
        cardTitle: "text-[#0B1F3A]",
        meta: "text-slate-600",
        muted: "text-slate-500",
        link: "text-slate-600 hover:text-[#0B1F3A]",
        closed: "bg-slate-100 text-slate-500",
        upcoming: "bg-amber-50 text-amber-800",
        live: "bg-rose-100 text-rose-700",
        error: "text-rose-600",
        button: "bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white",
        ghost: "border border-slate-300 text-slate-700 hover:bg-slate-50",
        stat: "bg-white border border-slate-200",
        statNum: "text-[#0B1F3A]",
    },
} as const;

const STATUS_LABEL: Record<Status, string> = { live: "Live", upcoming: "Upcoming", closed: "Closed" };
const STATUS_ORDER: Record<Status, number> = { live: 0, upcoming: 1, closed: 2 };

// Programme names as students know them (the Exam Bank drops "Diploma in" too).
const programmeName = (title: string) => title.replace(/^Diploma in /i, "") || "Other exams";

function examStatus(e: ExamItem, now: number): Status {
    if (now < new Date(e.opensAt).getTime()) return "upcoming";
    if (now <= new Date(e.closesAt).getTime() + e.durationMinutes * 60_000) return "live";
    return "closed";
}

interface Group {
    name: string;
    exams: ExamItem[];
    status: Status;
    opens: number;
    ends: number;
    writing: number;
    submitted: number;
    roomId: string | null; // the one room every exam in the group shares, if they do
}

/**
 * Today's proctored exams grouped by programme, for monitor accounts and
 * staff: each programme shows its session, its shared Zoom room
 * ("Live Proctoring") and its exams, each with "Warnings & photos" (the live
 * proctoring page under `base`).
 */
export function ExamMonitorList({ base, theme, resultsHref }: { base: string; theme: 'dark' | 'light'; resultsHref?: string }) {
    const t = THEMES[theme];
    const [exams, setExams] = useState<ExamItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opening, setOpening] = useState<string | null>(null);
    const [openError, setOpenError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const [toggled, setToggled] = useState<Record<string, boolean>>({});

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
        setNow(Date.now());
    }, []);

    useEffect(() => {
        void load();
        const timer = setInterval(load, 20_000);
        return () => clearInterval(timer);
    }, [load]);

    const groups = useMemo<Group[]>(() => {
        const map = new Map<string, ExamItem[]>();
        for (const e of exams || []) {
            const k = programmeName(e.courseTitle);
            map.set(k, [...(map.get(k) || []), e]);
        }
        return [...map.entries()].map(([name, list]) => {
            const sorted = [...list].sort((a, b) => new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime() || a.title.localeCompare(b.title));
            const statuses = sorted.map(e => examStatus(e, now));
            const status: Status = statuses.includes("live") ? "live" : statuses.includes("upcoming") ? "upcoming" : "closed";
            const rooms = new Set(sorted.map(e => e.roomId));
            return {
                name,
                exams: sorted,
                status,
                opens: Math.min(...sorted.map(e => new Date(e.opensAt).getTime())),
                ends: Math.max(...sorted.map(e => new Date(e.closesAt).getTime())),
                writing: sorted.reduce((s, e) => s + e.writing, 0),
                submitted: sorted.reduce((s, e) => s + e.submitted, 0),
                roomId: rooms.size === 1 ? sorted[0].roomId : null,
            };
        }).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.opens - b.opens || a.name.localeCompare(b.name));
    }, [exams, now]);

    const totals = useMemo(() => ({
        live: groups.filter(g => g.status === "live").length,
        writing: groups.reduce((s, g) => s + g.writing, 0),
        submitted: groups.reduce((s, g) => s + g.submitted, 0),
    }), [groups]);

    const openRoom = async (key: string, roomId: string | null, label: string) => {
        if (!roomId) return;
        setOpenError(null);
        setOpening(key);
        const err = await openExamRoomInZoom(roomId);
        setOpening(null);
        if (err) setOpenError(`${label}: ${err}`);
    };

    const RoomButton = ({ k, roomId, label, small }: { k: string; roomId: string | null; label: string; small?: boolean }) => (
        <button
            type="button"
            disabled={!roomId || opening === k}
            title={roomId ? undefined : "No Zoom room for this exam"}
            onClick={(ev) => { ev.stopPropagation(); void openRoom(k, roomId, label); }}
            className={cn("flex items-center gap-1.5 font-black uppercase tracking-widest disabled:opacity-50 shrink-0",
                small ? "text-[10px] px-3 py-2" : "text-[11px] px-4 py-2.5", small ? t.ghost : t.button)}
        >
            {opening === k ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />} Live Proctoring
        </button>
    );

    return (
        <div className={cn("flex-1 flex flex-col px-4 sm:px-6 gap-8", t.wrap)}>
            <div className={cn("space-y-3 max-w-2xl", theme === 'dark' ? "text-center" : "")}>
                <div className={cn("flex items-center gap-3", theme === 'dark' && "justify-center")}>
                    <div className="w-1.5 h-6 bg-[#C8A96A]" />
                    <h1 className={cn("font-serif text-2xl tracking-tight", t.title)}>Exam Monitor</h1>
                </div>
                <p className={cn("text-sm", t.sub)}>Today&apos;s proctored exams by programme. <strong>Live Proctoring</strong> opens the programme&apos;s Zoom room; <strong>Warnings &amp; photos</strong> shows who is writing an exam, warnings, lost connections and photos.</p>
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
                <div className="w-full max-w-3xl space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "Programmes live", value: totals.live, icon: ShieldAlert },
                            { label: "Writing now", value: totals.writing, icon: Users },
                            { label: "Submitted", value: totals.submitted, icon: CheckCircle2 },
                        ].map(s => (
                            <div key={s.label} className={cn("px-3 py-3 sm:px-4", t.stat)}>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", t.muted)}><s.icon className="w-3 h-3 text-[#C8A96A]" /> {s.label}</p>
                                <p className={cn("font-serif text-2xl tabular-nums mt-1", t.statNum)}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {openError && <p className={cn("flex items-center gap-2 text-sm", t.error)}><AlertTriangle className="w-4 h-4" /> {openError}</p>}

                    {groups.map(g => {
                        // Closed programmes start folded; a click flips the default.
                        const expanded = (g.status !== "closed") !== !!toggled[g.name];
                        return (
                            <section key={g.name} className={cn("border-l-4", g.status === "live" ? "border-l-rose-500" : "border-l-[#C8A96A]", t.card)}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={expanded}
                                    onClick={() => setToggled(s => ({ ...s, [g.name]: !s[g.name] }))}
                                    onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setToggled(s => ({ ...s, [g.name]: !s[g.name] })); } }}
                                    className={cn("p-4 sm:p-5 cursor-pointer transition-colors", t.head)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1", t[g.status])}>{STATUS_LABEL[g.status]}</span>
                                                <h2 className={cn("font-serif text-lg leading-snug", t.cardTitle)}>{g.name}</h2>
                                            </div>
                                            <p className={cn("text-xs flex flex-wrap items-center gap-x-3 gap-y-1", t.meta)}>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#C8A96A]" /> {time(g.opens)} – {time(g.ends)}</span>
                                                <span>{g.exams.length} exam{g.exams.length === 1 ? "" : "s"}</span>
                                                <span className="tabular-nums">{g.writing} writing · {g.submitted} submitted</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {g.roomId && <span className="hidden sm:block"><RoomButton k={`g:${g.name}`} roomId={g.roomId} label={g.name} /></span>}
                                            <ChevronDown className={cn("w-4 h-4 transition-transform", t.muted, expanded && "rotate-180")} />
                                        </div>
                                    </div>
                                    {g.roomId && <div className="sm:hidden mt-3"><RoomButton k={`g:${g.name}`} roomId={g.roomId} label={g.name} /></div>}
                                </div>

                                {expanded && (
                                    <ul>
                                        {g.exams.map(e => {
                                            const st = examStatus(e, now);
                                            return (
                                                <li key={e.id} className={cn("px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2", t.row)}>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={cn("text-sm font-semibold leading-snug", t.cardTitle)}>
                                                            {e.title.replace(/ Exam$/, "")}
                                                            {e.adminOnly && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#C8A96A] align-middle"><Lock className="w-3 h-3" /> Admin only</span>}
                                                        </p>
                                                        <p className={cn("text-xs mt-0.5 tabular-nums", t.muted)}>
                                                            <span className={cn("font-bold", st === "live" ? "text-rose-500" : "")}>{STATUS_LABEL[st]}</span>
                                                            {" · "}{time(e.opensAt)}–{time(e.closesAt)} · {e.durationMinutes} min · {e.writing} writing · {e.submitted} submitted
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <Link href={`${base}/${e.slug}/proctor`} className={cn("text-xs underline font-bold", t.link)}>Warnings &amp; photos</Link>
                                                        {!g.roomId && <RoomButton k={e.id} roomId={e.roomId} label={e.title} small />}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
