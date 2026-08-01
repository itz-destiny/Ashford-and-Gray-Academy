"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, BookOpen, GraduationCap, Download, AlertCircle, CheckCircle2, Loader2, Activity } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

type TopCourse = { id: string; title: string; enrollments: number; status: string };
type NeedsAttentionItem = { id: string; title: string; description: string; type: string };
type RecentEnrollment = { id: string; userName: string; course?: { title: string }; enrolledAt: string };

type Stats = {
    students: number;
    instructors: number;
    courses: number;
    events: number;
    revenue: number;
    completionRate: number;
    thirtyDayEnrollments: number;
    enrollmentGrowth: number;
    topPerformingCourses: TopCourse[];
};

const ATTENTION_STYLES: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function AdminReportsPage() {
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [trends, setTrends] = React.useState<any[]>([]);
    const [recentEnrollments, setRecentEnrollments] = React.useState<RecentEnrollment[]>([]);
    const [needsAttention, setNeedsAttention] = React.useState<NeedsAttentionItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiFetch('/api/admin/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    setTrends(data.trends || []);
                    setRecentEnrollments(data.recentEnrollments || []);
                    setNeedsAttention(data.needsAttention || []);
                }
            } catch (err) {
                console.error("Error fetching reports stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExport = () => {
        if (!stats) return;
        const rows = [
            ["Metric", "Value"],
            ["Active Students", stats.students],
            ["Instructors", stats.instructors],
            ["Course Catalog", stats.courses],
            ["Total Events", stats.events],
            ["Total Revenue (NGN)", stats.revenue],
            ["Completion Rate (%)", stats.completionRate],
            ["Enrollments (Last 30 Days)", stats.thirtyDayEnrollments],
            ["Enrollment Growth vs. Prior 30 Days (%)", stats.enrollmentGrowth],
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'academy_insights.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const statCards = stats ? [
        { title: "Total Revenue", value: `₦${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Active Students", value: stats.students.toLocaleString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Course Catalog", value: stats.courses.toLocaleString(), icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Instructors", value: stats.instructors.toLocaleString(), icon: GraduationCap, color: "text-sky-600", bg: "bg-sky-50" },
    ] : [];

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-7 h-7 text-indigo-600" />
                        Insights
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time performance across every course, student, and instructor in the academy.</p>
                </div>
                <Button variant="outline" onClick={handleExport} disabled={!stats} className="font-bold border-slate-200 h-11 px-6 rounded-xl gap-2 shadow-sm">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-none shadow-sm rounded-2xl bg-indigo-50/50">
                    <CardContent className="p-6 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Enrollments (Last 30 Days)</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.thirtyDayEnrollments ?? 0}</h3>
                        </div>
                        <span className={cn(
                            "flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full",
                            (stats?.enrollmentGrowth ?? 0) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                            {(stats?.enrollmentGrowth ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stats?.enrollmentGrowth ?? 0}% vs. prior 30 days
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-emerald-50/50">
                    <CardContent className="p-6 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Course Completion Rate</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats?.completionRate ?? 0}%</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Across {stats?.courses ?? 0} courses</span>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold text-slate-900">Enrollment &amp; Revenue Trend</CardTitle>
                        <CardDescription>Last 7 days, from real enrollment activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[280px] w-full">
                            {trends.length === 0 ? (
                                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 text-sm font-medium text-center px-8">
                                    No enrollment activity in the last 7 days.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenue (₦)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold text-slate-900">Needs Attention</CardTitle>
                        <CardDescription>Live items pulled from the database.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {needsAttention.map(item => (
                            <div key={item.id} className={cn("p-4 rounded-xl border flex items-start gap-3", ATTENTION_STYLES[item.type] ?? 'bg-slate-50 text-slate-600 border-slate-100')}>
                                {item.type === 'emerald' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                <div className="min-w-0">
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs opacity-80">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold text-slate-900">Top Performing Courses</CardTitle>
                        <CardDescription>Ranked by real enrollment counts.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {(stats?.topPerformingCourses ?? []).map((course, i) => (
                            <div key={course.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-7 h-7 shrink-0 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-500 shadow-sm">{i + 1}</span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-800 truncate">{course.title}</p>
                                        <p className="text-xs text-slate-400 font-medium">{course.enrollments} enrollments</p>
                                    </div>
                                </div>
                                <Badge className="bg-white text-slate-600 border-none font-bold text-[10px] uppercase shadow-sm shrink-0">{course.status}</Badge>
                            </div>
                        ))}
                        {(!stats?.topPerformingCourses || stats.topPerformingCourses.length === 0) && (
                            <p className="text-center text-slate-400 text-sm py-8">No enrollments yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold text-slate-900">Recent Enrollments</CardTitle>
                        <CardDescription>The latest students to join a course.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {recentEnrollments.map(en => (
                            <div key={en.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-slate-800 truncate">{en.userName}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate">{en.course?.title}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 ml-3">
                                    {format(new Date(en.enrolledAt), 'MMM d')}
                                </span>
                            </div>
                        ))}
                        {recentEnrollments.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-8">No enrollments yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
