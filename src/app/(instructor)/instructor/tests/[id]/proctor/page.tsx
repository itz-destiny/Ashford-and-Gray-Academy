"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { staffTestsBase } from "@/lib/exam-link";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProctorPhoto } from "@/components/tests/ProctorPhoto";
import { INCIDENT_LABELS, OFFLINE_AFTER_MS } from "@/lib/proctoring";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, ShieldAlert, Users, Radio, AlertTriangle, CheckCircle2, WifiOff, Video, PlayCircle } from "lucide-react";

interface Incident { type: string; at: string; detail?: string }

interface Row {
    attemptId: string;
    student: { displayName: string; email: string } | null;
    status: 'in_progress' | 'submitted' | 'graded';
    startedAt: string;
    submittedAt?: string;
    submitReason?: 'student' | 'time_up' | 'violations';
    score: number;
    maxScore: number;
    answered: number;
    totalQuestions: number;
    violations: Incident[];
    events: Incident[];
    snapshotCount: number;
    cameraOk?: boolean;
    lastSeenAt?: string;
    autoSubmitted: boolean;
    latestSnapshot: { _id: string; takenAt: string } | null;
    /** Whether Zoom shows this student in the live exam room (null = unknown / no room). */
    inRoom?: boolean | null;
    /** Taking the exam on a phone (proctored through the Zoom room). */
    device?: 'phone' | 'computer' | null;
}

interface Room {
    liveClassId: string;
    startTime: string;
    durationMinutes: number;
    meetingId: string;
    passcode?: string;
    recordingUrl: string | null;
    recordingPasscode: string | null;
}

interface Feed {
    assessment: { _id: string; title: string; type: string; status: string; durationMinutes: number; opensAt: string; closesAt: string };
    room: Room | null;
    maxViolations: number;
    serverTime: string;
    attempts: Row[];
}

const POLL_MS = 5000;

const time = (d: string | Date) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function liveState(row: Row, now: number): 'live' | 'offline' | 'done' {
    if (row.status !== 'in_progress') return 'done';
    if (!row.lastSeenAt) return 'offline';
    return now - new Date(row.lastSeenAt).getTime() > OFFLINE_AFTER_MS ? 'offline' : 'live';
}

