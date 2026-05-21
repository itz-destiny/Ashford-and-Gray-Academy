
"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useDirectMessages } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Search, Filter, MoreHorizontal, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function InstructorCommunicationsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch unique students who have messaged or are enrolled
    useEffect(() => {
        if (!user) return;
        const fetchContacts = async () => {
            const res = await apiFetch('/api/messages');
            const allMessages = await res.json();

            const uniqueSenderIds = Array.from(new Set(allMessages.map((m: any) => m.senderId === user.uid ? m.receiverId : m.senderId)));

            const contactList = uniqueSenderIds.map((id: any) => ({
                id,
                name: id.includes('@') ? id : `Student ${id.slice(-4)}`,
                lastMessage: allMessages.filter((m: any) => m.senderId === id || m.receiverId === id).pop()?.content || '',
                time: 'Just now'
            }));
            setContacts(contactList);
        };
        fetchContacts();
    }, [user]);

    // Realtime: subscribe to direct messages between instructor and contact.
    const rtMessages = useDirectMessages(user?.uid ?? null, selectedContact?.id ?? null);
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
    }, [rtMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedContact) return;

        const msg = {
            receiverId: selectedContact.id,
            content: newMessage,
        };

        try {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify(msg),
            });
            if (res.ok) {
                setNewMessage('');
                // Firestore listener delivers the sent message to both sides.
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
        }
    };

    return (
        <div className="flex h-[calc(100vh-14rem)] bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/5 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Contact List */}
            <aside className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/20">
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-black text-[#0B1F3A] tracking-tight">Student Messages</h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#0B1F3A] transition-colors" />
                        <Input
                            placeholder="Search students..."
                            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl focus-visible:ring-[#0B1F3A] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="px-4 pb-8 space-y-2">
                        {contacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={cn(
                                    "w-full text-left p-4 flex gap-4 rounded-3xl transition-all group",
                                    selectedContact?.id === contact.id ? 'bg-white shadow-xl shadow-blue-900/5 ring-1 ring-[#0B1F3A]/5' : 'hover:bg-white/50'
                                )}
                            >
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-xs">{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-black text-[#0B1F3A] text-sm truncate">{contact.name}</p>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{contact.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium truncate leading-relaxed">{contact.lastMessage}</p>
                                </div>
                            </button>
                        ))}
                        {contacts.length === 0 && (
                            <div className="p-12 text-center text-slate-300 font-bold italic text-sm">
                                No messages yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        <div className="p-6 bg-white border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-xs">{selectedContact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-[#0B1F3A] text-base">{selectedContact.name}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active Member</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-50"><Filter className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-50"><MoreHorizontal className="w-5 h-5" /></Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-8 bg-[#FCFCFE]">
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn("flex", msg.senderId === user?.uid ? 'justify-end' : 'justify-start')}>
                                        <div className={cn(
                                            "max-w-[70%] p-5 rounded-[2rem] text-sm shadow-sm transition-all",
                                            msg.senderId === user?.uid 
                                                ? 'bg-[#0B1F3A] text-white rounded-tr-lg' 
                                                : 'bg-white text-slate-900 border border-slate-100 rounded-tl-lg'
                                        )}>
                                            <p className="leading-relaxed font-medium">{msg.content}</p>
                                            <p className={cn(
                                                "text-[9px] font-black uppercase tracking-tighter mt-2 text-right",
                                                msg.senderId === user?.uid ? 'text-white/40' : 'text-slate-300'
                                            )}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-8 bg-white border-t border-slate-50">
                            <div className="max-w-4xl mx-auto flex gap-4 items-center bg-slate-50/50 p-2 pl-6 rounded-[2.5rem] border border-slate-100 focus-within:border-[#0B1F3A]/20 transition-all">
                                <Smile className="w-6 h-6 text-slate-300 hover:text-[#C8A96A] cursor-pointer transition-colors" />
                                <input
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-[#0B1F3A] placeholder:text-slate-300"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button 
                                    onClick={handleSendMessage} 
                                    className="bg-[#0B1F3A] hover:bg-slate-800 text-white h-12 w-12 rounded-full shadow-lg shadow-blue-900/10 transition-transform active:scale-95"
                                    size="icon"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                            <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-50">
                                <MessageSquare className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-[#0B1F3A] tracking-tight">Your Student Messages</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">Select a conversation from the sidebar to start guiding your students.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
