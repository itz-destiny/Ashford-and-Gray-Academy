"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDirectMessages, useConversationMessages } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { PlayCircle, CheckCircle2, MessageSquare, Send, Calendar, Video, BookOpen, ChevronDown, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RecordingsList } from '@/components/meeting/RecordingsList';
import { normalizeCourseContent } from '@/lib/course-content';

const tabsListClass = "bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50 w-full lg:w-fit flex-wrap";
const tabsTriggerClass = "px-5 py-2.5 rounded-xl data-[state=active]:bg-[#0B1F3A] data-[state=active]:text-white data-[state=active]:shadow-none font-black text-[10px] uppercase tracking-widest gap-1.5";

export default function CourseViewerPage() {
    const { id: courseId } = useParams();
    const { user } = useUser();
    const { toast } = useToast();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [openLesson, setOpenLesson] = useState<string | null>(null);
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat State (1:1 with instructor)
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Class group chat — every student enrolled in this course shares one
    // conversation. The conversation is auto-provisioned server-side.
    const [classChatId, setClassChatId] = useState<string | null>(null);
    const [classMessage, setClassMessage] = useState('');

    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            try {
                const [courseRes, contentRes, zoomRes, timetableRes] = await Promise.all([
                    apiFetch(`/api/courses/${courseId}`),
                    apiFetch(`/api/courses/${courseId}/content`),
                    apiFetch(`/api/courses/${courseId}/live-classes`),
                    apiFetch(`/api/courses/${courseId}/timetable`),
                ]);
                const courseData = courseRes.ok ? await courseRes.json() : null;
                const contentData = await contentRes.json();
                const zoomData = await zoomRes.json();
                const timetableData = await timetableRes.json();

                const normalized = normalizeCourseContent(contentData);
                setCourse(courseData);
                setModules(normalized.modules);
                setLessons(normalized.lessons);
                if (zoomData.success) {
                    setLiveClasses(zoomData.classes);
                }
                if (timetableData.success) {
                    setTimetable(timetableData.sessions);
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    useEffect(() => {
        if (!courseId || !user) return;
        let active = true;
        apiFetch(`/api/courses/${courseId}/class-chat`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => { if (active && data?.conversationId) setClassChatId(data.conversationId); })
            .catch((error) => console.error('Error provisioning class chat:', error));
        return () => { active = false; };
    }, [courseId, user]);

    const { messages: classMessages } = useConversationMessages(classChatId);

    const handleSendClassMessage = async () => {
        if (!classMessage.trim() || !user || !classChatId) return;
        try {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: String(courseId),
                    conversationId: classChatId,
                    courseId,
                    content: classMessage,
                }),
            });
            if (res.ok) {
                setClassMessage('');
                // Firestore listener delivers the sent message in real time.
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Chat Error", description: "Failed to send message." });
        }
    };

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

    if (loading) return <div className="p-8"><Skeleton className="h-96 w-full rounded-[32px]" /></div>;
    if (!course) return <div className="p-20 text-center text-slate-400 font-medium">Course not found</div>;

    const zoomHasStarted = liveClasses.length > 0;

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-4 md:-m-8 bg-[#FAF9F6]">
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 md:px-10 md:py-7 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-[1px] bg-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.35em]">Student Course View</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0B1F3A] tracking-tight truncate">{course.title}</h1>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 md:p-10 space-y-8">

                        {/* Zoom status notice — always shown; this is a live-class programme, not on-demand video */}
                        <div className={cn(
                            "rounded-[24px] p-6 md:p-7 flex items-start gap-5 shadow-sm",
                            zoomHasStarted ? "bg-[#0B1F3A]" : "bg-white border border-[#C8A96A]/30"
                        )}>
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                zoomHasStarted ? "bg-white/10" : "bg-[#C8A96A]/10"
                            )}>
                                <Calendar className={cn("w-5 h-5", zoomHasStarted ? "text-[#C8A96A]" : "text-[#C8A96A]")} />
                            </div>
                            <div className="flex-1 min-w-0">
                                {zoomHasStarted ? (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-1.5">Next Live Class</p>
                                        <h3 className="text-lg font-serif font-bold text-white">{liveClasses[0].topic}</h3>
                                        <p className="text-slate-300 text-sm font-medium mt-1">{new Date(liveClasses[0].startTime).toLocaleString()}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-1.5">Zoom Classes Haven't Started Yet</p>
                                        <p className="text-slate-600 text-sm font-medium leading-relaxed">Your instructor is preparing the live class timetable. Once sessions are scheduled, they'll appear here and in your <strong className="text-[#0B1F3A]">Schedule</strong> tab. In the meantime, explore your full curriculum below.</p>
                                    </>
                                )}
                            </div>
                            {zoomHasStarted && (
                                <Button asChild className="h-11 px-6 rounded-full bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.25em] shadow-none shrink-0">
                                    <a href={liveClasses[0].zoomJoinUrl} target="_blank" rel="noopener noreferrer">Join Class</a>
                                </Button>
                            )}
                        </div>

                        <Tabs defaultValue="curriculum" className="w-full">
                            <TabsList className={tabsListClass}>
                                <TabsTrigger value="curriculum" className={tabsTriggerClass}><BookOpen className="w-3 h-3" />Curriculum</TabsTrigger>
                                <TabsTrigger value="schedule" className={tabsTriggerClass}><Calendar className="w-3 h-3" />Schedule</TabsTrigger>
                                <TabsTrigger value="recordings" className={tabsTriggerClass}><Video className="w-3 h-3" />Recordings</TabsTrigger>
                                <TabsTrigger value="resources" className={tabsTriggerClass}>Resources</TabsTrigger>
                                <TabsTrigger value="assignments" className={tabsTriggerClass}>Assignments</TabsTrigger>
                                <TabsTrigger value="classmates" className={tabsTriggerClass}><Users className="w-3 h-3" />Classmates</TabsTrigger>
                                <TabsTrigger value="chat" className={tabsTriggerClass}>Ask Instructor</TabsTrigger>
                            </TabsList>

                            <TabsContent value="curriculum" className="pt-8">
                                {modules.length === 0 ? (
                                    <div className="rounded-[28px] border border-[#0B1F3A]/10 bg-gradient-to-br from-[#0B1F3A] via-[#11213B] to-[#1F7A5A] p-8 shadow-xl text-white">
                                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Live class programme</p>
                                        <h3 className="mt-4 text-2xl font-serif font-bold tracking-tight">Curriculum is being prepared</h3>
                                        <p className="mt-4 text-sm leading-7 text-slate-200/90 max-w-xl">Your instructor will publish the module breakdown here as soon as it's confirmed. Check back soon.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-[24px] border border-slate-100 overflow-hidden bg-white">
                                        {modules.map((mod: any, mIdx: number) => (
                                            <div key={mod._id} className="border-b border-slate-100 last:border-0">
                                                <div className="px-8 py-6 bg-[#FAF9F6] flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-[#C8A96A] uppercase tracking-[0.25em]">Module 0{mIdx + 1}</span>
                                                    <h3 className="font-serif text-lg text-[#0B1F3A] font-bold">{mod.title}</h3>
                                                    {mod.description && <p className="text-xs text-slate-500 font-medium mt-0.5">{mod.description}</p>}
                                                </div>
                                                <div className="py-2">
                                                    {lessons.filter(l => l.moduleId === mod._id).map((lesson: any) => {
                                                        const isOpen = openLesson === lesson._id;
                                                        return (
                                                            <div key={lesson._id} className="border-b border-slate-50 last:border-0">
                                                                <button
                                                                    onClick={() => setOpenLesson(isOpen ? null : lesson._id)}
                                                                    className="w-full text-left px-8 py-5 flex items-center gap-4 hover:bg-[#FAF9F6] transition-all group"
                                                                >
                                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 bg-slate-100 text-slate-400 group-hover:bg-slate-200">
                                                                        {lesson.isLive ? <Calendar className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold tracking-tight mb-1 text-slate-700">{lesson.title}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lesson.duration} Minutes</span>
                                                                            {lesson.isLive && <Badge className="bg-[#C8A96A]/15 text-[#B69859] border-none text-[8px] font-black uppercase tracking-tighter px-2 h-4 rounded-full">Live Session</Badge>}
                                                                        </div>
                                                                    </div>
                                                                    {lesson.completed && <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0" />}
                                                                    <ChevronDown className={cn("w-4 h-4 text-slate-300 shrink-0 transition-transform", isOpen && "rotate-180")} />
                                                                </button>
                                                                {isOpen && (
                                                                    <div className="px-8 pb-6 pl-[4.75rem]">
                                                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{lesson.content || 'Details for this lesson will be shared closer to its live session.'}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="schedule" className="pt-8">
                                {timetable.length === 0 ? (
                                    <Card className="border-none shadow-sm rounded-3xl bg-white">
                                        <CardContent className="p-10 text-center text-slate-400 text-sm font-medium">
                                            No class schedule has been published for this programme yet. Check back soon.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {timetable.map((s) => {
                                            const isPast = new Date(s.endTime).getTime() < Date.now();
                                            return (
                                                <Card key={s._id} className={cn("border-none shadow-sm rounded-2xl bg-white", isPast && "opacity-50")}>
                                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className="bg-[#0B1F3A]/5 text-[#0B1F3A] border-none text-[9px] font-black uppercase tracking-wider rounded-full">
                                                                    {s.weekCode}
                                                                </Badge>
                                                                {s.status === 'scheduled' && (
                                                                    <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] border-none text-[9px] font-black uppercase tracking-wider rounded-full">
                                                                        Zoom Ready
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="font-bold text-[#0B1F3A] truncate">{s.module}</p>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Facilitated by {s.lecturerName}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-black uppercase tracking-wider shrink-0">
                                                            {new Date(s.startTime).toLocaleString('en-NG', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                            {' · '}
                                                            {new Date(s.startTime).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
                                                            {' – '}
                                                            {new Date(s.endTime).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="recordings" className="pt-8">
                                <RecordingsList courseId={String(courseId)} />
                            </TabsContent>

                            <TabsContent value="resources" className="pt-8">
                                <Card className="border-none shadow-sm rounded-3xl bg-white">
                                    <CardContent className="p-10 text-center">
                                        <p className="font-black text-[#0B1F3A] uppercase tracking-[0.25em] text-[10px]">Resources</p>
                                        <p className="mt-3 text-sm text-slate-500 font-medium max-w-md mx-auto">Resources will appear here when your instructor shares them for this programme. Until then, please stay tuned for the live class timetable.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="assignments" className="pt-8">
                                <Card className="border-none shadow-sm rounded-3xl bg-white">
                                    <CardContent className="p-10 text-center">
                                        <p className="font-black text-[#0B1F3A] uppercase tracking-[0.25em] text-[10px]">Assignments</p>
                                        <p className="mt-3 text-sm text-slate-500 font-medium max-w-md mx-auto">No assignments have been published yet. Check back once your instructor's schedule is live.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="classmates" className="pt-8">
                                <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#0B1F3A]/5 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4 text-[#0B1F3A]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#0B1F3A] truncate">Class Group</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Everyone enrolled in {course.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                        {classMessages.map((msg) => {
                                            const isMine = msg.senderId === user?.uid;
                                            return (
                                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${isMine ? 'bg-[#0B1F3A] text-white' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                                                        {!isMine && msg.senderName && (
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-[#C8A96A] mb-1">{msg.senderName}</p>
                                                        )}
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {classMessages.length === 0 && (
                                            <div className="text-center py-16">
                                                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-400 text-sm font-medium">Say hello to your classmates!</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                                        <Input
                                            placeholder="Message the class..."
                                            value={classMessage}
                                            onChange={(e) => setClassMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendClassMessage()}
                                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#0B1F3A]/10"
                                        />
                                        <Button size="icon" onClick={handleSendClassMessage} className="h-11 w-11 rounded-xl bg-[#0B1F3A] hover:bg-[#1F7A5A] shrink-0">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="chat" className="pt-8">
                                <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${msg.senderId === user?.uid ? 'bg-[#0B1F3A] text-white' : 'bg-slate-50 text-slate-700 border border-slate-100'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {messages.length === 0 && (
                                            <div className="text-center py-16">
                                                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-400 text-sm font-medium">Have a question? Ask your instructor!</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                                        <Input
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#0B1F3A]/10"
                                        />
                                        <Button size="icon" onClick={handleSendMessage} className="h-11 w-11 rounded-xl bg-[#0B1F3A] hover:bg-[#1F7A5A] shrink-0">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
