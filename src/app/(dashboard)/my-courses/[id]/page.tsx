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
            <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col overflow-hidden`}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold truncate">Course Content</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    {modules.map((mod: any, mIdx: number) => (
                        <div key={mod._id} className="border-b">
                            <div className="p-4 bg-slate-50 font-semibold text-sm flex items-center justify-between">
                                <span>Module {mIdx + 1}: {mod.title}</span>
                            </div>
                            <div className="py-2">
                                {lessons.filter(l => l.moduleId === mod._id).map((lesson: any) => (
                                    <button
                                        key={lesson._id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`w-full text-left px-6 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors ${currentLesson?._id === lesson._id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
                                            }`}
                                    >
                                        {lesson.isLive ? <Calendar className="w-4 h-4 text-orange-500" /> : <PlayCircle className="w-4 h-4 text-slate-400" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                                            <p className="text-xs text-slate-400">{lesson.duration}m</p>
                                        </div>
                                        {lesson.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
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
                                                    <Calendar className="w-16 h-16 text-orange-500 mb-4 animate-pulse" />
                                                    <h2 className="text-2xl font-bold">Live Class Scheduled</h2>
                                                    <p className="opacity-70 mt-2">{new Date(currentLesson.scheduledAt).toLocaleString()}</p>
                                                    <Button className="mt-6 bg-orange-600 hover:bg-orange-700">Add to Calendar</Button>
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

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                                        <p className="text-slate-500 mt-1">{course.title} • Module {modules.findIndex(m => m._id === currentLesson.moduleId) + 1}</p>
                                    </div>
                                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">Mark as Complete</Button>
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
