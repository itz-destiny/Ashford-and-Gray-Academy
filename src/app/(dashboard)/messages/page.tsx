"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/firebase";
import { Paperclip, Search, Send, Smile, MoreVertical, Phone, Video } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

export default function MessagesPage() {
  const { user } = useUser();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.uid}`);
        const allMessages = await res.json();

        if (Array.isArray(allMessages)) {
          const contactIds = Array.from(new Set(allMessages.map(m => m.senderId === user.uid ? m.receiverId : m.senderId)));

          const contactDetails = await Promise.all(contactIds.map(async (id) => {
            const uRes = await fetch(`/api/users?uid=${id}`);
            const uData = await uRes.json();

            const lastMsg = allMessages.filter(m => m.senderId === id || m.receiverId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            return {
              id,
              name: uData.displayName || 'Anonymous User',
              avatar: uData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
              message: lastMsg?.content || '',
              time: new Date(lastMsg?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              online: true // Mock online status
            };
          }));

          setContacts(contactDetails);
          if (contactDetails.length > 0 && !selectedContact) {
            setSelectedContact(contactDetails[0]);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || !selectedContact) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.uid}&contactId=${selectedContact.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [user, selectedContact]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedContact) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.uid,
          receiverId: selectedContact.id,
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Card className="h-[calc(100vh-12rem)] w-full grid md:grid-cols-3 lg:grid-cols-4 border-none shadow-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
      {/* Sidebar: Contacts */}
      <div className="md:col-span-1 lg:col-span-1 border-r border-slate-100 flex flex-col bg-white/40">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-4">Communications</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search dialogue..."
              className="pl-10 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className={`p-4 flex gap-4 cursor-pointer rounded-2xl transition-all duration-300 transform active:scale-95 ${selectedContact?.id === contact.id
                  ? "bg-indigo-600 shadow-none scale-[1.02]"
                  : "hover:bg-slate-50"
                  }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-none">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className={`font-bold truncate ${selectedContact?.id === contact.id ? "text-white" : "text-slate-800"}`}>
                      {contact.name}
                    </h3>
                    <p className={`text-[10px] font-bold shrink-0 ${selectedContact?.id === contact.id ? "text-indigo-100" : "text-slate-400"}`}>
                      {contact.time}
                    </p>
                  </div>
                  <p className={`text-xs truncate font-medium ${selectedContact?.id === contact.id ? "text-indigo-100/80" : "text-slate-500"}`}>
                    {contact.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-white/20">
        {selectedContact ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/60 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-none">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-black text-slate-900 text-lg leading-tight">{selectedContact.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Institution Member</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
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
                  return (
                    <div key={msg._id || i} className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 mb-1 shadow-sm">
                          <AvatarImage src={selectedContact.avatar} />
                          <AvatarFallback className="bg-slate-200 text-[10px] font-bold">{getInitials(selectedContact.name)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`group relative max-w-[70%] p-4 rounded-3xl shadow-none transition-all hover:bg-slate-50 ${isMe
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                        }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
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
                    placeholder="Encrypted correspondence..."
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
