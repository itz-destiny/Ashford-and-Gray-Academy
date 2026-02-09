"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap,
    TrendingUp,
    Users,
    Activity,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function EnrollmentTrackingPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Enrollment Tracking
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full px-4 italic">+24% Growth</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Monitoring institutional enrollment velocities and student lifecycle metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                        <Download className="w-4 h-4 mr-2" /> Daily Log
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        Enroll Student
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "New Enrollments", value: "248", trend: "+12% MoM", icon: Users, color: "bg-indigo-500" },
                    { label: "Completion Rate", value: "87.4%", trend: "Institutional Avg", icon: CheckCircle2, color: "bg-emerald-500" },
                    { label: "Engagement Hub", value: "4.2", trend: "Sessions / Day", icon: Activity, color: "bg-amber-500" },
                    { label: "Growth Index", value: "112 pts", trend: "+$24k Yield", icon: TrendingUp, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full tracking-widest uppercase">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-10 border-b border-slate-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-10">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 italic">Enrollment Stream</CardTitle>
                                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Velocity Dashboard</CardDescription>
                            </div>
                            <div className="hidden lg:flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid Degree</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scholarship</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search logs..." className="pl-10 h-11 bg-slate-50 border-none rounded-xl w-[240px] font-medium shadow-inner" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/30">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Time-Log</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Faculty</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tier</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Status</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-12">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { time: "2m ago", name: "Chidi Okafor", email: "chidi.o@gmail.com", course: "Business Strategy", tier: "Premium", status: "Verified" },
                                    { time: "15m ago", name: "Fatima Yusuf", email: "fatima.y@gmail.com", course: "AI Research", tier: "Scholarship", status: "Verified" },
                                    { time: "45m ago", name: "James Wilson", email: "james.w@gmail.com", course: "Brand Identity", tier: "Basic", status: "Pending" },
                                    { time: "1h ago", name: "Amara Bello", email: "amara.b@gmail.com", course: "Cybersecurity Ops", tier: "Premium", status: "Verified" },
                                ].map((log, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                                        <td className="px-10 py-6">
                                            <span className="font-black text-slate-400 text-xs italic">{log.time}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{log.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{log.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">AG</div>
                                                <span className="font-bold text-slate-600 text-sm tracking-tight">{log.course}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <Badge className={
                                                log.tier === 'Premium' ? "bg-indigo-900 text-white rounded-lg border-none" :
                                                    log.tier === 'Scholarship' ? "bg-emerald-100 text-emerald-700 rounded-lg border-none" :
                                                        "bg-slate-100 text-slate-600 rounded-lg border-none"
                                            }>
                                                {log.tier}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                                <div className={`w-2 h-2 rounded-full ${log.status === 'Verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                                                {log.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right pr-12">
                                            <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-white group-hover:shadow-lg group-hover:shadow-indigo-50 transition-all">
                                                <Eye className="w-4 h-4 text-indigo-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
