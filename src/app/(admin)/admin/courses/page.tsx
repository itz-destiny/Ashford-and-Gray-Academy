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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Courses</h1>
                    <p className="text-slate-500 text-sm">Review, edit, and manage all academic offerings.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <Plus className="w-4 h-4" /> Create Course
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b px-6 py-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by title or instructor..."
                                className="pl-10 max-w-sm bg-slate-50 border-none focus-visible:ring-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-10 px-3 bg-slate-50 border-none rounded-md text-sm text-slate-600 focus:ring-1 focus:ring-indigo-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="text-indigo-600 font-bold">
                        Export CSV
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900 pl-6">Course</TableHead>
                                <TableHead className="font-bold text-slate-900">Instructor</TableHead>
                                <TableHead className="font-bold text-slate-900">Category</TableHead>
                                <TableHead className="font-bold text-slate-900">Price</TableHead>
                                <TableHead className="font-bold text-slate-900">Enrollments</TableHead>
                                <TableHead className="font-bold text-slate-900">Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                <img src={course.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-slate-700 block max-w-[200px] truncate">{course.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{course.instructor.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-2 py-0.5 text-[10px] font-bold">
                                            {course.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-700">${course.price}</TableCell>
                                    <TableCell className="text-slate-500 font-medium">{course.enrollmentCount} Student(s)</TableCell>
                                    <TableCell>
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 py-0.5 text-[10px] font-bold">
                                            Published
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> View Details</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-indigo-600 font-bold"><Edit2 className="w-4 h-4" /> Edit Course</DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="gap-2 text-emerald-600 font-bold cursor-pointer"
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
                    {loading && <div className="p-8 text-center text-slate-400">Loading courses...</div>}
                </CardContent>
            </Card>

            {/* Assign Instructor Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign Instructor</DialogTitle>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an instructor" />
                                </SelectTrigger>
                                <SelectContent>
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
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignInstructor} disabled={assigning} className="bg-indigo-600">
                            {assigning ? 'Assigning...' : 'Assign Instructor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
