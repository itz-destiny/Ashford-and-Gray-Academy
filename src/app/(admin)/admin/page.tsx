
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users, DollarSign, TrendingUp, Activity,
    BookOpen, Shield, ChevronRight, Clock,
    AlertTriangle, ArrowUpRight, BarChart3,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminDashboard() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<any>(null);
    const [kpis, setKpis] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;

        const fetchData = async () => {
            try {
                const [statsRes, kpisRes, activityRes, healthRes] = await Promise.all([
                    apiFetch('/api/admin/stats'),
                    apiFetch('/api/admin/kpis'),
                    apiFetch('/api/admin/activity-feed?limit=8'),
                    apiFetch('/api/admin/system-health'),
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (kpisRes.ok) {
                    const d = await kpisRes.json();
                    setKpis(d.kpis);
                }
                if (activityRes.ok) {
                    const d = await activityRes.json();
                    setActivities(d.activities || []);
                }
                if (healthRes.ok) {
                    const d = await healthRes.json();
                    setSystemStatus(d.summary);
                }
            } catch (err) {
                console.error("Admin dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60_000);
        return () => clearInterval(interval);
    }, [user, userLoading]);

    if (userLoading || (loading && !stats)) {
        return (
            <div className="p-12 space-y-12 animate-pulse bg-[#FAF9F6] min-h-screen">
                <div className="h-48 bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 h-[600px] bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />
                    <div className="h-[600px] bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />
                </div>
            </div>
        );
    }

    const overallStatus = systemStatus?.overallStatus || 'healthy';
    const isHealthy = overallStatus === 'healthy';

    const kpiCards = [
        {
            label: "Total Students",
            value: (kpis?.totalStudents ?? stats?.stats?.students ?? 0).toLocaleString(),
            sub: `${kpis?.activeStudents ?? 0} active this week`,
            icon: Users,
            accent: "text-[#0B1F3A]",
        },
        {
            label: "Monthly Revenue",
            value: `₦${(kpis?.revenue?.month ?? 0).toLocaleString()}`,
            sub: `₦${(kpis?.revenue?.week ?? 0).toLocaleString()} this week`,
            icon: DollarSign,
            accent: "text-[#1F7A5A]",
        },
        {
            label: "Completion Rate",
            value: `${kpis?.completionRate ?? stats?.stats?.completionRate ?? 0}%`,
            sub: `${kpis?.completedEnrollments ?? 0} of ${kpis?.totalEnrollments ?? 0} enrolments`,
            icon: TrendingUp,
            accent: "text-[#C8A96A]",
        },
        {
            label: "System Status",
            value: isHealthy ? "Operational" : overallStatus === 'warning' ? "Warning" : "Critical",
            sub: `${systemStatus?.criticalAlerts ?? 0} critical · ${systemStatus?.warningAlerts ?? 0} warnings`,
            icon: Activity,
            accent: isHealthy ? "text-[#1F7A5A]" : "text-rose-600",
        },
    ];

    const needsAttention: any[] = stats?.needsAttention || [];
    const recentEnrollments: any[] = stats?.recentEnrollments || [];
    const topCourses: any[] = stats?.stats?.topPerformingCourses || [];

    const safeDate = (d: any) => {
        if (!d) return null;
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6]">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Management Suite</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        Welcome back,<br />
                        <span className="text-[#C8A96A]">{user?.displayName?.split(' ')[0]}.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed font-serif">
                        {(stats?.stats?.students ?? 0).toLocaleString()} students enrolled across {stats?.stats?.courses ?? 0} programmes.
                    </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                    <Badge className={cn(
                        "px-5 py-2 rounded-none font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                        isHealthy ? "bg-[#1F7A5A] text-white" : "bg-rose-500 text-white"
                    )}>
                        {isHealthy ? '✓ Academy Online' : '⚠ Action Required'}
                    </Badge>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 pr-6 bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                        <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                            <card.icon className={cn("w-7 h-7", card.accent)} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-xl font-black text-[#0B1F3A]">{card.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* Left — 2/3 */}
                <div className="lg:col-span-2 space-y-14">

                    {/* Recent Enrollments */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-8 mb-10">
                            <div>
                                <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Recent Enrolments</h2>
                                <p className="text-slate-400 font-medium mt-2">Latest students joining programmes.</p>
                            </div>
                            <Link href="/admin/users" className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors">
                                All Members <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentEnrollments.length > 0 ? (
                                recentEnrollments.map((en: any) => {
                                    const enrolledDate = safeDate(en.enrolledAt);
                                    return (
                                        <div key={en.id} className="flex items-center gap-6 p-6 bg-white border border-[#0B1F3A]/10 shadow-sm hover:border-[#C8A96A] transition-all group">
                                            <Avatar className="w-12 h-12 rounded-none border border-[#0B1F3A]/10 flex-shrink-0">
                                                <AvatarImage src={en.userPhoto} />
                                                <AvatarFallback className="rounded-none bg-[#0B1F3A] text-white text-xs font-black">
                                                    {en.userName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-[#0B1F3A] text-sm truncate">{en.userName}</p>
                                                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{en.course?.title}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {enrolledDate ? format(enrolledDate, 'MMM dd, yyyy') : '—'}
                                                </p>
                                                <Badge className="mt-1 text-[8px] font-black uppercase tracking-widest rounded-none border border-[#C8A96A]/30 bg-[#C8A96A]/10 text-[#0B1F3A] shadow-none">
                                                    {en.progress ?? 0}% progress
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-sm">
                                    <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium italic font-serif">No enrolments recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performing Courses */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-8 mb-10">
                            <div>
                                <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Top Programmes</h2>
                                <p className="text-slate-400 font-medium mt-2">Courses ranked by enrolment volume.</p>
                            </div>
                            <Link href="/admin/courses" className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors">
                                All Courses <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="grid gap-4">
                            {topCourses.length > 0 ? (
                                topCourses.map((course: any, i: number) => (
                                    <div key={course.id || i} className="flex items-center gap-6 p-8 bg-white border border-[#0B1F3A]/10 shadow-sm hover:border-[#C8A96A] transition-all border-l-4 border-l-[#C8A96A]">
                                        <div className="w-10 h-10 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0">
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-[#0B1F3A] text-base truncate">{course.title}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {(course.enrollments ?? 0).toLocaleString()} enrolments
                                            </p>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-widest rounded-none border-none shadow-sm flex-shrink-0",
                                            course.status === 'Trending'
                                                ? "bg-[#1F7A5A] text-white"
                                                : course.status === 'High Yield'
                                                    ? "bg-[#C8A96A] text-[#0B1F3A]"
                                                    : "bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10"
                                        )}>
                                            {course.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-sm">
                                    <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium italic font-serif">No course data available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="border-b border-[#0B1F3A]/10 pb-8 mb-10">
                            <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Quick Actions</h2>
                            <p className="text-slate-400 font-medium mt-2">Common management tasks.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                {
                                    href: '/registrar/audit',
                                    icon: Shield,
                                    label: 'Audit Log',
                                    desc: 'Track all platform changes',
                                    iconBg: 'bg-indigo-50',
                                    iconColor: 'text-indigo-600',
                                },
                                {
                                    href: '/admin/reports',
                                    icon: AlertTriangle,
                                    label: 'Security Alerts',
                                    desc: `${systemStatus?.criticalAlerts ?? 0} items need review`,
                                    iconBg: 'bg-orange-50',
                                    iconColor: 'text-orange-600',
                                },
                                {
                                    href: '/course-registrar/approvals',
                                    icon: Clock,
                                    label: 'Review Requests',
                                    desc: 'Course & payment approvals',
                                    iconBg: 'bg-purple-50',
                                    iconColor: 'text-purple-600',
                                },
                            ].map((tool, i) => (
                                <Link
                                    key={i}
                                    href={tool.href}
                                    className="flex items-center gap-5 p-8 bg-white border border-[#0B1F3A]/10 shadow-sm hover:border-[#C8A96A] transition-all group"
                                >
                                    <div className={cn("w-12 h-12 flex items-center justify-center flex-shrink-0", tool.iconBg)}>
                                        <tool.icon className={cn("w-6 h-6 group-hover:scale-110 transition-transform", tool.iconColor)} />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#0B1F3A] text-sm">{tool.label}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{tool.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — 1/3 */}
                <div className="space-y-14">

                    {/* Needs Attention */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
                            <div className="w-2 h-6 bg-[#C8A96A]" />
                            Needs Attention
                        </h2>
                        <div className="space-y-4">
                            {needsAttention.map((item: any, i: number) => (
                                <div key={i} className={cn(
                                    "p-6 bg-white border border-[#0B1F3A]/10 shadow-sm",
                                    item.type === 'emerald'
                                        ? "border-l-4 border-l-[#1F7A5A]"
                                        : item.type === 'amber'
                                            ? "border-l-4 border-l-[#C8A96A]"
                                            : "border-l-4 border-l-indigo-500"
                                )}>
                                    <p className="font-black text-[#0B1F3A] text-sm">{item.title}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="bg-[#0B1F3A] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 p-10 space-y-8">
                            <h2 className="text-xl font-serif text-white flex items-center gap-3">
                                <div className="w-2 h-6 bg-[#C8A96A]" />
                                Tuition &amp; Revenue
                            </h2>

                            <div className="space-y-4">
                                <div className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <p className="text-[9px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">This Month</p>
                                    <p className="text-3xl font-black text-white">₦{(kpis?.revenue?.month ?? 0).toLocaleString()}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white/5 border border-white/10">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                                        <p className="text-2xl font-black text-white">{kpis?.pendingPayouts ?? 0}</p>
                                    </div>
                                    <div className="p-5 bg-rose-500/10 border border-rose-500/20">
                                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Failed</p>
                                        <p className="text-2xl font-black text-rose-400">{kpis?.failedTransactions ?? 0}</p>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black rounded-none shadow-xl text-[10px] uppercase tracking-widest">
                                <Link href="/admin/reports">
                                    Finance Report <ArrowUpRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
                            <div className="w-2 h-6 bg-[#C8A96A]" />
                            Recent Activity
                        </h2>

                        <div className="bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                            {activities.length > 0 ? (
                                activities.map((act: any, i: number) => {
                                    const ts = safeDate(act.timestamp);
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 p-6 border-b border-[#0B1F3A]/5 last:border-none hover:bg-[#F6F4F2] transition-all"
                                        >
                                            <div className={cn(
                                                "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                                                act.status === 'success' ? "bg-[#1F7A5A]" : "bg-rose-500"
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-[#0B1F3A] truncate">{act.userName}</p>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{act.action}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                                                    {ts ? format(ts, 'MMM dd · HH:mm') : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-16 text-center">
                                    <p className="text-slate-400 font-medium italic text-sm font-serif">No activity yet.</p>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/registrar/audit"
                            className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors"
                        >
                            Full Audit Log <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Academy Summary */}
                    <Card className="p-10 rounded-none border border-[#0B1F3A]/10 shadow-md bg-white space-y-8 border-t-4 border-t-[#C8A96A]">
                        <CardTitle className="text-xl font-serif text-[#0B1F3A]">Academy Summary</CardTitle>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Students', value: (stats?.stats?.students ?? 0).toLocaleString(), icon: Users },
                                { label: 'Instructors', value: (stats?.stats?.instructors ?? 0).toLocaleString(), icon: BarChart3 },
                                { label: 'Active Courses', value: (stats?.stats?.courses ?? 0).toLocaleString(), icon: BookOpen },
                                { label: 'Upcoming Events', value: (stats?.stats?.events ?? 0).toLocaleString(), icon: Clock },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-[#0B1F3A]/5 last:border-none">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center">
                                            <item.icon className="w-4 h-4 text-[#0B1F3A]/50" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                    </div>
                                    <p className="text-lg font-black text-[#0B1F3A]">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
