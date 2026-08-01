"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, Video, Loader2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type TimetableSession = {
    _id: string;
    weekCode: string;
    sessionCode: string;
    startTime: string;
    endTime: string;
    programmeName: string;
    courseTitle?: string;
    module: string;
    status: 'unassigned' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
    zoomJoinUrl?: string;
    zoomStartUrl?: string;
};

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-NG', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTimeRange(startIso: string, endIso: string) {
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    return `${new Date(startIso).toLocaleTimeString('en-NG', opts)} – ${new Date(endIso).toLocaleTimeString('en-NG', opts)}`;
}

export default function InstructorSchedulePage() {
    const [sessions, setSessions] = useState<TimetableSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [schedulingId, setSchedulingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSessions = async () => {
        try {
            const res = await apiFetch('/api/timetable/my-sessions');
            const data = await res.json();
            if (data.success) setSessions(data.sessions);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSessions(); }, []);

    const now = Date.now();
    const upcoming = useMemo(
        () => sessions.filter(s => s.status !== 'cancelled' && s.status !== 'completed' && new Date(s.endTime).getTime() >= now),
        [sessions]
    );
    const past = useMemo(
        () => sessions.filter(s => s.status === 'cancelled' || s.status === 'completed' || new Date(s.endTime).getTime() < now),
        [sessions]
    );

    const handleStartZoom = async (session: TimetableSession) => {
        setSchedulingId(session._id);
        try {
            const res = await apiFetch(`/api/timetable/${session._id}/schedule-zoom`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create Zoom class');
            setSessions(prev => prev.map(s => s._id === session._id
                ? { ...s, status: 'scheduled', zoomJoinUrl: data.session.zoomJoinUrl, zoomStartUrl: data.session.zoomStartUrl }
                : s));
            toast({ title: 'Zoom class created', description: 'Your session is live and ready to start.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Could not create Zoom class', description: e.message });
        } finally {
            setSchedulingId(null);
        }
    };

    return (
        <div className="mx-auto px-6 md:px-10 py-8 space-y-10 max-w-[1200px] animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tight mb-2 flex items-center gap-3">
                    <CalendarClock className="w-8 h-8 text-[#C8A96A]" /> My Schedule
                </h1>
                <p className="text-slate-500 font-medium italic">
                    Your teaching sessions, as assigned on the academy timetable. Times and modules are set by the Registry — start your Zoom class when it's your turn.
                </p>
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
            )}

            {!loading && sessions.length === 0 && (
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-12 text-center text-slate-400">
                        No sessions have been assigned to you on the timetable yet. Contact the Registry if you believe this is a mistake.
                    </CardContent>
                </Card>
            )}

            {!loading && upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Upcoming Sessions ({upcoming.length})</h2>
                    {upcoming.map(session => (
                        <Card key={session._id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-[#0B1F3A]/5 text-[#0B1F3A] border-none text-[9px] font-black uppercase tracking-wider">
                                            {session.weekCode} · {session.sessionCode}
                                        </Badge>
                                        <Badge className={
                                            session.status === 'scheduled'
                                                ? "bg-emerald-50 text-emerald-700 border-none text-[9px] font-black uppercase tracking-wider"
                                                : "bg-amber-50 text-amber-700 border-none text-[9px] font-black uppercase tracking-wider"
                                        }>
                                            {session.status === 'scheduled' ? 'Zoom Ready' : 'Not Started'}
                                        </Badge>
                                    </div>
                                    <h3 className="font-black text-[#0B1F3A] text-lg truncate">{session.module}</h3>
                                    <p className="text-sm text-slate-500 font-medium truncate">{session.courseTitle || session.programmeName}</p>
                                    <p className="text-xs text-slate-400 font-bold">{fmtDate(session.startTime)} · {fmtTimeRange(session.startTime, session.endTime)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {session.status === 'scheduled' ? (
                                        <Button asChild className="h-12 px-6 rounded-xl bg-[#1F7A5A] hover:bg-[#1F7A5A]/90 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                                            <a href={session.zoomStartUrl} target="_blank" rel="noopener noreferrer">
                                                <Video className="w-4 h-4" /> Start Class
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleStartZoom(session)}
                                            disabled={schedulingId === session._id}
                                            className="h-12 px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            {schedulingId === session._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                                            Create Zoom Class
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && past.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Past &amp; Cancelled ({past.length})</h2>
                    {past.map(session => (
                        <Card key={session._id} className="border-none shadow-sm rounded-2xl overflow-hidden opacity-60">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-wider">
                                            {session.weekCode} · {session.sessionCode}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-slate-600 truncate">{session.module}</h3>
                                    <p className="text-xs text-slate-400 font-bold">{fmtDate(session.startTime)} · {fmtTimeRange(session.startTime, session.endTime)}</p>
                                </div>
                                {session.status === 'completed' && (
                                    <Badge className="bg-slate-800 text-white border-none text-[9px] font-black uppercase tracking-wider gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
