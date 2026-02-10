"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, Activity, UserPlus, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                const usersRes = await fetch('/api/users');
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
            label: "Institutional Staff",
            value: stats.totalStaff.toString(),
            icon: Users,
            sub: "Across all departments",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/registrar/users"
        },
        {
            label: "Active Users",
            value: stats.activeUsers.toString(),
            icon: CheckCircle,
            sub: `${stats.suspendedUsers} suspended`,
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: "/registrar/users"
        },
        {
            label: "Audit Logs",
            value: recentActivities.length.toString(),
            icon: Activity,
            sub: "Recent activities",
            bg: "bg-purple-50",
            iconColor: "text-purple-600",
            href: "/registrar/audit"
        },
    ];

    const getActivityIcon = (action: string) => {
        if (action.includes('create')) return <UserPlus className="h-4 w-4 text-emerald-600" />;
        if (action.includes('update')) return <Activity className="h-4 w-4 text-blue-600" />;
        if (action.includes('delete') || action.includes('suspend')) return <AlertTriangle className="h-4 w-4 text-red-600" />;
        return <Activity className="h-4 w-4 text-slate-600" />;
    };

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Platform Governance</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage users, staff, and platform settings</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/registrar/users">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Staff
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/registrar/audit">
                            <Activity className="h-4 w-4 mr-2" />
                            View Audit Logs
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent System Activities */}
                <Card className="border-none shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent System Activities</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/registrar/audit">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                    Loading activities...
                                </div>
                            ) : recentActivities.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                    No recent activities.
                                </div>
                            ) : (
                                recentActivities.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="mt-1">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {activity.action.replace('_', ' ')}
                                                </p>
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {activity.resource}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                by {activity.role} • {formatTimeAgo(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/registrar/staff/new">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add New Staff
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/registrar/users">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/registrar/settings">
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Platform Settings
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/registrar/reports">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Generate Reports
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* System Health Overview */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Platform Status</p>
                                <p className="text-lg font-bold text-emerald-600">Operational</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Active Sessions</p>
                                <p className="text-lg font-bold text-blue-600">{stats.activeUsers}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                            <Clock className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Uptime</p>
                                <p className="text-lg font-bold text-purple-600">99.9%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
