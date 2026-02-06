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
    ArrowDownRight
} from "lucide-react";
import React from "react";

export default function SuperAdminDashboard() {
    const [kpis, setKpis] = React.useState<any>(null);
    const [activities, setActivities] = React.useState<any[]>([]);
    const [systemHealth, setSystemHealth] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [kpisRes, activityRes, healthRes] = await Promise.all([
                    fetch('/api/admin/kpis'),
                    fetch('/api/admin/activity-feed?limit=10'),
                    fetch('/api/admin/system-health')
                ]);

                if (kpisRes.ok) {
                    const data = await kpisRes.json();
                    setKpis(data.kpis);
                }

                if (activityRes.ok) {
                    const data = await activityRes.json();
                    setActivities(data.activities || []);
                }

                if (healthRes.ok) {
                    const data = await healthRes.json();
                    setSystemHealth(data.summary);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Revenue (Today)",
            value: `$${kpis?.revenue?.today?.toLocaleString() || 0}`,
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Active Students",
            value: kpis?.activeStudents || 0,
            subtitle: `${kpis?.totalStudents || 0} total`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Completion Rate",
            value: `${kpis?.completionRate || 0}%`,
            change: kpis?.completionRate >= 80 ? "Excellent" : "Needs Work",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "System Health",
            value: systemHealth?.overallStatus || "Unknown",
            subtitle: `${systemHealth?.criticalAlerts || 0} critical alerts`,
            icon: Activity,
            color: systemHealth?.overallStatus === 'healthy' ? "text-green-600" : "text-red-600",
            bg: systemHealth?.overallStatus === 'healthy' ? "bg-green-50" : "bg-red-50"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Command Center</h1>
                    <p className="text-slate-500 mt-1">Real-time platform oversight and control</p>
                </div>
                <Badge variant={systemHealth?.overallStatus === 'healthy' ? 'default' : 'destructive'} className="text-sm">
                    {systemHealth?.overallStatus === 'healthy' ? '✓ All Systems Operational' : '⚠ Issues Detected'}
                </Badge>
            </div>

            {/* Global KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bg} p-3 rounded-lg`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                {stat.change && (
                                    <Badge variant="secondary" className="text-xs">
                                        {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                                        {stat.change}
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                {stat.subtitle && (
                                    <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Real-time Activity Feed */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Real-time Activity Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                                activities.slice(0, 8).map((activity, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">
                                                {activity.userName} <span className="text-slate-500">({activity.role})</span>
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                {activity.action} on {activity.resource}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Health */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Financial Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Week Revenue</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        ${kpis?.revenue?.week?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Month Revenue</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        ${kpis?.revenue?.month?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-xs font-medium text-slate-600">Pending Payouts</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{kpis?.pendingPayouts || 0}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <p className="text-xs font-medium text-slate-600">Failed Transactions</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{kpis?.failedTransactions || 0}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Critical Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button variant="outline" className="justify-start h-auto p-4">
                            <Shield className="h-5 w-5 mr-3 text-indigo-600" />
                            <div className="text-left">
                                <p className="font-semibold">View Audit Logs</p>
                                <p className="text-xs text-slate-500">Cross-role activity tracking</p>
                            </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto p-4">
                            <AlertTriangle className="h-5 w-5 mr-3 text-yellow-600" />
                            <div className="text-left">
                                <p className="font-semibold">Review Alerts</p>
                                <p className="text-xs text-slate-500">{systemHealth?.criticalAlerts || 0} critical issues</p>
                            </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto p-4">
                            <Clock className="h-5 w-5 mr-3 text-purple-600" />
                            <div className="text-left">
                                <p className="font-semibold">Pending Approvals</p>
                                <p className="text-xs text-slate-500">Course & payout reviews</p>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