export default function LiveProctorPage() {
    const testsBase = staffTestsBase(usePathname());
    const { id } = useParams<{ id: string }>();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [clockSkew, setClockSkew] = useState(0);

    const load = useCallback(async () => {
        try {
            const res = await apiFetch(`/api/assessments/${id}/proctor`);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Could not load the proctoring feed.');
                return;
            }
            const data: Feed = await res.json();
            setClockSkew(new Date(data.serverTime).getTime() - Date.now());
            setFeed(data);
            setError(null);
        } catch {
            // Keep showing the last good data; the next poll retries.
        }
    }, [id]);

    useEffect(() => {
        void load();
        const t = setInterval(() => void load(), POLL_MS);
        return () => clearInterval(t);
    }, [load]);

    const now = Date.now() + clockSkew;

    const rows = useMemo(() => {
        const order = { live: 0, offline: 1, done: 2 } as const;
        return [...(feed?.attempts || [])].sort((a, b) =>
            order[liveState(a, now)] - order[liveState(b, now)]
            || b.violations.length - a.violations.length
            || (a.student?.displayName || '').localeCompare(b.student?.displayName || '')
        );
    }, [feed, now]);

    if (error && !feed) {
        return <div className="p-10 text-center text-slate-500 font-medium">{error}</div>;
    }
    if (!feed) {
        return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
    }

    const max = feed.maxViolations;
    const live = rows.filter(r => liveState(r, now) === 'live').length;
    const offline = rows.filter(r => liveState(r, now) === 'offline').length;
    const flagged = rows.filter(r => r.violations.length > 0).length;
    const done = rows.filter(r => r.status !== 'in_progress').length;
    const selectedRow = rows.find(r => r.attemptId === selected) || null;

    return (
        <div className="space-y-6 p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="space-y-2">
                <Link href={testsBase === '/monitor/exams' ? '/monitor' : `${testsBase}/${id}`} className="text-sm font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> {testsBase === '/monitor/exams' ? 'Back to monitor' : 'Back to results'}
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{feed.assessment.title}</h1>
                    <Badge className="bg-indigo-100 text-indigo-700 border-none flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Live proctoring</Badge>
                </div>
                <p className="text-slate-500 font-medium text-sm">
                    Updates every {POLL_MS / 1000} seconds · {feed.assessment.durationMinutes} min exam · auto-submit at {max} warnings
                </p>
            </div>

            <ExamRoomCard feed={feed} onChanged={load} />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Sitting now', value: live, icon: Radio, tone: 'bg-emerald-500' },
                    { label: 'Offline', value: offline, icon: WifiOff, tone: 'bg-slate-500' },
                    { label: 'With warnings', value: flagged, icon: AlertTriangle, tone: 'bg-amber-500' },
                    { label: 'Submitted', value: done, icon: CheckCircle2, tone: 'bg-indigo-500' },
                    { label: 'Total started', value: rows.length, icon: Users, tone: 'bg-slate-800' },
                ].map(s => (
                    <Card key={s.label} className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl text-white", s.tone)}><s.icon className="w-4 h-4" /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-slate-900 tabular-nums">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {rows.length === 0 ? (
                <div className="text-center text-slate-400 font-medium py-20">No student has started this exam yet. This page updates automatically.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rows.map(r => {
                        const state = liveState(r, now);
                        const v = r.violations.length;
                        const endsAt = new Date(r.startedAt).getTime() + feed.assessment.durationMinutes * 60_000;
                        const minsLeft = Math.max(0, Math.ceil((endsAt - now) / 60_000));
                        return (
                            <button
                                key={r.attemptId}
                                type="button"
                                onClick={() => setSelected(r.attemptId)}
                                className={cn(
                                    "text-left bg-white rounded-2xl shadow-lg shadow-slate-100 overflow-hidden border-2 transition-colors hover:border-indigo-200",
                                    v >= max ? "border-red-300" : v > 0 ? "border-amber-200" : "border-transparent"
                                )}
                            >
                                <div className="relative aspect-[4/3] bg-slate-900">
                                    <ProctorPhoto
                                        snapshotId={r.latestSnapshot?._id}
                                        alt={`Latest photo of ${r.student?.displayName || 'student'}`}
                                        className="w-full h-full"
                                    />
                                    <span className={cn(
                                        "absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider rounded-full px-2 py-0.5 flex items-center gap-1",
                                        state === 'live' ? "bg-emerald-500 text-white" : state === 'offline' ? "bg-slate-700 text-white" : "bg-white/90 text-slate-700"
                                    )}>
                                        {state === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        {state === 'live' ? 'Live' : state === 'offline' ? 'Offline' : r.submitReason === 'violations' ? 'Auto-submitted' : r.submitReason === 'time_up' ? 'Time up' : 'Submitted'}
                                    </span>
                                    <span className={cn(
                                        "absolute top-2 right-2 text-[10px] font-black rounded-full px-2 py-0.5",
                                        v === 0 ? "bg-white/90 text-emerald-700" : v < max ? "bg-amber-400 text-amber-950" : "bg-red-600 text-white"
                                    )}>
                                        {v}/{max} warnings
                                    </span>
                                    {r.latestSnapshot && (
                                        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
                                            Photo {time(r.latestSnapshot.takenAt)}
                                        </span>
                                    )}
                                    {state !== 'done' && r.cameraOk === false && (
                                        <span className="absolute bottom-2 right-2 text-[10px] font-black text-white bg-red-600 rounded px-1.5 py-0.5">Camera off</span>
                                    )}
                                    {state !== 'done' && feed.room && r.inRoom !== undefined && r.inRoom !== null && (
                                        <span className={cn(
                                            "absolute bottom-2 right-2 text-[10px] font-black rounded px-1.5 py-0.5",
                                            r.inRoom ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
                                        )}>
                                            {r.inRoom ? 'In Zoom room' : 'Not in Zoom room'}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 space-y-1.5">
                                    <p className="font-black text-slate-900 truncate flex items-center gap-1.5">
                                        {r.student?.displayName || 'Unknown student'}
                                        {r.device === 'phone' && <span className="shrink-0 text-[10px] font-black text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5">PHONE</span>}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{r.student?.email}</p>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
                                        <span>{r.answered}/{r.totalQuestions} answered</span>
                                        <span>{state === 'done' ? `${r.score}/${r.maxScore} pts` : `${minsLeft} min left`}</span>
                                    </div>
                                    {v > 0 && (
                                        <p className="text-xs font-bold text-amber-700 truncate">
                                            Last: {INCIDENT_LABELS[r.violations[v - 1].type] || r.violations[v - 1].type} at {time(r.violations[v - 1].at)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!selectedRow} onOpenChange={open => { if (!open) setSelected(null); }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedRow && <StudentDetail row={selectedRow} max={max} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ExamRoomCard({ feed, onChanged }: { feed: Feed; onChanged: () => void }) {
    const [busy, setBusy] = useState<'zoom' | 'create' | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const room = feed.room;
    const when = (d: string) => new Date(d).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

    // The Zoom app's gallery view is the way to watch a whole exam at once
    // (up to 49 students per screen). Open the tab inside the click so the
    // browser doesn't block it, then point it at a freshly-signed start link.
    const openInZoom = async () => {
        if (!room) return;
        setErr(null);
        setBusy('zoom');
        const win = window.open('about:blank', '_blank');
        try {
            const res = await apiFetch(`/api/live-classes/${room.liveClassId}/start-url`);
            const data = await res.json();
            if (!res.ok || !data.startUrl) throw new Error(data.error || 'Could not open the exam room.');
            if (win) win.location.href = data.startUrl; else window.location.href = data.startUrl;
        } catch (e: any) {
            win?.close();
            setErr(e.message);
        } finally {
            setBusy(null);
        }
    };

    const createRoom = async () => {
        setErr(null);
        setBusy('create');
        try {
            const res = await apiFetch(`/api/assessments/${feed.assessment._id}/exam-room`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not create the exam room.');
            onChanged();
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(null);
        }
    };

    return (
        <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl bg-[#0B1F3A] text-white">
            <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]">Live exam room</p>
                    {room ? (
                        <>
                            <p className="font-bold">Watch every student live on camera in Zoom&apos;s gallery view.</p>
                            <p className="text-xs text-white/60">Students on a phone (marked PHONE) are proctored through Zoom only: the site checks every 30 seconds that they are still in the room, and switching apps is a warning. Some phones pause Zoom video while the student writes in the browser.</p>
                            <p className="text-sm text-white/70">
                                Sitting: {when(feed.assessment.opensAt)} · students can start until {new Date(feed.assessment.closesAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · Meeting ID {room.meetingId}
                            </p>
                            <p className="text-xs text-white/60">Tip: in Zoom choose <strong>View → Gallery</strong> to see up to 49 students at once. The room records automatically.</p>
                        </>
                    ) : feed.assessment.status === 'published' ? (
                        <p className="font-bold">This exam has no live room yet.</p>
                    ) : (
                        <p className="font-bold">The live exam room is created when you publish the exam.</p>
                    )}
                    {err && <p className="text-sm font-bold text-red-300">{err}</p>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    {room ? (
                        <>
                            <Button onClick={openInZoom} disabled={busy !== null} className="bg-[#C8A96A] hover:bg-[#b8995a] text-[#0B1F3A] rounded-xl font-black">
                                {busy === 'zoom' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />} Open Exam Room in Zoom
                            </Button>
                            {room.recordingUrl && (
                                <Button asChild variant="outline" className="rounded-xl font-bold bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white">
                                    <a href={room.recordingUrl} target="_blank" rel="noreferrer">
                                        <PlayCircle className="w-4 h-4 mr-2" /> Recording{room.recordingPasscode ? ` (passcode ${room.recordingPasscode})` : ''}
                                    </a>
                                </Button>
                            )}
                        </>
                    ) : feed.assessment.status === 'published' && (
                        <Button onClick={createRoom} disabled={busy !== null} className="bg-[#C8A96A] hover:bg-[#b8995a] text-[#0B1F3A] rounded-xl font-black">
                            {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />} Create exam room
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function StudentDetail({ row, max }: { row: Row; max: number }) {
    const [snapshots, setSnapshots] = useState<{ _id: string; reason: string; detail?: string; takenAt: string }[] | null>(null);

    useEffect(() => {
        apiFetch(`/api/attempts/${row.attemptId}/proctor/snapshots`)
            .then(async res => setSnapshots(res.ok ? await res.json() : []))
            .catch(() => setSnapshots([]));
    }, [row.attemptId, row.snapshotCount]);

    const timeline = [
        ...row.violations.map(i => ({ ...i, counted: true })),
        ...row.events.map(i => ({ ...i, counted: false })),
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl font-black">{row.student?.displayName || 'Unknown student'}</DialogTitle>
                <p className="text-sm text-slate-500">{row.student?.email} · started {time(row.startedAt)}{row.submittedAt ? ` · submitted ${time(row.submittedAt)}` : ''}</p>
            </DialogHeader>

            <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{row.violations.length}/{max} warnings</Badge>
                    <Badge variant="outline">{row.events.length} blocked actions</Badge>
                    <Badge variant="outline">{row.snapshotCount} photos</Badge>
                    <Badge variant="outline">{row.answered}/{row.totalQuestions} answered</Badge>
                    {row.status !== 'in_progress' && <Badge variant="outline">{row.score}/{row.maxScore} pts</Badge>}
                    {row.submitReason === 'violations' && <Badge className="bg-red-100 text-red-700 border-none">Auto-submitted for warnings</Badge>}
                </div>

                <div>
                    <h3 className="text-sm font-black text-slate-900 mb-2">Timeline</h3>
                    {timeline.length === 0 ? (
                        <p className="text-sm text-slate-400">Nothing recorded — no warnings or blocked actions.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {timeline.map((t, i) => (
                                <li key={i} className="text-sm flex items-center gap-3">
                                    <span className="text-xs text-slate-400 tabular-nums w-20 shrink-0">{time(t.at)}</span>
                                    <span className={cn("font-bold", t.counted ? "text-red-700" : "text-slate-600")}>
                                        {INCIDENT_LABELS[t.type] || t.type}
                                    </span>
                                    {t.detail && <span className="text-xs text-slate-400">{t.detail}</span>}
                                    {t.counted && <Badge className="bg-red-50 text-red-700 border-none text-[10px]">Warning</Badge>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-black text-slate-900 mb-2">Photos</h3>
                    {!snapshots ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                    ) : snapshots.length === 0 ? (
                        <p className="text-sm text-slate-400">No photos were taken.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {snapshots.map(s => (
                                <div key={s._id} className="space-y-1">
                                    <ProctorPhoto snapshotId={s._id} alt={`Photo at ${time(s.takenAt)}`} className="w-full aspect-[4/3] rounded-lg" />
                                    <p className={cn("text-[11px] font-bold", s.reason === 'violation' ? "text-red-700" : "text-slate-500")}>
                                        {time(s.takenAt)} · {s.reason === 'violation' ? (INCIDENT_LABELS[s.detail || ''] || 'Warning') : s.reason === 'start' ? 'Start' : 'Routine'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
