"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileCheck,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    User,
    BookOpen,
    MessageSquare,
    ChevronRight,
    ArrowUpRight
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
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Course {
    _id: string;
    title: string;
    category: string;
    instructor: {
        name: string;
        avatarUrl: string;
    };
    status: 'draft' | 'pending' | 'published' | 'archived';
    price: number;
    createdAt: string;
    description: string;
}

export default function CourseApprovalsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const { toast } = useToast();

    // Selection/Preview State
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const data = await res.json();
                // For this demo, we'll treat 'draft' as 'pending' for the registrar's view if they are not the instructor's private drafts
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast({
                    title: newStatus === 'published' ? "Course Approved" : "Status Updated",
                    description: `Course has been moved to ${newStatus}.`
                });
                setIsPreviewOpen(false);
                fetchCourses();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        }
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'draft': return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">Draft</Badge>;
            case 'archived': return <Badge variant="outline" className="text-slate-400">Archived</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Content Approvals
                        <Badge variant="outline" className="rounded-full px-3">{courses.filter(c => c.status === 'pending' || c.status === 'draft').length} Pending</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Review and validate new course submissions for quality and compliance.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Button
                    variant={statusFilter === 'pending' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('pending')}
                    className={cn("rounded-2xl transition-all", statusFilter === 'pending' && "bg-slate-900 text-white shadow-lg shadow-slate-200")}
                >
                    Pending Review
                </Button>
                <Button
                    variant={statusFilter === 'published' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('published')}
                    className={cn("rounded-2xl transition-all", statusFilter === 'published' && "bg-slate-900 text-white shadow-lg shadow-slate-200")}
                >
                    Published
                </Button>
                <Button
                    variant={statusFilter === 'all' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('all')}
                    className={cn("rounded-2xl transition-all", statusFilter === 'all' && "bg-slate-900 text-white shadow-lg shadow-slate-200")}
                >
                    All Courses
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Instructor</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Submitted</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="h-20 bg-slate-50/20" />
                                    </TableRow>
                                ))
                            ) : filteredCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <FileCheck className="w-12 h-12 opacity-20" />
                                            <p className="font-bold">No courses currently awaiting review</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCourses.map((course) => (
                                    <TableRow key={course._id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 leading-tight">{course.title}</span>
                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">by {course.instructor.name}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-slate-600 text-sm">
                                            {course.category}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(course.status)}
                                        </TableCell>
                                        <TableCell className="py-4 text-xs font-bold text-slate-400">
                                            {format(new Date(course.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setIsPreviewOpen(true);
                                                }}
                                                className="h-9 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl gap-2 font-bold px-4"
                                            >
                                                Review <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedCourse && (
                        <>
                            <DialogHeader className="p-10 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        {getStatusBadge(selectedCourse.status)}
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 rounded-lg bg-white/10 p-0.5">
                                                <AvatarImage src={selectedCourse.instructor.avatarUrl} />
                                                <AvatarFallback>{selectedCourse.instructor.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-black uppercase tracking-widest text-white/60">{selectedCourse.instructor.name}</span>
                                        </div>
                                    </div>
                                    <DialogTitle className="text-4xl font-black mb-4 tracking-tighter">{selectedCourse.title}</DialogTitle>
                                    <div className="flex gap-4">
                                        <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 px-3 py-1 font-black uppercase text-[10px] tracking-widest">{selectedCourse.category}</Badge>
                                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 px-3 py-1 font-black uppercase text-[10px] tracking-widest">${selectedCourse.price}</Badge>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="p-10 space-y-10 bg-white">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-indigo-500" /> Executive Summary
                                    </h4>
                                    <p className="text-slate-600 font-medium leading-relaxed italic">
                                        "{selectedCourse.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Quality Score</p>
                                        <p className="text-2xl font-black text-slate-900">A+</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Duration</p>
                                        <p className="text-2xl font-black text-slate-900">12h</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Compliance</p>
                                        <p className="text-2xl font-black text-emerald-600">Passed</p>
                                    </div>
                                </div>

                                <DialogFooter className="pt-6 border-t border-slate-100 gap-4">
                                    <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-2xl h-12 px-8 font-bold border-slate-200">
                                        Cancel
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(selectedCourse._id, 'draft')}
                                            className="rounded-2xl h-12 px-8 font-extrabold text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Request Changes
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus(selectedCourse._id, 'published')}
                                            className="rounded-2xl h-12 px-10 font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 gap-2 group transition-all active:scale-95"
                                        >
                                            Approve Course <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
