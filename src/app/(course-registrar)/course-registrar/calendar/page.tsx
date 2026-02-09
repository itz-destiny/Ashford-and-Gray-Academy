"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    MapPin,
    Search,
    Filter,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Plus,
    Video
} from "lucide-react";

export default function MasterCalendarPage() {
    const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Master Calendar
                        <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 border-none rounded-full px-4 italic">Session A</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Coordinate institutional schedules, lecture halls, and virtual meeting rooms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
                        <span className="px-4 font-black text-sm text-slate-600">February 2026</span>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> Schedule Event
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Lectures</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-rose-500 rounded-full" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Exams</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Seminars</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-400 font-bold px-4">Standard Week View</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-white divide-x divide-slate-50 border-b border-slate-50">
                                <div className="p-4" />
                                {days.map(day => (
                                    <div key={day} className="p-4 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">{day}</span>
                                        <span className="text-xl font-black text-slate-900 italic">0{days.indexOf(day) + 9}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y divide-slate-50 h-[600px] overflow-y-auto">
                                {hours.map(hour => (
                                    <div key={hour} className="grid grid-cols-[100px_repeat(5,1fr)] divide-x divide-slate-50 min-h-[100px] group">
                                        <div className="p-4 text-right">
                                            <span className="text-xs font-black text-slate-300 italic">{hour}:00</span>
                                        </div>
                                        {days.map(day => {
                                            const hasEvent = hour === 10 && day === 'Mon';
                                            const hasVideo = hour === 14 && day === 'Wed';
                                            return (
                                                <div key={day} className="p-2 relative hover:bg-slate-50/50 transition-colors">
                                                    {hasEvent && (
                                                        <div className="absolute inset-1.5 bg-indigo-600 rounded-2xl p-3 shadow-lg shadow-indigo-100 group-hover:scale-[1.02] transition-transform">
                                                            <div className="flex flex-col h-full text-white">
                                                                <span className="text-[10px] font-black uppercase opacity-60 mb-1">Lecture</span>
                                                                <span className="text-xs font-black leading-tight mb-1 truncate">Strategic FinTech</span>
                                                                <div className="mt-auto flex items-center justify-between opacity-80">
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span className="text-[9px] font-bold italic">Hall B2</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {hasVideo && (
                                                        <div className="absolute inset-1.5 bg-rose-500 rounded-2xl p-3 shadow-lg shadow-rose-100 flex flex-col items-center justify-center text-white text-center">
                                                            <Video className="w-5 h-5 mb-1 opacity-60" />
                                                            <span className="text-[10px] font-black uppercase leading-tight">Virtual Thesis Review</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] bg-slate-900 text-white p-8">
                        <h3 className="text-xl font-black mb-6 leading-tight flex items-center justify-between">
                            Upcoming
                            <Clock className="w-5 h-5 opacity-40" />
                        </h3>
                        <div className="space-y-6">
                            {[
                                { time: "TOMORROW, 10:00", title: "Global Economics Seminar", type: "On-Site" },
                                { time: "WED, 14:30", title: "Tech Ethics Symposium", type: "Virtual" },
                                { time: "FRI, 09:00", title: "Institutional Review", type: "Hall A" },
                            ].map((item, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="text-[9px] font-black tracking-widest text-indigo-400 mb-1">{item.time}</div>
                                    <div className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{item.title}</div>
                                    <div className="text-[10px] font-bold text-slate-500 italic opacity-80">{item.type}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] p-8 border border-slate-50">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                            Resources
                            <Badge variant="outline" className="font-black text-[10px]">ALL CLEAR</Badge>
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "Lecture Hall A", status: "Occupied", color: "text-rose-500" },
                                { name: "Lecture Hall B2", status: "Available", color: "text-emerald-500" },
                                { name: "Seminar Room 1", status: "Available", color: "text-emerald-500" },
                                { name: "Virtual Studio", status: "Occupied", color: "text-rose-500" },
                            ].map((res, i) => (
                                <div key={i} className="flex items-center justify-between text-xs font-black py-2 border-b border-slate-50 last:border-0 uppercase tracking-wider">
                                    <span className="text-slate-400">{res.name}</span>
                                    <span className={res.color}>{res.name.includes('A') && res.name.includes('Lecture') ? 'BUSY' : 'READY'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
