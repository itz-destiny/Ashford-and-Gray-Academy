"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight, Quote, X } from "lucide-react";
import type { Facilitator } from "@/lib/facilitators-data";

function initials(name: string) {
    return name
        .replace(/^(Dr\.|Barrister|Comrade)\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
}

export function ProfileDialog({
    facilitator,
    variant = "secondary",
}: {
    facilitator: Facilitator;
    variant?: "primary" | "secondary" | "onDark";
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === "primary" ? (
                    <Button className="h-12 px-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-none shadow-none border-none">
                        Read Full Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : variant === "onDark" ? (
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white border-b border-[#C8A96A] pb-1 hover:text-[#C8A96A] transition-colors"
                    >
                        View Profile
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A] border-b border-[#C8A96A] pb-1 hover:text-[#1F7A5A] hover:border-[#1F7A5A] transition-colors"
                    >
                        Read Profile
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent
                className="max-w-2xl p-0 overflow-hidden bg-white border-none rounded-[1.75rem] shadow-2xl max-h-[92vh] grid grid-rows-[auto_1fr]"
                showCloseButton={false}
            >
                {/* Magazine-style hero banner */}
                <div className="relative h-72 sm:h-80 w-full shrink-0 bg-[#0B1F3A] overflow-hidden">
                    {facilitator.photo ? (
                        <>
                            {/* Blurred backdrop fill so a portrait-oriented photo never gets cropped */}
                            <Image
                                src={facilitator.photo}
                                alt=""
                                aria-hidden="true"
                                fill
                                sizes="640px"
                                className="object-cover object-top scale-110 blur-2xl opacity-60"
                            />
                            <Image
                                src={facilitator.photo}
                                alt={facilitator.name}
                                fill
                                sizes="640px"
                                className="object-contain object-bottom"
                            />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B1F3A] to-[#132C4F]">
                            <span className="text-6xl font-serif font-bold text-[#C8A96A]/70">{initials(facilitator.name)}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/10 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C8A96A] via-[#E6D6B8] to-[#C8A96A]" />

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm hover:bg-[#C8A96A] hover:text-[#0B1F3A] text-white flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C8A96A] mb-2">{facilitator.title}</p>
                        <DialogTitle asChild>
                            <h2 className="text-2xl sm:text-3xl font-serif text-white leading-tight">{facilitator.name}</h2>
                        </DialogTitle>
                        {facilitator.postNominals && (
                            <p className="text-xs text-white/60 italic font-semibold mt-1.5">{facilitator.postNominals}</p>
                        )}
                    </div>
                </div>

                {/* Body — single column, scrollable */}
                <div className="overflow-y-auto bg-white">
                    <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-6">
                        <div className="flex items-start gap-3">
                            <Quote className="w-6 h-6 text-[#C8A96A]/40 shrink-0 mt-1" />
                            <p className="text-base sm:text-lg font-serif text-[#0B1F3A] leading-snug">
                                {facilitator.bio[0]}
                            </p>
                        </div>

                        <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                            {facilitator.bio.slice(1).map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>

                        {facilitator.expertise && facilitator.expertise.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#0B1F3A]/50 mb-3">Core Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {facilitator.expertise.map((e, i) => (
                                        <span
                                            key={i}
                                            className="text-[11px] font-bold text-[#0B1F3A] bg-[#FAF9F6] border border-[#C8A96A]/40 rounded-full px-3.5 py-1.5"
                                        >
                                            {e}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
