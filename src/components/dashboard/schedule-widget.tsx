
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location: string;
    isLive?: boolean;
}

interface ScheduleWidgetProps {
    items: ScheduleItem[];
    dateLabel?: string;
    dayLabel?: string;
}

export function ScheduleWidget({ items, dateLabel = "October 2023", dayLabel = "Tuesday, 26" }: ScheduleWidgetProps) {
    return (
        <Card className="bg-[#0B1F3A] border-none p-10 text-white shadow-2xl rounded-[40px] overflow-hidden relative group">
            {/* Background Decorative Element */}
            <div className="absolute -bottom-20 -right-20 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <Calendar size={300} strokeWidth={0.5} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <p className="text-[#C8A96A] text-[10px] font-black uppercase tracking-[0.3em] mb-2">{dateLabel}</p>
                        <h3 className="text-4xl font-serif tracking-tight">{dayLabel}</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <Calendar className="w-6 h-6 text-[#C8A96A]" />
                    </div>
                </div>

                <div className="space-y-6">
                    {items.length > 0 ? items.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-6 rounded-[2rem] transition-all cursor-pointer group/item",
                                item.isLive 
                                    ? "bg-white/10 border border-white/20 hover:bg-white/20" 
                                    : "bg-slate-800/20 hover:bg-slate-800/40"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest">{item.time}</p>
                                        {item.isLive && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Now</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-xl font-serif group-hover/item:text-[#C8A96A] transition-colors">{item.title}</h4>
                                    <p className="text-xs text-white/40 font-medium">{item.location}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-white/30 font-medium italic">No scheduled events for today.</p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-10 bg-[#C8A96A] hover:bg-[#B69759] text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-[10px] uppercase tracking-[0.3em]">
                    Institutional Calendar
                </button>
            </div>
        </Card>
    );
}
