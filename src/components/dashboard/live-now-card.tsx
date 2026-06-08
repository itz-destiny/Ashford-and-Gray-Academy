
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface LiveNowCardProps {
    title: string;
    subtitle: string;
    description: string;
    instructor?: string;
    participants?: number;
    roomId: string;
}

export function LiveNowCard({
    title = "Advanced Quantum Mechanics: The Wave Function",
    subtitle = "Prof. Richard Feynman is exploring the mysteries of particle behavior.",
    description = "Join the session now.",
    participants = 12,
    roomId
}: LiveNowCardProps) {
    return (
        <Card className="relative overflow-hidden group min-h-[300px] border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] rounded-none shadow-xl">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/quantum_physics_chalkboard_background_1769081385701.png"
                    alt="Background"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#0B1F3A]/70 backdrop-blur-[2px] bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/80 to-transparent" />
            </div>

            <div className="relative z-10 p-8 flex flex-col justify-center h-full max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">LIVE NOW</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
                    {title}
                </h2>

                <p className="text-white/80 text-sm md:text-base mb-2 font-medium">
                    {subtitle}
                </p>
                <p className="text-white/60 text-sm mb-8">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button asChild className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black px-8 py-6 rounded-none shadow-none transition-all flex items-center gap-3 w-full sm:w-auto text-[10px] uppercase tracking-[0.3em]">
                        <Link href={`/meeting/${roomId || "sandbox"}`}>
                            <Video size={18} />
                            Join Lecture Room
                        </Link>
                    </Button>

                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B1F3A] bg-[#1F2d44] overflow-hidden">
                                <Image src={`https://picsum.photos/seed/p${i}/32/32`} alt="Participant" width={32} height={32} />
                            </div>
                        ))}
                        <div className="h-8 px-2 flex items-center justify-center bg-[#0B1F3A] rounded-full border-2 border-[#C8A96A] text-[10px] font-black text-[#C8A96A]">
                            +{participants}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
