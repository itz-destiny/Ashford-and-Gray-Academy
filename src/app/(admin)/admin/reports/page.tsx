"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, BookOpen, Download, Filter, Calendar, Share2, MoreHorizontal, Globe, ShieldCheck, Activity, Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReportsPage() {
    const [stats, setStats] = React.useState<any>(null);
    const [trends, setTrends] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    setTrends(data.trends);
                }
            } catch (err) {
                console.error("Error fetching reports stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const reportCards = [
        { title: "Total Revenue", value: stats ? `$${stats.revenue.toLocaleString()}` : "$0", trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Active Students", value: stats ? stats.students.toString() : "0", trend: "+8.1%", color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Course Catalog", value: stats ? stats.courses.toString() : "0", trend: "+2", color: "text-amber-600", bg: "bg-amber-50" },
        { title: "System Uptime", value: "99.98%", trend: "Stable", color: "text-sky-600", bg: "bg-sky-50" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-600" />
                        Institutional Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Comprehensive administrative oversight and system-wide performance telemetry.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold border-slate-200 h-11 px-6 rounded-xl gap-2 shadow-sm">
                        <Download className="w-4 h-4" />
                        Systems Audit
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 gap-2">
                        <Calendar className="w-4 h-4" />
                        Fiscal Year 2026
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {reportCards.map((stat: any, i: number) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/20">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/50 backdrop-blur-xl border border-white/20">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Growth Trajectory</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-100">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
                    <CardHeader className="relative z-10 p-10">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter">Server Health</CardTitle>
                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Global Node Distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-10 pt-0">
                        <div className="space-y-6">
                            {[
                                { label: "North America", status: "Optimal", color: "bg-emerald-500" },
                                { label: "Europe Central", status: "Optimal", color: "bg-emerald-500" },
                                { label: "Asia Pacific", status: "Maintenance", color: "bg-amber-500" },
                            ].map((node, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold text-sm tracking-tight">{node.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase opacity-60">{node.status}</span>
                                        <div className={`w-2 h-2 rounded-full ${node.color} animate-pulse`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
