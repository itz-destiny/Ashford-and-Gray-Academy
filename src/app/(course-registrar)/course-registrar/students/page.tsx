"use client";

import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    MoreHorizontal,
    GraduationCap,
    BookOpen,
    Activity,
    Mail,
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
}

export default function CourseRegistrarStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/course-registrar/students');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const fullyEnrolled = students.filter(s => s.avgProgress === 100).length;
    const avgEnrollment = students.length > 0
        ? (students.reduce((sum, s) => sum + s.enrollmentCount, 0) / students.length).toFixed(1)
        : '0.0';

    const filteredStudents = students.filter(s =>
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Student <span className="text-[#C8A96A]">Oversight.</span>
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none font-black text-[10px] uppercase tracking-widest px-3 py-1">{students.length} Total</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Monitoring student distribution, enrollment status, and academic progress.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none" onClick={fetchStudents}>
                        Refresh List
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { label: "Total Students", value: students.length.toString(), icon: Activity, color: "text-[#1F7A5A]" },
                    { label: "Average Enrollment", value: avgEnrollment, icon: BookOpen, color: "text-[#C8A96A]" },
                    { label: "Fully Completed", value: fullyEnrolled.toString(), icon: GraduationCap, color: "text-[#0B1F3A]" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 flex flex-row items-center gap-5">
                        <div className={cn("p-4 bg-[#F6F4F2] border border-[#0B1F3A]/5", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
                            <p className="text-2xl font-serif text-[#0B1F3A]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="p-8 border-b border-[#0B1F3A]/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/10">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollments</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Progress</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={4} className="h-16 bg-slate-50/50" />
                                    </TableRow>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p className="font-bold font-serif">No students found matching your search</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.uid} className="group hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-11 w-11 rounded-none border border-[#0B1F3A]/10">
                                                    <AvatarImage src={student.photoURL} alt={student.displayName} />
                                                    <AvatarFallback className="bg-[#F6F4F2] text-[#0B1F3A] font-black rounded-none">
                                                        {student.displayName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#0B1F3A] leading-tight">{student.displayName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{student.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className="rounded-none px-2 text-[#0B1F3A] border border-[#C8A96A]/30 bg-[#C8A96A]/10 font-black">
                                                {student.enrollmentCount} Courses
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="w-[120px] space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                    <span>{student.avgProgress}%</span>
                                                </div>
                                                <Progress value={student.avgProgress} className="h-1.5 rounded-none bg-slate-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-none hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-none p-2 shadow-xl border-[#0B1F3A]/10">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Academic Oversight</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => router.push('/course-registrar/communications')}
                                                        className="rounded-none flex items-center gap-3 p-3 cursor-pointer text-[#0B1F3A] font-bold"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        <span className="font-bold text-sm">Send Message</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

        </div>
    );
}
