
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, BookOpen, Calendar, CheckSquare, ChevronRight, Filter, MoreVertical, TrendingUp, UserPlus, Users, MessageSquare } from "lucide-react";
import Image from "next/image";

export default function AdminDashboardPage() {
    const stats = [
        { label: "Total Students", value: "2,543", icon: Users, sub: "+5% this week", subType: "success", bg: "bg-indigo-50", iconColor: "text-indigo-600" },
        { label: "Active Courses", value: "124", icon: BookOpen, sub: "+2% this month", subType: "success", bg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Upcoming Events", value: "8", icon: Calendar, sub: "Same as last week", subType: "neutral", bg: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Completion Rate", value: "87%", icon: CheckSquare, sub: "+1.5% increase", subType: "success", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
    ];

    const recentEnrollments = [
        { id: 1, name: "Sarah Johnson", email: "sarah.j@example.com", course: "Advanced React Patterns", date: "Oct 24, 2023", status: "Active", avatar: "SJ" },
        { id: 2, name: "Michael Chen", email: "m.chen@example.com", course: "Data Science Fundamentals", date: "Oct 23, 2023", status: "Pending", avatar: "MC" },
        { id: 3, name: "Emily Davis", email: "emily.d@example.com", course: "UI/UX Design Principles", date: "Oct 22, 2023", status: "Active", avatar: "ED" },
    ];

    return (
        <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h2 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h2>
                                </div>
                                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span className={stat.subType === 'success' ? "text-emerald-600" : "text-slate-500"}>
                                    {stat.sub}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Enrollment Trends</CardTitle>
                                <p className="text-sm text-slate-500">Last 30 Days</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">1,204</span>
                                    <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">+12%</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Placeholder for Chart - In a real app, use Recharts */}
                            <div className="h-[300px] w-full bg-gradient-to-b from-indigo-50/50 to-transparent rounded-lg border border-dashed border-indigo-200 flex items-center justify-center relative overflow-hidden group">
                                <p className="text-indigo-400 font-medium z-10">Chart Visualization Placeholder</p>

                                {/* CSS-only faux chart wave for visual effect */}
                                <div className="absolute inset-x-0 bottom-0 h-32 opacity-30">
                                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                                        <path d="M0.00,49.98 C150.00,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: '#6366f1' }}></path>
                                    </svg>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-32 opacity-50">
                                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                                        <path d="M0.00,49.98 C150.00,150.00 271.49,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: '#818cf8' }}></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-slate-400 px-2">
                                <span>Oct 1</span>
                                <span>Oct 7</span>
                                <span>Oct 14</span>
                                <span>Oct 21</span>
                                <span>Oct 30</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Recent Enrollments</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                                    <Filter className="w-3 h-3" /> Filter
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                                    Export
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Student Name</th>
                                        <th className="px-6 py-4 font-semibold">Course</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentEnrollments.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-9 h-9 border border-slate-200">
                                                        <AvatarImage src={`/avatar-${student.id}.png`} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{student.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{student.name}</p>
                                                        <p className="text-xs text-slate-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{student.course}</td>
                                            <td className="px-6 py-4 text-slate-500">{student.date}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={
                                                    student.status === 'Active'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                }>
                                                    {student.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 text-center">
                            <Button variant="link" className="text-indigo-600 text-sm font-medium">View All Transactions</Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Needs Attention</h3>
                        <Button variant="link" className="text-indigo-600 text-sm">View All</Button>
                    </div>

                    <div className="space-y-4">
                        <Card className="bg-orange-50 border-orange-100 shadow-sm">
                            <CardContent className="p-4 flex gap-4">
                                <div className="bg-white p-2 h-10 w-10 rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Server Maintenance</h4>
                                    <p className="text-xs text-slate-600 mt-1">Scheduled for tonight at 2:00 AM.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex gap-4">
                                    <div className="bg-white p-2 h-10 w-10 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">5 New Instructor Requests</h4>
                                        <p className="text-xs text-slate-600 mt-1">Pending approval for course creation.</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="self-end text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 h-8">
                                    Review
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardContent className="p-4 flex gap-4">
                                <div className="bg-slate-100 p-2 h-10 w-10 rounded-lg flex items-center justify-center text-slate-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Course Feedback</h4>
                                    <p className="text-xs text-slate-600 mt-1">New reviews on "Intro to UX Design".</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
