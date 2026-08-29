"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Assign Instructor State
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [selectedInstructorUid, setSelectedInstructorUid] = useState<string>('');
    const [assigning, setAssigning] = useState(false);
    const { toast } = useToast();

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const res = await fetch('/api/users?role=instructor');
            const data = await res.json();
            if (Array.isArray(data)) {
                setInstructors(data);
            }
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    const handleExport = () => {
        if (courses.length === 0) return;
        const headers = ["Title", "Instructor", "Category", "Price", "Enrollments"];
        const rows = courses.map(c => [
            c.title,
            c.instructor.name,
            c.category,
            c.price,
            c.enrollmentCount
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'courses_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    const handleAssignInstructor = async () => {
        if (!selectedCourse || !selectedInstructorUid) return;
        setAssigning(true);
        
        const selectedInstructor = instructors.find(i => i.uid === selectedInstructorUid);
        if (!selectedInstructor) return;

        try {
            const res = await fetch(`/api/courses/${selectedCourse._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instructorUid: selectedInstructor.uid,
                    instructor: {
                        name: selectedInstructor.displayName,
                        avatarUrl: selectedInstructor.photoURL || '',
                        verified: true
                    }
                })
            });

            if (res.ok) {
                toast({ title: 'Instructor Assigned', description: `Course assigned to ${selectedInstructor.displayName}` });
                setIsAssignOpen(false);
                fetchCourses();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign instructor' });
            }
        } catch (error) {
            console.error('Error assigning instructor:', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCourses();
            } else {
                alert('Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academy Catalogue</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Manage <span className="text-[#C8A96A]">Courses.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Review, edit, and manage all academic offerings.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none gap-2">
                        <Plus className="w-4 h-4" /> Create Course
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="px-8 py-6 border-b border-[#0B1F3A]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by title or instructor..."
                                className="pl-10 h-11 max-w-sm bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-11 px-3 bg-white border border-[#0B1F3A]/10 rounded-none text-sm text-[#0B1F3A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[10px] tracking-widest rounded-none">
                        Export CSV
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8 py-5">Course</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollments</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.map((course) => (
                            <TableRow key={course._id} className="hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                <TableCell className="pl-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#F6F4F2] border border-[#0B1F3A]/5 overflow-hidden flex-shrink-0">
                                            <img src={course.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-[#0B1F3A] block max-w-[200px] truncate">{course.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{course.instructor.name}</TableCell>
                                <TableCell>
                                    <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/5 rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                        {course.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-[#0B1F3A]">₦{course.price?.toLocaleString()}</TableCell>
                                <TableCell className="text-slate-500 font-medium">{course.enrollmentCount} Student(s)</TableCell>
                                <TableCell>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                        Published
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-none"><MoreVertical className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-none border-[#0B1F3A]/10">
                                            <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> View Details</DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 text-[#0B1F3A] font-bold"><Edit2 className="w-4 h-4" /> Edit Course</DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 text-[#1F7A5A] font-bold cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setSelectedInstructorUid(course.instructorUid || '');
                                                    setIsAssignOpen(true);
                                                }}
                                            >
                                                <Search className="w-4 h-4" /> Assign Instructor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 text-red-600 font-bold cursor-pointer"
                                                onClick={() => handleDelete(course._id)}
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {loading && <div className="p-8 text-center text-slate-400 font-serif italic">Loading courses...</div>}
            </div>

            {/* Assign Instructor Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#0B1F3A]">Assign Instructor</DialogTitle>
                        <DialogDescription>
                            Assign {selectedCourse?.title} to an instructor. They will manage this course's live classes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="instructor">Select Instructor</Label>
                            <Select
                                value={selectedInstructorUid}
                                onValueChange={setSelectedInstructorUid}
                            >
                                <SelectTrigger className="rounded-none">
                                    <SelectValue placeholder="Select an instructor" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    {instructors.length > 0 ? instructors.map(inst => (
                                        <SelectItem key={inst.uid} value={inst.uid}>
                                            {inst.displayName} ({inst.email})
                                        </SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>No instructors found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="rounded-none">Cancel</Button>
                        <Button onClick={handleAssignInstructor} disabled={assigning} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white rounded-none font-black text-[10px] uppercase tracking-widest">
                            {assigning ? 'Assigning...' : 'Assign Instructor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
