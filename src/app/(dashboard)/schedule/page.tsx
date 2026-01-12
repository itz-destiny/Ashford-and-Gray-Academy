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
    const BASE = "mt-1 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 duration-300";
    switch (type) {
      case 'Live Class':
        return { icon: Video, color: 'bg-indigo-500 shadow-indigo-100', className: BASE };
      case 'Quiz Due':
        return { icon: CalendarCheck, color: 'bg-rose-500 shadow-rose-100', className: BASE };
      case 'Assignment':
        return { icon: FileText, color: 'bg-amber-500 shadow-amber-100', className: BASE };
      default:
        return { icon: Video, color: 'bg-slate-500 shadow-slate-100', className: BASE };
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-indigo-600" />
            Academic Chronology
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Orchestrate your educational journey with precision and punctuality.</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1.5 font-bold rounded-full flex gap-2 items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Synchronized
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl border border-white/20">
            <CardHeader className="bg-white/80 p-6 border-b border-slate-50">
              <div className="flex justify-between items-center px-4">
                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">Event Matrix</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Live
                    <div className="w-2 h-2 bg-rose-500 rounded-full" /> Deadlines
                  </div>
                </div>
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
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
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
                  Today's Agenda
                </CardTitle>
                <Badge variant="outline" className="font-bold border-slate-200 text-slate-400">
                  {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </Badge>
              </div>
              <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 px-1">Institutional Commitments</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                {eventsOnSelectedDate.length > 0 ? (
                  eventsOnSelectedDate.map((reg) => {
                    const { icon: Icon, className } = getEventTypeProps(reg.event?.type || 'Live Class');
                    return (
                      <div key={reg._id} className="group flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100">
                        <div className={className}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors truncate">
                            {reg.event?.title}
                          </p>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                              <Clock className="w-3 h-3" />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{reg.event?.time || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
                              <MapPin className="w-3 h-3" />
                              <span className="text-[11px] font-bold uppercase tracking-tight truncate">{reg.event?.location || 'Digital Lecture Hall'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="self-center">
                          <Button variant="ghost" size="icon" className="rounded-full text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-20 px-8 flex flex-col items-center gap-6 opacity-30 select-none">
                    <div className="p-6 bg-slate-100 rounded-full">
                      <CalendarCheck className="w-12 h-12 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">Clear Registry</p>
                      <p className="text-sm font-bold text-slate-500 mt-1">No institutional activities recorded for this chronological marker.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-3xl bg-indigo-700 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900" />
            <div className="absolute top-0 right-0 p-8 transform group-hover:scale-150 transition-transform duration-700 opacity-20">
              <Video className="w-32 h-32" />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-2xl w-fit">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black leading-tight">Join Virtual Symposium</h3>
                <p className="text-indigo-100/70 font-bold text-xs uppercase tracking-widest mt-1">Next: Advanced Scholastic Methods</p>
              </div>
              <Button className="mt-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black h-12 rounded-2xl shadow-xl shadow-indigo-900/50 transition-all group-hover:-translate-y-1">
                Enter Meeting Hall
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
