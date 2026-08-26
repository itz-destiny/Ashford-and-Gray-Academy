"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, Search, Ticket, UserCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function StudentEventsPage() {
    const { user, loading: userLoading } = useUser();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]); // All events for browsing
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [regRes, evRes] = await Promise.all([
                    apiFetch('/api/registrations'),
                    fetch('/api/events')
                ]);
                const regData = await regRes.json();
                const evData = await evRes.json();

                setRegistrations(Array.isArray(regData) ? regData : []);
                setEvents(Array.isArray(evData) ? evData : []);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const registeredEventIds = registrations.map(r => r.eventId?._id || r.eventId);
    const myEvents = events.filter(e => registeredEventIds.includes(e.id || e._id));
    const suggestedEvents = events.filter(e => !registeredEventIds.includes(e.id || e._id));

    const filteredMy = myEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    const filteredSuggested = suggestedEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

    if (userLoading || loading) {
        return (
            <div className="p-12 space-y-8 animate-pulse bg-[#FAF9F6] min-h-screen">
                <div className="h-20 bg-slate-200/50 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-200/50" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academy Events</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        My <span className="text-[#C8A96A]">Events.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                        Manage your registrations and explore upcoming workshops and symposiums.
                    </p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#C8A96A] transition-colors" />
                    <Input
                        placeholder="Find an event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-12 bg-white border border-[#0B1F3A]/10 rounded-none text-sm font-medium shadow-sm"
                    />
                </div>
            </div>

            <Tabs defaultValue="my-events" className="space-y-10">
                <TabsList className="bg-white border border-[#0B1F3A]/10 p-1.5 rounded-none h-auto shadow-sm">
                    <TabsTrigger value="my-events" className="px-6 py-2.5 rounded-none data-[state=active]:bg-[#0B1F3A] data-[state=active]:text-white data-[state=active]:shadow-none font-black text-[10px] uppercase tracking-widest gap-2">
                        <Ticket className="w-4 h-4" /> My Registrations ({myEvents.length})
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="px-6 py-2.5 rounded-none data-[state=active]:bg-[#0B1F3A] data-[state=active]:text-white data-[state=active]:shadow-none font-black text-[10px] uppercase tracking-widest gap-2">
                        <CalendarIcon className="w-4 h-4" /> Explore New ({suggestedEvents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-events" className="m-0">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {filteredMy.length > 0 ? (
                            filteredMy.map(ev => (
                                <EventCard key={ev.id || ev._id} event={ev} isRegistered />
                            ))
                        ) : (
                            <EmptyState message="You haven't registered for any events yet." />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="explore" className="m-0">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {filteredSuggested.length > 0 ? (
                            filteredSuggested.map(ev => (
                                <EventCard key={ev.id || ev._id} event={ev} />
                            ))
                        ) : (
                            <EmptyState message="No new events found matching your search." />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EventCard({ event, isRegistered }: { event: any, isRegistered?: boolean }) {
    return (
        <Card className="border border-[#0B1F3A]/10 rounded-none shadow-sm hover:shadow-md hover:border-[#C8A96A] bg-white overflow-hidden flex flex-col sm:flex-row group transition-all duration-300">
            <div className="relative w-full sm:w-56 h-48 sm:h-auto overflow-hidden shrink-0">
                <Image
                    src={event.imageUrl || ""}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {isRegistered && (
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-[#0B1F3A] text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest gap-1 rounded-none shadow-sm">
                            <UserCheck className="w-3 h-3" /> Registered
                        </Badge>
                    </div>
                )}
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-black uppercase text-[#0B1F3A] border-[#0B1F3A]/10 bg-[#F6F4F2] rounded-none">
                            {event.category}
                        </Badge>
                        <span className="text-xl font-serif text-[#0B1F3A]">₦{(event.price || 0).toLocaleString()}</span>
                    </div>
                    <h3 className="text-xl font-serif text-[#0B1F3A] group-hover:text-[#C8A96A] transition-colors leading-tight">{event.title}</h3>

                    <div className="space-y-1.5 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#C8A96A]" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#C8A96A]" /> {event.location || "Main Auditorium"}
                        </div>
                    </div>
                </div>

                <Button asChild className={cn(
                    "w-full h-12 rounded-none font-black text-[10px] uppercase tracking-widest transition-all",
                    isRegistered ? "bg-[#F6F4F2] text-[#0B1F3A] hover:bg-slate-200" : "bg-[#0B1F3A] text-white hover:bg-[#C8A96A]"
                )}>
                    <Link href={`/events/${event.id || event._id}`}>
                        {isRegistered ? "Manage Registration" : "Reserve Spot"} <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full py-24 text-center bg-white border border-[#0B1F3A]/10 rounded-none border-t-4 border-t-[#C8A96A] shadow-md">
            <div className="max-w-xs mx-auto space-y-5">
                <div className="w-20 h-20 bg-[#F6F4F2] border border-[#0B1F3A]/10 rounded-none shadow-sm flex items-center justify-center mx-auto text-slate-300">
                    <CalendarIcon className="w-10 h-10" />
                </div>
                <p className="text-slate-500 font-medium font-serif">{message}</p>
                <Button asChild variant="ghost" className="text-[#0B1F3A] hover:text-[#C8A96A] hover:bg-[#F6F4F2] font-black uppercase text-[10px] tracking-widest">
                    <Link href="/events">View Public Calendar</Link>
                </Button>
            </div>
        </div>
    );
}
