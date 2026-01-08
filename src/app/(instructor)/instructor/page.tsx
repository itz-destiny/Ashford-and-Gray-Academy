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
import { ArrowLeft, ArrowRight, BarChart, BookOpen, Calendar, CheckSquare, GraduationCap, LineChart, Mail, MessageSquare, MoreHorizontal, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function InstructorDashboardPage() {
  const courses = [
    {
      id: "bio-101",
      code: "BIO-101",
      title: "Intro to Biology",
      dept: "Science Dept.",
      students: 45,
      schedule: "Mon/Wed",
      progress: 65,
      imageUrl: "/course1.jpeg",
      imageHint: "biology lab",
    },
    {
      id: "chm-202",
      code: "CHM-202",
      title: "Organic Chemistry",
      dept: "Science Dept.",
      students: 32,
      schedule: "Tue/Thu",
      progress: 32,
      imageUrl: "/course2.jpeg",
      imageHint: "chemistry beaker",
    }
  ];

  const recentMessages = [
    { id: 1, name: "Sarah Jenkins", message: "Question about the assignment...", time: "2m ago", avatar: "SJ" },
    { id: 2, name: "Mike Ross", message: "Can I get an extension on...", time: "1h ago", avatar: "MR" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & System Status - Optional derived from context, omitting for strict design match or keeping simple */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500">Welcome to Ashford and Gray Fusion Academy Instructor Dashboard.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            System Online
          </div>
          <div className="px-3 py-1 bg-white border rounded text-xs text-slate-600">
            Fall Semester 2023
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Courses", value: "12", icon: GraduationCap, sub: "2 New", subType: "success", subText: "vs last term", bg: "bg-indigo-50", iconColor: "text-indigo-600" },
          { label: "Total Enrollments", value: "1,240", icon: Users, sub: "15%", subType: "success", subText: "growth", bg: "bg-blue-50", iconColor: "text-blue-600" },
          { label: "Assignments", value: "28", icon: CheckSquare, sub: "5 Pending Review", subType: "warning", subText: "", bg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Unread Messages", value: "34", icon: Mail, sub: "Response time:", subType: "neutral", subText: "2h avg", bg: "bg-rose-50", iconColor: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <h2 className="text-3xl font-bold text-slate-900">{stat.value}</h2>
                </div>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                {stat.subType === 'success' && (
                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <LineChart className="w-3 h-3" /> {stat.sub}
                  </span>
                )}
                {stat.subType === 'warning' && (
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                    {stat.sub}
                  </span>
                )}
                {stat.subType === 'neutral' && (
                  <span className="text-slate-500">
                    {stat.sub}
                  </span>
                )}
                <span className="text-slate-400">{stat.subText}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Courses</h2>
            </div>
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full">
                  <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                  <Badge className="absolute top-4 right-4 bg-white text-slate-900 hover:bg-white">{course.code}</Badge>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <p className="text-xs text-white/80 font-medium mb-1">{course.dept}</p>
                    <h3 className="text-white font-bold text-xl">{course.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> {course.students} Students
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {course.schedule}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Course Progress</span>
                      <span className="text-slate-900">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1">Syllabus</Button>
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Manage Course</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Enrollments</h2>
            </div>
            {/* Simplified table placeholder as requested to match layout structure primarily */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-white">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Avatar className="w-8 h-8"><AvatarImage src="/avatar-1.png" /><AvatarFallback>LJ</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-slate-900">Liam Johnson</p>
                        <p className="text-xs text-slate-500">ID: 882910</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Intro to Biology</td>
                    <td className="px-4 py-3 text-slate-600">Oct 24, 2023</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge></td>
                    <td className="px-4 py-3 text-right"><Button variant="secondary" size="sm" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100">Review</Button></td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Avatar className="w-8 h-8"><AvatarImage src="/avatar-2.png" /><AvatarFallback>EW</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-slate-900">Emma Wilson</p>
                        <p className="text-xs text-slate-500">ID: 882911</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Organic Chemistry</td>
                    <td className="px-4 py-3 text-slate-600">Oct 23, 2023</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge></td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4 text-slate-400" /></Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-none shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-indigo-200 text-sm">October 2023</p>
                  <h2 className="text-2xl font-bold">Tuesday, 26</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-indigo-200">10:00 AM - 11:30 AM</p>
                    <Badge className="bg-white/20 hover:bg-white/30 text-xs py-0 h-5">LIVE</Badge>
                  </div>
                  <p className="font-bold">BIO-101 Lecture</p>
                  <p className="text-xs text-indigo-200">Room 302 / Zoom</p>
                </div>

                <div className="bg-indigo-800/50 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-indigo-300">02:00 PM - 04:00 PM</p>
                  </div>
                  <p className="font-medium">Office Hours</p>
                  <p className="text-xs text-indigo-300">Faculty Office</p>
                </div>
              </div>

              <Button className="w-full mt-6 bg-white text-indigo-600 hover:bg-indigo-50 font-bold">
                View Full Calendar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-base text-slate-800">Messages</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-rose-100 text-rose-600 hover:bg-rose-200">3 New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarImage src={`/avatar-${msg.id}.png`} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">{msg.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-slate-900">{msg.name}</p>
                        <p className="text-[10px] text-slate-400">{msg.time}</p>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs font-bold uppercase tracking-wide">Go to Inbox</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
