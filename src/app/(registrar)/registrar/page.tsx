"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import {
    Users, CheckCircle2, Activity, UserPlus, AlertTriangle,
    History, ShieldCheck, TrendingUp, RefreshCw, Loader2,
} from "lucide-react";
import { format } from "date-fns";

type AuditEntry = {
    action: string;
    resource: string;
    role: string;
    timestamp: string;
};

type DashStats = {
    totalStaff: number;
    activeUsers: number;
    suspendedUsers: number;
    totalUsers: number;
};

const safeDate = (d: string) => {
    const p = new Date(d);
    return Number.isNaN(p.getTime()) ? null : p;
};

export default function RegistrarDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<DashStats>({ totalStaff: 0, activeUsers: 0, suspendedUsers: 0, totalUsers: 0 });
    const [activities, setActivities] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [usersRes, auditRes] = await Promise.all([
                apiFetch('/api/users'),
                window.fetch('/api/audit/logs?limit=8'),
            ]);
            const users = await usersRes.json();
            if (Array.isArray(users)) {
                const staff = users.filter((u: any) => ['registrar', 'course_registrar', 'finance', 'instructor', 'admin'].includes(u.role));
                const suspended = users.filter((u: any) => u.status === 'suspended');
                setStats({
                    totalStaff: staff.length,
                    activeUsers: users.length - suspended.length,
                    suspendedUsers: suspended.length,
                    totalUsers: users.length,
                });
            }
            if (auditRes.ok) {
                const auditData = await auditRes.json();
                if (Array.isArray(auditData)) setActivities(auditData);
            }
        } catch (err) {
            console.error('Registrar dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!userLoading && user) {
            fetch();
            const interval = setInterval(fetch, 60000);
            return () => clearInterval(interval);
        }
    }, [user, userLoading, fetch]);

    const getActivityIcon = (action: string) => {
        if (action.includes('create')) return <UserPlus className="h-4 w-4 text-[#1F7A5A]" />;
        if (action.includes('update')) return <Activity className="h-4 w-4 text-[#0B1F3A]" />;
        if (action.includes('delete') || action.includes('suspend')) return <AlertTriangle className="h-4 w-4 text-rose-500" />;
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    const kpis = [
        { label: "Total Members", value: stats.totalUsers, icon: Users, color: "text-[#0B1F3A]", href: "/registrar/users" },
        { label: "Academy Staff", value: stats.totalStaff, icon: ShieldCheck, color: "text-[#C8A96A]", href: "/registrar/users" },
        { label: "Active Accounts", value: stats.activeUsers, icon: CheckCircle2, color: "text-[#1F7A5A]", href: "/registrar/users" },
        { label: "On Hold", value: stats.suspendedUsers, icon: AlertTriangle, color: "text-rose-500", href: "/registrar/users?status=suspended" },
    ];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Academy Records</h1>
                    <p className="text-slate-500 font-medium font-serif">Manage academy members, staff records and system history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                        <Link href="/registrar/users"><Users className="h-4 w-4 mr-2 text-[#C8A96A]" />Student Records</Link>
                    </Button>
                    <Button asChild className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Link href="/registrar/audit"><History className="h-4 w-4 mr-2" />System History</Link>
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
                                <k.icon className={cn("w-5 h-5", k.color)} />
                            </div>
                            <p className="text-4xl font-serif text-[#0B1F3A]">{loading ? '—' : k.value.toLocaleString()}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                    <div className="flex items-center justify-between p-8 pb-4">
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Recent System Activity</h2>
                        <Button variant="ghost" size="sm" asChild className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[9px] tracking-widest rounded-none">
                            <Link href="/registrar/audit">View All</Link>
                        </Button>
                    </div>
                    <div className="p-8 pt-0 space-y-2">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="h-14 bg-slate-100/60 animate-pulse" />
                            ))
                        ) : activities.length === 0 ? (
                            <div className="py-16 text-center">
                                <Activity className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium italic font-serif">No recent activity found.</p>
                            </div>
                        ) : activities.map((entry, i) => {
                            const d = safeDate(entry.timestamp);
                            return (
                                <div key={i} className="flex items-start gap-4 p-4 hover:bg-[#F6F4F2] transition-colors group border border-transparent hover:border-[#0B1F3A]/5">
                                    <div className="p-2 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex-shrink-0">
                                        {getActivityIcon(entry.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-[#0B1F3A] capitalize">
                                                {entry.action.replace(/_/g, ' ')}
                                            </p>
                                            <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/20 text-[9px] font-black uppercase tracking-widest rounded-none hover:bg-[#C8A96A]/20">
                                                {entry.resource}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                            by {entry.role} {d ? `· ${format(d, 'MMM dd, HH:mm')}` : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Tools */}
                <div className="space-y-4">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 space-y-3">
                        <h2 className="text-2xl font-serif text-white mb-6">Quick Tools</h2>
                        {[
                            { href: "/registrar/staff/new", label: "Add New Staff", icon: UserPlus, color: "text-[#1F7A5A]" },
                            { href: "/registrar/users", label: "Manage Users", icon: Users, color: "text-[#C8A96A]" },
                            { href: "/registrar/settings", label: "Platform Settings", icon: ShieldCheck, color: "text-blue-400" },
                            { href: "/registrar/reports", label: "Get Reports", icon: TrendingUp, color: "text-purple-400" },
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="flex items-center gap-4 p-4 border border-white/10 hover:bg-white/5 transition-colors group">
                                <item.icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Platform Status */}
                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8 space-y-4">
                        <h2 className="text-lg font-serif text-[#0B1F3A]">Platform Status</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                <span className="text-xs font-black text-[#1F7A5A] uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Accounts</span>
                                <span className="text-xs font-black text-[#0B1F3A]">{stats.totalUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                                <span className="text-xs font-black text-[#0B1F3A]">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
