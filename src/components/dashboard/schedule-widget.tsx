
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MoreVertical } from "lucide-react";
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
        <Card className="bg-indigo-600 border-none p-6 text-white shadow-xl overflow-hidden relative">
            {/* Background Calendar Icon Decoration */}
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                <Calendar size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-white/70 text-sm font-medium">{dateLabel}</p>
                        <h3 className="text-3xl font-bold">{dayLabel}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-4 rounded-2xl transition-all cursor-pointer",
                                item.isLive ? "bg-white/10 border border-white/20" : "bg-indigo-700/50"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider">{item.time}</p>
                                    <h4 className="text-lg font-bold">{item.title}</h4>
                                    <p className="text-xs text-white/50">{item.location}</p>
                                </div>
                                {item.isLive && (
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none px-3 uppercase text-[10px] tracking-widest font-bold">
                                        LIVE
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-lg hover:bg-white/90 transition-all text-sm">
                    View Full Calendar
                </button>
            </div>
        </Card>
    );
}
