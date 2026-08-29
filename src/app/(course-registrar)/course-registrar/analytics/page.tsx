"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import {
    TrendingUp,
    Activity,
    Loader2,
    PieChart,
    Target,
    BookOpen,
    Users,
} from "lucide-react";
import {
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

interface AnalyticsData {
    enrollmentTrends: { name: string; count: number }[];
    categoryDistribution: { name: string; value: number }[];
    stats: {
        totalEnrollments: number;
        totalCourses: number;
        completionRate: number;
        thirtyDayEnrollments: number;
    };
}

export default function CourseRegistrarAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await apiFetch('/api/course-registrar/analytics');
                const body = await res.json();
                if (res.ok) setData(body);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#0B1F3A', '#C8A96A', '#1F7A5A', '#94a3b8', '#e11d48', '#f59e0b'];

    const kpis = [
        { label: "Total Enrollments", value: data?.stats.totalEnrollments.toString() ?? '0', icon: Users },
        { label: "Completion Rate", value: `${data?.stats.completionRate ?? 0}%`, icon: Target },
        { label: "Active Courses", value: data?.stats.totalCourses.toString() ?? '0', icon: BookOpen },
        { label: "New Enrollments (30d)", value: data?.stats.thirtyDayEnrollments.toString() ?? '0', icon: Activity },
    ];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">
                        Academic <span className="text-[#C8A96A]">Analytics.</span>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Real enrollment activity and curriculum mix across the academy.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((stat, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-[#F6F4F2] border border-[#0B1F3A]/5 text-[#C8A96A] group-hover:scale-105 transition-transform duration-500">
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-serif text-[#0B1F3A]">{loading ? '—' : stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                    <div className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-[#C8A96A]" /> Enrollment Velocity
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">New enrollments over the last 7 days.</p>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="h-[350px] w-full">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.enrollmentTrends || []}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0B1F3A" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#0B1F3A" stopOpacity={0} />
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
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 0, border: '1px solid rgba(11,31,58,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                                            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#0B1F3A"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            animationDuration={800}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                    <div className="p-8 pb-0">
                        <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-[#C8A96A]" /> Curriculum Mix
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Real enrollments by course category.</p>
                    </div>
                    <div className="p-8">
                        <div className="h-[300px] w-full relative">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : !data || data.categoryDistribution.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400 font-serif italic">
                                    No enrollment data yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={data.categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {data.categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: 0, border: '1px solid rgba(11,31,58,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        {data && data.categoryDistribution.length > 0 && (
                            <div className="mt-6 space-y-3">
                                {data.categoryDistribution.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="font-bold text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="font-black text-[#0B1F3A]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
