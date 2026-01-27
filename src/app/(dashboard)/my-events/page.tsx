"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, Search, Filter, Ticket, UserCheck, ChevronRight } from "lucide-react";
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
                    fetch(`/api/registrations?userId=${user.uid}`),
                    fetch(`/api/events`)
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
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-20 bg-slate-50 rounded-2xl w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-6 md:px-10 py-8 space-y-10 max-w-[1600px] animate-in fade-in duration-700">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Events</h1>
                    <p className="text-slate-500 font-medium">Manage your registrations and explore upcoming workshops.</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                        placeholder="Find an event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-12 bg-white border-slate-100 rounded-2xl text-sm font-medium"
                    />
                </div>
            </div>

            <Tabs defaultValue="my-events" className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50">
                    <TabsTrigger value="my-events" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-black text-xs uppercase tracking-tight gap-2">
                        <Ticket className="w-4 h-4" /> My Registrations ({myEvents.length})
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-black text-xs uppercase tracking-tight gap-2">
                        <CalendarIcon className="w-4 h-4" /> Explore new ({suggestedEvents.length})
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
        <Card className="border-none bg-white rounded-[32px] overflow-hidden flex flex-col sm:flex-row group transition-all duration-500 hover:-translate-y-1">
            <div className="relative w-full sm:w-56 h-48 sm:h-auto overflow-hidden">
                <Image
                    src={event.imageUrl || ""}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {isRegistered && (
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest gap-1 shadow-none">
                            <UserCheck className="w-3 h-3" /> Registered
                        </Badge>
                    </div>
                )}
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-black uppercase text-indigo-600 border-indigo-100 bg-indigo-50/50">
                            {event.category}
                        </Badge>
                        <span className="text-xl font-black text-slate-900">${event.price || 0}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{event.title}</h3>

                    <div className="space-y-1 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {event.location || "Main Auditorium"}
                        </div>
                    </div>
                </div>

                <Button asChild className={cn(
                    "w-full h-12 rounded-2xl font-black transition-all",
                    isRegistered ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
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
        <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                    <CalendarIcon className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-tight">{message}</p>
                <Button asChild variant="link" className="text-indigo-600 font-black uppercase text-xs">
                    <Link href="/events">View Public Calendar</Link>
                </Button>
            </div>
        </div>
    );
}
