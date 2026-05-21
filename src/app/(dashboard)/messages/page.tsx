"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUser, useUserConversations, useConversationMessages } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Search, Send, Smile, Video, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function MessagesPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Realtime conversation list from Firestore — replaces the 5s polling.
  const { conversations: rtConversations } = useUserConversations(user?.uid);
  const userCacheRef = useRef<Map<string, { name: string; avatar: string }>>(new Map());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const enriched = await Promise.all(
        rtConversations.map(async (conv) => {
          const otherUserId = conv.participants.find((p: string) => p !== user.uid) || user.uid;
          let info = userCacheRef.current.get(otherUserId);
          if (!info) {
            try {
              const uRes = await apiFetch(`/api/users?uid=${otherUserId}`);
              const uData = await uRes.json();
              info = {
                name: uData.displayName || 'Anonymous',
                avatar: uData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
              };
              userCacheRef.current.set(otherUserId, info);
            } catch {
              info = {
                name: 'Anonymous',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
              };
            }
          }
          return {
            _id: conv.id,
            participants: conv.participants,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            otherUser: {
              id: otherUserId,
              name: info.name,
              avatar: info.avatar,
              online: false,
            },
          };
        })
      );
      if (cancelled) return;
      setConversations(enriched);
      if (enriched.length > 0 && !selectedConversation) {
        setSelectedConversation(enriched[0]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, rtConversations, selectedConversation]);

  // Realtime messages for the active conversation — replaces 3s polling.
  const { messages: rtMessages } = useConversationMessages(
    selectedConversation?._id ?? null
  );

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          conversationId: selectedConversation._id,
          content: newMessage
        })
      });

      if (res.ok) {
        setNewMessage("");
        // No optimistic append — Firestore listener will deliver the new
        // message to all participants (including the sender) within ~100ms.
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartVideoCall = async () => {
    if (!user || !selectedConversation) return;

    const roomId = `meet-${user.uid.slice(0, 5)}-${Date.now()}`;
    const meetingLink = `/meeting/${roomId}`;
    const messageContent = `I started a video meeting. Join here: ${window.location.origin}${meetingLink}`;

    // 1. Send message
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          conversationId: selectedConversation._id,
          content: messageContent
        })
      });
      // Firestore listener fans the new message out to both participants.
    } catch (error) {
      console.error(error);
    }

    // 2. Open meeting in new tab
    window.open(meetingLink, '_blank');
  };


  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedConversation) return;

    const ct = (file.type || '').toLowerCase();
    const category: 'image' | 'video' | 'document' | null =
      ct.startsWith('image/') ? 'image'
      : ct.startsWith('video/') ? 'video'
      : ct === 'application/pdf' ? 'document'
      : null;

    if (!category) {
      toast({ variant: "destructive", title: "Unsupported file", description: "Send an image, video, or PDF." });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const limits = { image: 10, video: 500, document: 25 } as const;
    if (file.size > limits[category] * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: `${category} attachments must be ${limits[category]} MB or smaller.` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const signRes = await apiFetch('/api/storage/signed-url', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          category,
        }),
      });
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not get an upload URL.');
      }
      const { uploadUrl, publicUrl } = await signRes.json();

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload failed.');

      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          conversationId: selectedConversation._id,
          content: `Attachment: ${file.name} — ${publicUrl}`,
        }),
      });
      // Firestore listener will surface the attachment message to both sides.
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err?.message || 'Try again.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??';

  const filteredConversations = conversations.filter(c => {
    if (!conversationSearch) return true;
    return c.otherUser?.name?.toLowerCase().includes(conversationSearch.toLowerCase());
  });

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
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              className="pl-10 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map(conv => (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                  onClick={handleStartVideoCall}
                  title="Start Video Meeting"
                >
                  <Video className="h-5 w-5" />
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Insert emoji">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="p-0 border-none shadow-2xl w-auto">
                      <EmojiPicker onEmojiClick={(e: any) => setNewMessage((m) => m + (e?.emoji ?? ''))} />
                    </PopoverContent>
                  </Popover>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    className="hidden"
                    onChange={handleFilePicked}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                    title="Attach file"
                  >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                  </Button>
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
