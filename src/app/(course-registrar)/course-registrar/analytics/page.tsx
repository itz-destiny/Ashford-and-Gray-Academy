"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    BookOpen,
    Activity,
    Download,
    Calendar,
    ArrowUpRight,
    Loader2,
    PieChart,
    Target,
    Zap,
    Trophy
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    Pie,
    PieChart as RePieChart
} from 'recharts';
import { cn } from "@/lib/utils";

export default function CourseRegistrarAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStats({
                enrollmentTrends: [
                    { name: 'Mon', count: 42 },
                    { name: 'Tue', count: 52 },
                    { name: 'Wed', count: 38 },
                    { name: 'Thu', count: 65 },
                    { name: 'Fri', count: 48 },
                    { name: 'Sat', count: 28 },
                    { name: 'Sun', count: 35 },
                ],
                categoryDistribution: [
                    { name: 'Hospitality', value: 35 },
                    { name: 'Legal Studies', value: 25 },
                    { name: 'Management', value: 20 },
                    { name: 'Architecture', value: 15 },
                    { name: 'Others', value: 5 },
                ]
            });
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Academic Analytics
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Data-driven insights into curriculum performance and student success.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Reports
                    </Button>
                    <Button className="h-11 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 gap-2 px-6">
                        <Calendar className="w-4 h-4" /> Fiscal Year
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Content Engagement", value: "94.2%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2.4%" },
                    { label: "Completion Rate", value: "82.1%", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+5.1%" },
                    { label: "Course Velocity", value: "4.8/5", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", trend: "Stable" },
                    { label: "Student ROI", value: "98%", icon: Trophy, color: "text-rose-600", bg: "bg-rose-50", trend: "+1.2%" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] bg-white group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100 rounded-[3rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-indigo-500" /> Enrollment Velocity
                            </CardTitle>
                            <CardDescription className="font-medium">Student sign-up frequency across the dynamic curriculum.</CardDescription>
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
                                    <AreaChart data={stats.enrollmentTrends}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                                            dy={15}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                                            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#6366f1"
                                            strokeWidth={5}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-100 rounded-[3rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-indigo-500" /> Curriculum Mix
                        </CardTitle>
                        <CardDescription className="font-medium">Market share by academic category.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-[300px] w-full relative">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={stats.categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {stats.categoryDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-6 space-y-3">
                            {stats?.categoryDistribution.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="font-bold text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="font-black text-slate-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[3rem] bg-slate-900 text-white p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-700 group-hover:scale-[1.7] group-hover:rotate-0">
                    <BarChart3 className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Strategic Curriculum Pivot</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Data suggests an 18% increase in demand for Management-related courses. Recommend expanding content in this vector.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <Button className="h-14 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl px-10 text-lg shadow-2xl transition-all active:scale-95">
                            Generate Faculty Briefing
                        </Button>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-indigo-400">Quarterly Analysis Due in 4 Days</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
