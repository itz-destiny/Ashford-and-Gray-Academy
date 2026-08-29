"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Book,
    Search,
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
            case 'published': return <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] hover:bg-[#1F7A5A]/10 border-none rounded-none">Published</Badge>;
            case 'pending': return <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] hover:bg-[#C8A96A]/10 border-none rounded-none">Pending Review</Badge>;
            case 'draft': return <Badge variant="outline" className="text-slate-400 rounded-none">Draft</Badge>;
            default: return <Badge variant="outline" className="rounded-none">{status}</Badge>;
        }
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
                        Master <span className="text-[#C8A96A]">Course Catalog.</span>
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none px-3 font-black text-[10px] uppercase tracking-widest">{courses.length}</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Registry of all academic offerings and their operational status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none" onClick={fetchCourses}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2 text-[#C8A96A]", loading && "animate-spin")} /> Refresh
                    </Button>
                    <Button asChild className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Link href="/course-registrar/courses/new">
                            <Plus className="w-4 h-4 mr-2" /> New Course
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="p-8 border-b border-[#0B1F3A]/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search courses, levels, or instructors..."
                                className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-[#F6F4F2] p-1.5">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={cn("rounded-none h-8 w-8 p-0", viewMode === 'table' ? "bg-[#0B1F3A] text-white" : "text-slate-400")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn("rounded-none h-8 w-8 p-0", viewMode === 'grid' ? "bg-[#0B1F3A] text-white" : "text-slate-400")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    {viewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-[#0B1F3A]/10">
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
                                                <p className="font-bold font-serif">No courses found matching your criteria</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <TableRow key={course._id} className="group hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#0B1F3A] leading-tight">{course.title}</span>
                                                    <span className="text-[10px] font-black uppercase text-[#C8A96A] tracking-tight">{course.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7 rounded-none">
                                                        <AvatarImage src={course.instructor.avatarUrl} />
                                                        <AvatarFallback className="text-[10px] rounded-none bg-[#F6F4F2] text-[#0B1F3A]">{course.instructor.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-bold text-slate-600">{course.instructor.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(course.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-sm font-black text-[#0B1F3A]">
                                                    <Users className="w-4 h-4 text-[#C8A96A]" />
                                                    {course.enrollmentCount || 0}
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
                                                        <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Course Registry Action</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-none flex items-center gap-3 p-3 cursor-pointer">
                                                            <ExternalLink className="h-4 w-4 text-slate-400" />
                                                            <span className="font-bold text-sm">View Public Page</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-none flex items-center gap-3 p-3 cursor-pointer">
                                                            <BarChart3 className="h-4 w-4 text-slate-400" />
                                                            <span className="font-bold text-sm">Analytics Hub</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-[#0B1F3A]/5 my-2" />
                                                        <DropdownMenuItem className="rounded-none flex items-center gap-3 p-3 cursor-pointer text-[#0B1F3A]">
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
                        <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCourses.map((course) => (
                                <div key={course._id} className="border border-[#0B1F3A]/10 overflow-hidden hover:shadow-lg transition-all group">
                                    <div className="aspect-video bg-[#F6F4F2] flex items-center justify-center relative overflow-hidden">
                                        <Book className="w-12 h-12 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute bottom-4 left-4">
                                            {getStatusBadge(course.status)}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">{course.category}</p>
                                        <h3 className="font-black text-[#0B1F3A] leading-tight mb-4 line-clamp-2 h-12">{course.title}</h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#0B1F3A]/5">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 rounded-none">
                                                    <AvatarImage src={course.instructor.avatarUrl} />
                                                    <AvatarFallback className="rounded-none bg-[#F6F4F2] text-[#0B1F3A]">{course.instructor.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-bold text-slate-500">{course.instructor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-black text-[#0B1F3A]">
                                                <Users className="w-3.5 h-3.5 text-[#C8A96A]" />
                                                {course.enrollmentCount || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-8 bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] text-white flex flex-col justify-between group overflow-hidden relative">
                    <div className="relative z-10">
                        <BarChart3 className="w-10 h-10 mb-6 text-[#C8A96A]" />
                        <h3 className="text-2xl font-serif mb-2">Engagement Insights</h3>
                        <p className="text-white/60 font-medium text-sm leading-relaxed mb-8">Identify which courses are resonating with students and which need improvement.</p>
                        <Button variant="link" className="text-[#C8A96A] p-0 h-auto font-black flex items-center gap-2 hover:no-underline hover:translate-x-1 transition-transform">
                            Explore Analytics <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-8 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] flex flex-col justify-between">
                    <div>
                        <Users className="w-10 h-10 mb-6 text-[#1F7A5A]" />
                        <h3 className="text-2xl font-serif text-[#0B1F3A] mb-2">Staff Directory</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Maintain professional records for all faculty members and instructors.</p>
                        <Button asChild className="w-full h-11 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none shadow-none">
                            <Link href="/course-registrar/students">Browse Staff</Link>
                        </Button>
                    </div>
                </div>
                <div className="p-8 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <Book className="w-10 h-10 text-slate-200" />
                            <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] border-none font-black text-[10px] uppercase rounded-none">Compliance Verified</Badge>
                        </div>
                        <h3 className="text-2xl font-serif mb-2 text-[#0B1F3A]">Curriculum Quality</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">Every course undergoes rigorous institutional review before publication.</p>
                        <Button variant="outline" className="w-full h-11 rounded-none font-black text-[10px] uppercase tracking-widest border-[#0B1F3A]/10 text-[#0B1F3A] shadow-none">
                            Quality Guidelines
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
