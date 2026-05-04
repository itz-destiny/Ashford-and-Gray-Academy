
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/firebase";
import { Paperclip, Search, Send, Smile, MoreVertical, Phone, Video, Loader2, ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import EmojiPicker from 'emoji-picker-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function Communications() {
    const { user } = useUser();
    const [conversations, setConversations] = useState<any[]>([]);
    const [staffDirectory, setStaffDirectory] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeTab, setActiveTab] = useState<'conversations' | 'instructors'>('conversations');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Fetch instructor directory based on enrollments
    useEffect(() => {
        if (!user) return;

        const fetchInstructorDirectory = async () => {
            try {
                // 1. Get user enrollments
                const enRes = await fetch(`/api/enrollments?userId=${user.uid}`);
                const enrollments = await enRes.json();
                
                if (Array.isArray(enrollments)) {
                    // 2. Extract unique instructor names/uids from courses
                    // In a more robust system, courses would have an instructorUid
                    // For now, we fetch users with the role 'instructor' who match the names
                    const instructorNames = Array.from(new Set(enrollments.map(en => en.course?.instructor?.name)));
                    
                    const res = await fetch('/api/users?role=instructor');
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        // STRICT FILTER: Only 'instructor' role AND must be one of the course instructors
                        const instructors = data.filter((u: any) => 
                            u.role === 'instructor' && instructorNames.includes(u.displayName)
                        );
                        console.log('Filtered Instructors:', instructors.map(i => i.displayName));
                        setStaffDirectory(instructors);
                    }
                }
            } catch (error) {
                console.error('Error fetching instructor directory:', error);
            }
        };

        fetchInstructorDirectory();
    }, [user]);

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

            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participants: [user.uid, staffMember.uid]
                })
            });

            if (res.ok) {
                const newConv = await res.json();
                const enriched = {
                    ...newConv,
                    otherUser: {
                        id: staffMember.uid,
                        name: staffMember.displayName,
                        avatar: staffMember.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.uid}`,
                        online: true
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

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            try {
                const res = await fetch(`/api/conversations?userId=${user.uid}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const enriched = (await Promise.all(data.map(async (conv: any) => {
                        const otherUserId = conv.participants.find((p: string) => p !== user.uid) || user.uid;
                        const uRes = await fetch(`/api/users?uid=${otherUserId}`);
                        const uData = await uRes.json();

                        // Hide conversations with admins
                        if (uData.role === 'admin' || uData.role === 'registrar' || uData.role === 'finance') return null;

                        return {
                            ...conv,
                            otherUser: {
                                id: otherUserId,
                                name: uData.displayName || 'Institutional Member',
                                avatar: uData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
                                online: true
                            }
                        };
                    }))).filter(c => c !== null);
                    setConversations(enriched);

                    if (enriched.length > 0 && !selectedConversation && !showMobileChat) {
                        // On desktop, select first. On mobile, wait for click.
                        if (window.innerWidth >= 768) {
                           setSelectedConversation(enriched[0]);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user || !selectedConversation) return;

        const fetchMessages = async () => {
            try {
                const query = selectedConversation._id
                    ? `conversationId=${selectedConversation._id}`
                    : `userId=${user.uid}&contactId=${selectedConversation.otherUser.id}`;

                const res = await fetch(`/api/messages?${query}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [user, selectedConversation]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedConversation) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.uid,
                    receiverId: selectedConversation.otherUser.id,
                    conversationId: selectedConversation._id,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage("");
                const sent = await res.json();
                setMessages([...messages, sent]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartVideoCall = async () => {
        if (!user || !selectedConversation) return;

        const roomId = `meet-${user.uid.slice(0, 5)}-${Date.now()}`;
        const meetingLink = `/meeting/${roomId}?conversationId=${selectedConversation._id}&hostId=${user.uid}`;
        const messageContent = `I started a video meeting. Join here: ${window.location.origin}${meetingLink}`;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.uid,
                    receiverId: selectedConversation.otherUser.id,
                    conversationId: selectedConversation._id,
                    content: messageContent
                })
            });
            if (res.ok) {
                const sent = await res.json();
                setMessages([...messages, sent]);
            }
        } catch (error) {
            console.error(error);
        }

        window.open(meetingLink, '_blank');
    };

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??';

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1F7A5A]" /></div>
    }

    return (
        <Card className="h-[calc(100vh-12rem)] w-full flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 border-none shadow-sm rounded-[3rem] overflow-hidden bg-white relative">
            {/* Sidebar: Contacts */}
            <div className={cn(
                "md:col-span-1 lg:col-span-1 border-r border-slate-50 flex flex-col bg-slate-50/50 transition-all duration-300",
                showMobileChat ? "hidden md:flex" : "flex w-full"
            )}>
                <div className="p-8 border-b border-slate-50 space-y-6">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">Academic Dialogue</h2>

                    <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <Button
                            variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('conversations')}
                            className={cn("flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all", activeTab === 'conversations' ? "bg-[#0B1F3A] text-white shadow-lg" : "text-slate-400")}
                        >
                            Recent
                        </Button>
                        <Button
                            variant={activeTab === 'instructors' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('instructors')}
                            className={cn("flex-1 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all", activeTab === 'instructors' ? "bg-[#0B1F3A] text-white shadow-lg" : "text-slate-400")}
                        >
                            Instructors
                        </Button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#1F7A5A] transition-colors" />
                        <Input
                            placeholder={activeTab === 'conversations' ? "Search..." : "Find instructor..."}
                            className="pl-12 bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#1F7A5A] placeholder:text-slate-300 font-medium h-12 shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        {activeTab === 'conversations' ? (
                            <>
                                {conversations.map(conv => (
                                    <div
                                        key={conv._id}
                                        className={cn(
                                            "p-5 flex gap-4 cursor-pointer rounded-[2rem] transition-all duration-500",
                                            selectedConversation?._id === conv._id
                                                ? "bg-white shadow-xl border border-slate-100"
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

                                {conversations.length === 0 && (
                                    <div className="p-12 text-center text-slate-300 font-serif italic">
                                        No established dialogue.
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {staffDirectory.map(staff => (
                                    <div
                                        key={staff.uid}
                                        className="p-5 flex gap-4 cursor-pointer rounded-[2rem] transition-all duration-500 hover:bg-white shadow-none hover:shadow-xl"
                                        onClick={() => startConversationWithStaff(staff)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                                                <AvatarImage src={staff.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.uid}`} />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-serif">{getInitials(staff.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-serif text-[#0B1F3A] truncate mb-1">
                                                {staff.displayName}
                                            </h3>
                                            <p className="text-[9px] font-black uppercase text-[#1F7A5A] tracking-widest">
                                                {staff.role}
                                            </p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 rounded-full hover:bg-slate-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startConversationWithStaff(staff);
                                            }}
                                        >
                                            <Video className="h-4 w-4 text-slate-300" />
                                        </Button>
                                    </div>
                                ))}
                                {staffDirectory.length === 0 && (
                                    <div className="p-12 text-center text-slate-300 font-serif italic">
                                        No authorized instructors available.
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
                                    className="md:hidden rounded-full"
                                    onClick={() => setShowMobileChat(false)}
                                >
                                    <ArrowLeft className="h-6 w-6 text-[#0B1F3A]" />
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
                            <div className="flex items-center gap-1 md:gap-3">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50 text-slate-300 hidden sm:flex">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-[#1F7A5A]/5 text-[#1F7A5A]"
                                    onClick={handleStartVideoCall}
                                    title="Authorize Video Link"
                                >
                                    <Video className="h-6 w-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50 text-slate-300">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0 p-6 md:p-10 bg-[#FCFCFE]">
                            <div className="space-y-12 max-w-5xl mx-auto">
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderId === user?.uid;
                                    const isMeetingLink = msg.content.includes('/meeting/');

                                    return (
                                        <div key={msg._id || i} className={`flex items-end gap-3 md:gap-5 ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-700`}>
                                            {!isMe && (
                                                <Avatar className="h-8 w-8 md:h-10 md:w-10 mb-1 shadow-sm border-2 border-white">
                                                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                                                    <AvatarFallback className="bg-slate-100 text-[10px] font-serif">{getInitials(selectedConversation.otherUser.name)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`relative max-w-[85%] md:max-w-[75%] p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all ${isMe
                                                ? "bg-[#0B1F3A] text-white rounded-br-none"
                                                : "bg-white text-slate-800 rounded-bl-none border border-slate-50"
                                                }`}>
                                                {isMeetingLink ? (
                                                    <div className="space-y-4 min-w-[200px] md:min-w-[240px]">
                                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                                           <Video className="w-5 h-5 text-[#C8A96A]" />
                                                           <p className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]">Invitation Received</p>
                                                        </div>
                                                        <Link href={msg.content.split(' ').find((w: string) => w.includes('/meeting/')) || '#'} target="_blank">
                                                            <Button size="lg" className="w-full bg-[#1F7A5A] hover:bg-emerald-600 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl border-none h-12">
                                                                Commence Meeting
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                                                )}
                                                <p className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-4 float-right opacity-40", isMe ? "text-white" : "text-slate-400")}>
                                                    {format(new Date(msg.createdAt), "hh:mm a")}
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
                                <div className="flex gap-1 md:gap-2 shrink-0">
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-300 hover:text-[#1F7A5A] rounded-full"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile className="h-5 w-5 md:h-6 md:w-6" />
                                        </Button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 max-w-[300px] md:max-w-none">
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
                                        className="text-slate-300 hover:text-[#1F7A5A] rounded-full hidden sm:flex"
                                    >
                                        <Paperclip className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="pr-16 md:pr-20 bg-slate-50 border-none h-14 md:h-16 rounded-[1.5rem] md:rounded-[2rem] focus-visible:ring-1 focus-visible:ring-[#1F7A5A] font-medium px-6 md:px-8 text-base md:text-lg"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl shadow-xl transition-all"
                                    >
                                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none bg-slate-50/20">
                        <div className="w-32 h-32 bg-white rounded-[3rem] shadow-sm flex items-center justify-center mb-10 border border-slate-50">
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
