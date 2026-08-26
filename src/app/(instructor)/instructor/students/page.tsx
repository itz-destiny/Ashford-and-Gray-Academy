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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
                    <p className="text-slate-500">Track progress and grade submissions across your courses.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[200px] bg-white">
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
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search students..." className="pl-9 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none bg-indigo-50/50 shadow-none">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{new Set(students.map(s => s.uid)).size}</h3>
                            <p className="text-xs text-indigo-700 font-medium">Total Active Students</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-emerald-50/50 shadow-none">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl text-white">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{students.filter(s => s.progress === 100).length}</h3>
                            <p className="text-xs text-emerald-700 font-medium">Course Completions</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-none overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900 pl-6">Student</TableHead>
                                <TableHead className="font-bold text-slate-900">Enrolled Course</TableHead>
                                <TableHead className="font-bold text-slate-900">Progress</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={student.photoURL} />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{student.avatar}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-bold text-slate-700">{student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600">{student.course}</TableCell>
                                    <TableCell className="w-48">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>{student.progress}%</span>
                                            </div>
                                            <Progress value={student.progress} className="h-1.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button asChild variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                                            <Link href="/instructor/communications">
                                                Message <ChevronRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-slate-400 italic">No students found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
