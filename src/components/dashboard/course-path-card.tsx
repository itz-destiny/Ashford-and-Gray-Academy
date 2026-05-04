
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, MoreHorizontal, ArrowRight } from "lucide-react";
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
        <Card className="flex flex-col md:flex-row gap-8 p-6 rounded-[3rem] border-none bg-white shadow-sm hover:shadow-xl transition-all duration-700 group overflow-hidden">
            <div className="relative w-full md:w-56 h-56 rounded-[2.5rem] overflow-hidden flex-shrink-0">
                <Image
                    src={imageUrl || "/placeholder-course.jpg"}
                    alt={title || "Course image"}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-700" />
            </div>

            <div className="flex-1 flex flex-col justify-between py-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-[#1F7A5A] uppercase tracking-[0.3em] leading-none">
                            {category}
                        </span>
                        <button className="text-slate-200 hover:text-[#0B1F3A] transition-colors">
                            <MoreHorizontal size={24} />
                        </button>
                    </div>
                    <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight group-hover:text-[#1F7A5A] transition-colors duration-500">
                        {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {hoursRemaining !== undefined && (
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-[#C8A96A]" />
                                <span>{hoursRemaining}h remaining</span>
                            </div>
                        )}
                        {nextTopic && (
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-[#1F7A5A]" />
                                <span>Module: {nextTopic}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 mt-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Institutional Progress</span>
                            <span className="text-[#0B1F3A]">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-slate-50 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-[#1F7A5A] [&>div]:to-emerald-400" />
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black rounded-2xl px-10 py-5 h-auto text-[10px] uppercase tracking-widest transition-all shadow-lg hover:translate-x-2 group/btn">
                            {progress === 0 ? "Authorize Commencement" : "Resume Mastery"}
                            <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
