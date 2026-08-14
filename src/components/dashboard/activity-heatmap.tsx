
"use client";

import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ActivityCell {
    date: string;
    total: number;
    level: number;
}

interface ActivityHeatmapProps {
    cells?: ActivityCell[];
}

export function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
    // Generate base grid (7x8 = 56 slots)
    const activityData: ActivityCell[] = cells && cells.length >= 56
        ? cells.slice(-56)
        : Array.from({ length: 56 }, (_, i) => ({ date: '', total: 0, level: 0 }));

    const getColor = (level: number) => {
        switch (level) {
            case 1: return "bg-[#C8A96A]/30";
            case 2: return "bg-[#C8A96A]/60";
            case 3: return "bg-[#C8A96A]";
            case 4: return "bg-[#0B1F3A]";
            default: return "bg-[#0B1F3A]/5";
        }
    };

    const formatTooltip = (cell: ActivityCell) => {
        if (!cell.date) return "No activity recorded";
        const dateLabel = new Date(`${cell.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        if (cell.total === 0) return `No activity on ${dateLabel}`;
        return `${cell.total} activit${cell.total === 1 ? 'y' : 'ies'} on ${dateLabel}`;
    };

    return (
        <Card className="p-10 h-full rounded-none border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-md bg-white">
            <div className="flex justify-between items-center mb-10">
                <CardTitle className="text-xl font-serif text-[#0B1F3A]">Institutional Engagement</CardTitle>
                <select className="bg-[#F6F4F2] border border-[#0B1F3A]/10 text-[10px] font-black uppercase tracking-widest text-[#0B1F3A]/60 rounded-none px-4 py-2 focus:ring-0 cursor-pointer">
                    <option>Quarterly Analysis</option>
                    <option>Academic Year</option>
                </select>
            </div>

            <div className="grid grid-cols-8 gap-2.5 mb-10">
                {activityData.map((cell, i) => (
                    <div
                        key={cell.date || i}
                        title={formatTooltip(cell)}
                        className={cn(
                            "w-full aspect-square rounded-none transition-all duration-500 hover:scale-110 cursor-pointer",
                            getColor(cell.level)
                        )}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-black text-[#0B1F3A]/40 uppercase tracking-[0.2em] pt-6 border-t border-[#0B1F3A]/10">
                <span>Standard</span>
                <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-none bg-[#0B1F3A]/5" />
                    <div className="w-3 h-3 rounded-none bg-[#C8A96A]/30" />
                    <div className="w-3 h-3 rounded-none bg-[#C8A96A]/60" />
                    <div className="w-3 h-3 rounded-none bg-[#C8A96A]" />
                    <div className="w-3 h-3 rounded-none bg-[#0B1F3A]" />
                </div>
                <span>Peak Mastery</span>
            </div>
        </Card>
    );
}
