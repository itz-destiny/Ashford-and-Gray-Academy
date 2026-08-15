"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarCheck, FileText, Video, Clock, MapPin, ChevronRight, Bell, GraduationCap } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { format, isSameDay } from "date-fns";

type LectureSession = {
  _id: string;
  startTime: string;
  endTime: string;
  programmeName: string;
  courseTitle?: string;
  module: string;
  lecturerName: string;
  status: string;
  zoomJoinUrl?: string;
};

type AgendaItem = {
  key: string;
  kind: "lecture" | "event";
  title: string;
  time: string;
  location: string;
  href?: string;
};

export default function SchedulePage() {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [lectureSessions, setLectureSessions] = useState<LectureSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSchedule = async () => {
      try {
        const [regRes, sessionsRes] = await Promise.all([
          apiFetch('/api/registrations'),
          apiFetch('/api/timetable/my-sessions'),
        ]);
        const regData = await regRes.json();
        const sessionsData = await sessionsRes.json().catch(() => null);
        if (Array.isArray(regData)) setRegistrations(regData);
        if (sessionsData?.success && Array.isArray(sessionsData.sessions)) setLectureSessions(sessionsData.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user]);

  // Every calendar day that has a lecture or a registered event — drives the
  // small dot indicator on the calendar grid.
  const activityDates = useMemo(() => {
    const dates: Date[] = [];
    for (const s of lectureSessions) dates.push(new Date(s.startTime));
    for (const r of registrations) if (r.event?.date) dates.push(new Date(r.event.date));
    return dates;
  }, [lectureSessions, registrations]);

  const agendaForSelectedDate = useMemo<AgendaItem[]>(() => {
    if (!selectedDate) return [];
    const items: AgendaItem[] = [];

    for (const s of lectureSessions) {
      const start = new Date(s.startTime);
      if (!isSameDay(start, selectedDate)) continue;
      items.push({
        key: `lecture-${s._id}`,
        kind: 'lecture',
        title: `${s.courseTitle || s.programmeName}: ${s.module}`,
        time: `${format(start, 'hh:mm a')} – ${format(new Date(s.endTime), 'hh:mm a')}`,
        location: s.lecturerName ? `Lecturer: ${s.lecturerName}` : 'Live Class',
        href: s.zoomJoinUrl && s.status === 'scheduled' ? s.zoomJoinUrl : undefined,
      });
    }

    for (const reg of registrations) {
      if (!reg.event?.date) continue;
      const eventDate = new Date(reg.event.date);
      if (!isSameDay(eventDate, selectedDate)) continue;
      items.push({
        key: `event-${reg._id}`,
        kind: 'event',
        title: reg.event.title,
        time: reg.event.time || 'Pending',
        location: reg.event.location || 'Online',
      });
    }

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [lectureSessions, registrations, selectedDate]);

  const getAgendaProps = (kind: AgendaItem['kind']) => {
    const BASE = "mt-1 flex h-12 w-12 items-center justify-center rounded-none border transition-all duration-300";
    return kind === 'lecture'
      ? { icon: GraduationCap, className: cn(BASE, "bg-[#0B1F3A] border-[#0B1F3A] text-white") }
      : { icon: CalendarCheck, className: cn(BASE, "bg-[#C8A96A]/10 border-[#C8A96A]/30 text-[#C8A96A]") };
  };

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
            Your lecture timetable and registered events in one place.
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
                  <p className="text-slate-400 font-medium text-sm mt-1">Days with a dot have a lecture or event — select one to view it.</p>
                </div>
                <div className="flex items-center gap-5 bg-[#F6F4F2] px-4 py-2.5 border border-[#0B1F3A]/5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#0B1F3A]" /> Lecture
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#C8A96A]" /> Event
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-4 md:p-10">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasActivity: activityDates }}
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
                modifiersClassNames={{
                  hasActivity: "[&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:bg-[#C8A96A] [&>button]:relative",
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
                {loading ? (
                  <div className="text-center py-20 text-slate-300 font-serif italic">Loading your schedule…</div>
                ) : agendaForSelectedDate.length > 0 ? (
                  agendaForSelectedDate.map((item) => {
                    const { icon: Icon, className } = getAgendaProps(item.kind);
                    const content = (
                      <div className="group flex items-start gap-5 p-5 rounded-none hover:bg-[#F6F4F2]/60 transition-all duration-300 border border-transparent hover:border-[#0B1F3A]/5">
                        <div className={className}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="font-serif text-[#0B1F3A] text-lg leading-tight group-hover:text-[#C8A96A] transition-colors">
                            {item.title}
                          </p>
                          <div className="flex flex-col gap-2 mt-3 text-slate-500">
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-3.5 h-3.5 text-[#C8A96A]" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{item.time}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
                              <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.location}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none text-slate-300 group-hover:text-[#C8A96A] group-hover:bg-[#F6F4F2] transition-all shrink-0">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    );
                    return item.href ? (
                      <Link key={item.key} href={item.href} target="_blank">{content}</Link>
                    ) : (
                      <div key={item.key}>{content}</div>
                    );
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
