"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { WARNING_REASONS } from "@/lib/class-warnings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Radio, Search, Send, ShieldAlert, CheckCircle2, X, ChevronLeft } from "lucide-react";

interface ClassRow { liveClassId: string; topic: string; courseTitle: string; startTime: string; durationMinutes: number; state: 'live' | 'upcoming' | 'ended'; joined: number; warnings: number }
interface Student { uid: string; name: string; email: string; joinedAt: string | null; warningsHere: number; warningsTotal: number }
interface Warning { _id: string; studentUid: string; studentName: string; reason: string; note?: string; issuedByName: string; createdAt: string; acknowledgedAt: string | null }

const time = (d: string) => new Date(d).toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' });

/**
 * Live-class warnings for staff: pick one of today's classes, pick a student
 * from its roster and send a warning. The student sees it as a pop-up on
 * their own portal (and by email) until they acknowledge it.
 */
export function LiveClassWarnings() {
    const [classes, setClasses] = useState<ClassRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [classId, setClassId] = useState<string | null>(null);
    const [roster, setRoster] = useState<{ students: Student[]; warnings: Warning[]; class: { topic: string; courseTitle: string } } | null>(null);
    const [query, setQuery] = useState('');
    const [target, setTarget] = useState<Student | null>(null);
    const [reason, setReason] = useState<string>('');
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    const loadClasses = useCallback(async () => {
        try {
            const res = await apiFetch('/api/class-warnings/classes');
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not load classes.');
            setClasses(data.classes || []); setError(null);
        } catch (e: any) { setError(e.message); }
    }, []);

    const loadRoster = useCallback(async (id: string) => {
        const res = await apiFetch(`/api/class-warnings/classes/${id}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) setRoster(data);
    }, []);

    useEffect(() => { void loadClasses(); const t = setInterval(loadClasses, 30_000); return () => clearInterval(t); }, [loadClasses]);
    useEffect(() => {
        if (!classId) { setRoster(null); return; }
        void loadRoster(classId);
        const t = setInterval(() => void loadRoster(classId), 20_000);
        return () => clearInterval(t);
    }, [classId, loadRoster]);

    const send = async () => {
        if (!target || !classId || !reason) return;
        setSending(true); setSendError(null);
        try {
            const res = await apiFetch('/api/class-warnings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liveClassId: classId, studentUid: target.uid, reason, note }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not send the warning.');
            setFlash(`Warning sent to ${target.name}. It's now on their screen (${data.totalForStudent} warning${data.totalForStudent === 1 ? '' : 's'} on their record).`);
            setTarget(null); setReason(''); setNote('');
            void loadRoster(classId); void loadClasses();
        } catch (e: any) { setSendError(e.message); } finally { setSending(false); }
    };

    const q = query.trim().toLowerCase();
    const students = (roster?.students || []).filter(s => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    const selected = classes?.find(c => c.liveClassId === classId);

    if (error) return <div className="flex items-center gap-2 text-rose-600 font-medium"><AlertTriangle className="w-5 h-5" /> {error}</div>;
    if (!classes) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] gap-6 items-start">
            {/* Today's classes */}
            <div className={cn("rounded-2xl bg-white shadow-lg shadow-slate-100 overflow-hidden", classId && "hidden lg:block")}>
                <p className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Today&apos;s classes</p>
                {classes.length === 0 && <p className="px-4 pb-6 text-sm text-slate-400">No classes today.</p>}
                <div className="divide-y divide-slate-50">
                    {classes.map(c => (
                        <button key={c.liveClassId} type="button" onClick={() => { setClassId(c.liveClassId); setTarget(null); setFlash(null); setQuery(''); }}
                            className={cn("w-full text-left px-4 py-3 transition-colors", c.liveClassId === classId ? "bg-indigo-50" : "hover:bg-slate-50", c.state === 'ended' && "opacity-60")}>
                            <div className="flex items-center gap-2 mb-0.5">
                                {c.state === 'live'
                                    ? <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live</span>
                                    : <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.state === 'upcoming' ? 'Later' : 'Ended'}</span>}
                                <span className="text-[11px] text-slate-400 tabular-nums">{time(c.startTime)}</span>
                                {c.warnings > 0 && <span className="ml-auto text-[10px] font-black rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">{c.warnings} warned</span>}
                            </div>
                            <p className="text-sm font-bold text-slate-900 leading-snug">{c.topic}</p>
                            <p className="text-xs text-slate-500">{c.courseTitle.replace(/^Diploma in /, '')} · {c.joined} joined</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Roster */}
            <div className="min-w-0 space-y-4">
                {!classId ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-400 font-medium">
                        Pick a class to see its students and give a warning.
                    </div>
                ) : !roster ? (
                    <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                ) : (
                    <>
                        <div className="rounded-2xl bg-white shadow-lg shadow-slate-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <button type="button" onClick={() => setClassId(null)} className="lg:hidden text-xs font-bold text-slate-500 flex items-center gap-1 mb-1"><ChevronLeft className="w-3.5 h-3.5" /> Classes</button>
                                <p className="font-black text-slate-900">{roster.class.topic}</p>
                                <p className="text-xs text-slate-500">{roster.class.courseTitle.replace(/^Diploma in /, '')}{selected ? ` · ${time(selected.startTime)}` : ''} · {roster.students.filter(s => s.joinedAt).length} of {roster.students.length} joined</p>
                            </div>
                            <div className="relative sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a student" className="pl-9 rounded-xl" />
                            </div>
                        </div>

                        {flash && (
                            <div className="rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold px-4 py-3 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <span className="flex-1">{flash}</span>
                                <button type="button" onClick={() => setFlash(null)}><X className="w-4 h-4" /></button>
                            </div>
                        )}

                        {target && (
                            <div className="rounded-2xl bg-white shadow-lg shadow-amber-100 ring-2 ring-amber-300 p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-900">Warn {target.name}</p>
                                        <p className="text-xs text-slate-500">{target.email} · {target.warningsTotal} earlier warning{target.warningsTotal === 1 ? '' : 's'}</p>
                                    </div>
                                    <button type="button" onClick={() => setTarget(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {WARNING_REASONS.map(r => (
                                        <button key={r} type="button" onClick={() => setReason(r)}
                                            className={cn("rounded-full px-3 py-1.5 text-xs font-bold border transition-colors", reason === r ? "bg-amber-500 border-amber-500 text-white" : "border-slate-200 text-slate-600 hover:border-amber-300")}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={500} rows={2}
                                    placeholder={reason === 'Other' ? 'What is the warning for? (required)' : 'Add a note for the student (optional)'}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
                                {sendError && <p className="text-sm font-bold text-rose-600">{sendError}</p>}
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" className="rounded-xl font-bold" onClick={() => setTarget(null)}>Cancel</Button>
                                    <Button disabled={!reason || sending || (reason === 'Other' && !note.trim())} onClick={() => void send()} className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white">
                                        {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />} Send warning
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl bg-white shadow-lg shadow-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[560px]">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/60">
                                            <th className="px-4 py-3">Student</th>
                                            <th className="px-3 py-3">In class</th>
                                            <th className="px-3 py-3 text-right">Warnings</th>
                                            <th className="px-4 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No students match.</td></tr>
                                        ) : students.map(s => (
                                            <tr key={s.uid} className={cn("border-b border-slate-50 last:border-0", target?.uid === s.uid && "bg-amber-50/60")}>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-bold text-slate-900 leading-tight">{s.name}</p>
                                                    <p className="text-[11px] text-slate-400">{s.email}</p>
                                                </td>
                                                <td className="px-3 py-2.5 text-xs">
                                                    {s.joinedAt ? <span className="font-bold text-emerald-700">Joined {time(s.joinedAt)}</span> : <span className="text-slate-400">Not joined</span>}
                                                </td>
                                                <td className="px-3 py-2.5 text-right tabular-nums">
                                                    {s.warningsHere > 0 && <span className="font-black text-amber-700">{s.warningsHere} here</span>}
                                                    {s.warningsHere > 0 && s.warningsTotal > s.warningsHere && <span className="text-slate-300"> · </span>}
                                                    {s.warningsTotal > s.warningsHere && <span className="text-slate-500">{s.warningsTotal} total</span>}
                                                    {s.warningsTotal === 0 && <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <Button size="sm" variant="outline" className="rounded-lg font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
                                                        onClick={() => { setTarget(s); setReason(''); setNote(''); setSendError(null); setFlash(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                                        <ShieldAlert className="w-4 h-4 mr-1" /> Warn
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {roster.warnings.length > 0 && (
                            <div className="rounded-2xl bg-white shadow-lg shadow-slate-100 p-4 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Warnings in this class</p>
                                {roster.warnings.map(w => (
                                    <div key={w._id} className="flex flex-wrap items-baseline gap-x-2 text-sm border-b border-slate-50 last:border-0 pb-2">
                                        <span className="text-xs text-slate-400 tabular-nums">{time(w.createdAt)}</span>
                                        <span className="font-bold text-slate-900">{w.studentName}</span>
                                        <span className="text-amber-700 font-bold">{w.reason}</span>
                                        {w.note && <span className="text-slate-500">— {w.note}</span>}
                                        <span className="ml-auto text-[11px] text-slate-400">by {w.issuedByName} · {w.acknowledgedAt ? <span className="text-emerald-700 font-bold">seen</span> : 'not seen yet'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
