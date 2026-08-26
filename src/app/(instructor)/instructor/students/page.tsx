"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight, UserCheck, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function InstructorStudentsPage() {
    const { user } = useUser();
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const res = await apiFetch('/api/instructor/students');
                const data = await res.json();
                if (data?.success) {
                    setCourses(data.courses || []);
                    setStudents((data.students || []).map((s: any) => ({
                        id: `${s.uid}-${s.courseId}`,
                        uid: s.uid,
                        name: s.displayName || 'Anonymous Student',
                        avatar: s.displayName ? s.displayName.split(' ').map((n: string) => n[0]).join('') : 'ST',
                        photoURL: s.photoURL,
                        courseId: s.courseId,
                        course: s.courseTitle || 'Unknown Course',
                        progress: s.progress || 0,
                    })));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredStudents = students
        .filter(s => selectedCourse === 'all' || s.courseId === selectedCourse)
        .filter(s => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase()));

    return (
        <div className="mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 space-y-10 md:space-y-16 pb-32 max-w-[1600px] bg-[#FAF9F6]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Faculty Portal</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        My <span className="text-[#C8A96A]">Students.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-base md:text-lg max-w-lg leading-relaxed font-serif">
                        Track progress across every course you teach.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white rounded-none border-[#0B1F3A]/10">
                            <SelectValue placeholder="Filter by Course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses.map(c => (
                                <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1F3A]/30" />
                        <Input placeholder="Search students..." className="pl-11 h-12 bg-white rounded-none border-[#0B1F3A]/10" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 pr-6 bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                    <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-7 h-7 text-[#0B1F3A]" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Active Students</p>
                        <p className="text-2xl font-black text-[#0B1F3A]">{new Set(students.map(s => s.uid)).size}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 pr-6 bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                    <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                        <Award className="w-7 h-7 text-[#1F7A5A]" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Completions</p>
                        <p className="text-2xl font-black text-[#0B1F3A]">{students.filter(s => s.progress === 100).length}</p>
                    </div>
                </div>
            </div>

            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#F6F4F2]">
                                <TableRow className="hover:bg-transparent border-[#0B1F3A]/10">
                                    <TableHead className="font-black text-[#0B1F3A] uppercase text-[9px] tracking-widest pl-8">Student</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A] uppercase text-[9px] tracking-widest">Enrolled Course</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A] uppercase text-[9px] tracking-widest">Progress</TableHead>
                                    <TableHead className="text-right pr-8 font-black text-[#0B1F3A] uppercase text-[9px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-[#F6F4F2]/60 transition-colors border-[#0B1F3A]/5">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 rounded-none border border-[#0B1F3A]/10">
                                                    <AvatarImage src={student.photoURL} />
                                                    <AvatarFallback className="rounded-none bg-[#0B1F3A] text-white text-xs font-black">{student.avatar}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-serif text-[#0B1F3A]">{student.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-600">{student.course}</TableCell>
                                        <TableCell className="w-48">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                    <span>{student.progress}%</span>
                                                </div>
                                                <Progress value={student.progress} className="h-1.5 rounded-none" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button asChild variant="ghost" size="sm" className="text-[#C8A96A] hover:text-[#0B1F3A] hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest rounded-none">
                                                <Link href="/instructor/communications">
                                                    Message <ChevronRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-16 md:py-20 text-slate-400 font-serif italic">No students found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
