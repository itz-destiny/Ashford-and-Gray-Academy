"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle2,
    MessageSquare,
    Search,
    BookOpen,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { useToast } from "@/hooks/use-toast";

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
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const { toast } = useToast();

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

    const handleApprove = async (course: Course) => {
        setApprovingId(course._id);
        try {
            const res = await apiFetch(`/api/courses/${course._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'published' }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to approve course.');
            }
            await logAudit({
                action: AUDIT_ACTIONS.COURSE_APPROVED,
                resource: AUDIT_RESOURCES.COURSE,
                resourceId: course._id,
                metadata: { title: course.title, instructor: course.instructor?.name },
            });
            toast({ title: "Course Approved", description: `${course.title} is now published.` });
            setCourses(prev => prev.map(c => c._id === course._id ? { ...c, status: 'published' } : c));
            setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
        } catch (err: any) {
            toast({ variant: "destructive", title: "Approval Failed", description: err.message });
        } finally {
            setApprovingId(null);
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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Course <span className="text-[#C8A96A]">Approvals.</span>
                        <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/20 rounded-none px-3 font-black text-[10px] uppercase tracking-widest">
                            {stats.pending} Pending
                        </Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Audit new course content for institutional quality and compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none" onClick={fetchCourses}>
                        Refresh Queue
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Pending Review", value: stats.pending.toString(), trend: "Awaiting", icon: Clock },
                    { label: "Approved Total", value: stats.approved.toString(), trend: "Published", icon: CheckCircle2 },
                    { label: "Draft Status", value: stats.draft.toString(), trend: "In Progress", icon: MessageSquare },
                    { label: "Total Courses", value: courses.length.toString(), trend: "All Status", icon: BookOpen },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                            <stat.icon className="w-5 h-5 text-[#C8A96A]" />
                        </div>
                        <p className="text-4xl font-serif text-[#0B1F3A] mb-2">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="p-8 border-b border-[#0B1F3A]/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-serif text-[#0B1F3A]">Academic Audit Queue</h2>
                            <p className="text-slate-400 font-bold">New submissions awaiting registrar validation.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Filter by instructor..."
                                    className="pl-10 h-11 bg-[#F6F4F2] border-none rounded-none w-[260px] font-medium focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#0B1F3A]/10">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course Detail</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Complexity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0B1F3A]/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center text-slate-400 font-bold font-serif">
                                            No pending approvals
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <tr key={course._id} className="hover:bg-[#F6F4F2] transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#F6F4F2] flex items-center justify-center font-black text-[#0B1F3A] border border-[#0B1F3A]/5">
                                                        <BookOpen className="w-5 h-5 text-[#C8A96A]" />
                                                    </div>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-black text-[#0B1F3A]">{course.title}</span>
                                                        <span className="text-[10px] font-black uppercase text-slate-400 opacity-70">ID: {course._id.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 font-bold text-slate-600 text-sm">{course.instructor?.name || 'Unknown'}</td>
                                            <td className="px-10 py-6">
                                                <Badge variant="outline" className="rounded-none font-black border-[#0B1F3A]/10 text-slate-500 bg-[#F6F4F2]">
                                                    {course.duration}h
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-6 font-black text-[#0B1F3A] text-sm uppercase tracking-tighter">{course.level}</td>
                                            <td className="px-10 py-6">
                                                <span className="font-bold text-sm text-slate-500">{formatTimeAgo(course.createdAt)}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={approvingId === course._id}
                                                        onClick={() => handleApprove(course)}
                                                        className="rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest h-9 hover:bg-[#1F7A5A]/10 hover:text-[#1F7A5A] hover:border-[#1F7A5A]/30 transition-all"
                                                    >
                                                        {approvingId === course._id
                                                            ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                            : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />} Approve
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
