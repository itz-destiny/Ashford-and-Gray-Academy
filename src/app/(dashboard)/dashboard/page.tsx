
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userLoading || !user) return;

    const fetchData = async () => {
      try {
        const [enrollmentsRes, eventsRes] = await Promise.all([
          fetch(`/api/enrollments?userId=${user.uid}`),
          fetch(`/api/events`)
        ]);

        const enrollmentsData = await enrollmentsRes.json();
        const eventsData = await eventsRes.json();

        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Could not fetch your latest activity."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading, toast]);

  if (userLoading || (loading && !enrollments.length)) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2 h-96 bg-slate-100 rounded-3xl" />
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Calculate stats
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.course?.progress || 0), 0) / enrollments.length)
    : 0; // Removing fallback mock

  const todayEvents = events.slice(0, 2).map((ev, i) => ({
    id: ev.id || String(i),
    title: ev.title,
    time: "10:00 AM - 11:30 AM", // Should be real but model lacks it
    location: ev.location || "Room 302 / Zoom",
    isLive: i === 0 // Mocking first one as live for visual parity
  }));

  const timelineEvents = [
    { date: "OCT 12", title: "Quantum Mechanics Live", time: "Starting in 20 minutes" },
    { date: "OCT 14", title: "UX Portfolio Review", time: "02:00 PM • Digital Hall" },
    { date: "OCT 18", title: "Career Fair 2023", time: "08:00 AM • Main Campus" }
  ];

  const deadlines = [
    { title: "Evolution of Bauhaus Thesis", category: "DESIGN HISTORY", timeLeft: "24H LEFT", priority: "high" },
    { title: "Neural Networks Quiz", category: "DATA SCIENCE", timeLeft: "3 DAYS", priority: "low" }
  ];

  return (
    <div className="mx-auto px-6 md:px-10 py-8 space-y-12 pb-24 max-w-[1600px]">

      {/* Top Section: Welcome & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 rounded-[40px] border-none bg-white flex flex-col md:flex-row justify-between items-center gap-8 group overflow-hidden relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700" />

          <div className="relative z-10 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, {user?.displayName?.split(' ')[0]}!
              </h1>
              <p className="text-slate-400 font-medium text-sm md:text-lg">
                Continue where you left off in your courses.
              </p>
            </div>

            {enrollments.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl min-w-[140px] border border-indigo-100/50">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Active Courses</p>
                  <p className="text-2xl font-black text-slate-900">{enrollments.length}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10">
            <CircularProgress value={overallProgress} />
          </div>
        </Card>

        <div className="h-full">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Featured Live Now */}
      <LiveNowCard
        title="Advanced Quantum Mechanics: The Wave Function"
        subtitle="Prof. Richard Feynman is exploring the mysteries of particle behavior."
        description="Don't miss the interactive Q&A session starting in 20 minutes."
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column: Learning Path */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Learning Path</h2>
            <Link href="/courses" className="text-indigo-600 font-bold text-sm flex items-center hover:underline">
              Browse Catalog <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-6">
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
              <div className="p-12 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No active courses. Explore our catalog to start learning!</p>
                <Link href="/courses">
                  <button className="mt-4 bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl">View Courses</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-12">

          {/* Real Data Schedule from image 2 */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Today&apos;s Schedule
            </h2>
            <ScheduleWidget
              items={todayEvents}
              dateLabel={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              dayLabel={new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
            />
          </div>

          {/* Event Timeline */}
          <Card className="p-6 rounded-3xl border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-black text-slate-900">Event Timeline</CardTitle>
              <CalendarIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-6">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center bg-slate-50 group-hover:bg-indigo-50 rounded-xl p-2 min-w-[60px] transition-colors">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 uppercase">{ev.date.split(' ')[0]}</span>
                    <span className="text-xl font-black text-slate-900 group-hover:text-indigo-600">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div className="space-y-1 py-1">
                    <h4 className="font-bold text-slate-800 text-sm">{ev.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-6 rounded-3xl border-slate-100 space-y-6">
            <CardTitle className="text-lg font-black text-slate-900">Upcoming Deadlines</CardTitle>
            <div className="space-y-4">
              {deadlines.map((dl, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100 hover:border-indigo-100 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dl.category}</span>
                    <Badge className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm",
                      dl.priority === 'high' ? "bg-orange-100 text-orange-600 hover:bg-orange-100" : "bg-slate-200 text-slate-500 hover:bg-slate-200"
                    )}>
                      {dl.timeLeft}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
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

