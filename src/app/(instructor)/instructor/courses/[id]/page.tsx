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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, Video, Edit2, Send, Users, Loader2,
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

export default function ManageCoursePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
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

    // Zoom classes for this course are read-only here — they come from the
    // academy timetable (see /instructor/schedule), not free-form scheduling.
    const [liveClasses, setLiveClasses] = useState<any[]>([]);

    useEffect(() => {
        if (userLoading || !user || !id) return;
        const load = async () => {
            try {
                const [courseRes, zoomRes] = await Promise.all([
                    apiFetch('/api/courses'),
                    apiFetch(`/api/courses/${id}/live-classes`)
                ]);
                const [allCourses, zoomData] = await Promise.all([
                    courseRes.json(),
                    zoomRes.json()
                ]);
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
                if (zoomData.success) {
                    setLiveClasses(zoomData.classes);
                }
            } catch (err) {
                console.error("Failed to load course details", err);
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
                        <p className="text-slate-500 font-medium italic">{course.category} · {course.level}</p>
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
                                <DialogDescription>Update title, description, category and level.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
                                <div><Label>Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                                <div><Label>Overview / description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><Label>Category</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
                                    <div><Label>Level</Label><Input value={editForm.level} onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))} /></div>
                                </div>
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
                        <Link href="/instructor/schedule">
                            <Video className="h-4 w-4" /> My Schedule
                        </Link>
                    </Button>
                </div>
            </div>

            {liveClasses.length > 0 && (
                <Card className="border-none bg-indigo-50/50 rounded-[2.5rem] shadow-sm">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                            <Video className="h-5 w-5 text-indigo-600" /> Scheduled Zoom Classes
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 font-medium">
                            Class times come from the academy timetable. Manage them from{" "}
                            <Link href="/instructor/schedule" className="underline font-bold text-[#1F7A5A]">My Schedule</Link>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                        {liveClasses.map(cls => (
                            <div key={cls._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm gap-4">
                                <div>
                                    <h4 className="font-bold text-[#0B1F3A]">{cls.topic}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{new Date(cls.startTime).toLocaleString()} · {cls.durationMinutes} mins</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                                        <a href={cls.zoomJoinUrl} target="_blank" rel="noopener noreferrer">Guest Link</a>
                                    </Button>
                                    <Button asChild size="sm" className="bg-[#1F7A5A] text-white rounded-xl">
                                        <Link href={`/live-classes/${cls._id}`}>Start as Host</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="border-none bg-white rounded-[2rem] shadow-sm max-w-xs">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl"><Users className="h-5 w-5 text-indigo-600" /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
                        <p className="text-2xl font-black text-[#0B1F3A]">{course.enrollmentCount ?? 0}</p>
                    </div>
                </CardContent>
            </Card>

            <RecordingsList courseId={String(id)} />
        </div>
    );
}
