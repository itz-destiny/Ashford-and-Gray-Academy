
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertTriangle,
    TrendingUp,
    Users,
    DollarSign,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard,
    History,
    Wallet
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = React.useState<any>(null);
    const [activities, setActivities] = React.useState<any[]>([]);
    const [systemStatus, setSystemStatus] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (userLoading || !user) return;

        const fetchDashboardData = async () => {
            try {
                const [statsRes, activityRes, healthRes] = await Promise.all([
                    apiFetch('/api/admin/kpis'),
                    apiFetch('/api/admin/activity-feed?limit=10'),
                    apiFetch('/api/admin/system-health')
                ]);

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.kpis);
                }

                if (activityRes.ok) {
                    const data = await activityRes.json();
                    setActivities(data.activities || []);
                }

                if (healthRes.ok) {
                    const data = await healthRes.json();
                    setSystemStatus(data.summary);
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
    }, [user, userLoading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B1F3A]" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${stats?.revenue?.today?.toLocaleString() || 0}`,
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Enrolled Students",
            value: stats?.activeStudents || 0,
            subtitle: `${stats?.totalStudents || 0} total accounts`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Success Rate",
            value: `${stats?.completionRate || 0}%`,
            change: stats?.completionRate >= 80 ? "Excellent" : "Average",
            icon: TrendingUp,
            color: "text-[#C8A96A]",
            bg: "bg-orange-50"
        },
        {
            title: "Academy Status",
            value: systemStatus?.overallStatus === 'healthy' ? "Operational" : "Attention",
            subtitle: `${systemStatus?.criticalAlerts || 0} system notices`,
            icon: Activity,
            color: systemStatus?.overallStatus === 'healthy' ? "text-emerald-600" : "text-rose-600",
            bg: systemStatus?.overallStatus === 'healthy' ? "bg-emerald-50" : "bg-rose-50"
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tight">Management Home</h1>
                    <p className="text-slate-500 font-medium italic">Overview of academy performance and operations.</p>
                </div>
                <Badge variant={systemStatus?.overallStatus === 'healthy' ? 'default' : 'destructive'} className={cn(
                    "px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                    systemStatus?.overallStatus === 'healthy' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                    {systemStatus?.overallStatus === 'healthy' ? '✓ Academy Online' : '⚠ Action Required'}
                </Badge>
            </div>

            {/* General Performance */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-none bg-white rounded-[2.5rem] group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                {stat.change && (
                                    <Badge className={cn(
                                        "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none",
                                        stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {stat.change}
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-[#0B1F3A]">{stat.value}</h3>
                                {stat.subtitle && (
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 italic">{stat.subtitle}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card className="border-none bg-white rounded-[3rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#0B1F3A] tracking-tight">
                            <History className="h-6 w-6 text-indigo-600" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                                activities.slice(0, 8).map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all group">
                                        <div className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${activity.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-[#0B1F3A]">
                                                {activity.userName} <span className="text-slate-400 font-bold ml-1">({activity.role})</span>
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                {activity.action}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-16 font-bold italic">No activity detected yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tuition & Fees */}
                <Card className="border-none bg-[#0B1F3A] text-white rounded-[3rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <CardHeader className="p-10 pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                            <Wallet className="h-6 w-6 text-[#C8A96A]" />
                            Tuition & Fees
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 relative z-10">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div>
                                    <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Weekly Collection</p>
                                    <p className="text-3xl font-black">
                                        ${stats?.revenue?.week?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-[#C8A96A]/20 rounded-2xl flex items-center justify-center text-[#C8A96A] group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Payments</p>
                                    <p className="text-2xl font-black">{stats?.pendingPayouts || 0}</p>
                                </div>
                                <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">Failed Invoices</p>
                                    <p className="text-2xl font-black text-rose-400">{stats?.failedTransactions || 0}</p>
                                </div>
                            </div>

                            <Button asChild className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black rounded-2xl shadow-xl shadow-black/20 text-xs uppercase tracking-widest mt-4">
                                <Link href="/admin/reports">View Full Finance Report</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Tools */}
            <Card className="border-none bg-white rounded-[3rem] shadow-sm">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-black text-[#0B1F3A] tracking-tight">Academy Tools</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Button asChild variant="outline" className="justify-start h-auto p-6 rounded-[2rem] border-slate-100 hover:bg-slate-50 group">
                            <Link href="/registrar/audit">
                                <Shield className="h-6 w-6 mr-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="font-black text-[#0B1F3A]">System History</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Track all platform changes</p>
                                </div>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start h-auto p-6 rounded-[2rem] border-slate-100 hover:bg-slate-50 group">
                            <Link href="/admin/reports">
                                <AlertTriangle className="h-6 w-6 mr-4 text-orange-600 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="font-black text-[#0B1F3A]">Security Alerts</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{systemStatus?.criticalAlerts || 0} items need review</p>
                                </div>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start h-auto p-6 rounded-[2rem] border-slate-100 hover:bg-slate-50 group">
                            <Link href="/course-registrar/approvals">
                                <Clock className="h-6 w-6 mr-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="font-black text-[#0B1F3A]">Review Requests</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Course & payment approvals</p>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
