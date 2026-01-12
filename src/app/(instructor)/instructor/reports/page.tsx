"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, BookOpen, Download, Filter, Calendar, Share2, MoreHorizontal } from "lucide-react";
import React from "react";

export default function InstructorReportsPage() {
    const stats = [
        { title: "Course Completion", value: "88%", trend: "+5.2%", color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Student Engagement", value: "92/100", trend: "+2.1%", color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "Average Grade", value: "A- (3.7)", trend: "+0.4%", color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Total Revenue", value: "$42,850", trend: "+12.8%", color: "text-sky-600", bg: "bg-sky-50" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        Performance Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Decipher academic trends and institutional performance metrics with granular precision.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold border-slate-200 h-11 px-6 rounded-xl gap-2 shadow-sm">
                        <Share2 className="w-4 h-4" />
                        Export Analytics
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-slate-200 gap-2">
                        <Calendar className="w-4 h-4" />
                        This Semester
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/20">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-bold text-[10px] border-none px-2 py-0.5">
                                    {stat.trend}
                                </Badge>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/50 backdrop-blur-xl border border-white/20">
                <CardHeader className="p-10 pb-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Engagement Flux</CardTitle>
                            <CardDescription className="font-bold text-slate-400 mt-1 uppercase text-xs tracking-widest">Temporal distribution of student activity</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                    <div className="h-[400px] w-full bg-slate-50/50 rounded-[2rem] border-4 border-dashed border-slate-100 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                        <div className="flex flex-col items-center gap-4 text-center opacity-40 select-none">
                            <BarChart3 className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                            <div>
                                <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Visualization Engine Offline</p>
                                <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto mt-2">Aggregate data processing in progress. Temporal visualizations will materialize momentarily.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800" />
                    <CardHeader className="relative z-10 p-10">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter">Enrolled Demographics</CardTitle>
                        <CardDescription className="text-indigo-100/70 font-bold uppercase text-[10px] tracking-widest">Geographical & Level distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-10 pt-0">
                        <div className="space-y-6">
                            {[
                                { label: "Post-Graduate", value: "45%", color: "bg-white" },
                                { label: "Undergraduate", value: "35%", color: "bg-indigo-300" },
                                { label: "Professional Certs", value: "20%", color: "bg-indigo-400" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden group">
                    <CardHeader className="p-10">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Recent Achievements</CardTitle>
                            <Button variant="ghost" size="icon" className="rounded-full text-slate-300 group-hover:text-amber-500 transition-colors">
                                <MoreHorizontal className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="space-y-8">
                            {[
                                { title: "Top Rated Course", desc: "Advanced Neuro-Linguistics", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                                { title: "Highest Engagement", desc: "Digital Scholastics Cohort B", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { title: "Fastest Response", desc: "Institutional Communications", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 items-center group/item hover:translate-x-2 transition-transform duration-300">
                                    <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-tight">{item.title}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
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

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", className)}>{children}</span>;
}
