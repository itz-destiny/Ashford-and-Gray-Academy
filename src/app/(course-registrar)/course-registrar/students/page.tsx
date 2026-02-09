"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    GraduationCap,
    BookOpen,
    Activity,
    Mail,
    ChevronRight,
    ArrowUpRight,
    Star,
    Clock
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Student {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    enrollmentCount: number;
    avgProgress: number;
    lastActive: string;
}

export default function CourseRegistrarStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Fetch students and their enrollment stats
            const res = await fetch('/api/users?role=student');
            const data = await res.json();

            if (res.ok) {
                // Mocking enrollment stats for this view as the API might not provide them directly yet
                const studentsWithStats = data.map((s: any) => ({
                    ...s,
                    enrollmentCount: Math.floor(Math.random() * 5) + 1,
                    avgProgress: Math.floor(Math.random() * 100),
                    lastActive: new Date().toISOString()
                }));
                setStudents(studentsWithStats);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Student Oversight
                        <Badge variant="outline" className="rounded-full px-3">{students.length} Total</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Monitoring student distribution, enrollment status, and academic progress.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 rounded-xl px-6 font-bold border-slate-200 shadow-sm" onClick={fetchStudents}>
                        Refresh List
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { label: "Highly Engaged", value: "64%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Average Enrollment", value: "3.2", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Graduation Rate", value: "88%", icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-3xl bg-white p-6 flex flex-row items-center gap-5">
                        <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, or student ID..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-2xl h-11 font-bold border-slate-200 shadow-sm">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" /> Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollments</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Progress</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Engagement Score</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="h-16 bg-slate-50/20" />
                                    </TableRow>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p className="font-bold">No students found matching your search</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.uid} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-11 w-11 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarImage src={student.photoURL} alt={student.displayName} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                        {student.displayName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">{student.displayName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{student.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="rounded-lg px-2 text-indigo-600 border-indigo-100 bg-indigo-50/50 font-black">
                                                {student.enrollmentCount} Courses
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="w-[120px] space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                    <span>{student.avgProgress}%</span>
                                                </div>
                                                <Progress value={student.avgProgress} className="h-1.5 bg-slate-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn("w-3 h-3", i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-black text-slate-900">4.2</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Academic Oversight</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <GraduationCap className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Transcripts</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Attendance Log</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50 my-2" />
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-indigo-600 font-bold">
                                                        <Mail className="h-4 w-4" />
                                                        <span className="font-bold text-sm">Send Consultation</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Activity className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-3xl font-black mb-4 tracking-tighter">Academic Interventions</h3>
                            <p className="text-slate-400 font-medium text-base mb-8 leading-relaxed max-w-sm">
                                Proactively identify students falling below engagement thresholds.
                            </p>
                        </div>
                        <Button className="w-fit h-12 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl px-8 items-center gap-2">
                            View Risk Analysis <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-indigo-600 text-white p-10 relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-3xl font-black mb-4 tracking-tighter">Alumni Readiness</h3>
                            <p className="text-indigo-100 font-medium text-base mb-8 leading-relaxed max-w-sm">
                                Track certification eligibility and external organization placements.
                            </p>
                        </div>
                        <Button variant="outline" className="w-fit h-12 border-white/20 hover:bg-white/10 text-white font-black rounded-xl px-8 items-center gap-2">
                            Placement Dashboard <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
