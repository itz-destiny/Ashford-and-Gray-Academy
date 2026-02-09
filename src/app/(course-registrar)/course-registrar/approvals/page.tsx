"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardCheck,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Search,
    ArrowUpRight,
    BookOpen,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Course {
    _id: string;
    title: string;
    instructor: {
        name: string;
    };
    level: string;
    duration: number;
    status: string;
    createdAt: string;
}

export default function CourseApprovalsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        draft: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();

            setCourses(data || []);

            // Calculate stats
            const pending = data.filter((c: Course) => c.status === 'pending').length;
            const approved = data.filter((c: Course) => c.status === 'published').length;
            const draft = data.filter((c: Course) => c.status === 'draft').length;

            setStats({ pending, approved, draft });
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const pendingCourses = courses.filter(c => c.status === 'pending');
    const filteredCourses = pendingCourses.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimeAgo = (date: string) => {
        const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Course Approvals
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-full px-4">
                            {stats.pending} Pending
                        </Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Audit new course content for institutional quality and compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50" onClick={fetchCourses}>
                        Refresh Queue
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Pending Review", value: stats.pending.toString(), trend: "Awaiting", icon: Clock, color: "bg-amber-500" },
                    { label: "Approved Total", value: stats.approved.toString(), trend: "Published", icon: CheckCircle2, color: "bg-emerald-500" },
                    { label: "Draft Status", value: stats.draft.toString(), trend: "In Progress", icon: MessageSquare, color: "bg-indigo-500" },
                    { label: "Total Courses", value: courses.length.toString(), trend: "All Status", icon: BookOpen, color: "bg-slate-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-10 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 leading-tight">Academic Audit Queue</CardTitle>
                            <CardDescription className="text-slate-400 font-bold">New submissions awaiting registrar validation.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Filter by instructor..."
                                    className="pl-10 h-11 bg-slate-50 border-none rounded-xl w-[260px] font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course Detail</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Complexity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center text-slate-400 font-bold">
                                            No pending approvals
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <tr key={course._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-slate-50 shadow-sm">
                                                        <BookOpen className="w-5 h-5 opacity-40" />
                                                    </div>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-bold text-slate-900">{course.title}</span>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 opacity-70">ID: {course._id.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 font-bold text-slate-600 text-sm italic">{course.instructor?.name || 'Unknown'}</td>
                                            <td className="px-10 py-6">
                                                <Badge variant="outline" className="rounded-lg font-black border-slate-100 text-slate-500 bg-slate-50/50">
                                                    {course.duration}h
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-6 font-black text-slate-900 text-sm uppercase tracking-tighter">{course.level}</td>
                                            <td className="px-10 py-6">
                                                <span className="font-bold text-sm text-slate-500">{formatTimeAgo(course.createdAt)}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="rounded-xl border-slate-200 font-bold text-xs h-9 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="rounded-xl hover:bg-white hover:shadow-sm h-9 w-9">
                                                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
