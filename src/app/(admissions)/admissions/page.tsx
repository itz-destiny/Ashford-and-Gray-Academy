"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    UserPlus,
    Search,
    ArrowRightLeft,
    GraduationCap,
    Loader2,
    MoreHorizontal,
    Edit2,
    Trash2,
    X,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentEnrollment {
    enrollmentId: string;
    courseId?: string;
    courseTitle: string;
}

interface Student {
    uid: string;
    displayName: string;
    email: string;
    phone?: string;
    enrollments: StudentEnrollment[];
}

interface CourseOption {
    id: string;
    title: string;
}

export default function AdmissionsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const { toast } = useToast();

    // Switch-department dialog state
    const [switchTarget, setSwitchTarget] = useState<{ student: Student; enrollment: StudentEnrollment } | null>(null);
    const [switchCourseId, setSwitchCourseId] = useState('');
    const [switching, setSwitching] = useState(false);

    // Add-student dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({ displayName: '', email: '', phone: '', courseId: '' });

    // Edit-profile dialog state
    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const [editForm, setEditForm] = useState({ displayName: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deletingUid, setDeletingUid] = useState<string | null>(null);

    // Bulk selection + bulk action state
    const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
    const [bulkSwitchOpen, setBulkSwitchOpen] = useState(false);
    const [bulkSwitchCourseId, setBulkSwitchCourseId] = useState('');
    const [bulkSwitching, setBulkSwitching] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                apiFetch('/api/admissions/students'),
                apiFetch('/api/courses'),
            ]);
            if (studentsRes.ok) setStudents(await studentsRes.json());
            if (coursesRes.ok) {
                const data = await coursesRes.json();
                // Degree/Diploma programmes are hidden site-wide for now (see the
                // public /courses page) — keep them out of these pickers too.
                const cohortOnly = (data || []).filter((c: any) => !c.title?.trim().toLowerCase().startsWith('diploma'));
                setCourses(cohortOnly.map((c: any) => ({ id: c.id || c._id, title: c.title })));
            }
        } catch (error) {
            console.error("Failed to load admissions data", error);
            toast({ variant: "destructive", title: "Fetch Failed", description: "Could not load the student roster." });
        } finally {
            setLoading(false);
        }
    };

    const courseCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const s of students) {
            for (const en of s.enrollments) {
                counts[en.courseTitle] = (counts[en.courseTitle] || 0) + 1;
            }
        }
        return counts;
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCourse = courseFilter === 'all' ||
                s.enrollments.some(en => en.courseTitle === courseFilter);
            return matchesSearch && matchesCourse;
        });
    }, [students, searchQuery, courseFilter]);

    // Selection is kept against uids so it survives search/filter changes;
    // only the currently visible rows matter for "select all", though.
    const allVisibleSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedUids.has(s.uid));
    const selectedStudents = students.filter(s => selectedUids.has(s.uid));

    const toggleSelectAll = () => {
        setSelectedUids(prev => {
            if (allVisibleSelected) {
                const next = new Set(prev);
                filteredStudents.forEach(s => next.delete(s.uid));
                return next;
            }
            const next = new Set(prev);
            filteredStudents.forEach(s => next.add(s.uid));
            return next;
        });
    };

    const toggleSelect = (uid: string) => {
        setSelectedUids(prev => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid); else next.add(uid);
            return next;
        });
    };

    const handleBulkSwitch = async () => {
        if (!bulkSwitchCourseId || selectedStudents.length === 0) return;
        setBulkSwitching(true);
        const newCourse = courses.find(c => c.id === bulkSwitchCourseId);
        let succeeded = 0, failed = 0, skipped = 0;
        for (const student of selectedStudents) {
            const enrollment = student.enrollments[0];
            if (!enrollment) { skipped++; continue; }
            if (enrollment.courseId === bulkSwitchCourseId) { skipped++; continue; }
            try {
                const res = await apiFetch(`/api/enrollments/${enrollment.enrollmentId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ courseId: bulkSwitchCourseId }),
                });
                if (!res.ok) throw new Error();
                await logAudit({
                    action: AUDIT_ACTIONS.ENROLLMENT_TRANSFERRED,
                    resource: AUDIT_RESOURCES.ENROLLMENT,
                    resourceId: enrollment.enrollmentId,
                    metadata: { student: student.email, from: enrollment.courseTitle, to: newCourse?.title, bulk: true },
                });
                succeeded++;
            } catch {
                failed++;
            }
        }
        toast({
            title: "Bulk switch complete",
            description: `${succeeded} moved and notified${failed ? `, ${failed} failed` : ''}${skipped ? `, ${skipped} skipped (already there or unenrolled)` : ''}.`,
            variant: failed ? "destructive" : undefined,
        });
        setBulkSwitching(false);
        setBulkSwitchOpen(false);
        setBulkSwitchCourseId('');
        setSelectedUids(new Set());
        fetchAll();
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) return;
        if (!confirm(`Permanently delete ${selectedStudents.length} student account${selectedStudents.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
        setBulkDeleting(true);
        let succeeded = 0, failed = 0;
        for (const student of selectedStudents) {
            try {
                const res = await apiFetch(`/api/admissions/students/${student.uid}`, { method: 'DELETE' });
                if (!res.ok) throw new Error();
                await logAudit({
                    action: AUDIT_ACTIONS.USER_DELETED,
                    resource: AUDIT_RESOURCES.USER,
                    resourceId: student.uid,
                    metadata: { email: student.email, bulk: true },
                });
                succeeded++;
            } catch {
                failed++;
            }
        }
        toast({
            title: "Bulk delete complete",
            description: `${succeeded} account${succeeded === 1 ? '' : 's'} deleted${failed ? `, ${failed} failed` : ''}.`,
            variant: failed ? "destructive" : undefined,
        });
        setBulkDeleting(false);
        setSelectedUids(new Set());
        fetchAll();
    };

    const handleSwitch = async () => {
        if (!switchTarget || !switchCourseId) return;
        setSwitching(true);
        try {
            const res = await apiFetch(`/api/enrollments/${switchTarget.enrollment.enrollmentId}`, {
                method: 'PATCH',
                body: JSON.stringify({ courseId: switchCourseId }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to switch department');
            }
            const newCourse = courses.find(c => c.id === switchCourseId);
            await logAudit({
                action: AUDIT_ACTIONS.ENROLLMENT_TRANSFERRED,
                resource: AUDIT_RESOURCES.ENROLLMENT,
                resourceId: switchTarget.enrollment.enrollmentId,
                metadata: { student: switchTarget.student.email, from: switchTarget.enrollment.courseTitle, to: newCourse?.title },
            });
            toast({ title: "Department switched", description: `${switchTarget.student.displayName} has been moved and notified by email.` });
            setSwitchTarget(null);
            setSwitchCourseId('');
            fetchAll();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Switch Failed", description: error.message || "Could not switch department." });
        } finally {
            setSwitching(false);
        }
    };

    const handleAddStudent = async () => {
        if (!newStudent.displayName || !newStudent.email || !newStudent.courseId) {
            toast({ variant: "destructive", title: "Missing details", description: "Name, email, and course are required." });
            return;
        }
        setAdding(true);
        try {
            const res = await apiFetch('/api/admissions/students', {
                method: 'POST',
                body: JSON.stringify(newStudent),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to admit student');
            }
            await logAudit({
                action: AUDIT_ACTIONS.STUDENT_ADMITTED,
                resource: AUDIT_RESOURCES.USER,
                metadata: { email: newStudent.email, courseId: newStudent.courseId },
            });
            toast({ title: "Student admitted", description: `${newStudent.displayName} has been sent their login details.` });
            setIsAddOpen(false);
            setNewStudent({ displayName: '', email: '', phone: '', courseId: '' });
            fetchAll();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Admission Failed", description: error.message || "Could not admit student." });
        } finally {
            setAdding(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            const res = await apiFetch(`/api/admissions/students/${editTarget.uid}`, {
                method: 'PATCH',
                body: JSON.stringify(editForm),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to update profile');
            }
            await logAudit({
                action: AUDIT_ACTIONS.USER_UPDATED,
                resource: AUDIT_RESOURCES.USER,
                resourceId: editTarget.uid,
                metadata: { email: editForm.email },
            });
            toast({ title: "Profile updated", description: `${editForm.displayName}'s profile has been saved.` });
            setEditTarget(null);
            fetchAll();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update profile." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (student: Student) => {
        if (!confirm(`Permanently delete ${student.displayName}'s account? This cannot be undone.`)) return;
        setDeletingUid(student.uid);
        try {
            const res = await apiFetch(`/api/admissions/students/${student.uid}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to delete account');
            }
            await logAudit({
                action: AUDIT_ACTIONS.USER_DELETED,
                resource: AUDIT_RESOURCES.USER,
                resourceId: student.uid,
                metadata: { email: student.email },
            });
            toast({ title: "Account deleted", description: `${student.displayName}'s account has been removed.` });
            fetchAll();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Delete Failed", description: error.message || "Could not delete account." });
        } finally {
            setDeletingUid(null);
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Admissions
                        <Badge variant="outline" className="rounded-full px-3">{students.length} Students</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage which department every student belongs to, and admit new students.</p>
                </div>

                <Button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Add Student
                </Button>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Admit New Student</DialogTitle>
                            <DialogDescription>
                                They'll receive an email with their login and a temporary password immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="s-name">Full Name</Label>
                                <Input
                                    id="s-name"
                                    placeholder="Jane Doe"
                                    value={newStudent.displayName}
                                    onChange={(e) => setNewStudent({ ...newStudent, displayName: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s-email">Email Address</Label>
                                <Input
                                    id="s-email"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s-phone">Phone (optional)</Label>
                                <Input
                                    id="s-phone"
                                    placeholder="080..."
                                    value={newStudent.phone}
                                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Department / Course</Label>
                                <Select value={newStudent.courseId} onValueChange={(v) => setNewStudent({ ...newStudent, courseId: v })}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleAddStudent} disabled={adding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-11">
                                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Admit Student
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="bg-indigo-500 p-3 rounded-xl text-white"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
                            <p className="text-2xl font-black text-slate-900">{students.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl text-white"><GraduationCap className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departments</p>
                            <p className="text-2xl font-black text-slate-900">{Object.keys(courseCounts).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-500 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 shadow-sm w-[240px]">
                                    <SelectValue placeholder="Filter by department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={fetchAll} className="h-11 rounded-2xl border-slate-200 shadow-sm hover:bg-slate-50">
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {selectedUids.size > 0 && (
                    <div className="flex items-center gap-4 px-8 py-4 bg-indigo-50 border-b border-indigo-100">
                        <span className="text-sm font-black text-indigo-700">{selectedUids.size} selected</span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-indigo-200 bg-white font-bold text-xs h-9"
                            onClick={() => setBulkSwitchOpen(true)}
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Switch Department
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs h-9"
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                        >
                            {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                            Delete Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl font-bold text-xs h-9 text-slate-500 ml-auto"
                            onClick={() => setSelectedUids(new Set())}
                        >
                            <X className="w-3.5 h-3.5 mr-1.5" /> Clear
                        </Button>
                    </div>
                )}

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="w-[44px] pl-8 py-5">
                                    <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                                </TableHead>
                                <TableHead className="w-[60px] py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">#</TableHead>
                                <TableHead className="w-[300px] py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="h-20 bg-slate-50/30 mb-2" />
                                    </TableRow>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p className="font-bold">No students found</p>
                                            <p className="text-sm">Try adjusting your filters or search query.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <TableRow
                                        key={student.uid}
                                        data-state={selectedUids.has(student.uid) ? 'selected' : undefined}
                                        className="group hover:bg-slate-50/50 border-slate-50 transition-colors data-[state=selected]:bg-indigo-50/50"
                                    >
                                        <TableCell className="pl-8 py-4">
                                            <Checkbox
                                                checked={selectedUids.has(student.uid)}
                                                onCheckedChange={() => toggleSelect(student.uid)}
                                                aria-label={`Select ${student.displayName}`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-bold text-slate-400">{index + 1}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                        {student.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">{student.displayName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{student.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {student.enrollments.length === 0 ? (
                                                <Badge variant="outline" className="text-slate-400">Unenrolled</Badge>
                                            ) : (
                                                student.enrollments.map(en => (
                                                    <Badge key={en.enrollmentId} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none mr-1">
                                                        {en.courseTitle}
                                                    </Badge>
                                                ))
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-xl hover:bg-slate-100"
                                                        disabled={deletingUid === student.uid}
                                                    >
                                                        {deletingUid === student.uid ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                        ) : (
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Manage Student</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer"
                                                        onClick={() => {
                                                            setEditTarget(student);
                                                            setEditForm({ displayName: student.displayName, email: student.email, phone: student.phone || '' });
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Edit Profile</span>
                                                    </DropdownMenuItem>
                                                    {student.enrollments.length > 0 && (
                                                        <DropdownMenuItem
                                                            className="rounded-xl flex items-center gap-3 p-3 cursor-pointer"
                                                            onClick={() => {
                                                                setSwitchTarget({ student, enrollment: student.enrollments[0] });
                                                                setSwitchCourseId('');
                                                            }}
                                                        >
                                                            <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                                                            <span className="font-bold text-sm">Switch Department</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator className="bg-slate-50 my-2" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(student)}
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="font-bold text-sm">Delete Account</span>
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

            <Dialog open={!!switchTarget} onOpenChange={(open) => !open && setSwitchTarget(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Switch Department</DialogTitle>
                        <DialogDescription>
                            {switchTarget && (
                                <>Moving <strong>{switchTarget.student.displayName}</strong> out of <strong>{switchTarget.enrollment.courseTitle}</strong>. They'll be emailed automatically.</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label>New Department</Label>
                        <Select value={switchCourseId} onValueChange={setSwitchCourseId}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses
                                    .filter(c => c.id !== switchTarget?.enrollment.courseId)
                                    .map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSwitchTarget(null)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSwitch} disabled={switching || !switchCourseId} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-11">
                            {switching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Switch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bulkSwitchOpen} onOpenChange={(open) => { setBulkSwitchOpen(open); if (!open) setBulkSwitchCourseId(''); }}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Switch Department</DialogTitle>
                        <DialogDescription>
                            Moving <strong>{selectedStudents.length}</strong> student{selectedStudents.length === 1 ? '' : 's'} to a new department. Each will be emailed automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label>New Department</Label>
                        <Select value={bulkSwitchCourseId} onValueChange={setBulkSwitchCourseId}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setBulkSwitchOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleBulkSwitch} disabled={bulkSwitching || !bulkSwitchCourseId} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-11">
                            {bulkSwitching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Switch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Edit Profile</DialogTitle>
                        <DialogDescription>Update this student's basic details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="e-name">Full Name</Label>
                            <Input
                                id="e-name"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="e-email">Email Address</Label>
                            <Input
                                id="e-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="e-phone">Phone</Label>
                            <Input
                                id="e-phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditTarget(null)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-11">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
