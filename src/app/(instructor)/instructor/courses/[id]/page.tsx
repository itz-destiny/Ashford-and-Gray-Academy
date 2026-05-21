"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, BookOpen, Plus, Trash2, Video, Edit2, Send, Users, Loader2, Calendar, PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecordingsList } from "@/components/meeting/RecordingsList";

type Course = {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    price: number;
    duration: number;
    imageUrl: string;
    status: 'draft' | 'pending' | 'published' | 'archived';
    enrollmentCount?: number;
    instructorUid?: string;
    instructor?: { name: string };
    whoFor?: string[];
    certificationDetails?: string[];
    careerOpportunities?: string[];
};

type Module = { _id: string; courseId: string; title: string; description?: string; order: number };
type Lesson = { _id: string; moduleId: string; title: string; content?: string; videoUrl?: string; duration?: number; isLive?: boolean; scheduledAt?: string };

export default function ManageCoursePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        price: 0,
        category: "",
        level: "",
        whoFor: "",
        certificationDetails: "",
        careerOpportunities: "",
    });
    const [saving, setSaving] = useState(false);

    // Add-module / add-lesson state
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [newLesson, setNewLesson] = useState<Record<string, { title: string; videoUrl: string; isLive: boolean; scheduledAt: string }>>({});
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (userLoading || !user || !id) return;
        const load = async () => {
            try {
                const [courseRes, contentRes] = await Promise.all([
                    apiFetch('/api/courses'),
                    apiFetch(`/api/courses/${id}/content`),
                ]);
                const [allCourses, content] = await Promise.all([courseRes.json(), contentRes.json()]);
                const mine = Array.isArray(allCourses)
                    ? allCourses.find((c: any) => (c._id || c.id) === id)
                    : null;
                if (!mine) {
                    toast({ variant: "destructive", title: "Course not found", description: "It may have been deleted." });
                    router.push('/instructor/courses');
                    return;
                }
                setCourse(mine);
                setEditForm({
                    title: mine.title || '',
                    description: mine.description || '',
                    price: mine.price ?? 0,
                    category: mine.category || '',
                    level: mine.level || '',
                    whoFor: Array.isArray(mine.whoFor) ? mine.whoFor.join('\n') : '',
                    certificationDetails: Array.isArray(mine.certificationDetails) ? mine.certificationDetails.join('\n') : '',
                    careerOpportunities: Array.isArray(mine.careerOpportunities) ? mine.careerOpportunities.join('\n') : '',
                });
                setModules(content.modules || []);
                setLessons(content.lessons || []);
            } catch (err) {
                console.error('manage course load failed:', err);
                toast({ variant: "destructive", title: "Load failed", description: "Could not load course." });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user, userLoading, router, toast]);

    const splitLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);

    const handleSaveCourse = async () => {
        setSaving(true);
        try {
            const res = await apiFetch(`/api/courses/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    price: Number(editForm.price) || 0,
                    category: editForm.category,
                    level: editForm.level,
                    whoFor: splitLines(editForm.whoFor),
                    certificationDetails: splitLines(editForm.certificationDetails),
                    careerOpportunities: splitLines(editForm.careerOpportunities),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Update failed');
            }
            const updated = await res.json();
            setCourse(updated);
            toast({ title: "Saved", description: "Course details updated." });
            setEditOpen(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err?.message || 'Try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        setAdding(true);
        try {
            const res = await apiFetch(`/api/courses/${id}/content`, {
                method: 'POST',
                body: JSON.stringify({ type: 'module', data: { title: newModuleTitle } }),
            });
            if (!res.ok) throw new Error('Failed to add module.');
            const created = await res.json();
            setModules(m => [...m, created]);
            setNewModuleTitle("");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Failed", description: err?.message });
        } finally {
            setAdding(false);
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        const form = newLesson[moduleId];
        if (!form || !form.title.trim()) return;
        setAdding(true);
        try {
            const payload: any = {
                moduleId,
                title: form.title,
                isLive: form.isLive,
            };
            if (form.videoUrl) payload.videoUrl = form.videoUrl;
            if (form.isLive && form.scheduledAt) payload.scheduledAt = new Date(form.scheduledAt).toISOString();
            const res = await apiFetch(`/api/courses/${id}/content`, {
                method: 'POST',
                body: JSON.stringify({ type: 'lesson', data: payload }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to add lesson.');
            }
            const created = await res.json();
            setLessons(l => [...l, created]);
            setNewLesson(prev => ({ ...prev, [moduleId]: { title: "", videoUrl: "", isLive: false, scheduledAt: "" } }));
        } catch (err: any) {
            toast({ variant: "destructive", title: "Failed", description: err?.message });
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete this lesson?')) return;
        try {
            const res = await apiFetch(`/api/courses/${id}/content?type=lesson&id=${lessonId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed.');
            setLessons(l => l.filter(x => x._id !== lessonId));
        } catch (err: any) {
            toast({ variant: "destructive", title: "Failed", description: err?.message });
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Delete this module and all its lessons?')) return;
        try {
            const res = await apiFetch(`/api/courses/${id}/content?type=module&id=${moduleId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed.');
            setModules(m => m.filter(x => x._id !== moduleId));
            setLessons(l => l.filter(x => x.moduleId !== moduleId));
        } catch (err: any) {
            toast({ variant: "destructive", title: "Failed", description: err?.message });
        }
    };

    const handleRequestPublish = async () => {
        try {
            const res = await apiFetch(`/api/courses/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'pending' }),
            });
            if (!res.ok) throw new Error('Failed');
            const updated = await res.json();
            setCourse(updated);
            toast({ title: "Submitted for review", description: "A registrar will review and publish your course." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Submit failed", description: err?.message });
        }
    };

    if (loading || userLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    if (!course) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button asChild variant="ghost" size="icon" className="mt-1 rounded-2xl">
                        <Link href="/instructor/courses"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">{course.title}</h1>
                            <Badge className={cn(
                                "border-none font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5",
                                course.status === 'published' ? "bg-emerald-100 text-emerald-700"
                                : course.status === 'pending' ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            )}>{course.status}</Badge>
                        </div>
                        <p className="text-slate-500 font-medium italic">{course.category} · {course.level} · ${course.price}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl font-bold gap-2"><Edit2 className="h-4 w-4" /> Edit details</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit course details</DialogTitle>
                                <DialogDescription>Update title, description, price and level.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
                                <div><Label>Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                                <div><Label>Overview / description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><Label>Category</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
                                    <div><Label>Level</Label><Input value={editForm.level} onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))} /></div>
                                </div>
                                <div><Label>Price</Label><Input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
                                <div>
                                    <Label>Who this is for (one per line)</Label>
                                    <Textarea
                                        value={editForm.whoFor}
                                        onChange={e => setEditForm(f => ({ ...f, whoFor: e.target.value }))}
                                        rows={4}
                                        placeholder={'Aspiring hospitality professionals\nHotel and guest service personnel\nButlers and concierge professionals'}
                                    />
                                </div>
                                <div>
                                    <Label>Certification details (one per line)</Label>
                                    <Textarea
                                        value={editForm.certificationDetails}
                                        onChange={e => setEditForm(f => ({ ...f, certificationDetails: e.target.value }))}
                                        rows={3}
                                        placeholder={'Professional Certificate in Hospitality Management\nExecutive Hospitality Skills Recognition\nPractical Competency Assessment Report'}
                                    />
                                </div>
                                <div>
                                    <Label>Career opportunities (one per line)</Label>
                                    <Textarea
                                        value={editForm.careerOpportunities}
                                        onChange={e => setEditForm(f => ({ ...f, careerOpportunities: e.target.value }))}
                                        rows={5}
                                        placeholder={'Hospitality Managers\nGuest Relations Officers\nConcierge Professionals'}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveCourse} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {course.status !== 'published' && course.status !== 'pending' && (
                        <Button onClick={handleRequestPublish} variant="outline" className="rounded-xl font-bold gap-2">
                            <Send className="h-4 w-4" /> Submit for review
                        </Button>
                    )}
                    <Button asChild className="bg-[#1F7A5A] hover:bg-[#1F7A5A]/90 text-white rounded-xl font-bold gap-2">
                        <Link href={`/live-classes/course-${course._id}`}>
                            <Video className="h-4 w-4" /> Start Live Class
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-2xl"><Users className="h-5 w-5 text-indigo-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">{course.enrollmentCount ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl"><BookOpen className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">{modules.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl"><PlayCircle className="h-5 w-5 text-orange-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lessons</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">{lessons.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <RecordingsList courseId={String(id)} />

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A]">Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex gap-3">
                        <Input
                            placeholder="New module title…"
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleAddModule} disabled={adding || !newModuleTitle.trim()} className="bg-[#0B1F3A] text-white font-bold rounded-xl gap-2">
                            <Plus className="h-4 w-4" /> Add module
                        </Button>
                    </div>

                    {modules.length === 0 ? (
                        <p className="text-sm text-slate-400 font-bold italic text-center py-8">No modules yet. Add your first module above.</p>
                    ) : (
                        <div className="space-y-6">
                            {modules.sort((a, b) => a.order - b.order).map(mod => (
                                <div key={mod._id} className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                                        <h3 className="font-black text-[#0B1F3A]">{mod.title}</h3>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(mod._id)}>
                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                        </Button>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {lessons.filter(l => l.moduleId === mod._id).map(lesson => (
                                            <div key={lesson._id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {lesson.isLive ? <Calendar className="h-4 w-4 text-orange-500 shrink-0" /> : <PlayCircle className="h-4 w-4 text-slate-400 shrink-0" />}
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#0B1F3A] truncate">{lesson.title}</p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {lesson.isLive ? `Live · ${lesson.scheduledAt ? new Date(lesson.scheduledAt).toLocaleString() : 'unscheduled'}` : (lesson.videoUrl || 'no video')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson._id)}>
                                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        ))}

                                        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto] items-center pt-3 border-t border-slate-50">
                                            <Input
                                                placeholder="Lesson title…"
                                                value={newLesson[mod._id]?.title || ""}
                                                onChange={e => setNewLesson(prev => ({ ...prev, [mod._id]: { ...prev[mod._id], title: e.target.value, videoUrl: prev[mod._id]?.videoUrl || "", isLive: prev[mod._id]?.isLive || false, scheduledAt: prev[mod._id]?.scheduledAt || "" } }))}
                                            />
                                            {newLesson[mod._id]?.isLive ? (
                                                <Input
                                                    type="datetime-local"
                                                    value={newLesson[mod._id]?.scheduledAt || ""}
                                                    onChange={e => setNewLesson(prev => ({ ...prev, [mod._id]: { ...prev[mod._id], scheduledAt: e.target.value } }))}
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="Video URL (optional)"
                                                    value={newLesson[mod._id]?.videoUrl || ""}
                                                    onChange={e => setNewLesson(prev => ({ ...prev, [mod._id]: { ...prev[mod._id], videoUrl: e.target.value } }))}
                                                />
                                            )}
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <input
                                                    type="checkbox"
                                                    checked={newLesson[mod._id]?.isLive || false}
                                                    onChange={e => setNewLesson(prev => ({ ...prev, [mod._id]: { ...prev[mod._id], isLive: e.target.checked, title: prev[mod._id]?.title || "", videoUrl: prev[mod._id]?.videoUrl || "", scheduledAt: prev[mod._id]?.scheduledAt || "" } }))}
                                                />
                                                Live class
                                            </label>
                                            <Button
                                                onClick={() => handleAddLesson(mod._id)}
                                                disabled={adding || !newLesson[mod._id]?.title?.trim()}
                                                className="bg-[#1F7A5A] hover:bg-[#1F7A5A]/90 text-white rounded-xl font-bold gap-2"
                                            >
                                                <Plus className="h-4 w-4" /> Add lesson
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
