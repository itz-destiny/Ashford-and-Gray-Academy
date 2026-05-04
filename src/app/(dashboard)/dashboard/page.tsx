
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/dashboard/circular-progress";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { LiveNowCard } from "@/components/dashboard/live-now-card";
import { CoursePathCard } from "@/components/dashboard/course-path-card";
import { ScheduleWidget } from "@/components/dashboard/schedule-widget";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, ChevronRight, BookOpen, Target, Award } from "lucide-react";
import Link from "next/link";
import { format, isToday, isAfter, parseISO } from "date-fns";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userLoading || !user) return;

    const fetchData = async () => {
      try {
        const [enrollmentsRes, eventsRes, assignmentsRes] = await Promise.all([
          fetch(`/api/enrollments?userId=${user.uid}`),
          fetch(`/api/events`),
          fetch(`/api/assignments?userId=${user.uid}`)
        ]);

        const enrollmentsData = await enrollmentsRes.json();
        const eventsData = await eventsRes.json();
        const assignmentsData = await assignmentsRes.json();

        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Institutional Sync Error",
          description: "Could not synchronize your academic records."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading, toast]);

  if (userLoading || (loading && !enrollments.length)) {
    return (
      <div className="p-12 space-y-12 animate-pulse bg-[#FCFCFE] min-h-screen">
        <div className="h-48 bg-slate-100 rounded-[40px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 h-[600px] bg-slate-100 rounded-[40px]" />
          <div className="h-[600px] bg-slate-100 rounded-[40px]" />
        </div>
      </div>
    );
  }

  // Real-time Data Processing
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.course?.progress || 0), 0) / enrollments.length)
    : 0;

  // Filter events for today's schedule
  const todayEvents = events
    .filter(ev => ev.date && !isNaN(new Date(ev.date).getTime()) && isToday(new Date(ev.date)))
    .map(ev => ({
      id: ev.id,
      title: ev.title,
      time: format(new Date(ev.date), "hh:mm a"),
      location: ev.location,
      isLive: ev.isLive || false
    }));

  // Filter upcoming events for timeline
  const upcomingEvents = events
    .filter(ev => ev.date && !isNaN(new Date(ev.date).getTime()) && isAfter(new Date(ev.date), new Date()) && !isToday(new Date(ev.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Use real assignments for deadlines
  const deadlines = assignments
    .filter(a => a.dueDate && !isNaN(new Date(a.dueDate).getTime()) && !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)
    .map(a => ({
      title: a.title,
      category: a.category || "ACADEMIC",
      timeLeft: format(new Date(a.dueDate), "MMM dd"),
      priority: isAfter(new Date(), new Date(a.dueDate)) ? "high" : "low"
    }));

  // Fallback for demonstration if no real deadlines exist yet
  const displayDeadlines = deadlines.length > 0 ? deadlines : [
    { title: "Initial Institutional Orientation", category: "FOUNDATION", timeLeft: "Pending", priority: "low" }
  ];

  const liveEvent = events.find(ev => ev.isLive);

  return (
    <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FCFCFE]">

      {/* Top Section: Welcome & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <Card className="lg:col-span-2 p-12 rounded-[50px] border-none bg-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-12 group overflow-hidden relative">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-1000" />

          <div className="relative z-10 space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="w-1.5 h-8 bg-[#1F7A5A] rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Student Portal</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                Distinction, <br />
                <span className="italic text-[#C8A96A]">{user?.displayName?.split(' ')[0]}.</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed">
                You are currently tracking {enrollments.length} professional programs. Continue your path toward institutional mastery.
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6">
               <div className="flex items-center gap-4 p-2 pr-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1F7A5A]">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Paths</p>
                     <p className="text-lg font-black text-[#0B1F3A]">{enrollments.length}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-2 pr-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#C8A96A]">
                     <Award className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certifications</p>
                     <p className="text-lg font-black text-[#0B1F3A]">0</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative z-10 scale-110">
            <CircularProgress value={overallProgress} />
          </div>
        </Card>

        <div className="h-full">
          <ActivityHeatmap data={enrollments.map(() => Math.floor(Math.random() * 4) + 1)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* Left Column: Learning Path */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex justify-between items-end border-b border-slate-100 pb-8">
            <div>
               <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Your Academic Path</h2>
               <p className="text-slate-400 font-medium mt-2">Professional programs and certifications currently in progress.</p>
            </div>
            <Link href="/courses" className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">
              Institutional Catalog <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid gap-8">
            {enrollments.length > 0 ? (
              enrollments.map((en) => (
                <CoursePathCard
                  key={en.id}
                  title={en.course?.title}
                  category={en.course?.category}
                  progress={en.course?.progress || 0}
                  imageUrl={en.course?.imageUrl}
                />
              ))
            ) : (
              <div className="p-20 text-center bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-slate-200 mx-auto mb-8">
                   <Target className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-[#0B1F3A] mb-4">No Active Programs</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">Your learning path is currently clear. Explore our curated selection of professional programs.</p>
                <Link href="/courses">
                  <button className="bg-[#0B1F3A] text-white font-black px-12 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest">Enroll in a Program</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-16">

          {/* Today's Schedule */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#C8A96A] rounded-full" />
               Institutional Agenda
            </h2>
            <ScheduleWidget
              items={todayEvents}
              dateLabel={format(new Date(), "MMMM yyyy")}
              dayLabel={format(new Date(), "EEEE, do")}
            />
          </div>

          {/* Event Timeline */}
          <Card className="p-10 rounded-[40px] border-none shadow-sm bg-white space-y-10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-serif text-[#0B1F3A]">Upcoming Events</CardTitle>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1F7A5A]">
                 <CalendarIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-8">
              {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                <div key={i} className="flex gap-6 group cursor-pointer">
                  <div className="flex flex-col items-center justify-center bg-slate-50 group-hover:bg-[#1F7A5A] group-hover:text-white rounded-2xl p-4 min-w-[70px] transition-all duration-500 shadow-sm">
                    <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">{ev.date && !isNaN(new Date(ev.date).getTime()) ? format(new Date(ev.date), "MMM") : "---"}</span>
                    <span className="text-2xl font-black">{ev.date && !isNaN(new Date(ev.date).getTime()) ? format(new Date(ev.date), "dd") : "--"}</span>
                  </div>
                  <div className="space-y-2 py-1">
                    <h4 className="font-serif text-[#0B1F3A] text-lg group-hover:text-[#1F7A5A] transition-colors leading-tight">{ev.title}</h4>
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock className="w-3 h-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest">{ev.date && !isNaN(new Date(ev.date).getTime()) ? format(new Date(ev.date), "hh:mm a") : "--:--"} • {ev.location}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 font-medium italic text-center py-8">No upcoming events scheduled.</p>
              )}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-10 rounded-[40px] border-none shadow-sm bg-white space-y-10">
            <CardTitle className="text-xl font-serif text-[#0B1F3A]">Academic Deadlines</CardTitle>
            <div className="space-y-6">
              {displayDeadlines.map((dl, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-50 hover:border-[#C8A96A]/20 transition-all cursor-pointer group shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dl.category}</span>
                    <Badge className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                      dl.priority === 'high' ? "bg-red-50 text-red-600" : "bg-[#1F7A5A]/10 text-[#1F7A5A]"
                    )}>
                      {dl.timeLeft}
                    </Badge>
                  </div>
                  <h4 className="text-base font-serif text-[#0B1F3A] group-hover:text-[#1F7A5A] transition-colors leading-tight">
                    {dl.title}
                  </h4>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

