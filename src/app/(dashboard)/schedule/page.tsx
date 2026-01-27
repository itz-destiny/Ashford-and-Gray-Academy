"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarCheck, FileText, Video, Clock, MapPin, ChevronRight, Bell } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";

export default function SchedulePage() {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/registrations?userId=${user.uid}`);
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

  const getEventTypeProps = (type: string) => {
    const BASE = "mt-1 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3";
    switch (type) {
      case 'Live Class':
        return { icon: Video, color: 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-none', className: BASE };
      case 'Quiz Due':
        return { icon: CalendarCheck, color: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-none', className: BASE };
      case 'Assignment':
        return { icon: FileText, color: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-none', className: BASE };
      default:
        return { icon: Video, color: 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-none', className: BASE };
    }
  }

  const eventsOnSelectedDate = registrations.filter(reg => {
    if (!reg.event?.date) return false;
    const eventDate = new Date(reg.event.date);
    return selectedDate &&
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-none">
              <CalendarCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tightest">
              Academic <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Chronology</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
            Symphonize your educational odyssey with precision, punctuality, and a touch of professional elegance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-none flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-none" />
            <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Real-time Sync</span>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Main Calendar Section */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-none rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/40">
            <CardHeader className="bg-gradient-to-r from-white/90 to-white/50 p-8 border-b border-slate-100/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Event Matrix</CardTitle>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Nodal Chronological Mapping</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase px-2 py-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-indigo-50" /> Live Class
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase px-2 py-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full ring-4 ring-rose-50" /> Deadline
                  </div>
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
                  caption_label: "text-3xl font-black text-slate-950 uppercase tracking-tighter px-6 drop-shadow-sm",
                  nav: "flex items-center gap-3",
                  nav_button: "h-12 w-12 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 transition-all rounded-2xl flex items-center justify-center p-0 shadow-none hover:bg-slate-100 active:scale-95",
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
                    "h-full w-full p-4 font-bold text-slate-600 transition-all hover:bg-white rounded-[1.5rem] flex flex-col items-center justify-center gap-1 shadow-none",
                    "aria-selected:opacity-100"
                  ),
                  day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white shadow-none border-none scale-105 z-10",
                  day_today: "bg-indigo-50/50 text-indigo-700 border-2 border-indigo-100 ring-4 ring-white",
                  day_outside: "text-slate-200 opacity-40",
                  day_disabled: "text-slate-200 opacity-40 hover:bg-transparent",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-10 animate-in slide-in-from-right-8 duration-1000 delay-300">
          <Card className="border-none shadow-none rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl border border-white">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Bell className="w-5 h-5 text-amber-500" />
                    </div>
                    Today's Agenda
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] px-1">Institutional Commitments</CardDescription>
                </div>
                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-none">
                  {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              <div className="space-y-6">
                {eventsOnSelectedDate.length > 0 ? (
                  eventsOnSelectedDate.map((reg) => {
                    const { icon: Icon, color, className } = getEventTypeProps(reg.event?.type || 'Live Class');
                    return (
                      <div key={reg._id} className="group flex items-start gap-6 p-5 rounded-[2rem] hover:bg-indigo-50/50 transition-all duration-500 border border-transparent hover:border-indigo-100/50">
                        <div className={cn(className, color)}>
                          <Icon className="h-6 w-6 text-white drop-shadow-md" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                            {reg.event?.title}
                          </p>
                          <div className="flex flex-col gap-2 mt-3 text-slate-500">
                            <div className="flex items-center gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-black uppercase tracking-widest">{reg.event?.time || 'Pending'}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-black uppercase tracking-widest truncate">{reg.event?.location || 'Digital Auditorium'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="self-center">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all">
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
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

          {/* Call to Action Card */}
          <Card className="border-none shadow-none rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group cursor-pointer active:scale-95 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-800" />
            <div className="absolute top-0 right-0 p-10 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 opacity-20">
              <Video className="w-40 h-40" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <CardContent className="p-10 relative z-10 flex flex-col gap-6">
              <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] w-fit border border-white/20 shadow-none">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black leading-none tracking-tight">Virtual Symposium</h3>
                <p className="text-indigo-100/60 font-black text-[10px] uppercase tracking-[0.3em]">Advanced Scholastic Methods • Ongoing</p>
              </div>
              <Button className="w-full bg-white text-indigo-700 hover:bg-slate-50 hover:scale-[1.02] font-black h-14 rounded-2xl shadow-none transition-all uppercase tracking-widest text-xs">
                Enter Symposium Hall
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
