"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Pencil, CalendarClock, Video, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api-client';

type TimetableSession = {
    _id: string;
    weekCode: string;
    day: string;
    sessionCode: string;
    date: string;
    startTime: string;
    endTime: string;
    programmeName: string;
    courseId?: string;
    courseTitle?: string;
    module: string;
    lecturerName: string;
    instructorUid?: string;
    instructorEmail?: string;
    status: 'unassigned' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
    zoomJoinUrl?: string;
};

const STATUS_STYLES: Record<string, string> = {
    unassigned: 'bg-slate-100 text-slate-500',
    assigned: 'bg-blue-50 text-blue-700',
    scheduled: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-slate-800 text-white',
    cancelled: 'bg-red-50 text-red-600',
};

function fmtDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', { weekday: 'short', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function AdminTimetablePage() {
    const [sessions, setSessions] = useState<TimetableSession[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [weekFilter, setWeekFilter] = useState('All');
    const [instructorFilter, setInstructorFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<TimetableSession | null>(null);
    const [editInstructorUid, setEditInstructorUid] = useState('');
    const [editCourseId, setEditCourseId] = useState('');
    const [editModule, setEditModule] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editStatus, setEditStatus] = useState('assigned');
    const [saving, setSaving] = useState(false);
    const [creatingZoomId, setCreatingZoomId] = useState<string | null>(null);

    const { toast } = useToast();

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/admin/timetable');
            const data = await res.json();
            if (data.success) setSessions(data.sessions);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const res = await apiFetch('/api/users?role=instructor');
            const data = await res.json();
            if (Array.isArray(data)) setInstructors(data);
        } catch (e) { console.error(e); }
    };

    const fetchCourses = async () => {
        try {
            const res = await apiFetch('/api/courses');
            const data = await res.json();
            if (Array.isArray(data)) setCourses(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchSessions();
        fetchInstructors();
        fetchCourses();
    }, []);

    const weeks = useMemo(() => ['All', ...Array.from(new Set(sessions.map(s => s.weekCode))).sort()], [sessions]);
    const instructorOptions = useMemo(() => ['All', ...Array.from(new Set(sessions.map(s => s.lecturerName))).sort()], [sessions]);

    const filtered = sessions.filter(s => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || s.module.toLowerCase().includes(q) || s.programmeName.toLowerCase().includes(q) || s.lecturerName.toLowerCase().includes(q);
        const matchesWeek = weekFilter === 'All' || s.weekCode === weekFilter;
        const matchesInstructor = instructorFilter === 'All' || s.lecturerName === instructorFilter;
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesWeek && matchesInstructor && matchesStatus;
    });

    const openEdit = (session: TimetableSession) => {
        setEditing(session);
        setEditInstructorUid(session.instructorUid || '');
        setEditCourseId(session.courseId || '');
        setEditModule(session.module);
        setEditStartTime(new Date(session.startTime).toISOString().slice(0, 16));
        setEditEndTime(new Date(session.endTime).toISOString().slice(0, 16));
        setEditStatus(session.status);
        setEditOpen(true);
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const res = await apiFetch(`/api/admin/timetable/${editing._id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    instructorUid: editInstructorUid || undefined,
                    courseId: editCourseId || undefined,
                    module: editModule,
                    startTime: new Date(editStartTime).toISOString(),
                    endTime: new Date(editEndTime).toISOString(),
                    status: editStatus,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');
            toast({ title: 'Session updated' });
            setEditOpen(false);
            fetchSessions();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateZoom = async (session: TimetableSession) => {
        setCreatingZoomId(session._id);
        try {
            const res = await apiFetch(`/api/timetable/${session._id}/schedule-zoom`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create Zoom class');
            setSessions(prev => prev.map(s => s._id === session._id
                ? { ...s, status: 'scheduled', zoomJoinUrl: data.session.zoomJoinUrl }
                : s));
            toast({ title: 'Zoom class created', description: 'The lecturer can now start this session.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Could not create Zoom class', description: e.message });
        } finally {
            setCreatingZoomId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this session from the timetable? This cannot be undone.')) return;
        try {
            const res = await apiFetch(`/api/admin/timetable/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s._id !== id));
                toast({ title: 'Session removed' });
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarClock className="w-6 h-6 text-[#C8A96A]" /> Academy Timetable
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {sessions.length} sessions across {new Set(sessions.map(s => s.lecturerName)).size} lecturers. Reassign a lecturer, course, or time below.
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b px-6 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search module, programme, or lecturer..."
                            className="pl-10 bg-slate-50 border-none focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="h-10 px-3 bg-slate-50 border-none rounded-md text-sm text-slate-600" value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)}>
                        {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weeks' : w}</option>)}
                    </select>
                    <select className="h-10 px-3 bg-slate-50 border-none rounded-md text-sm text-slate-600 max-w-[220px]" value={instructorFilter} onChange={(e) => setInstructorFilter(e.target.value)}>
                        {instructorOptions.map(i => <option key={i} value={i}>{i === 'All' ? 'All Lecturers' : i}</option>)}
                    </select>
                    <select className="h-10 px-3 bg-slate-50 border-none rounded-md text-sm text-slate-600" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {['All', 'assigned', 'scheduled', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                    </select>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900 pl-6">Session</TableHead>
                                <TableHead className="font-bold text-slate-900">Course</TableHead>
                                <TableHead className="font-bold text-slate-900">Lecturer</TableHead>
                                <TableHead className="font-bold text-slate-900">When</TableHead>
                                <TableHead className="font-bold text-slate-900">Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((s) => (
                                <TableRow key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <p className="font-bold text-slate-700">{s.module}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{s.sessionCode}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 max-w-[220px]">
                                        {s.courseTitle || <span className="text-red-500 italic">Unmatched: {s.programmeName}</span>}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{s.lecturerName}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium">{fmtDateTime(s.startTime)}</TableCell>
                                    <TableCell>
                                        <Badge className={`${STATUS_STYLES[s.status]} border-none px-2 py-0.5 text-[10px] font-bold capitalize`}>
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-1">
                                            {s.status !== 'scheduled' && s.status !== 'completed' && s.status !== 'cancelled' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Create Zoom class"
                                                    disabled={creatingZoomId === s._id}
                                                    onClick={() => handleCreateZoom(s)}
                                                >
                                                    {creatingZoomId === s._id
                                                        ? <Loader2 className="w-4 h-4 text-[#1F7A5A] animate-spin" />
                                                        : <Video className="w-4 h-4 text-[#1F7A5A]" />}
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                                                <Pencil className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {loading && <div className="p-8 text-center text-slate-400">Loading timetable...</div>}
                    {!loading && filtered.length === 0 && <div className="p-8 text-center text-slate-400">No sessions match these filters.</div>}
                </CardContent>
            </Card>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                        <DialogDescription>{editing?.sessionCode} — {editing?.programmeName}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label>Module / Topic</Label>
                            <Input value={editModule} onChange={(e) => setEditModule(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Lecturer</Label>
                            <Select value={editInstructorUid} onValueChange={setEditInstructorUid}>
                                <SelectTrigger><SelectValue placeholder="Select a lecturer" /></SelectTrigger>
                                <SelectContent>
                                    {instructors.map(i => (
                                        <SelectItem key={i.uid} value={i.uid}>{i.displayName} ({i.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Course</Label>
                            <Select value={editCourseId} onValueChange={setEditCourseId}>
                                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((c: any) => (
                                        <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Time</Label>
                                <Input type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Time</Label>
                                <Input type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['assigned', 'scheduled', 'completed', 'cancelled', 'unassigned'].map(s => (
                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A]">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
