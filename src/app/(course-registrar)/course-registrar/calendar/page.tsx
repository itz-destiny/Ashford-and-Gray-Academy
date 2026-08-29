"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Plus,
    Video
} from "lucide-react";

export default function MasterCalendarPage() {
    const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Master <span className="text-[#C8A96A]">Calendar.</span>
                        <Badge className="bg-[#0B1F3A] text-white border-none rounded-none px-3 font-black text-[10px] uppercase tracking-widest">Session A</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Coordinate institutional schedules, lecture halls, and virtual meeting rooms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-[#0B1F3A]/10">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none"><ChevronLeft className="w-4 h-4 text-[#0B1F3A]" /></Button>
                        <span className="px-4 font-black text-sm text-[#0B1F3A]">February 2026</span>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none"><ChevronRight className="w-4 h-4 text-[#0B1F3A]" /></Button>
                    </div>
                    <Button className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Plus className="w-4 h-4 mr-2" /> Schedule Event
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                        <div className="p-8 border-b border-[#0B1F3A]/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#0B1F3A]" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Lectures</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-rose-500" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Exams</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#1F7A5A]" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Seminars</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="rounded-none border-[#0B1F3A]/10 text-slate-400 font-bold px-4">Standard Week View</Badge>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-white divide-x divide-[#0B1F3A]/5 border-b border-[#0B1F3A]/10">
                                <div className="p-4" />
                                {days.map(day => (
                                    <div key={day} className="p-4 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">{day}</span>
                                        <span className="text-xl font-serif text-[#0B1F3A]">0{days.indexOf(day) + 9}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y divide-[#0B1F3A]/5 h-[600px] overflow-y-auto">
                                {hours.map(hour => (
                                    <div key={hour} className="grid grid-cols-[100px_repeat(5,1fr)] divide-x divide-[#0B1F3A]/5 min-h-[100px] group">
                                        <div className="p-4 text-right">
                                            <span className="text-xs font-black text-slate-300">{hour}:00</span>
                                        </div>
                                        {days.map(day => {
                                            const hasEvent = hour === 10 && day === 'Mon';
                                            const hasVideo = hour === 14 && day === 'Wed';
                                            return (
                                                <div key={day} className="p-2 relative hover:bg-[#F6F4F2] transition-colors">
                                                    {hasEvent && (
                                                        <div className="absolute inset-1.5 bg-[#0B1F3A] p-3 group-hover:scale-[1.02] transition-transform">
                                                            <div className="flex flex-col h-full text-white">
                                                                <span className="text-[10px] font-black uppercase opacity-60 mb-1">Lecture</span>
                                                                <span className="text-xs font-black leading-tight mb-1 truncate">Strategic FinTech</span>
                                                                <div className="mt-auto flex items-center justify-between opacity-80">
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span className="text-[9px] font-bold">Hall B2</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {hasVideo && (
                                                        <div className="absolute inset-1.5 bg-rose-500 p-3 flex flex-col items-center justify-center text-white text-center">
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
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8">
                        <h3 className="text-xl font-serif text-white mb-6 leading-tight flex items-center justify-between">
                            Upcoming
                            <Clock className="w-5 h-5 text-[#C8A96A]" />
                        </h3>
                        <div className="space-y-6">
                            {[
                                { time: "TOMORROW, 10:00", title: "Global Economics Seminar", type: "On-Site" },
                                { time: "WED, 14:30", title: "Tech Ethics Symposium", type: "Virtual" },
                                { time: "FRI, 09:00", title: "Institutional Review", type: "Hall A" },
                            ].map((item, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="text-[9px] font-black tracking-widest text-[#C8A96A] mb-1">{item.time}</div>
                                    <div className="font-bold text-sm text-white group-hover:text-[#C8A96A] transition-colors">{item.title}</div>
                                    <div className="text-[10px] font-bold text-white/40 opacity-80">{item.type}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8">
                        <h3 className="text-lg font-serif text-[#0B1F3A] mb-6 flex items-center justify-between">
                            Resources
                            <Badge variant="outline" className="font-black text-[10px] rounded-none border-[#1F7A5A]/30 text-[#1F7A5A]">ALL CLEAR</Badge>
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: "Lecture Hall A", status: "Occupied", color: "text-rose-500" },
                                { name: "Lecture Hall B2", status: "Available", color: "text-[#1F7A5A]" },
                                { name: "Seminar Room 1", status: "Available", color: "text-[#1F7A5A]" },
                                { name: "Virtual Studio", status: "Occupied", color: "text-rose-500" },
                            ].map((res, i) => (
                                <div key={i} className="flex items-center justify-between text-xs font-black py-2 border-b border-[#0B1F3A]/5 last:border-0 uppercase tracking-wider">
                                    <span className="text-slate-400">{res.name}</span>
                                    <span className={res.color}>{res.name.includes('A') && res.name.includes('Lecture') ? 'BUSY' : 'READY'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
