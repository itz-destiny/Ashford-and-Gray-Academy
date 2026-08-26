
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useUserConversations, useConversationMessages } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Paperclip, Search, Send, Smile, MoreVertical, Phone, Video, Loader2, ArrowLeft, History, Landmark, GraduationCap, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import EmojiPicker from 'emoji-picker-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const OFFICE_ROLES = ['admin', 'registrar', 'course_registrar', 'finance'];

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10' },
    registrar: { label: 'Registrar', className: 'bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10' },
    course_registrar: { label: 'Course Registrar', className: 'bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10' },
    finance: { label: 'Finance', className: 'bg-[#1F7A5A]/10 text-[#1F7A5A] border border-[#1F7A5A]/20' },
    instructor: { label: 'Lecturer', className: 'bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/30' },
};

export function Communications() {
    const { user } = useUser();
    const { toast } = useToast();
    const [conversations, setConversations] = useState<any[]>([]);
    const [officesDirectory, setOfficesDirectory] = useState<any[]>([]);
    const [lecturersDirectory, setLecturersDirectory] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeTab, setActiveTab] = useState<'conversations' | 'offices' | 'lecturers'>('conversations');
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Office staff (admin, registrar, course_registrar, finance) get two
    // directories — Offices and Lecturers — so they can reach any colleague
    // directly, without waiting for the other side to message first. An
    // instructor can only ever reach their own cohort — the students actually
    // enrolled in courses they teach — never another instructor or an office.
    // Students only see the instructors of the courses they're actually
    // enrolled in.
    const isInstructor = user?.role === 'instructor';
    const isOfficeStaff = !!user?.role && user.role !== 'student' && user.role !== 'instructor';
    const isStaff = isOfficeStaff;

    useEffect(() => {
        if (!user) return;

        const fetchDirectory = async () => {
            try {
                if (isOfficeStaff) {
                    const res = await apiFetch('/api/users?role=staff');
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const others = data.filter((u: any) => u.uid !== user.uid);
                        setOfficesDirectory(others.filter((u: any) => OFFICE_ROLES.includes(u.role)));
                        setLecturersDirectory(others.filter((u: any) => u.role === 'instructor'));
                    }
                    return;
                }

                if (isInstructor) {
                    const res = await apiFetch('/api/instructor/students');
                    const data = await res.json();
                    if (data?.success && Array.isArray(data.students)) {
                        const seen = new Set<string>();
                        const uniqueStudents = data.students.filter((s: any) => {
                            if (seen.has(s.uid)) return false;
                            seen.add(s.uid);
                            return true;
                        });
                        setLecturersDirectory(uniqueStudents);
                    }
                    return;
                }

                // Student: only the instructors of courses they're currently,
                // actively enrolled in — access ends once the course's stated
                // duration has elapsed from the enrollment date.
                const enRes = await apiFetch('/api/enrollments');
                const enrollments = await enRes.json();

                if (Array.isArray(enrollments)) {
                    const now = Date.now();
                    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
                    const activeInstructorUids = new Set(
                        enrollments
                            .filter((en: any) => {
                                const uid = en.course?.instructorUid;
                                if (!uid) return false;
                                const enrolledAt = new Date(en.enrolledAt).getTime();
                                const durationWeeks = en.course?.duration || 0;
                                return now <= enrolledAt + durationWeeks * WEEK_MS;
                            })
                            .map((en: any) => en.course.instructorUid)
                    );

                    const res = await apiFetch('/api/users?role=instructor');
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        const instructors = data.filter((u: any) => activeInstructorUids.has(u.uid));
                        setLecturersDirectory(instructors);
                    }
                }
            } catch (error) {
                console.error('Error fetching directory:', error);
            }
        };

        fetchDirectory();
    }, [user, isOfficeStaff, isInstructor]);

    const query = searchQuery.trim().toLowerCase();
    const filteredConversations = conversations.filter((c) =>
        !query || c.otherUser.name.toLowerCase().includes(query) || (c.lastMessage || '').toLowerCase().includes(query)
    );
    const filteredOffices = officesDirectory.filter((s) =>
        !query || s.displayName?.toLowerCase().includes(query) || (ROLE_BADGE[s.role]?.label ?? s.role ?? '').toLowerCase().includes(query)
    );
    const filteredLecturers = lecturersDirectory.filter((s) =>
        !query || s.displayName?.toLowerCase().includes(query)
    );

    const startConversationWithStaff = async (staffMember: any) => {
        if (!user) return;

        try {
            const existingConv = conversations.find(c =>
                c.participants.includes(staffMember.uid)
            );

            if (existingConv) {
                setSelectedConversation(existingConv);
                setShowMobileChat(true);
                setActiveTab('conversations');
                return;
            }

            const res = await apiFetch('/api/conversations', {
                method: 'POST',
                body: JSON.stringify({
                    participants: [staffMember.uid]
                })
            });

            if (res.ok) {
                const newConv = await res.json();
                const enriched = {
                    ...newConv,
                    otherUser: {
                        id: staffMember.uid,
                        name: staffMember.displayName,
                        avatar: staffMember.photoURL || undefined,
                        online: false
                    }
                };
                setConversations([...conversations, enriched]);
                setSelectedConversation(enriched);
                setShowMobileChat(true);
                setActiveTab('conversations');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    // Realtime conversation list — replaces 10s polling.
    const { conversations: rtConversations } = useUserConversations(user?.uid);
    const userCacheRef = useRef<Map<string, { name: string; avatar: string; role: string } | null>>(new Map());

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            const enriched = (await Promise.all(
                rtConversations.map(async (conv) => {
                    const otherUserId = conv.participants.find((p: string) => p !== user.uid) || user.uid;
                    let info = userCacheRef.current.get(otherUserId);
                    if (info === undefined) {
                        try {
                            const uRes = await apiFetch(`/api/users?uid=${otherUserId}`);
                            const uData = await uRes.json();
                            info = {
                                name: uData.displayName || 'Institutional Member',
                                avatar: uData.photoURL || undefined,
                                role: uData.role || 'student',
                            };
                            userCacheRef.current.set(otherUserId, info);
                        } catch {
                            info = null;
                        }
                    }
                    if (!info) return null;
                    return {
                        _id: conv.id,
                        participants: conv.participants,
                        lastMessage: conv.lastMessage,
                        lastMessageAt: conv.lastMessageAt,
                        otherUser: { id: otherUserId, name: info.name, avatar: info.avatar, online: false },
                    };
                })
            )).filter((c) => c !== null) as any[];
            if (cancelled) return;
            setConversations(enriched);
            if (enriched.length > 0 && !selectedConversation && !showMobileChat) {
                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                    setSelectedConversation(enriched[0]);
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [user, rtConversations, selectedConversation, showMobileChat]);

    // Realtime messages for the active conversation — replaces 5s polling.
    const { messages: rtMessages } = useConversationMessages(selectedConversation?._id ?? null);
    // A message the user just hit "send" on, echoed locally so it appears
    // instantly instead of waiting on the Firestore round-trip. Cleared the
    // moment the real copy shows up in rtMessages (or on send failure).
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
    useEffect(() => {
        setMessages(
            rtMessages.map((m) => ({
                _id: m.id,
                senderId: m.senderId,
                receiverId: m.receiverId,
                content: m.content,
                createdAt: m.createdAt,
            }))
        );
        setPendingMessages([]);
    }, [rtMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        const content = newMessage.trim();
        if (!content || !user || !selectedConversation) return;

        const pendingId = `pending-${Date.now()}`;
        setNewMessage("");
        setPendingMessages((prev) => [
            ...prev,
            { _id: pendingId, senderId: user.uid, receiverId: selectedConversation.otherUser.id, content, createdAt: new Date().toISOString(), pending: true },
        ]);

        try {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: selectedConversation.otherUser.id,
                    conversationId: selectedConversation._id,
                    content
                })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setPendingMessages((prev) => prev.filter((m) => m._id !== pendingId));
                setNewMessage(content);
                toast({
                    variant: "destructive",
                    title: "Message not sent",
                    description: body.error || "This conversation is no longer available.",
                });
            }
            // On success, the Firestore listener replaces this pending echo
            // with the real message (see the rtMessages effect above).
        } catch (error) {
            console.error(error);
            setPendingMessages((prev) => prev.filter((m) => m._id !== pendingId));
            setNewMessage(content);
        }
    };

    const handleStartVideoCall = async () => {
        if (!user || !selectedConversation) return;

        try {
            const zoomRes = await apiFetch('/api/messages/video-call', {
                method: 'POST',
                body: JSON.stringify({ conversationId: selectedConversation._id }),
            });
            const zoomBody = await zoomRes.json().catch(() => ({}));
            if (!zoomRes.ok || !zoomBody.joinUrl) {
                toast({
                    variant: 'destructive',
                    title: 'Could not start video call',
                    description: zoomBody.error || 'Please try again.',
                });
                return;
            }

            const messageContent = `I started a video meeting. Join here: ${zoomBody.joinUrl}`;
            await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: selectedConversation.otherUser.id,
                    conversationId: selectedConversation._id,
                    content: messageContent
                })
            });
            // Firestore listener fans the meeting message out.

            window.open(zoomBody.joinUrl, '_blank');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Could not start video call', description: 'Please try again.' });
        }
    };

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??';

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1F7A5A]" /></div>
    }

    return (
        <Card className="h-[calc(100vh-12rem)] w-full flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 border border-[#0B1F3A]/10 shadow-md rounded-none overflow-hidden bg-white relative">
            {/* Sidebar: Contacts */}
            <div className={cn(
                "md:col-span-1 lg:col-span-1 border-r border-slate-50 flex flex-col bg-slate-50/50 transition-all duration-300",
                showMobileChat ? "hidden md:flex" : "flex w-full"
            )}>
                <div className="p-8 border-b border-slate-50 space-y-6">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">Academic Dialogue</h2>

                    <div className="flex gap-2 p-1 bg-white rounded-none shadow-sm border border-[#0B1F3A]/10">
                        <Button
                            variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('conversations')}
                            className={cn("flex-1 gap-1.5 rounded-none font-black text-[9px] uppercase tracking-widest transition-all", activeTab === 'conversations' ? "bg-[#0B1F3A] text-white shadow-none" : "text-slate-400")}
                        >
                            <History className="h-3.5 w-3.5" /> Recent
                        </Button>
                        {isStaff && (
                            <Button
                                variant={activeTab === 'offices' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('offices')}
                                className={cn("flex-1 gap-1.5 rounded-none font-black text-[9px] uppercase tracking-widest transition-all", activeTab === 'offices' ? "bg-[#0B1F3A] text-white shadow-none" : "text-slate-400")}
                            >
                                <Landmark className="h-3.5 w-3.5" /> Offices
                            </Button>
                        )}
                        <Button
                            variant={activeTab === 'lecturers' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('lecturers')}
                            className={cn("flex-1 gap-1.5 rounded-none font-black text-[9px] uppercase tracking-widest transition-all", activeTab === 'lecturers' ? "bg-[#0B1F3A] text-white shadow-none" : "text-slate-400")}
                        >
                            <GraduationCap className="h-3.5 w-3.5" /> {isOfficeStaff ? 'Lecturers' : isInstructor ? 'My Students' : 'Instructors'}
                        </Button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#C8A96A] transition-colors" />
                        <Input
                            placeholder={activeTab === 'conversations' ? "Search conversations..." : activeTab === 'offices' ? "Find an office..." : isOfficeStaff ? "Find a lecturer..." : isInstructor ? "Find a student..." : "Find instructor..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-10 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A] placeholder:text-slate-300 font-medium h-12 shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        {activeTab === 'conversations' ? (
                            <>
                                {filteredConversations.map(conv => (
                                    <div
                                        key={conv._id}
                                        className={cn(
                                            "p-5 flex gap-4 cursor-pointer rounded-none transition-all duration-300",
                                            selectedConversation?._id === conv._id
                                                ? "bg-white shadow-sm border border-[#0B1F3A]/10"
                                                : "hover:bg-white/60"
                                        )}
                                        onClick={() => {
                                            setSelectedConversation(conv);
                                            setShowMobileChat(true);
                                        }}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                                                <AvatarImage src={conv.otherUser.avatar} />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-serif">{getInitials(conv.otherUser.name)}</AvatarFallback>
                                            </Avatar>
                                            {conv.otherUser.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-serif text-[#0B1F3A] truncate leading-none">
                                                    {conv.otherUser.name}
                                                </h3>
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest shrink-0 mt-1">
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <p className="text-xs truncate font-medium text-slate-400">
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {filteredConversations.length === 0 && (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-white rounded-none shadow-sm flex items-center justify-center border border-[#0B1F3A]/10">
                                            <History className="w-7 h-7 text-slate-200" />
                                        </div>
                                        <p className="text-slate-300 font-serif italic">
                                            {query ? 'No matching conversations.' : 'No established dialogue.'}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'offices' ? (
                            <>
                                {filteredOffices.map(staff => (
                                    <div
                                        key={staff.uid}
                                        className="p-5 flex gap-4 cursor-pointer rounded-none transition-all duration-300 hover:bg-white shadow-none hover:shadow-md group"
                                        onClick={() => startConversationWithStaff(staff)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                                                <AvatarImage src={staff.photoURL || undefined} />
                                                <AvatarFallback className="bg-[#F6F4F2] text-[#0B1F3A] font-serif">{getInitials(staff.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                                                <Landmark className="w-3 h-3 text-[#0B1F3A]/40" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="font-serif text-[#0B1F3A] truncate mb-1.5">
                                                {staff.displayName}
                                            </h3>
                                            <span className={cn("inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none", ROLE_BADGE[staff.role]?.className ?? 'bg-slate-50 text-slate-600')}>
                                                {ROLE_BADGE[staff.role]?.label ?? staff.role}
                                            </span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 rounded-none hover:bg-[#F6F4F2] opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startConversationWithStaff(staff);
                                            }}
                                        >
                                            <Video className="h-4 w-4 text-slate-300" />
                                        </Button>
                                    </div>
                                ))}
                                {filteredOffices.length === 0 && (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-white rounded-none shadow-sm flex items-center justify-center border border-[#0B1F3A]/10">
                                            <Landmark className="w-7 h-7 text-slate-200" />
                                        </div>
                                        <p className="text-slate-300 font-serif italic">
                                            {query ? 'No matching offices.' : 'No offices available.'}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {filteredLecturers.map(staff => (
                                    <div
                                        key={staff.uid}
                                        className="p-5 flex gap-4 cursor-pointer rounded-none transition-all duration-300 hover:bg-white shadow-none hover:shadow-md group"
                                        onClick={() => startConversationWithStaff(staff)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                                                <AvatarImage src={staff.photoURL || undefined} />
                                                <AvatarFallback className="bg-[#C8A96A]/10 text-[#0B1F3A] font-serif">{getInitials(staff.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                                                <GraduationCap className="w-3 h-3 text-[#0B1F3A]/40" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="font-serif text-[#0B1F3A] truncate mb-1.5">
                                                {staff.displayName}
                                            </h3>
                                            <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/30">
                                                {isInstructor ? (staff.courseTitle || 'Student') : 'Lecturer'}
                                            </span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 rounded-none hover:bg-[#F6F4F2] opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startConversationWithStaff(staff);
                                            }}
                                        >
                                            <Video className="h-4 w-4 text-slate-300" />
                                        </Button>
                                    </div>
                                ))}
                                {filteredLecturers.length === 0 && (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-white rounded-none shadow-sm flex items-center justify-center border border-[#0B1F3A]/10">
                                            <GraduationCap className="w-7 h-7 text-slate-200" />
                                        </div>
                                        <p className="text-slate-300 font-serif italic">
                                            {isOfficeStaff
                                                ? (query ? 'No matching lecturers.' : 'No lecturers available.')
                                                : isInstructor
                                                ? (query ? 'No matching students.' : 'No students enrolled in your courses yet.')
                                                : (query ? 'No matching instructors.' : 'No authorized instructors available.')}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "md:col-span-2 lg:col-span-3 flex flex-col h-full bg-white transition-all duration-300",
                showMobileChat ? "flex w-full" : "hidden md:flex"
            )}>
                {selectedConversation ? (
                    <>
                        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white shadow-sm relative z-10">
                            <div className="flex items-center gap-4 md:gap-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2]"
                                    onClick={() => setShowMobileChat(false)}
                                >
                                    <ArrowLeft className="h-5 w-5 text-[#0B1F3A]" />
                                </Button>
                                <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-slate-50 shadow-sm">
                                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                                    <AvatarFallback className="bg-slate-100 text-[#0B1F3A] font-serif text-xl">{getInitials(selectedConversation.otherUser.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-serif text-[#0B1F3A] text-lg md:text-2xl tracking-tight leading-none mb-1 md:mb-2">{selectedConversation.otherUser.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secure Access</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                                <Button variant="ghost" size="icon" className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] text-[#0B1F3A]/50 hidden sm:flex">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-none border border-[#1F7A5A]/20 bg-[#1F7A5A]/5 hover:bg-[#1F7A5A]/10 text-[#1F7A5A]"
                                    onClick={handleStartVideoCall}
                                    title="Start Video Call"
                                >
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] text-[#0B1F3A]/50">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0 p-6 md:p-10 bg-[#FCFCFE]">
                            <div className="space-y-12 max-w-5xl mx-auto">
                                {[...messages, ...pendingMessages].map((msg, i) => {
                                    const isMe = msg.senderId === user?.uid;
                                    const isMeetingLink = msg.content.includes('zoom.us/');

                                    return (
                                        <div key={msg._id || i} className={`flex items-end gap-3 md:gap-4 ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-700 ${msg.pending ? 'opacity-50' : ''}`}>
                                            {!isMe && (
                                                <Avatar className="h-8 w-8 md:h-10 md:w-10 mb-1 shadow-sm border-2 border-white shrink-0">
                                                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                                                    <AvatarFallback className="bg-slate-100 text-[10px] font-serif">{getInitials(selectedConversation.otherUser.name)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn(
                                                "flex flex-col max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-none shadow-sm transition-all border-l-2",
                                                isMe
                                                    ? "bg-[#0B1F3A] text-white border-l-[#C8A96A]"
                                                    : "bg-white text-slate-800 border border-[#0B1F3A]/8 border-l-2 border-l-[#0B1F3A]/20"
                                            )}>
                                                {isMeetingLink ? (
                                                    <div className="space-y-4 min-w-[200px] md:min-w-[240px]">
                                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                           <Video className="w-5 h-5 text-[#C8A96A]" />
                                                           <p className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]">Invitation Received</p>
                                                        </div>
                                                        <Link href={msg.content.split(' ').find((w: string) => w.includes('zoom.us/')) || '#'} target="_blank">
                                                            <Button size="lg" className="w-full bg-[#1F7A5A] hover:bg-emerald-600 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-none border-none h-12">
                                                                Join on Zoom
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                )}
                                                <p className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 self-end opacity-40", isMe ? "text-white" : "text-slate-400")}>
                                                    {msg.pending ? 'Sending…' : format(new Date(msg.createdAt), "hh:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-6 md:p-10 border-t border-slate-50 bg-white">
                            <div className="max-w-5xl mx-auto relative flex items-center gap-3 md:gap-6">
                                <div className="flex gap-2 shrink-0">
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] text-[#0B1F3A]/40 hover:text-[#C8A96A] h-11 w-11 md:h-12 md:w-12"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile className="h-5 w-5" />
                                        </Button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-none overflow-hidden border border-[#0B1F3A]/10 max-w-[300px] md:max-w-none">
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => {
                                                        setNewMessage((prev) => prev + emojiData.emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] text-[#0B1F3A]/40 hover:text-[#C8A96A] h-11 w-11 md:h-12 md:w-12 hidden sm:flex"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="pr-16 md:pr-20 bg-slate-50 border-none h-14 md:h-16 rounded-none focus-visible:ring-1 focus-visible:ring-[#1F7A5A] font-medium px-6 md:px-8 text-base md:text-lg"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white h-10 w-10 md:h-11 md:w-11 rounded-none shadow-none transition-all"
                                    >
                                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none bg-slate-50/20">
                        <div className="w-32 h-32 bg-white rounded-none shadow-sm flex items-center justify-center mb-10 border border-[#0B1F3A]/10">
                            <Send className="w-12 h-12 text-slate-100 -rotate-45" />
                        </div>
                        <h2 className="text-3xl font-serif text-[#0B1F3A] mb-4">Secure Academic Network</h2>
                        <p className="max-w-sm text-slate-400 font-medium leading-relaxed">Please select a dialogue from the directory or authorize a new link with a faculty member to begin.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
