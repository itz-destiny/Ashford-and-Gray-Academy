
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import Image from "next/image";

interface LiveNowCardProps {
    title: string;
    subtitle: string;
    description: string;
    instructor?: string;
    participants?: number;
}

export function LiveNowCard({
    title = "Advanced Quantum Mechanics: The Wave Function",
    subtitle = "Prof. Richard Feynman is exploring the mysteries of particle behavior.",
    description = "Don't miss the interactive Q&A session starting in 20 minutes.",
    participants = 124
}: LiveNowCardProps) {
    return (
        <Card className="relative overflow-hidden group min-h-[300px] border-none rounded-3xl">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/quantum_physics_chalkboard_background_1769081385701.png"
                    alt="Background"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
            </div>

            <div className="relative z-10 p-8 flex flex-col justify-center h-full max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white font-bold text-xs uppercase tracking-widest">LIVE NOW</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    {title}
                </h2>

                <p className="text-white/80 text-sm md:text-base mb-2 font-medium">
                    {subtitle}
                </p>
                <p className="text-white/60 text-sm mb-8">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-3 w-full sm:w-auto">
                        <Video size={18} />
                        Join Lecture Room
                    </Button>

                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                                <Image src={`https://picsum.photos/seed/p${i}/32/32`} alt="Participant" width={32} height={32} />
                            </div>
                        ))}
                        <div className="h-8 px-2 flex items-center justify-center bg-slate-800 rounded-full border-2 border-slate-900 text-[10px] font-bold text-white">
                            +{participants}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
