"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePicker } from "@/components/FilePicker";
import { FileText, Plus, Search, Video, Presentation, Code, FileArchive, Trash2, Download, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

type ResourceType = 'PDF' | 'Video' | 'Slides' | 'Code' | 'Other';

const ACCEPT_BY_TYPE: Record<ResourceType, string> = {
    PDF: 'application/pdf',
    Video: 'video/*',
    Slides: '.ppt,.pptx',
    Code: '.zip',
    Other: '*/*',
};

export default function InstructorResourcesPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [resources, setResources] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState<{ title: string; type: ResourceType; courseId: string; url: string }>({
        title: '', type: 'PDF', courseId: '', url: '',
    });

    const fetchResources = async () => {
        try {
            const res = await apiFetch('/api/resources');
            const data = await res.json();
            if (Array.isArray(data)) setResources(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchResources();
        (async () => {
            try {
                const res = await fetch('/api/courses');
                const all = await res.json();
                if (Array.isArray(all)) {
                    setCourses(all.filter((c: any) => c.instructorUid === user.uid));
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [user]);

    const resetForm = () => setForm({ title: '', type: 'PDF', courseId: '', url: '' });

    const handleShare = async () => {
        if (!form.title.trim() || !form.courseId || !form.url) {
            toast({ variant: 'destructive', title: 'Missing details', description: 'Title, course, and a file or link are all required.' });
            return;
        }
        setSaving(true);
        try {
            const res = await apiFetch('/api/resources', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Could not share this resource.');
            }
            toast({ title: 'Resource shared', description: `Visible to everyone enrolled in that course.` });
            setOpen(false);
            resetForm();
            fetchResources();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Share failed', description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Could not delete this resource.');
            }
            setResources((prev) => prev.filter((r) => r._id !== id));
            toast({ title: 'Resource removed' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
        } finally {
            setDeletingId(null);
        }
    };

    const getResourceTypeIcon = (type: string) => {
        const ICON_CLASS = "h-8 w-8 transition-transform group-hover:scale-110 duration-300";
        switch (type.toUpperCase()) {
            case 'PDF': return <FileText className={`${ICON_CLASS} text-rose-500`} />;
            case 'VIDEO': return <Video className={`${ICON_CLASS} text-sky-500`} />;
            case 'SLIDES': return <Presentation className={`${ICON_CLASS} text-amber-500`} />;
            case 'CODE': return <Code className={`${ICON_CLASS} text-emerald-500`} />;
            default: return <FileArchive className={`${ICON_CLASS} text-slate-400`} />;
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileArchive className="w-8 h-8 text-indigo-600" />
                        Study Materials
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Share files and links with students enrolled in the courses you teach.</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-none gap-2" disabled={courses.length === 0}>
                            <Plus className="w-4 h-4" />
                            Share Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Share a Resource</DialogTitle>
                            <DialogDescription>Only students enrolled in the course you pick will see this.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Week 3 Lecture Slides"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <Select value={form.courseId} onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ResourceType, url: '' }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(['PDF', 'Video', 'Slides', 'Code', 'Other'] as ResourceType[]).map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <FilePicker
                                label="File or Link"
                                value={form.url}
                                onChange={(url) => setForm((f) => ({ ...f, url }))}
                                accept={ACCEPT_BY_TYPE[form.type]}
                                placeholder="https://..."
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleShare} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {!loading && courses.length === 0 && (
                <Card className="border-none shadow-none bg-amber-50/60 rounded-2xl">
                    <CardContent className="p-6 text-amber-800 text-sm font-medium">
                        You aren't assigned to teach any courses yet, so there's no cohort to share resources with.
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-none bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Search your shared materials..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-14 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-lg font-medium rounded-2xl"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                <Card className="border-none shadow-none bg-white/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest pl-10">Title</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Type</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Course</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Shared</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-6 pl-10"><Skeleton className="h-6 w-48" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-16" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-32" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-24" /></td>
                                            <td className="p-6 text-right pr-10"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredResources.length > 0 ? (
                                    filteredResources.map((resource) => (
                                        <tr key={resource._id} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                            <td className="p-6 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-none border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                                        {getResourceTypeIcon(resource.type)}
                                                    </div>
                                                    <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{resource.title}</p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase border-none px-2 py-0.5">
                                                    {resource.type}
                                                </Badge>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-xs font-bold text-slate-600">{resource.courseId?.title || 'General'}</p>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-xs font-bold text-slate-400">{new Date(resource.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </td>
                                            <td className="p-6 text-right pr-10">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                        onClick={() => handleDelete(resource._id)}
                                                        disabled={deletingId === resource._id}
                                                    >
                                                        {deletingId === resource._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center opacity-30 select-none">
                                            <div className="flex flex-col items-center gap-4">
                                                <FileArchive className="w-16 h-16 text-slate-300" />
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nothing Shared Yet</p>
                                                    <p className="text-sm font-bold text-slate-500">Share your first resource with one of your cohorts.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
