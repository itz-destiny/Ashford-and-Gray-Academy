"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
            // In a real app, query unique senderIds for messages where receiverId = user.displayName
            // For now, we'll fetch all messages and filter unique senders
            const res = await fetch(`/api/messages?userId=${user.uid}`);
            const allMessages = await res.json();

            const uniqueSenderIds = Array.from(new Set(allMessages.map((m: any) => m.senderId === user.uid ? m.receiverId : m.senderId)));

            // Mocking contact names/details for now
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

    useEffect(() => {
        if (!user || !selectedContact) return;

        const fetchMessages = async () => {
            const res = await fetch(`/api/messages?userId=${user.uid}&contactId=${selectedContact.id}`);
            const data = await res.json();
            setMessages(data);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [user, selectedContact]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedContact) return;

        const msg = {
            senderId: user.uid,
            receiverId: selectedContact.id,
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
            toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white border rounded-xl overflow-hidden">
            {/* Contact List */}
            <aside className="w-80 border-r flex flex-col">
                <div className="p-4 border-b space-y-4">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search students..."
                            className="pl-9 bg-slate-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {contacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full text-left p-4 flex gap-3 hover:bg-slate-50 transition-colors border-b ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''
                                }`}
                        >
                            <Avatar>
                                <AvatarFallback className="bg-indigo-100 text-indigo-700">{contact.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-sm truncate">{contact.name}</p>
                                    <span className="text-[10px] text-slate-400">{contact.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                    {contacts.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No conversations yet.
                        </div>
                    )}
                </ScrollArea>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col bg-slate-50/30">
                {selectedContact ? (
                    <>
                        <div className="p-4 bg-white border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">{selectedContact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-sm">{selectedContact.name}</h3>
                                    <p className="text-[10px] text-emerald-500 font-bold">Online</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon"><Filter className="w-4 h-4" /></Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 border'
                                            }`}>
                                            {msg.content}
                                            <p className={`text-[9px] mt-1 text-right ${msg.senderId === user?.uid ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-white border-t flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button size="icon" onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Your Student Messages</h3>
                        <p className="text-slate-500 mt-2 max-w-xs">Select a student from the list to view your conversation or start a new chat.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
