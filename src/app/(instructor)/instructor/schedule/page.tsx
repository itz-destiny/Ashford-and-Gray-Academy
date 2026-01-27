"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarCheck, Video, Clock, MapPin, ChevronRight, Bell, Plus, Calendar as CalendarIcon, Filter, Layers } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorSchedulePage() {
    const { user } = useUser();
    const [events, setEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchSchedule = async () => {
            try {
                // Fetch events relevant to the instructor
                const res = await fetch(`/api/events`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setEvents(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [user]);

    const eventsOnSelectedDate = events.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return selectedDate &&
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
    });

    return (
        <div className="mx-auto px-6 md:px-10 py-8 space-y-10 max-w-[1600px] animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Teaching Itinerary</h1>
                    <p className="text-slate-500 font-medium">Coordinate your upcoming lectures, seminars and academic milestones.</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <Button variant="outline" className="flex-1 lg:flex-none h-12 px-6 rounded-2xl border-slate-100 font-bold text-slate-600 gap-2 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" />
                        Refine View
                    </Button>
                    <Button className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 px-8 rounded-2xl shadow-none gap-2 transition-all hover:scale-[1.02] active:scale-95">
                        <Plus className="w-5 h-5" />
                        New Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Main Calendar Card */}
                <div className="xl:col-span-8 space-y-8">
                    <Card className="border-none shadow-none rounded-[40px] overflow-hidden bg-white group">
                        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Academic Calendar</CardTitle>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Chronology Mapping</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                    Live Class
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Seminar
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-10">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="w-full"
                                classNames={{
                                    months: "flex flex-col space-y-12",
                                    month: "space-y-6 w-full",
                                    caption: "flex justify-center pt-2 relative items-center mb-8",
                                    caption_label: "text-3xl font-black text-slate-950 uppercase tracking-tighter px-6",
                                    nav: "flex items-center gap-3",
                                    nav_button: "h-12 w-12 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all rounded-2xl flex items-center justify-center p-0",
                                    nav_button_previous: "absolute left-2",
                                    nav_button_next: "absolute right-2",
                                    table: "w-full border-collapse",
                                    head_row: "flex w-full mb-6",
                                    head_cell: "text-slate-400 rounded-md w-full font-black text-xs uppercase tracking-[0.2em]",
                                    row: "flex w-full mt-3",
                                    cell: cn(
                                        "h-24 w-full text-center text-sm p-0 relative transition-all duration-300",
                                        "[&:has([aria-selected])]:bg-indigo-50/30 first:[&:has([aria-selected])]:rounded-l-[2rem] last:[&:has([aria-selected])]:rounded-r-[2rem]"
                                    ),
                                    day: cn(
                                        "h-full w-full p-4 font-bold text-slate-600 transition-all hover:bg-slate-50 rounded-[1.5rem] flex flex-col items-center justify-center gap-1",
                                        "aria-selected:opacity-100"
                                    ),
                                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white shadow-none border-none scale-105 z-10",
                                    day_today: "bg-slate-100 text-slate-900 border-2 border-slate-200 ring-4 ring-white",
                                    day_outside: "text-slate-200 opacity-40",
                                    day_disabled: "text-slate-200 opacity-40",
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Perspective Note */}
                    <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 flex gap-4 items-center">
                        <div className="bg-white p-3 rounded-2xl"><CalendarIcon className="w-5 h-5 text-indigo-600" /></div>
                        <p className="text-sm font-medium text-slate-600">
                            Selecting a chronological marker will materialize the corresponding <strong>Institutional Docket</strong> in the auxiliary viewport.
                        </p>
                    </div>
                </div>

                {/* Sidebar Widget: Daily Docket */}
                <div className="xl:col-span-4 space-y-10">
                    <Card className="border-none shadow-none rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-xl">
                                            <Bell className="w-5 h-5 text-amber-500" />
                                        </div>
                                        Daily Docket
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] px-1">Institutional Activities</CardDescription>
                                </div>
                                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black">
                                    {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2">
                            <div className="space-y-6">
                                {loading ? (
                                    Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
                                    ))
                                ) : eventsOnSelectedDate.length > 0 ? (
                                    eventsOnSelectedDate.map((event) => (
                                        <div key={event._id} className="group flex items-start gap-6 p-5 rounded-[2rem] hover:bg-slate-50 transition-all duration-500 border border-transparent hover:border-slate-100">
                                            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-none group-hover:scale-110 transition-transform duration-300">
                                                <Video className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                                                    {event.title}
                                                </p>
                                                <div className="flex flex-col gap-2 mt-3 text-slate-500">
                                                    <div className="flex items-center gap-2.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-[11px] font-black uppercase tracking-widest">{event.time || 'Pending'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span className="text-[11px] font-black uppercase tracking-widest truncate">{event.location || 'Lecture Hall Delta'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all">
                                                    <ChevronRight className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 px-8 flex flex-col items-center gap-8 group/empty transition-all">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-0 group-hover/empty:opacity-60 transition-opacity" />
                                            <div className="relative p-8 bg-slate-50 text-slate-200 rounded-[2.5rem] border border-slate-100 group-hover/empty:scale-110 group-hover/empty:text-indigo-200 group-hover/empty:bg-white transition-all duration-700">
                                                <CalendarCheck className="w-16 h-16" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black text-slate-950 uppercase tracking-tighter">Serene Registry</p>
                                            <p className="text-sm font-medium text-slate-400 max-w-[200px] leading-relaxed">No institutional activities recorded for this chronological marker.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary CTA: Symposia */}
                    <Card className="border-none shadow-none rounded-[40px] bg-slate-900 text-white overflow-hidden relative group cursor-pointer transition-all active:scale-95">
                        <div className="absolute top-0 right-0 p-10 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 opacity-20">
                            <Video className="w-32 h-32" />
                        </div>
                        <CardContent className="p-10 relative z-10 space-y-6">
                            <Badge className="bg-indigo-500 text-white border-none px-3 py-1 font-black text-[10px] tracking-widest">LIVE NOW</Badge>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black leading-tight">Virtual Symposium Hall</h3>
                                <p className="text-slate-400 text-sm font-medium">Join 12 verified members in the active academic discourse.</p>
                            </div>
                            <Button className="w-full bg-white text-slate-900 border-none hover:bg-slate-100 font-black h-12 rounded-2xl transition-all">
                                Participate
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
