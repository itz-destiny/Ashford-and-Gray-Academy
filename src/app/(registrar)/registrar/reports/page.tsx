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
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            title: "Active Courses",
            value: stats?.courses || "0",
            change: stats ? `${stats.courseGrowth > 0 ? '+' : ''}${stats.courseGrowth}%` : null,
            isPositive: (stats?.courseGrowth || 0) >= 0,
            icon: BookOpen,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Completion Rate",
            value: stats ? `${stats.completionRate}%` : "0%",
            change: null,
            isPositive: true,
            icon: GraduationCap,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Enrollments (30d)",
            value: stats?.thirtyDayEnrollments || "0",
            change: stats ? `${stats.enrollmentGrowth > 0 ? '+' : ''}${stats.enrollmentGrowth}%` : null,
            isPositive: (stats?.enrollmentGrowth || 0) >= 0,
            icon: TrendingUp,
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Academic Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium">Monitoring curriculum performance and student engagement metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleExportCsv} disabled={!stats} className="h-11 px-6 rounded-2xl font-bold border-slate-200 shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="h-11 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 gap-2">
                        <Calendar className="w-4 h-4" /> Last 30 Days
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] bg-white overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", card.bg, card.color)}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                {card.change !== null && (
                                    <div className={cn(
                                        "flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black",
                                        card.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {card.change}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-white">
                    <CardHeader className="p-10 pb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Enrollment Trends</CardTitle>
                                <CardDescription className="font-medium">New student sign-ups over time.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" /> Enrollments
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
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="enrollments"
                                            stroke="#6366f1"
                                            strokeWidth={4}
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
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-slate-900 text-white p-8 group">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" /> Needs Attention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            {needsAttention.map((item) => (
                                <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={cn(
                                            "w-4 h-4 mt-0.5 flex-shrink-0",
                                            item.type === 'emerald' ? "text-emerald-400" : item.type === 'amber' ? "text-amber-400" : "text-indigo-400"
                                        )} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{item.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <GraduationCap className="w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-black mb-2">Need a Custom Report?</h3>
                        <p className="text-indigo-100 text-sm font-medium mb-6 leading-relaxed">
                            Reach out and we'll put together a deep-dive report for your department or board.
                        </p>
                        <Button onClick={() => router.push('/registrar/communications')} className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl gap-2">
                            <MessageSquare className="w-4 h-4" /> Request via Message
                        </Button>
                    </Card>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <CardTitle className="text-xl font-black">Top Performing Courses</CardTitle>
                    <CardDescription className="font-medium">Courses with highest engagement and enrollment rates.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {stats?.topPerformingCourses?.length > 0 ? (
                        <div className="grid md:grid-cols-3 divide-x divide-slate-50">
                            {stats.topPerformingCourses.map((course: any, i: number) => {
                                const Icon = i === 0 ? Clock : i === 1 ? CheckCircle2 : Activity;
                                return (
                                    <div key={course.id ?? i} className="p-10 hover:bg-slate-50/50 transition-colors group">
                                        <Icon className="w-8 h-8 text-indigo-500 mb-6 group-hover:scale-110 transition-transform" />
                                        <h4 className="font-black text-slate-900 mb-2 leading-tight">{course.title}</h4>
                                        <div className="flex items-center gap-4 text-sm font-bold">
                                            <span className="text-slate-400">{course.enrollments.toLocaleString()} Students</span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-black px-2">{course.status}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="font-bold">No enrollment data yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
