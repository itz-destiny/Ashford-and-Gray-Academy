"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/firebase/auth/use-user";
import { Paperclip, Search, Send, Smile, MoreVertical, Phone, Video, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';

export function Communications() {
    const { user } = useUser();
    const [conversations, setConversations] = useState<any[]>([]);
    const [staffDirectory, setStaffDirectory] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeTab, setActiveTab] = useState<'conversations' | 'staff'>('conversations');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    // Fetch staff directory (for admins to see all staff members)
    useEffect(() => {
        if (!user) return;

        const fetchStaffDirectory = async () => {
            try {
                const res = await fetch('/api/users?role=staff'); // Get all staff
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Filter staff roles only
                    const staff = data.filter((u: any) =>
                        ['registrar', 'course_registrar', 'finance', 'admin', 'instructor'].includes(u.role)
                    );
                    setStaffDirectory(staff);
                }
            } catch (error) {
                console.error('Error fetching staff directory:', error);
            }
        };

        fetchStaffDirectory();
    }, [user]);

    // Start conversation with staff member
    const startConversationWithStaff = async (staffMember: any) => {
        if (!user) return;

        try {
            // Check if conversation already exists
            const existingConv = conversations.find(c =>
                c.participants.includes(staffMember.uid)
            );

            if (existingConv) {
                setSelectedConversation(existingConv);
                setActiveTab('conversations');
                return;
            }

            // Create new conversation
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participants: [user.uid, staffMember.uid]
                })
            });

            if (res.ok) {
                const newConv = await res.json();
                setConversations([...conversations, {
                    ...newConv,
                    otherUser: {
                        id: staffMember.uid,
                        name: staffMember.displayName,
                        avatar: staffMember.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.uid}`,
                        online: true
                    }
                }]);
                setSelectedConversation({
                    ...newConv,
                    otherUser: {
                        id: staffMember.uid,
                        name: staffMember.displayName,
                        avatar: staffMember.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.uid}`,
                        online: true
                    }
                });
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
                    // Enrich with user details
                    const enriched = await Promise.all(data.map(async (conv: any) => {
                        const otherUserId = conv.participants.find((p: string) => p !== user.uid) || user.uid; // Default to self if alone
                        const uRes = await fetch(`/api/users?uid=${otherUserId}`);
                        const uData = await uRes.json();

                        return {
                            ...conv,
                            otherUser: {
                                id: otherUserId,
                                name: uData.displayName || 'Anonymous',
                                avatar: uData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
                                online: true // Mock
                            }
                        };
                    }));
                    setConversations(enriched);

                    if (enriched.length > 0 && !selectedConversation) {
                        setSelectedConversation(enriched[0]);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user || !selectedConversation) return;

        const fetchMessages = async () => {
            try {
                if (!user?.uid || (!selectedConversation._id && !selectedConversation.otherUser?.id)) return;

                // Fetch by conversationId if available, OR fallback to participants
                const query = selectedConversation._id
                    ? `conversationId=${selectedConversation._id}`
                    : `userId=${user.uid}&contactId=${selectedConversation.otherUser.id}`;

                if (!query) return;

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
        const interval = setInterval(fetchMessages, 3000);
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
        // Pass context to meeting page so it can post "Meeting Ended" message
        const meetingLink = `/meeting/${roomId}?conversationId=${selectedConversation._id}&hostId=${user.uid}`;
        const messageContent = `I started a video meeting. Join here: ${window.location.origin}${meetingLink}`;

        // 1. Send message
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

        // 2. Open meeting in new tab
        window.open(meetingLink, '_blank');
    };


    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??';

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
    }

    return (
        <Card className="h-[calc(100vh-12rem)] w-full grid md:grid-cols-3 lg:grid-cols-4 border-none shadow-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
            {/* Sidebar: Contacts */}
            <div className="md:col-span-1 lg:col-span-1 border-r border-slate-100 flex flex-col bg-white/40">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-4">Communications</h2>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={activeTab === 'conversations' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('conversations')}
                            className="flex-1"
                        >
                            Chats
                        </Button>
                        <Button
                            variant={activeTab === 'staff' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('staff')}
                            className="flex-1"
                        >
                            Staff
                        </Button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder={activeTab === 'conversations' ? "Search dialogue..." : "Search staff..."}
                            className="pl-10 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {activeTab === 'conversations' ? (
                            <>
                                {conversations.map(conv => (
                                    <div
                                        key={conv._id}
                                        className={`p-4 flex gap-4 cursor-pointer rounded-2xl transition-all duration-300 transform active:scale-95 ${selectedConversation?._id === conv._id
                                            ? "bg-indigo-600 shadow-none scale-[1.02]"
                                            : "hover:bg-slate-50"
                                            }`}
                                        onClick={() => setSelectedConversation(conv)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-none">
                                                <AvatarImage src={conv.otherUser.avatar} />
                                                <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{getInitials(conv.otherUser.name)}</AvatarFallback>
                                            </Avatar>
                                            {conv.otherUser.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className={`font-bold truncate ${selectedConversation?._id === conv._id ? "text-white" : "text-slate-800"}`}>
                                                    {conv.otherUser.name}
                                                </h3>
                                                <p className={`text-[10px] font-bold shrink-0 ${selectedConversation?._id === conv._id ? "text-indigo-100" : "text-slate-400"}`}>
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <p className={`text-xs truncate font-medium ${selectedConversation?._id === conv._id ? "text-indigo-100/80" : "text-slate-500"}`}>
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {conversations.length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-xs">
                                        No active conversations.
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {staffDirectory.map(staff => (
                                    <div
                                        key={staff.uid}
                                        className="p-4 flex gap-4 cursor-pointer rounded-2xl transition-all duration-300 transform active:scale-95 hover:bg-slate-50"
                                        onClick={() => startConversationWithStaff(staff)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-none">
                                                <AvatarImage src={staff.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.uid}`} />
                                                <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{getInitials(staff.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate text-slate-800">
                                                {staff.displayName}
                                            </h3>
                                            <p className="text-xs text-slate-500 capitalize">
                                                {staff.role.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startConversationWithStaff(staff);
                                            }}
                                        >
                                            <Video className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {staffDirectory.length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-xs">
                                        No staff members found.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-white/20">
                {selectedConversation ? (
                    <>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/60 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-none">
                                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{getInitials(selectedConversation.otherUser.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-black text-slate-900 text-lg leading-tight">{selectedConversation.otherUser.name}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                    onClick={handleStartVideoCall}
                                    title="Start Video Meeting"
                                >
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-8 bg-gradient-to-b from-slate-50/50 to-white/50">
                            <div className="space-y-8 max-w-4xl mx-auto">
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderId === user?.uid;
                                    // Check if message is a meeting link
                                    const isMeetingLink = msg.content.includes('/meeting/');

                                    return (
                                        <div key={msg._id || i} className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                                            {!isMe && (
                                                <Avatar className="h-8 w-8 mb-1 shadow-sm">
                                                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                                                    <AvatarFallback className="bg-slate-200 text-[10px] font-bold">{getInitials(selectedConversation.otherUser.name)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`group relative max-w-[70%] p-4 rounded-3xl shadow-none transition-all hover:bg-slate-50 ${isMe
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                                                }`}>
                                                {isMeetingLink ? (
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Video Meeting Invitation</p>
                                                        <Link href={msg.content.split(' ').find((w: string) => w.includes('/meeting/')) || '#'} target="_blank">
                                                            <Button size="sm" variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-inherit border-none">
                                                                <Video className="w-4 h-4 mr-2" /> Join Meeting
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                )}
                                                <p className={`text-[9px] font-bold mt-2 float-right opacity-60 ${isMe ? "text-indigo-100" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                            <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                                <div className="flex gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><Smile className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><Paperclip className="h-5 w-5" /></Button>
                                </div>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="pr-14 bg-slate-100/50 border-none h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-medium"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSendMessage}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white hover:bg-indigo-700 h-9 w-9 p-0 rounded-xl shadow-none transition-all hover:scale-110 active:scale-95"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 select-none">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Send className="w-10 h-10 text-slate-300 -rotate-45" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Academic Exchange</h2>
                        <p className="max-w-xs text-slate-500 font-bold mt-2">Initialize a secure channel with institutional faculty or verified peers to begin consultation.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
