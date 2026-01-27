
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface CoursePathCardProps {
    title: string;
    category: string;
    progress: number;
    hoursRemaining?: number;
    nextTopic?: string;
    imageUrl: string;
}

export function CoursePathCard({
    title,
    category,
    progress,
    hoursRemaining,
    nextTopic,
    imageUrl
}: CoursePathCardProps) {
    return (
        <Card className="flex flex-col md:flex-row gap-6 p-4 rounded-3xl border-slate-100 transition-all duration-300 group shadow-none">
            <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                    src={imageUrl || "/placeholder-course.jpg"}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                            {category}
                        </span>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                        {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {hoursRemaining !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-300" />
                                <span>{hoursRemaining}h remaining</span>
                            </div>
                        )}
                        {nextTopic && (
                            <div className="flex items-center gap-1.5">
                                <BookOpen size={14} className="text-slate-300" />
                                <span>Next: {nextTopic}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Course Completion</span>
                            <span className="text-slate-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-100 rounded-full [&>div]:bg-indigo-600" />
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6 py-2 h-auto text-xs transition-shadow">
                            {progress === 0 ? "Start Chapter" : "Resume Lesson"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
