"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, BarChart, BookOpen, Calendar, CheckSquare, GraduationCap, LineChart, Mail, MessageSquare, MoreHorizontal, Plus, Users, Video } from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

export default function InstructorDashboardPage() {
  const { user } = useUser();
  const [instructorCourses, setInstructorCourses] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ activeCourses: 0, enrollments: 0, assignments: 0, messages: 0 });
  const [recentEnrollments, setRecentEnrollments] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [cRes, enRes, mRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch(`/api/messages?userId=${user.uid}`)
      ]);
      const [courses, allEnrollments, messages] = await Promise.all([
        cRes.json(), enRes.json(), mRes.json()
      ]);

      const mine = Array.isArray(courses) ? courses.filter((c: any) => c.instructor.name === user.displayName) : [];
      setInstructorCourses(mine);

      const myCourseIds = mine.map((c: any) => c._id);
      const myEnrollments = Array.isArray(allEnrollments) ? allEnrollments.filter((en: any) => myCourseIds.includes(en.courseId)) : [];
      setRecentEnrollments(myEnrollments.slice(0, 5));

      setMessages(Array.isArray(messages) ? messages.slice(0, 3) : []);
      setStats({
        activeCourses: mine.length,
        enrollments: myEnrollments.length,
        assignments: 0, // Placeholder
        messages: Array.isArray(messages) ? messages.filter((m: any) => !m.isRead && m.receiverId === user.uid).length : 0
      });
    };
    fetchData();
  }, [user]);

  const statsItems = [
    { label: "Active Courses", value: stats.activeCourses.toString(), icon: GraduationCap, bg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Total Students", value: stats.enrollments.toString(), icon: Users, bg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Unread Messages", value: stats.messages.toString(), icon: Mail, bg: "bg-rose-50", iconColor: "text-rose-600" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Instructor Overview</h1>
          <p className="text-slate-500 font-medium">Monitoring academic performance and course engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-6 rounded-xl shadow-none transition-all active:scale-95">
            <Link href="/instructor/courses/new"><Plus className="w-4 h-4 mr-2" /> Create New Course</Link>
          </Button>
          <div className="flex items-center gap-2 px-4 h-11 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Session Ready
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {statsItems.map((stat, i) => (
          <Card key={i} className="border-none bg-white rounded-3xl group hover:bg-slate-50 transition-colors shadow-none">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h2 className="text-4xl font-black text-slate-900">{stat.value}</h2>
                </div>
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Active Curriculum
              </h2>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm" asChild>
                <Link href="/instructor/courses">Manage All <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {instructorCourses.map(course => (
                <Card key={course._id} className="overflow-hidden border-none rounded-[32px] group hover:-translate-y-1 transition-all duration-500 shadow-none bg-white border border-slate-50">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 backdrop-blur text-slate-900 font-black text-[9px] uppercase tracking-widest border-none px-3 py-1">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-xl font-black text-slate-900 leading-snug line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold">{course.reviews * 3}+ Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <BarChart className="w-4 h-4" />
                        <span className="text-xs font-bold">85% Avg</span>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-11 rounded-xl shadow-none">
                      <Link href={`/instructor/courses/${course._id}`}>Manage Content</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                Enrollment Stream
              </h2>
              <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-600 font-black text-[10px] tracking-widest px-3 py-1 uppercase">Live Updates</Badge>
            </div>

            <div className="rounded-2xl border border-slate-50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Selected Course</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEnrollments.map((enr: any) => (
                    <tr key={enr.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border-2 border-slate-50">
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs">{enr.userId[0]}</AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-slate-900 truncate max-w-[120px]">{enr.userId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-600 truncate max-w-[150px]">{enr.course?.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled {new Date(enr.enrolledAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 font-bold px-3 py-0.5 rounded-full text-[10px]">VERIFIED</Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:bg-indigo-50 font-black text-xs uppercase tracking-tight">
                          <Link href={`/instructor/students?studentId=${enr.userId}`}>Full Bio</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {recentEnrollments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-16 text-center text-slate-400 font-bold italic bg-slate-50/30">No recent enrollment activity detected.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Column: Redesigned Event Matrix */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Event Matrix
            </h2>

            <Card className="border-none bg-slate-900 text-white rounded-[40px] overflow-hidden relative shadow-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20" />
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    <h3 className="text-3xl font-black">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}</h3>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-indigo-600 p-5 rounded-3xl border border-indigo-500 relative group cursor-pointer hover:bg-indigo-500 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">10:00 AM — 11:30 AM</span>
                      <Badge className="bg-white/20 text-white font-black text-[8px] tracking-widest border-none px-2 py-0.5">LIVE NOW</Badge>
                    </div>
                    <h4 className="text-lg font-black leading-tight mb-1">Advanced Cell Biology</h4>
                    <p className="text-xs text-indigo-200 font-medium">Room 302 / Zoom Relay</p>
                  </div>

                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">02:00 PM — 04:00 PM</span>
                    </div>
                    <h4 className="text-lg font-black leading-tight mb-1 font-medium text-slate-300">Office Consultation</h4>
                    <p className="text-xs text-slate-500 font-medium">Faculty Wing Office</p>
                  </div>
                </div>

                <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl shadow-none text-xs uppercase tracking-tight">
                  Launch Calendar Matrix
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none bg-white rounded-[32px] border border-slate-50 shadow-none">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  Communications
                </h3>
                <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none px-3 py-1 font-bold text-[10px]">3 PENDING</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-5">
                {messages.map(msg => (
                  <div key={msg._id} className="flex gap-4 group cursor-pointer">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-none ring-1 ring-slate-100">
                      <AvatarFallback className="bg-slate-50 text-slate-600 font-black text-xs">{msg.senderId[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{msg.senderId}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Signal Inbox Clear</p>
                  </div>
                )}
              </div>
              <Button variant="outline" asChild className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all">
                <Link href="/instructor/communications">Open Communication Hub</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
