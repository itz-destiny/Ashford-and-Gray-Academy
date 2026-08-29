"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Download,
    Calendar,
    Activity,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    GraduationCap,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageSquare
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { cn } from "@/lib/utils";

export default function RegistrarReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [needsAttention, setNeedsAttention] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    setTrends(data.trends);
                    setNeedsAttention(data.needsAttention || []);
                }
            } catch (err) {
                console.error("Error fetching registrar reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExportCsv = () => {
        if (!stats) return;
        const rows = [
            ['Metric', 'Value'],
            ['Total Students', stats.students],
            ['Active Courses', stats.courses],
            ['Completion Rate (%)', stats.completionRate],
            ['Enrollments (30d)', stats.thirtyDayEnrollments],
            ['Enrollment Growth (%)', stats.enrollmentGrowth],
            [],
            ['Top Performing Course', 'Enrollments'],
            ...((stats.topPerformingCourses || []).map((c: any) => [c.title, c.enrollments])),
        ];
        const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academy-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const kpiCards = [
        {
            title: "Total Students",
            value: stats?.students || "0",
            change: stats ? `${stats.studentGrowth > 0 ? '+' : ''}${stats.studentGrowth}%` : null,
            isPositive: (stats?.studentGrowth || 0) >= 0,
            icon: Users,
        },
        {
            title: "Active Courses",
            value: stats?.courses || "0",
            change: stats ? `${stats.courseGrowth > 0 ? '+' : ''}${stats.courseGrowth}%` : null,
            isPositive: (stats?.courseGrowth || 0) >= 0,
            icon: BookOpen,
        },
        {
            title: "Completion Rate",
            value: stats ? `${stats.completionRate}%` : "0%",
            change: null,
            isPositive: true,
            icon: GraduationCap,
        },
        {
            title: "Enrollments (30d)",
            value: stats?.thirtyDayEnrollments || "0",
            change: stats ? `${stats.enrollmentGrowth > 0 ? '+' : ''}${stats.enrollmentGrowth}%` : null,
            isPositive: (stats?.enrollmentGrowth || 0) >= 0,
            icon: TrendingUp,
        },
    ];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Academic <span className="text-[#C8A96A]">Intelligence.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Monitoring curriculum performance and student engagement metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleExportCsv} disabled={!stats} className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none gap-2">
                        <Calendar className="w-4 h-4" /> Last 30 Days
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <card.icon className="w-5 h-5 text-[#C8A96A]" />
                            {card.change !== null && (
                                <div className={cn(
                                    "flex items-center gap-0.5 px-2 py-1 text-[10px] font-black",
                                    card.isPositive ? "bg-[#1F7A5A]/10 text-[#1F7A5A]" : "bg-rose-50 text-rose-600"
                                )}>
                                    {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.change}
                                </div>
                            )}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{card.title}</p>
                        <h3 className="text-4xl font-serif text-[#0B1F3A]">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm bg-white">
                    <CardHeader className="p-10 pb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Enrollment Trends</CardTitle>
                                <CardDescription className="font-medium">New student sign-ups over time.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <div className="w-3 h-3 bg-[#C8A96A]" /> Enrollments
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-[350px] w-full">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends}>
                                        <defs>
                                            <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C8A96A" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#C8A96A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 0, border: '1px solid rgba(11,31,58,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="enrollments"
                                            stroke="#C8A96A"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorEnroll)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8">
                        <h2 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#C8A96A]" /> Needs Attention
                        </h2>
                        <div className="space-y-3">
                            {needsAttention.map((item) => (
                                <div key={item.id} className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={cn(
                                            "w-4 h-4 mt-0.5 flex-shrink-0",
                                            item.type === 'emerald' ? "text-[#1F7A5A]" : item.type === 'amber' ? "text-amber-400" : "text-[#C8A96A]"
                                        )} />
                                        <div>
                                            <p className="text-sm font-bold text-white/90">{item.title}</p>
                                            <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
                            <GraduationCap className="w-16 h-16 text-[#0B1F3A]" />
                        </div>
                        <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">Need a Custom Report?</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                            Reach out and we'll put together a deep-dive report for your department or board.
                        </p>
                        <Button onClick={() => router.push('/registrar/communications')} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none text-[10px] uppercase tracking-widest shadow-none gap-2">
                            <MessageSquare className="w-4 h-4" /> Request via Message
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-[#0B1F3A]/5">
                    <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Top Performing Courses</CardTitle>
                    <CardDescription className="font-medium">Courses with highest engagement and enrollment rates.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {stats?.topPerformingCourses?.length > 0 ? (
                        <div className="grid md:grid-cols-3 divide-x divide-[#0B1F3A]/5">
                            {stats.topPerformingCourses.map((course: any, i: number) => {
                                const Icon = i === 0 ? Clock : i === 1 ? CheckCircle2 : Activity;
                                return (
                                    <div key={course.id ?? i} className="p-10 hover:bg-[#F6F4F2]/50 transition-colors group">
                                        <Icon className="w-8 h-8 text-[#C8A96A] mb-6 group-hover:scale-110 transition-transform" />
                                        <h4 className="font-serif text-lg text-[#0B1F3A] mb-2 leading-tight">{course.title}</h4>
                                        <div className="flex items-center gap-4 text-sm font-bold">
                                            <span className="text-slate-400">{course.enrollments.toLocaleString()} Students</span>
                                            <Badge variant="outline" className="text-[9px] uppercase font-black px-2 rounded-none border-[#0B1F3A]/10">{course.status}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="font-serif italic">No enrollment data yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
