"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, GraduationCap, FileCheck, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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
                    const enrollmentsRes = await fetch('/api/enrollments');
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
            label: "Active Courses",
            value: stats.activeCourses.toString(),
            icon: Book,
            sub: `${stats.totalCourses} total courses`,
            bg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            href: "/course-registrar/courses"
        },
        {
            label: "Total Enrollments",
            value: stats.totalEnrollments.toString(),
            icon: Users,
            sub: "Across all courses",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            href: "/course-registrar/students"
        },
        {
            label: "Completion Rate",
            value: `${stats.completionRate}%`,
            icon: GraduationCap,
            sub: "Student success rate",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: "/course-registrar/analytics"
        },
        {
            label: "Pending Approvals",
            value: stats.pendingApprovals.toString(),
            icon: FileCheck,
            sub: "Awaiting review",
            bg: "bg-orange-50",
            iconColor: "text-orange-600",
            href: "/course-registrar/approvals"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Academic Quality Control</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage courses, curriculum, and student success</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/course-registrar/courses">
                            <Book className="h-4 w-4 mr-2" />
                            Manage Courses
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/course-registrar/approvals">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Course Approvals
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Courses */}
                <Card className="border-none shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent Courses</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/course-registrar/courses">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                    Loading courses...
                                </div>
                            ) : recentCourses.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                    No courses found.
                                </div>
                            ) : (
                                recentCourses.map((course, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {course.title}
                                                </p>
                                                <Badge
                                                    variant={course.status === 'published' ? 'default' : 'secondary'}
                                                    className="text-xs capitalize"
                                                >
                                                    {course.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {course.category} • {course.instructor.name || 'No instructor'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">${course.price}</p>
                                            <p className="text-xs text-slate-500">{course.rating || 0} ⭐</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/course-registrar/approvals">
                                <FileCheck className="h-4 w-4 mr-2" />
                                Review Approvals
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/course-registrar/courses">
                                <Book className="h-4 w-4 mr-2" />
                                Manage Courses
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/course-registrar/students">
                                <Users className="h-4 w-4 mr-2" />
                                Student Oversight
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/course-registrar/analytics">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Analytics
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Academic Performance */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Academic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                                <p className="text-lg font-bold text-emerald-600">{stats.completionRate}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Active Enrollments</p>
                                <p className="text-lg font-bold text-blue-600">{stats.totalEnrollments}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                            <AlertCircle className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-slate-600">Needs Attention</p>
                                <p className="text-lg font-bold text-orange-600">{stats.pendingApprovals}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
