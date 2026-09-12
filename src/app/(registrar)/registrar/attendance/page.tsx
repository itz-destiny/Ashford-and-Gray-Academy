"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ClipboardCheck, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    Users, Clock, Loader2, AlertTriangle, CalendarDays,
} from "lucide-react";

interface Attendee {
    name: string;
    email?: string;
    role?: string;
    joinedAt: string;
}

interface ClassAttendance {
    liveClassId: string;
    topic: string;
    courseTitle: string;
    instructorName: string;
    startTime: string;
    durationMinutes: number;
    status: string;
    enrolledCount: number;
    attendeeCount: number;
    attendees: Attendee[];
}

function toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}

// WAT is UTC+1 — shifting the calendar date math by the offset keeps "today"
// aligned with the academy's actual day, not the server's UTC day.
function shiftWatDate(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    return toDateStr(dt);
}

export default function RegistrarAttendancePage() {
    const [date, setDate] = useState<string>(toDateStr(new Date()));
    const [classes, setClasses] = useState<ClassAttendance[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const fetchAttendance = useCallback(async (d: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/registrar/attendance?date=${d}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not load attendance.');
            setClasses(data.classes || []);
        } catch (err: any) {
            setError(err.message || 'Could not load attendance.');
            setClasses(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAttendance(date); }, [date, fetchAttendance]);

    const toggleExpanded = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const totalAttendees = classes?.reduce((sum, c) => sum + c.attendeeCount, 0) || 0;
    const totalEnrolled = classes?.reduce((sum, c) => sum + c.enrolledCount, 0) || 0;
    const rate = totalEnrolled > 0 ? Math.round((totalAttendees / totalEnrolled) * 100) : null;

    return (
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1200px] mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">
                    Class <span className="text-[#C8A96A]">Attendance.</span>
                </h1>
                <p className="text-slate-500 font-medium font-serif">Who signed in for each live class, day by day.</p>
            </div>

            <div className="flex items-center justify-between bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6">
                <Button variant="ghost" size="icon" className="rounded-none hover:bg-[#F6F4F2]" onClick={() => setDate((d) => shiftWatDate(d, -1))}>
                    <ChevronLeft className="h-5 w-5 text-[#0B1F3A]" />
                </Button>
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-[#C8A96A]" />
                    <p className="font-serif text-xl text-[#0B1F3A]">
                        {new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {date !== toDateStr(new Date()) && (
                        <Button variant="link" className="text-[#C8A96A] text-xs font-black uppercase tracking-widest" onClick={() => setDate(toDateStr(new Date()))}>
                            Today
                        </Button>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="rounded-none hover:bg-[#F6F4F2]" onClick={() => setDate((d) => shiftWatDate(d, 1))}>
                    <ChevronRight className="h-5 w-5 text-[#0B1F3A]" />
                </Button>
            </div>

            {!loading && classes && classes.length > 0 && (
                <div className="grid grid-cols-3 gap-6">
                    <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Classes</p>
                            <p className="text-3xl font-serif text-[#0B1F3A]">{classes.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] rounded-none">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Attendance</p>
                            <p className="text-3xl font-serif text-[#0B1F3A]">{totalAttendees}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#0B1F3A] rounded-none">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Attendance Rate</p>
                            <p className="text-3xl font-serif text-[#0B1F3A]">{rate === null ? '—' : `${rate}%`}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-400" />
                    <p className="text-slate-500">{error}</p>
                </div>
            ) : classes && classes.length > 0 ? (
                <div className="space-y-4">
                    {classes.map((cls) => {
                        const isOpen = expanded.has(cls.liveClassId);
                        const time = new Date(cls.startTime).toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' });
                        return (
                            <Card key={cls.liveClassId} className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none overflow-hidden">
                                <CardHeader
                                    className="p-6 cursor-pointer hover:bg-[#F6F4F2]/50 transition-colors"
                                    onClick={() => toggleExpanded(cls.liveClassId)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{time} WAT</span>
                                            </div>
                                            <p className="font-serif text-lg text-[#0B1F3A] truncate">{cls.topic}</p>
                                            <p className="text-sm text-slate-500 font-medium truncate">{cls.courseTitle} &middot; {cls.instructorName}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <Users className="w-3.5 h-3.5 text-[#1F7A5A]" />
                                                    <span className="font-black text-[#0B1F3A]">{cls.attendeeCount}</span>
                                                    <span className="text-slate-400 text-sm">/ {cls.enrolledCount}</span>
                                                </div>
                                                <Badge className={cn(
                                                    "rounded-none font-black text-[9px] uppercase tracking-widest border-none mt-1",
                                                    cls.status === 'completed' ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"
                                                )}>
                                                    {cls.status}
                                                </Badge>
                                            </div>
                                            {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                                        </div>
                                    </div>
                                </CardHeader>
                                {isOpen && (
                                    <CardContent className="p-6 pt-0 border-t border-[#0B1F3A]/5">
                                        {cls.attendees.length === 0 ? (
                                            <p className="text-slate-400 text-sm italic py-4">Nobody has signed attendance for this class yet.</p>
                                        ) : (
                                            <div className="grid sm:grid-cols-2 gap-3 pt-4">
                                                {cls.attendees.map((a, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-[#F6F4F2]/60 px-4 py-2.5">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[#0B1F3A] truncate">{a.name}</p>
                                                            {a.email && <p className="text-xs text-slate-400 truncate">{a.email}</p>}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium shrink-0 ml-3">
                                                            {new Date(a.joinedAt).toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white border border-[#0B1F3A]/10">
                    <ClipboardCheck className="w-10 h-10 text-slate-200" />
                    <p className="text-slate-400 font-serif italic">No classes scheduled this day.</p>
                </div>
            )}
        </div>
    );
}
