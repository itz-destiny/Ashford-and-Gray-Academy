"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ChevronRight, PlayCircle, CheckCircle2, MessageSquare, FileText, Lock, Menu, X, Send, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseViewerPage() {
    const { id: courseId } = useParams();
    const { user } = useUser();
    const { toast } = useToast();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            try {
                const [courseRes, contentRes] = await Promise.all([
                    fetch(`/api/courses?id=${courseId}`),
                    fetch(`/api/courses/${courseId}/content`)
                ]);
                const courseData = await courseRes.json();
                const contentData = await contentRes.json();

                setCourse(courseData);
                setModules(contentData.modules);
                setLessons(contentData.lessons);

                if (contentData.lessons.length > 0) {
                    setCurrentLesson(contentData.lessons[0]);
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
        if (!user || !course) return;

        const fetchMessages = async () => {
            const res = await fetch(`/api/messages?userId=${user.uid}&contactId=${course.instructor.name}&courseId=${courseId}`);
            const data = await res.json();
            setMessages(data);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll for messages
        return () => clearInterval(interval);
    }, [user, course, courseId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !course) return;

        const msg = {
            senderId: user.uid,
            receiverId: course.instructor.name, // In a real app, use instructor UID
            courseId,
            content: newMessage,
        };

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg),
            });
            if (res.ok) {
                const savedMsg = await res.json();
                setMessages([...messages, savedMsg]);
                setNewMessage('');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Chat Error", description: "Failed to send message." });
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-4 md:-m-8">
            {/* Sidebar - Course Content */}
            <aside className={`${isSidebarOpen ? 'w-96' : 'w-0'} bg-white border-r transition-all duration-500 flex flex-col overflow-hidden shadow-2xl z-20`}>
                <div className="p-8 border-b flex justify-between items-center bg-[#0B1F3A] text-white">
                    <div>
                        <h2 className="font-serif text-xl font-bold tracking-tight">Curriculum</h2>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#C8A96A] mt-1 font-black">Program Modules</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto bg-white">
                    {modules.map((mod: any, mIdx: number) => (
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
                                        className={`w-full text-left px-8 py-5 flex items-center gap-4 hover:bg-slate-50 transition-all group ${currentLesson?._id === lesson._id ? 'bg-slate-50 border-r-4 border-[#1F7A5A]' : ''
                                            }`}
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
            </aside>

            {/* Main Content - Player & Tabs */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                {!isSidebarOpen && (
                    <div className="flex items-center gap-4 p-4 border-b bg-white">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold truncate">{course.title}</h1>
                    </div>
                )}

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
                                                <>
                                                    <Calendar className="w-16 h-16 text-[#C8A96A] mb-4 animate-pulse" />
                                                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Live Class Scheduled</h2>
                                                    <p className="opacity-70 mt-4 text-slate-300 font-medium">{new Date(currentLesson.scheduledAt).toLocaleString()}</p>
                                                    <div className="flex gap-4 mt-8">
                                                        <Button 
                                                            className="h-16 px-10 rounded-full bg-[#1F7A5A] hover:bg-[#1F7A5A]/90 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
                                                            onClick={() => router.push(`/meeting/${courseId}`)}
                                                        >
                                                            Join Live Session
                                                        </Button>
                                                        <Button variant="outline" className="h-16 px-10 rounded-full border-white/20 text-white hover:bg-white/10 font-bold">
                                                            Add to Calendar
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-16 h-16 text-indigo-400 mb-4" />
                                                    <h2 className="text-2xl font-bold">Reading Material</h2>
                                                    <p className="opacity-70 mt-2">See resources below for details.</p>
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
                                    <Button size="lg" className="h-16 px-10 rounded-full bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl">
                                        Mark as Complete
                                    </Button>
                                </div>

                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="resources">Resources</TabsTrigger>
                                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                        <TabsTrigger value="chat">Chat with Instructor</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="pt-6">
                                        <div className="prose max-w-none">
                                            <p>{currentLesson.content || 'No description available for this lesson.'}</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="resources" className="pt-6">
                                        <Card>
                                            <CardContent className="p-4 flex flex-col gap-3">
                                                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-indigo-600" />
                                                        <div>
                                                            <p className="font-bold text-sm">Lecture Notes.pdf</p>
                                                            <p className="text-xs text-slate-500">2.4 MB</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline">Download</Button>
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
    );
}
