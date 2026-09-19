"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays,
    Copy, Clock, Video, Link2,
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

export default function RegistrarZoomLinksPage() {
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

    const isToday = date === toDateStr(new Date());

    return (
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academy Calendar</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Zoom <span className="text-[#C8A96A]">Links.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Browse any day's classes and copy every link at once — no need to ask.</p>
                </div>
                {classes && classes.length > 0 && (
                    <Button
                        onClick={handleCopyAll}
                        className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none gap-2"
                    >
                        <Copy className="w-4 h-4" /> Copy All Links ({classes.length})
                    </Button>
                )}
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-[#0B1F3A]/60 hover:text-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-none" onClick={() => setDate((d) => shiftWatDate(d, -1))}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-[#C8A96A]" />
                    <p className="font-serif text-lg text-[#0B1F3A]">
                        {new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {!isToday && (
                        <button onClick={() => setDate(toDateStr(new Date()))} className="text-[#C8A96A] text-[10px] font-black uppercase tracking-widest hover:underline">
                            Today
                        </button>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="text-[#0B1F3A]/60 hover:text-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-none" onClick={() => setDate((d) => shiftWatDate(d, 1))}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 border border-rose-100 px-6 py-4">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            ) : classes && classes.length > 0 ? (
                <div className="space-y-4">
                    {classes.map((cls) => {
                        const time = new Date(cls.startTime).toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' });
                        return (
                            <div key={cls.liveClassId} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">{time} WAT</span>
                                    </div>
                                    <p className="text-[#0B1F3A] text-lg font-serif truncate">{cls.topic}</p>
                                    <p className="text-slate-500 text-sm font-medium truncate">{cls.courseTitle}</p>
                                    {(cls.zoomMeetingId || cls.zoomPasscode) && (
                                        <p className="text-slate-400 text-xs font-medium">
                                            {cls.zoomMeetingId && <>Meeting ID: <span className="text-slate-600 font-mono">{cls.zoomMeetingId}</span></>}
                                            {cls.zoomMeetingId && cls.zoomPasscode && <> &middot; </>}
                                            {cls.zoomPasscode && <>Passcode: <span className="text-slate-600 font-mono">{cls.zoomPasscode}</span></>}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button
                                        onClick={() => handleCopyOne(cls)}
                                        variant="outline"
                                        className="h-11 px-4 bg-transparent border-[#0B1F3A]/15 text-[#0B1F3A] hover:bg-[#0B1F3A]/5 font-black text-xs uppercase tracking-widest rounded-none"
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
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-12 text-center space-y-2">
                    <Link2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Classes</p>
                    <p className="text-slate-600 font-serif text-lg">Nothing scheduled this day.</p>
                </div>
            )}
        </div>
    );
}
