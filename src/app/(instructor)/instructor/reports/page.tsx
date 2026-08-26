"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Award } from "lucide-react";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const GOLD = '#C8A96A';
const NAVY = '#0B1F3A';
const EMERALD = '#1F7A5A';
const SLICE_COLORS = ['#ef4444', '#f59e0b', GOLD, EMERALD];

export default function InstructorReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/api/instructor/performance');
                const body = await res.json();
                if (body.success) setData(body);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const kpis = data?.kpis || {};
    const fmt = (v: number | null, suffix = '') => (v === null || v === undefined ? '—' : `${v}${suffix}`);

    const kpiCards = [
        { label: 'Course Completion', value: fmt(kpis.courseCompletion, '%'), sub: 'Enrollments at 100% progress', icon: Award, accent: 'text-[#1F7A5A]' },
        { label: 'Student Engagement', value: fmt(kpis.studentEngagement, '%'), sub: 'Average live-class attendance', icon: TrendingUp, accent: 'text-[#0B1F3A]' },
        { label: 'Average Test Score', value: fmt(kpis.averageScore, '%'), sub: 'Across your graded tests', icon: BarChart3, accent: 'text-[#C8A96A]' },
    ];

    if (loading) {
        return (
            <div className="p-6 md:p-12 space-y-10 animate-pulse bg-[#FAF9F6] min-h-screen">
                <div className="h-20 bg-slate-200/50 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200/50 rounded-none" />)}
                </div>
                <div className="h-96 bg-slate-200/50 rounded-none" />
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 space-y-10 md:space-y-16 pb-32 max-w-[1600px] bg-[#FAF9F6]">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Faculty Portal</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                    Performance <span className="text-[#C8A96A]">Intelligence.</span>
                </h1>
                <p className="text-slate-500 font-medium text-base md:text-lg max-w-lg leading-relaxed font-serif">
                    Real engagement, completion, and scoring trends across the courses you teach.
                </p>
            </div>

            {!data || (data.courseBreakdown?.length === 0) ? (
                <div className="p-16 md:p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-sm">
                    <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif text-[#0B1F3A] mb-3">No data yet</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed font-serif">
                        You aren't assigned to teach any courses yet, so there's nothing to analyze.
                    </p>
                </div>
            ) : (
                <>
                    {/* KPI Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {kpiCards.map((card, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 pr-6 bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                                <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                                    <card.icon className={cn("w-7 h-7", card.accent)} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                    <p className="text-2xl font-black text-[#0B1F3A]">{card.value}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{card.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enrollment trend */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-6 md:pb-8 mb-8 md:mb-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] tracking-tight">Enrollment Trend</h2>
                                <p className="text-slate-400 font-medium mt-2 text-sm md:text-base">New enrollments per week, last 10 weeks.</p>
                            </div>
                        </div>
                        <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm bg-white border-t-4 border-t-[#C8A96A]">
                            <CardContent className="p-4 md:p-10">
                                <div className="h-[280px] md:h-[340px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.enrollmentTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ borderRadius: 0, border: `1px solid ${NAVY}1A`, fontSize: 12 }} />
                                            <Line type="monotone" dataKey="enrollments" stroke={GOLD} strokeWidth={3} dot={{ r: 4, fill: GOLD }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance + Score distribution */}
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-6 md:pb-8 mb-8 md:mb-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] tracking-tight">Engagement Flux</h2>
                                    <p className="text-slate-400 font-medium mt-2 text-sm md:text-base">Attendance rate for your last live classes.</p>
                                </div>
                            </div>
                            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm bg-white border-t-4 border-t-[#C8A96A]">
                                <CardContent className="p-4 md:p-8">
                                    {data.attendanceByClass?.length > 0 ? (
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.attendanceByClass}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} unit="%" />
                                                    <Tooltip contentStyle={{ borderRadius: 0, border: `1px solid ${NAVY}1A`, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Attendance']} />
                                                    <Bar dataKey="attendanceRate" fill={EMERALD} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-center text-slate-300">
                                            <p className="font-serif italic">No completed live classes yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-6 md:pb-8 mb-8 md:mb-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] tracking-tight">Test Scores</h2>
                                    <p className="text-slate-400 font-medium mt-2 text-sm md:text-base">Distribution of submitted attempts.</p>
                                </div>
                            </div>
                            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm bg-white border-t-4 border-t-[#C8A96A]">
                                <CardContent className="p-4 md:p-8">
                                    {data.scoreDistribution?.some((d: any) => d.count > 0) ? (
                                        <div className="h-[280px] w-full flex items-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={data.scoreDistribution} dataKey="count" nameKey="range" innerRadius={60} outerRadius={100} paddingAngle={3}>
                                                        {data.scoreDistribution.map((_: any, i: number) => (
                                                            <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: 0, border: `1px solid ${NAVY}1A`, fontSize: 12 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-center text-slate-300">
                                            <p className="font-serif italic">No graded test attempts yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Per-course breakdown */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-6 md:pb-8 mb-8 md:mb-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] tracking-tight">Course Breakdown</h2>
                                <p className="text-slate-400 font-medium mt-2 text-sm md:text-base">Enrolled vs. completed, per programme.</p>
                            </div>
                        </div>
                        <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm bg-white border-t-4 border-t-[#C8A96A]">
                            <CardContent className="p-4 md:p-10">
                                <div className="h-[280px] md:h-[340px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.courseBreakdown} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} allowDecimals={false} />
                                            <YAxis type="category" dataKey="title" axisLine={false} tickLine={false} width={140} tick={{ fontSize: 10, fill: '#0B1F3A', fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: 0, border: `1px solid ${NAVY}1A`, fontSize: 12 }} />
                                            <Bar dataKey="enrolled" name="Enrolled" fill={`${NAVY}30`} radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="completed" name="Completed" fill={EMERALD} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
