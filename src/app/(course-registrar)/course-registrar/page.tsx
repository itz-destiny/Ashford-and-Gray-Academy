"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import {
    BookOpen, Users, GraduationCap, FileCheck, TrendingUp,
    CheckCircle2, AlertCircle, Star, ChevronRight,
} from "lucide-react";

type CourseStats = {
    totalCourses: number;
    activeCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    completionRate: number;
};

export default function CourseRegistrarDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0, activeCourses: 0, draftCourses: 0,
        totalEnrollments: 0, completionRate: 0,
    });
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [coursesRes, enrollmentsRes] = await Promise.all([
                window.fetch('/api/courses'),
                apiFetch('/api/enrollments'),
            ]);
            const allCourses = await coursesRes.json();
            const enrollments = await enrollmentsRes.json();

            if (Array.isArray(allCourses)) {
                const active = allCourses.filter((c: any) => c.status === 'published');
                const drafts = allCourses.filter((c: any) => c.status === 'draft');
                const totalEnrollments = Array.isArray(enrollments) ? enrollments.length : 0;
                const completed = Array.isArray(enrollments) ? enrollments.filter((e: any) => e.progress === 100).length : 0;
                setStats({
                    totalCourses: allCourses.length,
                    activeCourses: active.length,
                    draftCourses: drafts.length,
                    totalEnrollments,
                    completionRate: totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0,
                });
                setCourses(allCourses.slice(0, 6));
            }
        } catch (err) {
            console.error('CourseRegistrar dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!userLoading && user) {
            fetchData();
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }
    }, [user, userLoading, fetchData]);

    const kpis = [
        { label: "Live Programmes", value: stats.activeCourses, icon: BookOpen, href: "/course-registrar/courses" },
        { label: "Total Students", value: stats.totalEnrollments, icon: Users, href: "/course-registrar/students" },
        { label: "Success Rate", value: `${stats.completionRate}%`, icon: GraduationCap, href: "/course-registrar/analytics" },
        { label: "Awaiting Review", value: stats.draftCourses, icon: FileCheck, href: "/course-registrar/approvals" },
    ];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Programme Overview</h1>
                    <p className="text-slate-500 font-medium font-serif">Manage academy courses and track student performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                        <Link href="/course-registrar/courses"><BookOpen className="h-4 w-4 mr-2 text-[#C8A96A]" />Class List</Link>
                    </Button>
                    <Button asChild className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Link href="/course-registrar/approvals"><FileCheck className="h-4 w-4 mr-2" />Approve Courses</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <Link key={i} href={k.href}>
                        <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{k.label}</p>
                                <k.icon className="w-5 h-5 text-[#C8A96A]" />
                            </div>
                            <p className="text-4xl font-serif text-[#0B1F3A]">{loading ? '—' : k.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Courses list */}
                <div className="lg:col-span-2 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                    <div className="flex items-center justify-between p-8 pb-4">
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Programme Catalogue</h2>
                        <Button variant="ghost" size="sm" asChild className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[9px] tracking-widest rounded-none">
                            <Link href="/course-registrar/courses">View All</Link>
                        </Button>
                    </div>
                    <div className="p-8 pt-0 space-y-2">
                        {loading ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100/60 animate-pulse" />)
                        ) : courses.length === 0 ? (
                            <div className="py-16 text-center">
                                <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium italic font-serif">No courses found.</p>
                            </div>
                        ) : courses.map((course, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-[#F6F4F2] border border-transparent hover:border-[#0B1F3A]/5 transition-all">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-black text-[#0B1F3A] truncate">{course.title}</p>
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest rounded-none border-none px-2 py-0.5",
                                            course.status === 'published'
                                                ? "bg-[#1F7A5A]/10 text-[#1F7A5A]"
                                                : "bg-slate-100 text-slate-400"
                                        )}>
                                            {course.status === 'published' ? 'Live' : 'Draft'}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {course.category} · {course.instructor?.name || 'Staff Member'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-black text-[#0B1F3A]">
                                        {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                                    </p>
                                    {course.rating > 0 && (
                                        <div className="flex items-center justify-end gap-1 text-[#C8A96A] mt-0.5">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-[10px] font-black">{course.rating}</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Management + Academy Stats */}
                <div className="space-y-4">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 space-y-3">
                        <h2 className="text-2xl font-serif text-white mb-6">Management</h2>
                        {[
                            { href: "/course-registrar/approvals", label: "Approve Courses", icon: FileCheck, color: "text-[#1F7A5A]" },
                            { href: "/course-registrar/courses", label: "Manage Programmes", icon: BookOpen, color: "text-[#C8A96A]" },
                            { href: "/course-registrar/students", label: "Student List", icon: Users, color: "text-blue-400" },
                            { href: "/course-registrar/analytics", label: "View Performance", icon: TrendingUp, color: "text-purple-400" },
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="flex items-center gap-4 p-4 border border-white/10 hover:bg-white/5 transition-colors">
                                <item.icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8 space-y-4">
                        <h2 className="text-lg font-serif text-[#0B1F3A]">Academy Stats</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
                                <span className="text-sm font-black text-[#1F7A5A]">{stats.completionRate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Students</span>
                                <span className="text-sm font-black text-[#0B1F3A]">{stats.totalEnrollments}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Items</span>
                                <span className={cn("text-sm font-black", stats.draftCourses > 0 ? "text-[#C8A96A]" : "text-[#0B1F3A]")}>
                                    {stats.draftCourses}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
