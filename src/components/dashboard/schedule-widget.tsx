"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location: string;
    isLive?: boolean;
    date?: Date; // added to allow matching items to specific days
}

interface ScheduleWidgetProps {
    items: ScheduleItem[];
    dateLabel?: string;
    dayLabel?: string;
}

export function ScheduleWidget({ items }: ScheduleWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // We want the calendar grid to always start on Sunday
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(monthEnd);
    if (endDate.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });

    // Ensure we have exactly 6 rows (42 days) to maintain fixed height
    if (daysInGrid.length < 42) {
       const extraDays = 42 - daysInGrid.length;
       const lastDate = daysInGrid[daysInGrid.length - 1];
       for (let i = 1; i <= extraDays; i++) {
           const nextD = new Date(lastDate);
           nextD.setDate(nextD.getDate() + i);
           daysInGrid.push(nextD);
       }
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Card className="bg-[#0B1F3A] border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 text-white shadow-xl rounded-none overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-white/10 transition-colors rounded-full text-white/60 hover:text-white">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h3 className="text-xl font-serif tracking-wide text-white">{format(currentDate, "MMMM yyyy")}</h3>
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-white/10 transition-colors rounded-full text-white/60 hover:text-white">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {weekDays.map(day => (
                    <div key={day} className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]/60 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysInGrid.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);
                    
                    // Note: This relies on items having a date property. If not, it just uses today's items for today.
                    // If you pass date objects in items, it will map them properly.
                    const dayItems = items.filter(item => item.date ? isSameDay(new Date(item.date), day) : isDayToday);
                    
                    const hasLiveItem = dayItems.some(i => i.isLive);
                    const hasAnyItem = dayItems.length > 0;

                    return (
                        <div 
                            key={idx} 
                            className={cn(
                                "aspect-square p-1 flex flex-col items-center justify-center relative rounded-md border border-transparent transition-colors",
                                isCurrentMonth ? "bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer" : "opacity-30",
                                isDayToday && "bg-[#C8A96A]/20 border-[#C8A96A]/40",
                                hasLiveItem && "ring-1 ring-red-500/50 bg-red-500/10"
                            )}
                        >
                            <span className={cn(
                                "text-sm font-medium z-10", 
                                isDayToday ? "text-[#C8A96A]" : "text-white"
                            )}>
                                {format(day, "d")}
                            </span>
                            
                            {hasAnyItem && (
                                <div className="absolute bottom-1 flex gap-1">
                                    {dayItems.slice(0, 3).map((it, i) => (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                it.isLive ? "bg-red-500 animate-pulse" : "bg-[#C8A96A]"
                                            )} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* List upcoming events below calendar */}
            <div className="mt-8 space-y-4">
                <h4 className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-4 border-b border-white/10 pb-2">Upcoming Classes</h4>
                {items.length > 0 ? items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-4 items-start p-3 bg-white/5 rounded-none border-l-2 border-l-transparent hover:border-l-[#C8A96A] hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-1">
                            {item.isLive ? (
                                <div className="p-1.5 bg-red-500/20 text-red-400 rounded-full">
                                    <Video size={14} />
                                </div>
                            ) : (
                                <div className="p-1.5 bg-[#C8A96A]/20 text-[#C8A96A] rounded-full">
                                    <Clock size={14} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-serif leading-tight">{item.title}</h5>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{item.time}</span>
                                {item.isLive && (
                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded-sm">Live Now</span>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-xs text-white/40 italic">No classes scheduled.</p>
                )}
            </div>
        </Card>
    );
}
