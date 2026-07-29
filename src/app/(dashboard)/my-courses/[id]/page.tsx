"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useDirectMessages } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { PlayCircle, CheckCircle2, MessageSquare, FileText, Send, Calendar, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RecordingsList } from '@/components/meeting/RecordingsList';
import { normalizeCourseContent } from '@/lib/course-content';

export default function CourseViewerPage() {
    const { id: courseId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            try {
                const [courseRes, contentRes, zoomRes] = await Promise.all([
                    fetch(`/api/courses?id=${courseId}`),
                    fetch(`/api/courses/${courseId}/content`),
                    fetch(`/api/courses/${courseId}/live-classes`)
                ]);
                const courseData = await courseRes.json();
                const contentData = await contentRes.json();
                const zoomData = await zoomRes.json();

                const normalized = normalizeCourseContent(contentData);
                setCourse(courseData);
                setModules(normalized.modules);
                setLessons(normalized.lessons);
                setCurrentLesson(normalized.currentLesson);
                if (zoomData.success) {
                    setLiveClasses(zoomData.classes);
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    // Realtime DMs with the course instructor — replaces 5s polling.
    const instructorUid = course?.instructorUid as string | undefined;
    const rtCourseMessages = useDirectMessages(user?.uid ?? null, instructorUid ?? null);
    useEffect(() => {
        if (!instructorUid) {
            setMessages([]);
            return;
        }
        setMessages(
            rtCourseMessages.map((m) => ({
                _id: m.id,
                senderId: m.senderId,
                receiverId: m.receiverId,
                content: m.content,
                createdAt: m.createdAt,
            }))
        );
    }, [rtCourseMessages, instructorUid]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !course) return;

        const msg = {
            receiverId: course.instructorUid || course.instructor?.name,
            courseId,
            content: newMessage,
        };

        try {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify(msg),
            });
            if (res.ok) {
                setNewMessage('');
                // Firestore listener delivers the sent message in real time.
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Chat Error", description: "Failed to send message." });
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
    if (!course) return <div>Course not found</div>;

    return (
        <Dialog>
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-4 md:-m-8">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex flex-col gap-4 p-4 border-b bg-white md:flex-row md:items-center md:justify-between md:p-6">
                        <div className="min-w-0 space-y-2">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Student course view</p>
                            <h1 className="text-2xl font-bold text-slate-900 truncate">{course.title}</h1>
                        </div>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                                View Curriculum
                            </Button>
                        </DialogTrigger>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 md:p-8 space-y-6">
                        {/* Player Placeholder */}
                        {currentLesson ? (
                            <div className="space-y-6">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                                    {currentLesson.videoUrl ? (
                                        <iframe
                                            src={currentLesson.videoUrl}
                                            className="w-full h-full"
                                            allow="autoplay; fullscreen"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
                                            {currentLesson.isLive ? (
                                                liveClasses.length > 0 ? (
                                                    <>
                                                        <Calendar className="w-16 h-16 text-[#C8A96A] mb-4 animate-pulse" />
                                                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Next Live Class: {liveClasses[0].topic}</h2>
                                                        <p className="opacity-70 mt-4 text-slate-300 font-medium">Scheduled for: {new Date(liveClasses[0].startTime).toLocaleString()}</p>
                                                        <div className="flex gap-4 mt-8">
                                                            <Button asChild className="h-16 px-10 rounded-full bg-gradient-to-r from-[#1F7A5A] to-[#0B5F47] text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl">
                                                                <a href={liveClasses[0].zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                                                                    Join Zoom Class
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="w-16 h-16 text-indigo-400 mb-4" />
                                                        <h2 className="text-2xl font-bold">No Zoom classes scheduled yet</h2>
                                                        <p className="opacity-70 mt-2">This programme is delivered through live sessions. If no time is published yet, please hold on and check your timetable for the latest announcement.</p>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <FileText className="w-16 h-16 text-indigo-400 mb-4" />
                                                    <h2 className="text-2xl font-bold">Content is coming soon</h2>
                                                    <p className="opacity-70 mt-2">Check back later for updates.</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-[1px] bg-[#C8A96A]" />
                                            <p className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.4em]">Current Lesson</p>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1F3A] tracking-tight">{currentLesson.title}</h2>
                                        <p className="text-slate-500 mt-2 font-medium">{course.title} • Module 0{modules.findIndex(m => m._id === currentLesson.moduleId) + 1}</p>
                                    </div>
                                    <Button size="lg" className="h-16 px-10 rounded-full bg-gradient-to-r from-[#0B1F3A] to-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl">
                                        Mark as Complete
                                    </Button>
                                </div>

                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 lg:w-fit">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="recordings"><Video className="w-3 h-3 mr-1" />Recordings</TabsTrigger>
                                        <TabsTrigger value="resources">Resources</TabsTrigger>
                                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                        <TabsTrigger value="chat">Chat</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="pt-6">
                                        <div className="prose max-w-none">
                                            <p>{currentLesson.content || 'This lesson has not been published yet. Your instructor will share the live class details and any relevant resources through the timetable and resources section.'}</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="recordings" className="pt-6">
                                        <RecordingsList courseId={String(courseId)} />
                                    </TabsContent>
                                    <TabsContent value="resources" className="pt-6">
                                        <Card>
                                            <CardContent className="p-6 flex flex-col gap-4">
                                                <div className="rounded-3xl bg-white shadow-lg p-6 text-center border border-transparent">
                                                    <p className="font-black text-[#0B1F3A] uppercase tracking-[0.25em] text-[10px]">Resources</p>
                                                    <p className="mt-3 text-sm text-slate-600 font-medium">Resources will appear here when your instructor shares them for this programme. Until then, please stay tuned for the live class timetable.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="assignments" className="pt-6">
                                        <div className="space-y-4">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Module Assignment</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-slate-600">No specific assignment for this lesson. Check the module footer for final tasks.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="chat" className="pt-6">
                                        <div className="flex flex-col h-[500px] bg-slate-50 rounded-xl border overflow-hidden">
                                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                                {messages.map((msg, i) => (
                                                    <div key={i} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 border'
                                                            }`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {messages.length === 0 && (
                                                    <div className="text-center py-12">
                                                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                        <p className="text-slate-400 text-sm">Have a question? Ask your instructor!</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-white border-t flex gap-2">
                                                <Input
                                                    placeholder="Type your message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                />
                                                <Button size="icon" onClick={handleSendMessage}>
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <PlayCircle className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-slate-400">Select a lesson to start learning</h2>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>

        <DialogContent className="sm:max-w-5xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-3xl font-serif font-bold tracking-tight text-slate-900">Curriculum</DialogTitle>
                <DialogDescription className="mt-3 text-sm text-slate-500">
                    Explore all modules and lessons for this course. Select a lesson to continue learning.
                </DialogDescription>
            </DialogHeader>
            <div className="px-8 pb-8">
                {modules.length === 0 ? (
                    <div className="rounded-[32px] border border-[#0B1F3A]/10 bg-gradient-to-br from-[#0B1F3A] via-[#11213B] to-[#1F7A5A] p-8 shadow-2xl text-white">
                        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Live class programme</p>
                                <h3 className="mt-4 text-2xl font-serif font-bold tracking-tight">Class schedule is being prepared</h3>
                            </div>
                            <div className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#F8FAFC]">Instructor-led</div>
                        </div>
                        <p className="mt-6 text-sm leading-7 text-slate-200/90">
                            This course is delivered through live sessions. Your instructor will publish the lesson schedule and module breakdown here as soon as it is confirmed.
                        </p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <Button asChild className="h-14 rounded-2xl bg-[#C8A96A] text-[#0B1F3A] font-black uppercase tracking-[0.2em] hover:bg-[#E3D09A]">
                                <Link href="/my-courses">View course dashboard</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-14 rounded-2xl border-white/20 text-white font-black uppercase tracking-[0.2em] hover:bg-white/10">
                                <Link href="/courses">Browse other live programmes</Link>
                            </Button>
                        </div>
                    </div>
                ) : modules.map((mod: any, mIdx: number) => (
                    <div key={mod._id} className="border-b border-slate-100 last:border-0">
                        <div className="px-8 py-6 bg-slate-50/50 flex flex-col gap-1">
                            <span className="text-[9px] font-black text-[#C8A96A] uppercase tracking-[0.2em]">Module 0{mIdx + 1}</span>
                            <h3 className="font-serif text-lg text-[#0B1F3A] font-bold">{mod.title}</h3>
                        </div>
                        <div className="py-2">
                            {lessons.filter(l => l.moduleId === mod._id).map((lesson: any) => (
                                <button
                                    key={lesson._id}
                                    onClick={() => setCurrentLesson(lesson)}
                                    className={`w-full text-left px-8 py-5 flex items-center gap-4 hover:bg-slate-50 transition-all group ${currentLesson?._id === lesson._id ? 'bg-slate-50 border-r-4 border-[#1F7A5A]' : ''}`}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        currentLesson?._id === lesson._id ? "bg-[#1F7A5A] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        {lesson.isLive ? <Calendar className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-bold tracking-tight mb-1",
                                            currentLesson?._id === lesson._id ? "text-[#0B1F3A]" : "text-slate-600"
                                        )}>{lesson.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lesson.duration} Minutes</span>
                                            {lesson.isLive && <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] font-black uppercase tracking-tighter px-2 h-4">Live</Badge>}
                                        </div>
                                    </div>
                                    {lesson.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
    </Dialog>
    );
}
