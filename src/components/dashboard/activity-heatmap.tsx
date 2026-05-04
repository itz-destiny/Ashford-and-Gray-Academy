
"use client";

import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
    data?: number[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate base grid (7x8 = 56 slots)
    const activityData = data && data.length >= 56 ? data.slice(0, 56) : Array.from({ length: 56 }, () => 0);

    const getColor = (level: number) => {
        switch (level) {
            case 1: return "bg-emerald-200";
            case 2: return "bg-emerald-400";
            case 3: return "bg-emerald-600";
            case 4: return "bg-emerald-800";
            default: return "bg-slate-100";
        }
    };

    return (
        <Card className="p-10 h-full rounded-[40px] border-none shadow-sm bg-white">
            <div className="flex justify-between items-center mb-10">
                <CardTitle className="text-xl font-serif text-[#0B1F3A]">Institutional Engagement</CardTitle>
                <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl px-4 py-2 focus:ring-0 cursor-pointer">
                    <option>Quarterly Analysis</option>
                    <option>Academic Year</option>
                </select>
            </div>

            <div className="grid grid-cols-8 gap-3 mb-10">
                {activityData.map((level, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-full aspect-square rounded-lg transition-all duration-500 hover:scale-110 cursor-pointer shadow-sm",
                            getColor(level)
                        )}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span>Standard</span>
                <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-sm bg-slate-100" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-600" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-800" />
                </div>
                <span>Peak Mastery</span>
            </div>
        </Card>
    );
}
