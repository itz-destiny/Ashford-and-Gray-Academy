"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarCheck, FileText, Video, Clock, MapPin, ChevronRight, Bell } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";

export default function SchedulePage() {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSchedule = async () => {
      try {
        const res = await apiFetch('/api/registrations');
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
    const BASE = "mt-1 flex h-12 w-12 items-center justify-center rounded-none border transition-all duration-300";
    switch (type) {
      case 'Live Class':
        return { icon: Video, className: cn(BASE, "bg-[#0B1F3A] border-[#0B1F3A] text-white") };
      case 'Quiz Due':
        return { icon: CalendarCheck, className: cn(BASE, "bg-[#C8A96A]/10 border-[#C8A96A]/30 text-[#C8A96A]") };
      case 'Assignment':
        return { icon: FileText, className: cn(BASE, "bg-[#F6F4F2] border-[#0B1F3A]/10 text-[#0B1F3A]") };
      default:
        return { icon: Video, className: cn(BASE, "bg-[#F6F4F2] border-[#0B1F3A]/10 text-[#0B1F3A]") };
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
    <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#C8A96A]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">My Schedule</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
            Academic <span className="text-[#C8A96A]">Calendar.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
            Your live classes, deadlines, and registered events in one place.
          </p>
        </div>
        <div className="flex items-center gap-4 px-5 py-3 bg-white border border-[#0B1F3A]/10 rounded-none shadow-sm">
          <div className="w-2 h-2 bg-[#1F7A5A] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-[#0B1F3A] uppercase tracking-widest">Real-time Sync</span>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Calendar */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
            <div className="p-8 border-b border-[#0B1F3A]/10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-serif text-[#0B1F3A]">Calendar</h2>
                  <p className="text-slate-400 font-medium text-sm mt-1">Select a date to view its activity.</p>
                </div>
                <div className="flex items-center gap-5 bg-[#F6F4F2] px-4 py-2.5 border border-[#0B1F3A]/5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#0B1F3A]" /> Live Class
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#C8A96A]" /> Deadline
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-4 md:p-10">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                classNames={{
                  months: "flex flex-col space-y-12",
                  month: "space-y-6 w-full",
                  month_caption: "flex justify-center pt-2 relative items-center mb-8",
                  caption_label: "text-2xl font-serif text-[#0B1F3A] px-6",
                  nav: "flex items-center justify-between absolute inset-x-0 top-2",
                  button_previous: "h-11 w-11 bg-white hover:bg-[#F6F4F2] border border-[#0B1F3A]/10 text-[#0B1F3A] transition-all rounded-none flex items-center justify-center p-0 shadow-sm active:scale-95",
                  button_next: "h-11 w-11 bg-white hover:bg-[#F6F4F2] border border-[#0B1F3A]/10 text-[#0B1F3A] transition-all rounded-none flex items-center justify-center p-0 shadow-sm active:scale-95",
                  month_grid: "w-full border-collapse table-fixed",
                  weekdays: "",
                  weekday: "text-[#0B1F3A]/40 font-black text-[10px] uppercase tracking-[0.2em] h-10 align-middle text-center",
                  week: "",
                  day: cn(
                    "h-24 text-center text-sm p-1 relative align-middle transition-all duration-300",
                    "[&:has([aria-selected])]:bg-[#C8A96A]/5"
                  ),
                  day_button: cn(
                    "h-full w-full p-4 font-bold text-slate-600 transition-all hover:bg-[#F6F4F2] rounded-none flex flex-col items-center justify-center gap-1"
                  ),
                  selected: "[&>button]:bg-[#0B1F3A] [&>button]:text-white [&>button]:hover:bg-[#0B1F3A] [&>button]:hover:text-white [&>button]:focus:bg-[#0B1F3A] [&>button]:focus:text-white z-10",
                  today: "[&>button]:bg-[#C8A96A]/10 [&>button]:text-[#0B1F3A] [&>button]:border-2 [&>button]:border-[#C8A96A]/30",
                  outside: "[&>button]:text-slate-200 [&>button]:opacity-40",
                  disabled: "[&>button]:text-slate-200 [&>button]:opacity-40 [&>button]:hover:bg-transparent",
                  range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none flex items-center justify-center text-[#C8A96A]">
                      <Bell className="w-5 h-5" />
                    </div>
                    Today's Agenda
                  </h2>
                </div>
                <div className="px-4 py-1.5 bg-[#0B1F3A] text-white text-[10px] font-black uppercase tracking-widest">
                  {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
            <CardContent className="p-8 pt-4">
              <div className="space-y-6">
                {eventsOnSelectedDate.length > 0 ? (
                  eventsOnSelectedDate.map((reg) => {
                    const { icon: Icon, className } = getEventTypeProps(reg.event?.type || 'Live Class');
                    return (
                      <div key={reg._id} className="group flex items-start gap-5 p-5 rounded-none hover:bg-[#F6F4F2]/60 transition-all duration-300 border border-transparent hover:border-[#0B1F3A]/5">
                        <div className={className}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="font-serif text-[#0B1F3A] text-lg leading-tight group-hover:text-[#C8A96A] transition-colors truncate">
                            {reg.event?.title}
                          </p>
                          <div className="flex flex-col gap-2 mt-3 text-slate-500">
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-3.5 h-3.5 text-[#C8A96A]" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{reg.event?.time || 'Pending'}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
                              <span className="text-[10px] font-black uppercase tracking-widest truncate">{reg.event?.location || 'Online'}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none text-slate-300 group-hover:text-[#C8A96A] group-hover:bg-[#F6F4F2] transition-all shrink-0">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-20 px-8 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-[#F6F4F2] border border-[#0B1F3A]/10 rounded-none shadow-sm flex items-center justify-center text-slate-300">
                      <CalendarCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-serif text-[#0B1F3A]">Nothing Scheduled</p>
                      <p className="text-sm font-medium text-slate-400 max-w-[220px] leading-relaxed">No activity recorded for this date.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] rounded-none shadow-xl bg-[#0B1F3A] text-white overflow-hidden relative group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
            <CardContent className="p-10 relative z-10 flex flex-col gap-8">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-none flex items-center justify-center">
                <Video className="w-7 h-7 text-[#C8A96A]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif leading-tight text-white">Live Classes</h3>
                <p className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.3em]">Join your next session on time</p>
              </div>
              <Button className="w-full bg-[#C8A96A] text-[#0B1F3A] hover:bg-[#B69759] font-black h-14 rounded-none shadow-none transition-all uppercase tracking-widest text-[10px] border-none" asChild>
                <Link href="/my-courses">Go to My Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
