"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarCheck, Video, Clock, MapPin, ChevronRight, Bell, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";

export default function InstructorSchedulePage() {
    const { user } = useUser();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchSchedule = async () => {
            try {
                // For instructors, we might want to fetch events they created or are teaching
                // Since we don't have a specific "teaching" API, we'll fetch all events for now
                // or filter by instructor name if we had that.
                const res = await fetch(`/api/events`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setRegistrations(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [user]);

    const eventsOnSelectedDate = registrations.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return selectedDate &&
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <CalendarCheck className="w-8 h-8 text-indigo-600" />
                        Teaching Itinerary
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage your live sessions, office hours, and academic milestones.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-full shadow-lg shadow-indigo-100 gap-2 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4" />
                        Coordinate New Event
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl border border-white/20">
                        <CardHeader className="bg-white/80 p-6 border-b border-slate-50">
                            <div className="flex justify-between items-center px-4">
                                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">Academic Calendar</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="w-full"
                                classNames={{
                                    months: "flex flex-col space-y-8",
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center mb-4",
                                    caption_label: "text-2xl font-black text-slate-900 uppercase tracking-tighter px-4",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-10 w-10 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl flex items-center justify-center p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full mb-4",
                                    head_cell: "text-slate-400 rounded-md w-full font-black text-[10px] uppercase tracking-widest",
                                    row: "flex w-full mt-2",
                                    cell: cn(
                                        "h-20 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                        "[&:has([aria-selected])]:bg-indigo-50/50 first:[&:has([aria-selected])]:rounded-l-3xl last:[&:has([aria-selected])]:rounded-r-3xl"
                                    ),
                                    day: cn(
                                        "h-full w-full p-2 font-bold transition-all hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center",
                                        "aria-selected:opacity-100"
                                    ),
                                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white shadow-xl shadow-indigo-200",
                                    day_today: "bg-slate-100 text-slate-900 border-2 border-slate-200",
                                    day_outside: "text-slate-300 opacity-50",
                                    day_disabled: "text-slate-300 opacity-50",
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-right-4 duration-700 delay-200">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md border border-white/20">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-amber-500" />
                                    Daily Docket
                                </CardTitle>
                                <Badge variant="outline" className="font-bold border-slate-200 text-slate-400">
                                    {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-6">
                                {eventsOnSelectedDate.length > 0 ? (
                                    eventsOnSelectedDate.map((event) => (
                                        <div key={event._id} className="group flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100">
                                            <div className="mt-1 flex h-10 w-10 min-w-[40px] items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-300">
                                                <Video className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors truncate">
                                                    {event.title}
                                                </p>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[11px] font-bold uppercase tracking-tight">{event.time || 'TBD'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="text-[11px] font-bold uppercase tracking-tight truncate">{event.location || 'Lecture Hall A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <Button variant="ghost" size="icon" className="rounded-full text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 px-8 flex flex-col items-center gap-6 opacity-30 select-none">
                                        <div className="p-6 bg-slate-100 rounded-full">
                                            <CalendarCheck className="w-12 h-12 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">Open Schedule</p>
                                            <p className="text-sm font-bold text-slate-500 mt-1">No instructional sessions documented for this marker.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
