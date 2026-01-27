
"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ActivityHeatmap() {
    // Mock data for a 7x8 grid (8 weeks)
    const activityData = Array.from({ length: 56 }, () => Math.floor(Math.random() * 4));

    const getColor = (level: number) => {
        switch (level) {
            case 1: return "bg-indigo-200";
            case 2: return "bg-indigo-400";
            case 3: return "bg-indigo-600";
            default: return "bg-slate-100";
        }
    };

    return (
        <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <CardTitle className="text-base font-bold text-slate-800">Learning Activity</CardTitle>
                <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-md px-2 py-1 focus:ring-0">
                    <option>Last 3 Months</option>
                </select>
            </div>

            <div className="grid grid-cols-8 gap-2 mb-6">
                {activityData.map((level, i) => (
                    <div
                        key={i}
                        className={cn("w-full aspect-square rounded-[4px] transition-colors hover:ring-2 hover:ring-indigo-300 cursor-pointer", getColor(level))}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Less Active</span>
                <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-[1px] bg-slate-100" />
                    <div className="w-2 h-2 rounded-[1px] bg-indigo-200" />
                    <div className="w-2 h-2 rounded-[1px] bg-indigo-400" />
                    <div className="w-2 h-2 rounded-[1px] bg-indigo-600" />
                </div>
                <span>More Active</span>
            </div>
        </Card>
    );
}
