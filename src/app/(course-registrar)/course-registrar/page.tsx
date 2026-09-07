"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import {
    Users, CalendarClock, Video, ChevronRight, Clock,
} from "lucide-react";

type TimetableSession = {
    _id: string;
    module: string;
    programmeName: string;
    courseTitle?: string;
    lecturerName: string;
    startTime: string;
    endTime: string;
    status: 'unassigned' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
};

type DashboardStats = {
    totalStudents: number;
    totalSessions: number;
    scheduledSessions: number;
    awaitingZoomSetup: number;
};

function isLiveNow(s: TimetableSession) {
    const now = Date.now();
    return s.status === 'scheduled' && now >= new Date(s.startTime).getTime() && now <= new Date(s.endTime).getTime();
}

export default function CourseRegistrarDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0, totalSessions: 0, scheduledSessions: 0, awaitingZoomSetup: 0,
    });
    const [upcomingSessions, setUpcomingSessions] = useState<TimetableSession[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [adminStatsRes, timetableRes] = await Promise.all([
                apiFetch('/api/admin/stats'),
                apiFetch('/api/admin/timetable'),
            ]);
            const adminStats = await adminStatsRes.json().catch(() => null);
            const timetableData = await timetableRes.json().catch(() => null);
            const sessions: TimetableSession[] = timetableData?.success ? timetableData.sessions : [];

            setStats({
                totalStudents: adminStats?.stats?.students ?? 0,
                totalSessions: sessions.length,
                scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
                awaitingZoomSetup: sessions.filter(s => s.status === 'assigned').length,
            });

            const now = Date.now();
            const upcoming = sessions
                .filter(s => s.status === 'scheduled' && new Date(s.endTime).getTime() >= now)
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 5);
            setUpcomingSessions(upcoming);
        } catch (err) {
            console.error('CourseRegistrar dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!userLoading && user) {
            fetchData();
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }
    }, [user, userLoading, fetchData]);

    const kpis = [
        { label: "Total Students", value: stats.totalStudents, icon: Users, href: "/course-registrar/students" },
        { label: "Zoom Classes Scheduled", value: stats.scheduledSessions, icon: Video, href: "/course-registrar/timetable" },
        { label: "Awaiting Zoom Setup", value: stats.awaitingZoomSetup, icon: CalendarClock, href: "/course-registrar/timetable" },
        { label: "Timetable Sessions", value: stats.totalSessions, icon: Clock, href: "/course-registrar/timetable" },
    ];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Programme Overview</h1>
                    <p className="text-slate-500 font-medium font-serif">Schedule classes, manage the timetable, and create Zoom meetings for the academy.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Link href="/course-registrar/timetable"><CalendarClock className="h-4 w-4 mr-2" />Timetable &amp; Zoom</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <Link key={i} href={k.href}>
                        <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{k.label}</p>
                                <k.icon className="w-5 h-5 text-[#C8A96A]" />
                            </div>
                            <p className="text-4xl font-serif text-[#0B1F3A]">{loading ? '—' : k.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Zoom classes */}
                <div className="lg:col-span-2 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                    <div className="flex items-center justify-between p-8 pb-4">
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Upcoming Zoom Classes</h2>
                        <Button variant="ghost" size="sm" asChild className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[9px] tracking-widest rounded-none">
                            <Link href="/course-registrar/timetable">View Timetable</Link>
                        </Button>
                    </div>
                    <div className="p-8 pt-0 space-y-2">
                        {loading ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100/60 animate-pulse" />)
                        ) : upcomingSessions.length === 0 ? (
                            <div className="py-16 text-center">
                                <CalendarClock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium italic font-serif">No upcoming Zoom classes are scheduled yet.</p>
                            </div>
                        ) : upcomingSessions.map((s) => (
                            <Link
                                key={s._id}
                                href="/course-registrar/timetable"
                                className="flex items-center gap-4 p-4 hover:bg-[#F6F4F2] border border-transparent hover:border-[#0B1F3A]/5 transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-black text-[#0B1F3A] truncate">{s.module}</p>
                                        {isLiveNow(s) && (
                                            <Badge className="text-[9px] font-black uppercase tracking-widest rounded-none border-none px-2 py-0.5 bg-red-500/10 text-red-600">
                                                Live Now
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {s.courseTitle || s.programmeName} · {s.lecturerName}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 flex items-center gap-1.5 text-slate-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">
                                        {new Date(s.startTime).toLocaleString('en-NG', { weekday: 'short', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Management */}
                <div className="space-y-4">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 space-y-3">
                        <h2 className="text-2xl font-serif text-white mb-6">Management</h2>
                        {[
                            { href: "/course-registrar/timetable", label: "Timetable & Zoom", icon: CalendarClock, color: "text-[#C8A96A]" },
                            { href: "/course-registrar/students", label: "Student List", icon: Users, color: "text-purple-400" },
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="flex items-center gap-4 p-4 border border-white/10 hover:bg-white/5 transition-colors">
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
