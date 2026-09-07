"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Pencil, CalendarClock, Video, Loader2, Plus } from 'lucide-react';
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
    assigned: 'bg-sky-50 text-sky-700',
    scheduled: 'bg-[#1F7A5A]/10 text-[#1F7A5A]',
    completed: 'bg-[#0B1F3A] text-white',
    cancelled: 'bg-red-50 text-red-600',
};

function fmtDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', { weekday: 'short', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function CourseRegistrarTimetablePage() {
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

    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [scheduleCourseId, setScheduleCourseId] = useState('');
    const [scheduleInstructorUid, setScheduleInstructorUid] = useState('');
    const [scheduleModule, setScheduleModule] = useState('');
    const [scheduleStartTime, setScheduleStartTime] = useState('');
    const [scheduleDuration, setScheduleDuration] = useState('60');
    const [scheduling, setScheduling] = useState(false);

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

    const resetScheduleForm = () => {
        setScheduleCourseId('');
        setScheduleInstructorUid('');
        setScheduleModule('');
        setScheduleStartTime('');
        setScheduleDuration('60');
    };

    const handleScheduleNewClass = async () => {
        if (!scheduleCourseId || !scheduleModule || !scheduleStartTime || !scheduleInstructorUid) {
            toast({ variant: 'destructive', title: 'Missing details', description: 'Course, lecturer, topic, and start time are all required to create the Zoom class.' });
            return;
        }
        setScheduling(true);
        try {
            const createRes = await apiFetch('/api/admin/timetable', {
                method: 'POST',
                body: JSON.stringify({
                    courseId: scheduleCourseId,
                    instructorUid: scheduleInstructorUid || undefined,
                    module: scheduleModule,
                    startTime: new Date(scheduleStartTime).toISOString(),
                    durationMinutes: Number(scheduleDuration) || 60,
                }),
            });
            const createData = await createRes.json();
            if (!createRes.ok) throw new Error(createData.error || 'Failed to create the session');

            // Immediately create the real Zoom meeting too, so this is a
            // genuine one-click "schedule a class" action, not a two-step one.
            const zoomRes = await apiFetch(`/api/timetable/${createData.session._id}/schedule-zoom`, { method: 'POST' });
            const zoomData = await zoomRes.json();
            if (!zoomRes.ok) {
                toast({
                    variant: 'destructive',
                    title: 'Session created, but Zoom setup failed',
                    description: zoomData.error || 'You can retry creating the Zoom class from the table below.',
                });
            } else {
                toast({ title: 'Class scheduled', description: 'The Zoom meeting has been created and is ready.' });
            }

            setScheduleOpen(false);
            resetScheduleForm();
            fetchSessions();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Could not schedule class', description: e.message });
        } finally {
            setScheduling(false);
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
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        <CalendarClock className="w-8 h-8 text-[#C8A96A]" /> Academy Timetable
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">
                        {sessions.length} sessions across {new Set(sessions.map(s => s.lecturerName)).size} lecturers. Assign a lecturer, course, and time, then create the Zoom class from here.
                    </p>
                </div>
                <Button
                    onClick={() => setScheduleOpen(true)}
                    className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none"
                >
                    <Plus className="h-4 w-4 mr-2" /> Schedule New Class
                </Button>
            </div>

            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-[#0B1F3A]/5 px-8 py-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search module, programme, or lecturer..."
                            className="pl-10 h-11 bg-[#F6F4F2] border-none rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="h-11 px-3 bg-[#F6F4F2] border-none rounded-none text-sm text-[#0B1F3A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C8A96A]" value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)}>
                        {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weeks' : w}</option>)}
                    </select>
                    <select className="h-11 px-3 bg-[#F6F4F2] border-none rounded-none text-sm text-[#0B1F3A] font-medium max-w-[220px] focus:outline-none focus:ring-1 focus:ring-[#C8A96A]" value={instructorFilter} onChange={(e) => setInstructorFilter(e.target.value)}>
                        {instructorOptions.map(i => <option key={i} value={i}>{i === 'All' ? 'All Lecturers' : i}</option>)}
                    </select>
                    <select className="h-11 px-3 bg-[#F6F4F2] border-none rounded-none text-sm text-[#0B1F3A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C8A96A]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {['All', 'assigned', 'scheduled', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                    </select>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#F6F4F2]/60">
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8">Session</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Course</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Lecturer</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">When</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((s) => (
                                <TableRow key={s._id} className="hover:bg-[#F6F4F2]/50 border-[#0B1F3A]/5 transition-colors">
                                    <TableCell className="pl-8 py-4">
                                        <p className="font-bold text-[#0B1F3A]">{s.module}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{s.sessionCode}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 max-w-[220px]">
                                        {s.courseTitle || <span className="text-red-500 italic">Unmatched: {s.programmeName}</span>}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{s.lecturerName}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-medium">{fmtDateTime(s.startTime)}</TableCell>
                                    <TableCell>
                                        <Badge className={`${STATUS_STYLES[s.status]} border-none rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest`}>
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-1">
                                            {s.status !== 'scheduled' && s.status !== 'completed' && s.status !== 'cancelled' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Create Zoom class"
                                                    disabled={creatingZoomId === s._id}
                                                    className="rounded-none hover:bg-[#1F7A5A]/10"
                                                    onClick={() => handleCreateZoom(s)}
                                                >
                                                    {creatingZoomId === s._id
                                                        ? <Loader2 className="w-4 h-4 text-[#1F7A5A] animate-spin" />
                                                        : <Video className="w-4 h-4 text-[#1F7A5A]" />}
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="rounded-none hover:bg-[#0B1F3A]/5" onClick={() => openEdit(s)}>
                                                <Pencil className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-none hover:bg-red-50" onClick={() => handleDelete(s._id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {loading && <div className="p-16 text-center text-slate-400 font-serif italic">Loading timetable...</div>}
                    {!loading && filtered.length === 0 && <div className="p-16 text-center text-slate-400 font-serif italic">No sessions match these filters.</div>}
                </CardContent>
            </Card>

            <Dialog open={scheduleOpen} onOpenChange={(open) => { setScheduleOpen(open); if (!open) resetScheduleForm(); }}>
                <DialogContent className="sm:max-w-[480px] rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#0B1F3A]">Schedule New Class</DialogTitle>
                        <DialogDescription>
                            Creates the timetable session and its real Zoom meeting together. Instructors can only start a class once it's been created here — never on their own.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label>Course</Label>
                            <Select value={scheduleCourseId} onValueChange={setScheduleCourseId}>
                                <SelectTrigger className="rounded-none"><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((c: any) => (
                                        <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Lecturer</Label>
                            <Select value={scheduleInstructorUid} onValueChange={setScheduleInstructorUid}>
                                <SelectTrigger className="rounded-none"><SelectValue placeholder="Select a lecturer" /></SelectTrigger>
                                <SelectContent>
                                    {instructors.map(i => (
                                        <SelectItem key={i.uid} value={i.uid}>{i.displayName} ({i.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Module / Topic</Label>
                            <Input
                                className="rounded-none"
                                placeholder="e.g. Introduction to Housekeeping"
                                value={scheduleModule}
                                onChange={(e) => setScheduleModule(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Time</Label>
                                <Input
                                    className="rounded-none"
                                    type="datetime-local"
                                    value={scheduleStartTime}
                                    onChange={(e) => setScheduleStartTime(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Duration (minutes)</Label>
                                <Input
                                    className="rounded-none"
                                    type="number"
                                    min={15}
                                    max={300}
                                    value={scheduleDuration}
                                    onChange={(e) => setScheduleDuration(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-none" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleScheduleNewClass}
                            disabled={scheduling}
                            className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white rounded-none font-black text-[10px] uppercase tracking-widest"
                        >
                            {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                            {scheduling ? 'Scheduling...' : 'Schedule & Create Zoom'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#0B1F3A]">Edit Session</DialogTitle>
                        <DialogDescription>{editing?.sessionCode} — {editing?.programmeName}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label>Module / Topic</Label>
                            <Input className="rounded-none" value={editModule} onChange={(e) => setEditModule(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Lecturer</Label>
                            <Select value={editInstructorUid} onValueChange={setEditInstructorUid}>
                                <SelectTrigger className="rounded-none"><SelectValue placeholder="Select a lecturer" /></SelectTrigger>
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
                                <SelectTrigger className="rounded-none"><SelectValue placeholder="Select a course" /></SelectTrigger>
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
                                <Input className="rounded-none" type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Time</Label>
                                <Input className="rounded-none" type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['assigned', 'scheduled', 'completed', 'cancelled', 'unassigned'].map(s => (
                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-none" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white rounded-none font-black text-[10px] uppercase tracking-widest">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
