
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users, BookOpen, MessageSquare, ChevronRight,
    Plus, Video, Clock, Calendar, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";

export default function InstructorDashboard() {
    const { user } = useUser();
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [cRes, enRes, mRes, evRes] = await Promise.all([
                    apiFetch('/api/courses'),
                    apiFetch('/api/enrollments'),
                    apiFetch('/api/messages'),
                    fetch('/api/events'),
                ]);
                const [allCourses, allEnrollments, allMessages, events] = await Promise.all([
                    cRes.json(), enRes.json(), mRes.json(), evRes.json(),
                ]);

                const mine = Array.isArray(allCourses)
                    ? allCourses.filter((c: any) =>
                        c.instructorUid === user.uid || c.instructor?.name === user.displayName
                    )
                    : [];
                setCourses(mine);

                const myCourseIds = mine.map((c: any) => (c._id || c.id)?.toString());
                const myEnrollments = Array.isArray(allEnrollments)
                    ? allEnrollments.filter((en: any) => myCourseIds.includes(en.courseId?.toString()))
                    : [];
                setEnrollments(myEnrollments);

                const msgList = Array.isArray(allMessages) ? allMessages : [];
                setMessages(msgList.filter((m: any) => !m.isRead && m.receiverId === user.uid).slice(0, 4));

                const upcoming = (Array.isArray(events) ? events : [])
                    .filter((e: any) => e.date && isAfter(new Date(e.date), new Date()))
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3);
                setUpcomingEvents(upcoming);
            } catch (err) {
                console.error('instructor dashboard fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const unreadCount = messages.length;

    const kpiCards = [
        {
            label: 'Active Courses',
            value: courses.length.toString(),
            sub: 'Programmes you teach',
            icon: BookOpen,
            accent: 'text-[#0B1F3A]',
        },
        {
            label: 'Total Students',
            value: enrollments.length.toString(),
            sub: 'Across all courses',
            icon: Users,
            accent: 'text-[#1F7A5A]',
        },
        {
            label: 'Unread Messages',
            value: unreadCount.toString(),
            sub: 'Awaiting your reply',
            icon: MessageSquare,
            accent: unreadCount > 0 ? 'text-rose-600' : 'text-[#C8A96A]',
        },
    ];

    const safeDate = (d: any) => {
        if (!d) return null;
        const p = new Date(d);
        return Number.isNaN(p.getTime()) ? null : p;
    };

    if (loading) {
        return (
            <div className="p-12 space-y-12 animate-pulse bg-[#FAF9F6] min-h-screen">
                <div className="h-40 bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />
                <div className="grid grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200/50 rounded-none border border-[#0B1F3A]/5" />)}
                </div>
                <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-2 h-[500px] bg-slate-200/50 rounded-none" />
                    <div className="h-[500px] bg-slate-200/50 rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1600px] bg-[#FAF9F6]">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Faculty Portal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        Welcome, <span className="text-[#C8A96A]">{user?.displayName?.split(' ')[0]}.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed font-serif">
                        You are teaching {courses.length} {courses.length === 1 ? 'programme' : 'programmes'} with {enrollments.length} students enrolled.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-[#1F7A5A] text-white px-5 py-2 rounded-none font-black text-[10px] uppercase tracking-widest border-none">
                        ✓ Connection Ready
                    </Badge>
                    <Button asChild className="h-12 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#C8A96A] text-white hover:text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest shadow-none border-none transition-colors">
                        <Link href="/instructor/courses/new">
                            <Plus className="h-4 w-4 mr-2" /> New Course
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {kpiCards.map((card, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 pr-6 bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                        <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                            <card.icon className={cn("w-7 h-7", card.accent)} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">{card.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* Left — 2/3 */}
                <div className="lg:col-span-2 space-y-14">

                    {/* My Courses */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-8 mb-10">
                            <div>
                                <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">My Courses</h2>
                                <p className="text-slate-400 font-medium mt-2">Programmes you are currently teaching.</p>
                            </div>
                            <Link href="/instructor/courses" className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors">
                                Manage All <ChevronRight size={14} />
                            </Link>
                        </div>

                        {courses.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {courses.map((course: any) => (
                                    <div key={course._id || course.id} className="bg-white border border-[#0B1F3A]/10 shadow-sm hover:border-[#C8A96A] transition-all group overflow-hidden border-t-4 border-t-[#C8A96A]">
                                        <div className="relative h-44 w-full overflow-hidden bg-[#F6F4F2]">
                                            {course.imageUrl ? (
                                                <Image
                                                    src={course.imageUrl}
                                                    alt={course.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <BookOpen className="w-12 h-12 text-[#0B1F3A]/10" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <Badge className="bg-white/90 text-[#0B1F3A] font-black text-[9px] uppercase tracking-widest border-none rounded-none px-3 py-1">
                                                    {course.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <div>
                                                <h3 className="font-serif text-[#0B1F3A] text-xl leading-snug line-clamp-2">{course.title}</h3>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Users className="w-3 h-3" /> {course.enrollmentCount || 0} students
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" /> {course.duration || '—'} wks
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button asChild className="flex-1 h-11 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none transition-colors">
                                                    <Link href={`/instructor/courses/${course._id || course.id}`}>Manage</Link>
                                                </Button>
                                                <Button asChild variant="outline" className="h-11 px-4 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] hover:border-[#C8A96A] transition-colors">
                                                    <Link href={`/live-classes/course-${course._id || course.id}`}>
                                                        <Video className="w-4 h-4 text-[#C8A96A]" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-sm">
                                <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif text-[#0B1F3A] mb-3">No courses yet</h3>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed font-serif">
                                    Create your first course to start teaching students.
                                </p>
                                <Button asChild className="h-14 px-12 rounded-none bg-[#0B1F3A] hover:bg-[#C8A96A] hover:text-[#0B1F3A] text-white font-black text-[10px] uppercase tracking-widest shadow-none transition-colors">
                                    <Link href="/instructor/courses/new"><Plus className="w-4 h-4 mr-2" /> Create Course</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Students */}
                    <div>
                        <div className="flex justify-between items-end border-b border-[#0B1F3A]/10 pb-8 mb-10">
                            <div>
                                <h2 className="text-3xl font-serif text-[#0B1F3A] tracking-tight">Recent Students</h2>
                                <p className="text-slate-400 font-medium mt-2">Latest enrolments in your programmes.</p>
                            </div>
                            <Link href="/instructor/students" className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors">
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {enrollments.slice(0, 5).length > 0 ? (
                                enrollments.slice(0, 5).map((en: any, i: number) => {
                                    const enrolledDate = safeDate(en.enrolledAt);
                                    return (
                                        <div key={en.id || i} className="flex items-center gap-6 p-6 bg-white border border-[#0B1F3A]/10 shadow-sm hover:border-[#C8A96A] transition-all group">
                                            <Avatar className="w-12 h-12 rounded-none border border-[#0B1F3A]/10 flex-shrink-0">
                                                <AvatarImage src={en.userPhoto} />
                                                <AvatarFallback className="rounded-none bg-[#0B1F3A] text-white text-xs font-black">
                                                    {(en.userName || en.userId || '?')[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-[#0B1F3A] text-sm truncate">{en.userName || en.userId}</p>
                                                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{en.course?.title}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {enrolledDate ? format(enrolledDate, 'MMM dd, yyyy') : '—'}
                                                </p>
                                                <Badge className="mt-1 text-[8px] font-black uppercase tracking-widest rounded-none border border-[#1F7A5A]/30 bg-[#1F7A5A]/10 text-[#1F7A5A] shadow-none">
                                                    Enrolled
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-16 text-center bg-white border border-[#0B1F3A]/10 shadow-sm">
                                    <p className="text-slate-400 font-medium italic font-serif">No student enrolments yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — 1/3 */}
                <div className="space-y-14">

                    {/* Live Class Launcher */}
                    <div className="bg-[#0B1F3A] relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 p-10 space-y-8">
                            <h2 className="text-xl font-serif text-white flex items-center gap-3">
                                <div className="w-2 h-6 bg-[#C8A96A]" />
                                Live Classes
                            </h2>
                            <div className="space-y-4">
                                <div className="p-6 bg-white/5 border border-white/10">
                                    <p className="text-[9px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 bg-[#1F7A5A] rounded-full animate-pulse" />
                                        <p className="text-white font-black text-sm">Room Ready</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button asChild className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black rounded-none shadow-xl text-[10px] uppercase tracking-widest">
                                    <Link href={courses.length > 0 ? `/live-classes/course-${courses[0]._id || courses[0].id}` : '/live-classes'}>
                                        <Video className="w-4 h-4 mr-2" /> Start Live Class
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full h-12 rounded-none border-white/20 bg-white/5 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest shadow-none">
                                    <Link href="/instructor/schedule">
                                        View Schedule <ArrowUpRight className="w-3 h-3 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
                            <div className="w-2 h-6 bg-[#C8A96A]" />
                            Upcoming Events
                        </h2>
                        <Card className="p-10 rounded-none border border-[#0B1F3A]/10 shadow-md bg-white space-y-8 border-t-4 border-t-[#C8A96A]">
                            <div className="space-y-6">
                                {upcomingEvents.length > 0 ? upcomingEvents.map((ev: any, i: number) => {
                                    const d = safeDate(ev.date);
                                    return (
                                        <div key={ev._id || i} className="flex gap-5 group cursor-pointer">
                                            <div className="flex flex-col items-center justify-center bg-[#F6F4F2] border border-[#0B1F3A]/5 group-hover:bg-[#0B1F3A] group-hover:text-white rounded-none p-4 min-w-[64px] transition-all duration-300">
                                                <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-1">{d ? format(d, 'MMM') : '—'}</span>
                                                <span className="text-2xl font-black">{d ? format(d, 'dd') : '—'}</span>
                                            </div>
                                            <div className="space-y-1 py-1">
                                                <h4 className="font-serif text-[#0B1F3A] text-base group-hover:text-[#C8A96A] transition-colors leading-tight">{ev.title}</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d ? format(d, 'hh:mm a') : ''} {ev.location ? `· ${ev.location}` : ''}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-slate-400 font-medium italic text-center py-8 font-serif">No upcoming events.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Messages */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-3">
                            <div className="w-2 h-6 bg-[#C8A96A]" />
                            Messages
                            {unreadCount > 0 && (
                                <Badge className="ml-auto text-[8px] font-black uppercase tracking-widest rounded-none border-none bg-rose-500 text-white shadow-sm">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </h2>

                        <div className="bg-white border border-[#0B1F3A]/10 shadow-sm border-t-4 border-t-[#C8A96A]">
                            {messages.length > 0 ? (
                                messages.map((msg: any, i: number) => (
                                    <div key={msg._id || i} className="flex items-start gap-4 p-6 border-b border-[#0B1F3A]/5 last:border-none hover:bg-[#F6F4F2] transition-all">
                                        <Avatar className="w-10 h-10 rounded-none border border-[#0B1F3A]/10 flex-shrink-0">
                                            <AvatarFallback className="rounded-none bg-[#F6F4F2] text-[#0B1F3A] text-xs font-black">
                                                {(msg.senderId || '?')[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-[#0B1F3A] truncate">{msg.senderId}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center">
                                    <p className="text-slate-400 font-medium italic text-sm font-serif">Inbox clear.</p>
                                </div>
                            )}
                        </div>

                        <Link href="/instructor/communications" className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#0B1F3A] transition-colors">
                            Open Inbox <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
