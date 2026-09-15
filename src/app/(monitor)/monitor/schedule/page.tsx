"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays,
    Copy, Clock, Video,
} from "lucide-react";

interface ScheduleClass {
    liveClassId: string;
    topic: string;
    courseTitle: string;
    startTime: string;
    durationMinutes: number;
    status: string;
    zoomJoinUrl?: string;
    zoomMeetingId?: string;
    zoomPasscode?: string;
}

function toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}

// WAT is UTC+1 — shifting the calendar date math by the offset keeps day
// navigation aligned with the academy's actual day, not the server's UTC day.
function shiftWatDate(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    return toDateStr(dt);
}

export default function MonitorSchedulePage() {
    const { toast } = useToast();
    const [date, setDate] = useState(toDateStr(new Date()));
    const [classes, setClasses] = useState<ScheduleClass[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = useCallback(async (d: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/admin/schedule?date=${d}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Could not load the schedule.");
            setClasses(data.classes || []);
        } catch (err: any) {
            setError(err.message || "Could not load the schedule.");
            setClasses(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSchedule(date); }, [date, fetchSchedule]);

    const handleCopyOne = (cls: ScheduleClass) => {
        const lines = [
            cls.topic,
            `Join: ${cls.zoomJoinUrl || 'n/a'}`,
            cls.zoomMeetingId ? `Meeting ID: ${cls.zoomMeetingId}` : '',
            cls.zoomPasscode ? `Passcode: ${cls.zoomPasscode}` : '',
        ].filter(Boolean);
        navigator.clipboard.writeText(lines.join('\n'));
        toast({ title: "Copied", description: cls.topic });
    };

    const handleCopyAll = () => {
        if (!classes || classes.length === 0) return;
        const lines = [
            'ASHFORD & GRAY FUSION ACADEMY — LIVE CLASS SCHEDULE',
            new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            '='.repeat(56),
            '',
            ...classes.flatMap((cls, i) => {
                const time = new Date(cls.startTime).toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' });
                return [
                    `${i + 1}. ${cls.topic}`,
                    `   Course: ${cls.courseTitle}`,
                    `   Time: ${time} WAT`,
                    `   Join Link: ${cls.zoomJoinUrl || 'n/a'}`,
                    cls.zoomMeetingId ? `   Meeting ID: ${cls.zoomMeetingId}` : '',
                    cls.zoomPasscode ? `   Passcode: ${cls.zoomPasscode}` : '',
                    '',
                ].filter(Boolean);
            }),
        ];
        navigator.clipboard.writeText(lines.join('\n'));
        toast({ title: "All links copied", description: `${classes.length} class${classes.length === 1 ? '' : 'es'} — ready to paste anywhere.` });
    };

    return (
        <div className="flex-1 flex flex-col items-center px-6 py-12 gap-8">
            <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">IT Tools</p>
                <h1 className="font-serif text-2xl text-white">Class Schedule</h1>
                <p className="text-white/50 text-sm max-w-sm">Browse any day's classes and copy the links — no need to wait for that day to arrive.</p>
            </div>

            <div className="w-full max-w-2xl flex items-center justify-between bg-white/[0.03] border border-white/10 p-4">
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setDate((d) => shiftWatDate(d, -1))}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-[#C8A96A]" />
                    <p className="font-serif text-lg text-white">
                        {new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {date !== toDateStr(new Date()) && (
                        <button onClick={() => setDate(toDateStr(new Date()))} className="text-[#C8A96A] text-[10px] font-black uppercase tracking-widest hover:underline">
                            Today
                        </button>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setDate((d) => shiftWatDate(d, 1))}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {classes && classes.length > 0 && (
                <Button
                    onClick={handleCopyAll}
                    variant="outline"
                    className="h-11 px-6 bg-transparent border-[#C8A96A]/40 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:text-[#C8A96A] font-black text-[10px] uppercase tracking-widest rounded-none"
                >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Links ({classes.length})
                </Button>
            )}

            {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
            ) : error ? (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            ) : classes && classes.length > 0 ? (
                <div className="w-full max-w-2xl space-y-4">
                    {classes.map((cls) => {
                        const time = new Date(cls.startTime).toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' });
                        return (
                            <div key={cls.liveClassId} className="bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">{time} WAT</span>
                                    </div>
                                    <p className="text-white text-lg font-serif truncate">{cls.topic}</p>
                                    <p className="text-white/50 text-sm font-medium truncate">{cls.courseTitle}</p>
                                    {(cls.zoomMeetingId || cls.zoomPasscode) && (
                                        <p className="text-white/40 text-xs font-medium">
                                            {cls.zoomMeetingId && <>Meeting ID: <span className="text-white/70 font-mono">{cls.zoomMeetingId}</span></>}
                                            {cls.zoomMeetingId && cls.zoomPasscode && <> &middot; </>}
                                            {cls.zoomPasscode && <>Passcode: <span className="text-white/70 font-mono">{cls.zoomPasscode}</span></>}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button
                                        onClick={() => handleCopyOne(cls)}
                                        variant="outline"
                                        className="h-11 px-4 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-black text-xs uppercase tracking-widest rounded-none"
                                    >
                                        <Copy className="w-4 h-4 mr-2" /> Copy
                                    </Button>
                                    {cls.zoomJoinUrl && (
                                        <Button
                                            onClick={() => window.open(cls.zoomJoinUrl, '_blank', 'noopener,noreferrer')}
                                            className="h-11 px-5 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-xs uppercase tracking-widest rounded-none"
                                        >
                                            <Video className="w-4 h-4 mr-2" /> Open
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-8 text-center">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Idle</p>
                    <p className="text-white/70 font-serif text-lg">No classes scheduled this day.</p>
                </div>
            )}
        </div>
    );
}
