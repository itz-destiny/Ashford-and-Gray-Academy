
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
        <Card className="bg-[#0B1F3A] border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-10 text-white shadow-xl rounded-none overflow-hidden relative group">
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
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-none border border-white/10">
                        <Calendar className="w-6 h-6 text-[#C8A96A]" />
                    </div>
                </div>

                <div className="space-y-6">
                    {items.length > 0 ? items.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-6 rounded-none transition-all cursor-pointer group/item border-l-2",
                                item.isLive
                                    ? "bg-white/10 border-l-[#C8A96A] hover:bg-white/20"
                                    : "bg-white/[0.03] border-l-white/10 hover:bg-white/[0.07] hover:border-l-[#C8A96A]"
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
                        <div className="p-8 text-center bg-white/5 rounded-none border border-dashed border-white/10">
                            <p className="text-white/30 font-medium italic">No scheduled events for today.</p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-10 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black py-5 rounded-none shadow-none transition-all text-[10px] uppercase tracking-[0.3em]">
                    Institutional Calendar
                </button>
            </div>
        </Card>
    );
}
