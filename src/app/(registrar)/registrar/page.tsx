
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, Activity, UserPlus, AlertTriangle, CheckCircle, Clock, TrendingUp, History, LayoutDashboard } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

interface DashboardStats {
    totalStaff: number;
    auditLogsThisWeek: number;
    pendingApprovals: number;
    activeUsers: number;
    suspendedUsers: number;
}

export default function RegistrarDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStaff: 0,
        auditLogsThisWeek: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        suspendedUsers: 0
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user stats
                const usersRes = await apiFetch('/api/users');
                const users = await usersRes.json();

                if (Array.isArray(users)) {
                    const staff = users.filter(u => ['registrar', 'course_registrar', 'finance', 'instructor'].includes(u.role));
                    const active = users.filter(u => u.status !== 'suspended');
                    const suspended = users.filter(u => u.status === 'suspended');

                    setStats({
                        totalStaff: staff.length,
                        auditLogsThisWeek: 0, // Will be populated from audit API
                        pendingApprovals: 0, // Will be populated from approvals API
                        activeUsers: active.length,
                        suspendedUsers: suspended.length
                    });
                }

                // Fetch recent audit logs
                const auditRes = await fetch('/api/audit/logs?limit=5');
                const auditData = await auditRes.json();
                if (Array.isArray(auditData)) {
                    setRecentActivities(auditData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const statCards = [
        {
            label: "Academy Staff",
            value: stats.totalStaff.toString(),
            icon: Users,
            sub: "Total staff across teams",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/registrar/users"
        },
        {
            label: "Active Accounts",
            value: stats.activeUsers.toString(),
            icon: CheckCircle,
            sub: `${stats.suspendedUsers} on hold`,
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: "/registrar/users"
        },
        {
            label: "Recent Updates",
            value: recentActivities.length.toString(),
            icon: Activity,
            sub: "Last 24 hours",
            bg: "bg-purple-50",
            iconColor: "text-purple-600",
            href: "/registrar/audit"
        },
    ];

    const getActivityIcon = (action: string) => {
        if (action.includes('create')) return <UserPlus className="h-4 w-4 text-emerald-600" />;
        if (action.includes('update')) return <Activity className="h-4 w-4 text-blue-600" />;
        if (action.includes('delete') || action.includes('suspend')) return <AlertTriangle className="h-4 w-4 text-rose-600" />;
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 bg-[#FAF9F6] min-h-screen p-6 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#0B1F3A]/10 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight leading-tight">Enrollment Overview</h1>
                    <p className="text-slate-500 font-medium italic font-serif">Manage academy members and staff records.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="rounded-none border-[#0B1F3A]/10 bg-white hover:bg-slate-50 font-black text-[10px] uppercase tracking-wider">
                        <Link href="/registrar/users">
                            <Users className="h-4 w-4 mr-2 text-[#C8A96A]" />
                            Staff List
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#0B1F3A] hover:bg-[#C8A96A] text-white rounded-none font-black text-[10px] uppercase tracking-wider">
                        <Link href="/registrar/audit">
                            <History className="h-4 w-4 mr-2" />
                            System History
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border border-[#0B1F3A]/10 bg-white rounded-none group hover:shadow-xl transition-all duration-300 overflow-hidden relative border-t-4 border-t-[#0B1F3A]">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h2 className="text-4xl font-black text-[#0B1F3A] mt-2 font-serif">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`bg-[#F6F4F2] border border-[#0B1F3A]/5 p-4 rounded-none transition-transform group-hover:scale-110`}>
                                        <stat.icon className={`w-6 h-6 text-[#C8A96A]`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic font-serif">
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Updates */}
                <Card className="border border-[#0B1F3A]/10 bg-white rounded-none shadow-md lg:col-span-2 overflow-hidden border-t-4 border-t-[#C8A96A]">
                    <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-serif text-[#0B1F3A] tracking-tight">Recent Updates</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[10px] tracking-wider rounded-none">
                            <Link href="/registrar/audit">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm italic font-bold">
                                    Loading history...
                                </div>
                            ) : recentActivities.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm italic font-bold">
                                    No recent updates found.
                                </div>
                            ) : (
                                recentActivities.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-[#F6F4F2]/50 rounded-none border border-transparent hover:border-[#0B1F3A]/5 transition-all group">
                                        <div className="mt-1 p-2 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none group-hover:bg-white transition-colors">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-bold text-[#0B1F3A] capitalize">
                                                    {activity.action.replace('_', ' ')}
                                                </p>
                                                <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] hover:bg-[#C8A96A]/20 border border-[#C8A96A]/20 text-[9px] font-black uppercase tracking-widest rounded-none">
                                                    {activity.resource}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-serif">
                                                by {activity.role} • {formatTimeAgo(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Management Actions */}
                <Card className="border border-[#0B1F3A]/10 bg-[#0B1F3A] text-white rounded-none shadow-2xl overflow-hidden relative border-t-4 border-t-[#C8A96A]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-3xl" />
                    <CardHeader className="p-10 pb-4 relative z-10">
                        <CardTitle className="text-2xl font-serif tracking-tight text-white">Quick Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-4 relative z-10">
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-none hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/registrar/staff/new">
                                <UserPlus className="h-5 w-5 mr-3 text-emerald-400" />
                                <span className="font-black text-xs uppercase tracking-wider">Add New Staff</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-none hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/registrar/users">
                                <Users className="h-5 w-5 mr-3 text-blue-400" />
                                <span className="font-black text-xs uppercase tracking-wider">Manage Users</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-none hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/registrar/settings">
                                <ShieldCheck className="h-5 w-5 mr-3 text-[#C8A96A]" />
                                <span className="font-black text-xs uppercase tracking-wider">Platform Settings</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-none hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/registrar/reports">
                                <TrendingUp className="h-5 w-5 mr-3 text-purple-400" />
                                <span className="font-black text-xs uppercase tracking-wider">Get Reports</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Status Overview */}
            <Card className="border border-[#0B1F3A]/10 bg-white rounded-none shadow-md border-t-4 border-t-[#0B1F3A]">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-serif text-[#0B1F3A] tracking-tight">Platform Status</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-6 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none shadow-sm">
                            <CheckCircle className="h-10 w-10 text-emerald-600 animate-pulse" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xl font-black text-emerald-600 uppercase tracking-wide">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none shadow-sm">
                            <Activity className="h-10 w-10 text-blue-600" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Users</p>
                                <p className="text-xl font-black text-blue-600">{stats.activeUsers}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none shadow-sm">
                            <Clock className="h-10 w-10 text-purple-600" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academy Uptime</p>
                                <p className="text-xl font-black text-purple-600">99.9%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
}
