"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Users,
    CheckCircle2,
    Search,
    Download,
    Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { format } from "date-fns";

interface RecentEnrollment {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    course: { title: string };
    enrolledAt: string;
    progress: number;
}

export default function EnrollmentTrackingPage() {
    const [loading, setLoading] = useState(true);
    const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
    const [stats, setStats] = useState<{ thirtyDayEnrollments: number; enrollmentGrowth: number; completionRate: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiFetch('/api/admin/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    setRecentEnrollments(data.recentEnrollments || []);
                }
            } catch (err) {
                console.error('Error fetching enrollment data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = recentEnrollments.filter(e =>
        e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportCsv = () => {
        if (recentEnrollments.length === 0) return;
        const rows = [
            ['Student', 'Course', 'Enrolled', 'Progress'],
            ...recentEnrollments.map(e => [e.userName, e.course?.title || '', format(new Date(e.enrolledAt), 'yyyy-MM-dd'), `${e.progress}%`]),
        ];
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recent-enrollments-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Enrollment <span className="text-[#C8A96A]">Tracking.</span>
                        {stats && (
                            <Badge className={
                                stats.enrollmentGrowth >= 0
                                    ? "bg-[#1F7A5A]/10 text-[#1F7A5A] border border-[#1F7A5A]/20 rounded-none px-3 font-black text-[10px] uppercase tracking-widest"
                                    : "bg-rose-50 text-rose-600 border border-rose-200 rounded-none px-3 font-black text-[10px] uppercase tracking-widest"
                            }>
                                {stats.enrollmentGrowth >= 0 ? '+' : ''}{stats.enrollmentGrowth}% vs. prior 30d
                            </Badge>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Monitoring real institutional enrollment activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        disabled={recentEnrollments.length === 0}
                        onClick={handleExportCsv}
                        className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none"
                    >
                        <Download className="w-4 h-4 mr-2 text-[#C8A96A]" /> Export
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "New Enrollments (30d)", value: stats?.thirtyDayEnrollments.toString() ?? '0', icon: Users },
                    { label: "Completion Rate", value: `${stats?.completionRate ?? 0}%`, icon: CheckCircle2 },
                    { label: "Growth vs. Prior 30d", value: `${(stats?.enrollmentGrowth ?? 0) >= 0 ? '+' : ''}${stats?.enrollmentGrowth ?? 0}%`, icon: TrendingUp },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                            <stat.icon className="w-5 h-5 text-[#C8A96A]" />
                        </div>
                        <p className="text-4xl font-serif text-[#0B1F3A]">{loading ? '—' : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Enrollment Stream */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="p-8 border-b border-[#0B1F3A]/10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-serif text-[#0B1F3A]">Recent Enrollments</h2>
                            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Most recent sign-ups, real-time</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by student or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-[#F6F4F2] border-none rounded-none w-[260px] font-medium focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F6F4F2]/50">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-12">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0B1F3A]/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-serif italic">
                                            No enrollments found
                                        </td>
                                    </tr>
                                ) : filtered.map((log) => (
                                    <tr key={log.id} className="group hover:bg-[#F6F4F2] transition-all border-l-4 border-l-transparent hover:border-l-[#C8A96A]">
                                        <td className="px-10 py-6">
                                            <span className="font-black text-slate-400 text-xs">{format(new Date(log.enrolledAt), 'MMM d, yyyy')}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="font-black text-[#0B1F3A] group-hover:text-[#C8A96A] transition-colors">{log.userName}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="font-bold text-slate-600 text-sm tracking-tight">{log.course?.title || 'Unknown Course'}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right pr-12">
                                            <span className="font-black text-[#0B1F3A] text-sm">{log.progress}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
