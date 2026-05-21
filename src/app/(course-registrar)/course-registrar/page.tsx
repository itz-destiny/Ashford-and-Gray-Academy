
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, GraduationCap, FileCheck, Users, TrendingUp, Clock, CheckCircle, AlertCircle, LayoutDashboard, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CourseStats {
    totalCourses: number;
    activeCourses: number;
    totalEnrollments: number;
    completionRate: number;
    pendingApprovals: number;
}

export default function CourseRegistrarDashboardPage() {
    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0,
        activeCourses: 0,
        totalEnrollments: 0,
        completionRate: 0,
        pendingApprovals: 0
    });
    const [recentCourses, setRecentCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch courses
                const coursesRes = await fetch('/api/courses');
                const courses = await coursesRes.json();

                if (Array.isArray(courses)) {
                    const active = courses.filter(c => c.status === 'published');

                    // Fetch enrollments
                    const enrollmentsRes = await apiFetch('/api/enrollments');
                    const enrollments = await enrollmentsRes.json();

                    const totalEnrollments = Array.isArray(enrollments) ? enrollments.length : 0;
                    const completed = Array.isArray(enrollments) ? enrollments.filter(e => e.progress === 100).length : 0;

                    setStats({
                        totalCourses: courses.length,
                        activeCourses: active.length,
                        totalEnrollments,
                        completionRate: totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0,
                        pendingApprovals: courses.filter(c => c.status === 'draft').length
                    });

                    setRecentCourses(courses.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const statCards = [
        {
            label: "Live Classes",
            value: stats.activeCourses.toString(),
            icon: Book,
            sub: `${stats.totalCourses} total classes`,
            bg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            href: "/course-registrar/courses"
        },
        {
            label: "Total Students",
            value: stats.totalEnrollments.toString(),
            icon: Users,
            sub: "Across all academy programs",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/course-registrar/students"
        },
        {
            label: "Success Rate",
            value: `${stats.completionRate}%`,
            icon: GraduationCap,
            sub: "Student completion rate",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: "/course-registrar/analytics"
        },
        {
            label: "Awaiting Review",
            value: stats.pendingApprovals.toString(),
            icon: FileCheck,
            sub: "Courses to approve",
            bg: "bg-orange-50",
            iconColor: "text-orange-600",
            href: "/course-registrar/approvals"
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">Study Plan Home</h1>
                    <p className="text-slate-500 font-medium italic">Manage academy courses and track student performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="rounded-xl border-slate-100 font-bold text-xs uppercase tracking-tight">
                        <Link href="/course-registrar/courses">
                            <Book className="h-4 w-4 mr-2" />
                            Class List
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#0B1F3A] hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-tight">
                        <Link href="/course-registrar/approvals">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Approve Courses
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border-none bg-white rounded-[2.5rem] group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h2 className="text-3xl font-black text-[#0B1F3A] mt-2">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 italic">
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Courses */}
                <Card className="border-none bg-white rounded-[3rem] shadow-sm lg:col-span-2 overflow-hidden">
                    <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-black text-[#0B1F3A] tracking-tight">Newest Courses</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">
                            <Link href="/course-registrar/courses">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm italic font-bold">
                                    Loading classes...
                                </div>
                            ) : recentCourses.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm italic font-bold">
                                    No courses found yet.
                                </div>
                            ) : (
                                recentCourses.map((course, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-black text-[#0B1F3A] truncate">
                                                    {course.title}
                                                </p>
                                                <Badge
                                                    className={cn(
                                                        "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border-none",
                                                        course.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}
                                                >
                                                    {course.status === 'published' ? 'Live' : 'Draft'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                {course.category} • {course.instructor.name || 'Staff Member'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-[#0B1F3A]">${course.price}</p>
                                            <div className="flex items-center justify-end gap-1 text-[#C8A96A] mt-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-black">{course.rating || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Tools */}
                <Card className="border-none bg-[#0B1F3A] text-white rounded-[3rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <CardHeader className="p-10 pb-4 relative z-10">
                        <CardTitle className="text-2xl font-black tracking-tight">Management</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-4 relative z-10">
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/course-registrar/approvals">
                                <FileCheck className="h-5 w-5 mr-3 text-emerald-400" />
                                <span className="font-bold">Approve Courses</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/course-registrar/courses">
                                <Book className="h-5 w-5 mr-3 text-blue-400" />
                                <span className="font-bold">Manage Program</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/course-registrar/students">
                                <Users className="h-5 w-5 mr-3 text-[#C8A96A]" />
                                <span className="font-bold">Student List</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl hover:bg-white/10 text-white border border-white/10" asChild>
                            <Link href="/course-registrar/analytics">
                                <TrendingUp className="h-5 w-5 mr-3 text-purple-400" />
                                <span className="font-bold">View Performance</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Academy Performance */}
            <Card className="border-none bg-white rounded-[3rem] shadow-sm">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-black text-[#0B1F3A] tracking-tight">Academy Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-[2rem]">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                                <p className="text-xl font-black text-emerald-600">{stats.completionRate}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-[2rem]">
                            <TrendingUp className="h-10 w-10 text-blue-600" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Students</p>
                                <p className="text-xl font-black text-blue-600">{stats.totalEnrollments}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-[2rem]">
                            <AlertCircle className="h-10 w-10 text-orange-600" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Review Items</p>
                                <p className="text-xl font-black text-orange-600">{stats.pendingApprovals}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
