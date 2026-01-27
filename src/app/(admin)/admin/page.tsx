
"use client";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, BookOpen, Calendar, CheckSquare, ChevronRight, Filter, MoreVertical, TrendingUp, UserPlus, Users, MessageSquare, Loader2 } from "lucide-react";
import React from "react";
import Image from "next/image";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
    const [statsData, setStatsData] = React.useState({
        students: 0,
        instructors: 0,
        courses: 0,
        events: 0,
        completion: 87,
        thirtyDayEnrollments: 0,
        enrollmentGrowth: 0
    });
    const [recentEnrollments, setRecentEnrollments] = React.useState<any[]>([]);
    const [trends, setTrends] = React.useState<any[]>([]);
    const [needsAttention, setNeedsAttention] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();

                if (res.ok) {
                    setStatsData({
                        students: data.stats.students,
                        instructors: data.stats.instructors,
                        courses: data.stats.courses,
                        events: data.stats.events,
                        completion: data.stats.completionRate,
                        thirtyDayEnrollments: data.stats.thirtyDayEnrollments,
                        enrollmentGrowth: data.stats.enrollmentGrowth
                    });
                    setRecentEnrollments(data.recentEnrollments);
                    setTrends(data.trends);
                    setNeedsAttention(data.needsAttention);
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExport = () => {
        if (recentEnrollments.length === 0) return;
        const headers = ["Student Name", "Course", "Date", "Status"];
        const rows = recentEnrollments.map(en => [
            en.userName,
            en.course?.title,
            new Date(en.enrolledAt).toLocaleDateString(),
            "Active"
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'recent_enrollments.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const stats = [
        { label: "Total Students", value: statsData.students.toLocaleString(), icon: Users, sub: "+5% this week", subType: "success", bg: "bg-indigo-50", iconColor: "text-indigo-600" },
        { label: "Active Courses", value: statsData.courses.toString(), icon: BookOpen, sub: "+2% this month", subType: "success", bg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Upcoming Events", value: statsData.events.toString(), icon: Calendar, sub: "Same as last week", subType: "neutral", bg: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Completion Rate", value: statsData.completion + "%", icon: CheckSquare, sub: "+1.5% increase", subType: "success", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
    ];

    return (
        <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h2 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h2>
                                </div>
                                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span className={stat.subType === 'success' ? "text-emerald-600" : "text-slate-500"}>
                                    {stat.sub}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Enrollment Trends</CardTitle>
                                <p className="text-sm text-slate-500">Last 30 Days</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">{statsData.thirtyDayEnrollments.toLocaleString()}</span>
                                    <Badge className={cn(
                                        "ml-2",
                                        statsData.enrollmentGrowth >= 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                    )}>
                                        {statsData.enrollmentGrowth >= 0 ? "+" : ""}{statsData.enrollmentGrowth}%
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {loading ? (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-indigo-200">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trends}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="_id"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                dy={10}
                                            />
                                            <YAxis hide domain={[0, 'auto']} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="enrollments"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorCount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Recent Enrollments</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                                    <Filter className="w-3 h-3" /> Filter
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 text-slate-600" onClick={handleExport}>
                                    Export
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Student Name</th>
                                        <th className="px-6 py-4 font-semibold">Course</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentEnrollments.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-9 h-9 border border-slate-200">
                                                        <AvatarImage src={student.userPhoto} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{student.userName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{student.userName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{student.course?.title}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Active
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 text-center">
                            <Button variant="link" className="text-indigo-600 text-sm font-medium">View All Transactions</Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Needs Attention</h3>
                        <Button variant="link" className="text-indigo-600 text-sm">View All</Button>
                    </div>

                    <div className="space-y-4">
                        {needsAttention.map((item, i) => (
                            <Card key={i} className={cn(
                                "shadow-sm border-none transition-all hover:scale-[1.02]",
                                item.type === 'orange' ? "bg-orange-50 border-orange-100" :
                                    item.type === 'indigo' ? "bg-indigo-50 border-indigo-100" :
                                        item.type === 'amber' ? "bg-amber-50 border-amber-100" :
                                            "bg-emerald-50 border-emerald-100"
                            )}>
                                <CardContent className="p-4 flex gap-4">
                                    <div className={cn(
                                        "p-2 h-10 w-10 rounded-lg flex items-center justify-center shadow-sm",
                                        item.type === 'orange' ? "bg-white text-orange-600" :
                                            item.type === 'indigo' ? "bg-white text-indigo-600" :
                                                item.type === 'amber' ? "bg-white text-amber-600" :
                                                    "bg-white text-emerald-600"
                                    )}>
                                        {item.id === 'messages' ? <MessageSquare className="w-5 h-5" /> :
                                            item.id === 'submissions' ? <CheckSquare className="w-5 h-5" /> :
                                                item.type === 'emerald' ? <CheckSquare className="w-5 h-5" /> :
                                                    <AlertTriangle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
