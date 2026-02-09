"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Book,
    Search,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Users,
    BarChart3,
    ExternalLink,
    RefreshCcw,
    Plus,
    LayoutGrid,
    List
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Course {
    _id: string;
    title: string;
    category: string;
    instructor: {
        name: string;
        avatarUrl: string;
    };
    status: string;
    price: number;
    enrollmentCount: number;
    createdAt: string;
}

export default function CourseRegistrarCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const { toast } = useToast();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (res.ok) {
                setCourses(data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none">Published</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none">Pending Review</Badge>;
            case 'draft': return <Badge variant="outline" className="text-slate-400">Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Master Course Catalog
                        <Badge variant="outline" className="rounded-full px-3">{courses.length}</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Registry of all academic offerings and their operational status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-11 px-6 font-bold border-slate-200" onClick={fetchCourses}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Refresh
                    </Button>
                    <Button asChild className="bg-slate-900 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-slate-200">
                        <Link href="/instructor/courses/new">
                            <Plus className="w-4 h-4 mr-2" /> New Course
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search courses, levels, or instructors..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={cn("rounded-xl h-8 w-8 p-0", viewMode === 'table' && "bg-white text-slate-900 shadow-sm")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn("rounded-xl h-8 w-8 p-0", viewMode === 'grid' && "bg-white text-slate-900 shadow-sm")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course Information</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollments</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell colSpan={5} className="h-16 bg-slate-50/30" />
                                        </TableRow>
                                    ))
                                ) : filteredCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <Book className="w-12 h-12 opacity-20" />
                                                <p className="font-bold">No courses found matching your criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <TableRow key={course._id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 leading-tight">{course.title}</span>
                                                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-tight">{course.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7 rounded-full">
                                                        <AvatarImage src={course.instructor.avatarUrl} />
                                                        <AvatarFallback className="text-[10px]">{course.instructor.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-bold text-slate-600">{course.instructor.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(course.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                                                    <Users className="w-4 h-4 text-slate-300" />
                                                    {course.enrollmentCount || 0}
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
                                                        <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Course Registry Action</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                            <ExternalLink className="h-4 w-4 text-slate-400" />
                                                            <span className="font-bold text-sm">View Public Page</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                            <BarChart3 className="h-4 w-4 text-slate-400" />
                                                            <span className="font-bold text-sm">Analytics Hub</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-50 my-2" />
                                                        <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-indigo-600">
                                                            <Book className="h-4 w-4" />
                                                            <span className="font-bold text-sm">Curriculum Audit</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <Card key={course._id} className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                        <Book className="w-12 h-12 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute bottom-4 left-4">
                                            {getStatusBadge(course.status)}
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{course.category}</p>
                                        <h3 className="font-black text-slate-900 leading-tight mb-4 line-clamp-2 h-12">{course.title}</h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={course.instructor.avatarUrl} />
                                                    <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-bold text-slate-500">{course.instructor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                                                <Users className="w-3.5 h-3.5 text-slate-300" />
                                                {course.enrollmentCount || 0}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl p-8 bg-slate-900 text-white flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                        <BarChart3 className="w-10 h-10 mb-6 text-indigo-400 opacity-50" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter">Engagement Insights</h3>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">Identify which courses are resonating with students and which need improvement.</p>
                        <Button variant="link" className="text-white p-0 h-auto font-black flex items-center gap-2 hover:no-underline hover:translate-x-1 transition-transform">
                            Explore Analytics <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl p-8 bg-indigo-600 text-white flex flex-col justify-between">
                    <div>
                        <Users className="w-10 h-10 mb-6 text-white/50" />
                        <h3 className="text-2xl font-black mb-2 tracking-tighter">Staff Directory</h3>
                        <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-8">Maintain professional records for all faculty members and instructors.</p>
                        <Button variant="outline" asChild className="w-full h-11 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl shadow-lg border-none">
                            <Link href="/course-registrar/students">Browse Staff</Link>
                        </Button>
                    </div>
                </Card>
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl p-8 bg-white border border-slate-50 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <Book className="w-10 h-10 text-slate-200" />
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">Compliance Verified</Badge>
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tighter text-slate-900">Curriculum Quality</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Every course undergoes rigorous institutional review before publication.</p>
                        <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-900 shadow-sm">
                            Quality Guidelines
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
