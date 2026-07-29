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
import { ArrowUpRight, X } from "lucide-react";
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
                className="max-w-3xl p-0 overflow-hidden bg-white border border-slate-200 rounded-none shadow-2xl max-h-[90vh] grid grid-rows-[auto_1fr]"
                showCloseButton={false}
            >
                {/* Header band */}
                <div className="bg-[#0B1F3A] text-white px-8 md:px-12 py-8 relative">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-[#C8A96A] hover:text-[#0B1F3A] text-white flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-3">{facilitator.title}</p>
                    <DialogTitle asChild>
                        <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">{facilitator.name}</h2>
                    </DialogTitle>
                    {facilitator.postNominals && (
                        <p className="text-sm text-white/70 italic font-semibold mt-2">{facilitator.postNominals}</p>
                    )}
                </div>

                {/* Body — scrollable, two-column on desktop */}
                <div className="overflow-y-auto">
                    <div className="grid md:grid-cols-[200px_1fr] gap-8 px-8 md:px-12 py-10">
                        <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden bg-slate-100">
                            {facilitator.photo ? (
                                <Image
                                    src={facilitator.photo}
                                    alt={facilitator.name}
                                    fill
                                    sizes="200px"
                                    className="object-cover object-top"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1F3A]">
                                    <span className="text-3xl font-serif font-bold text-[#C8A96A]">{initials(facilitator.name)}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4 text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                            {facilitator.bio.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                            {facilitator.expertise && facilitator.expertise.length > 0 && (
                                <div className="pt-2">
                                    <p className="font-bold text-[#0B1F3A] mb-2">Core Expertise</p>
                                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                        {facilitator.expertise.map((e, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8A96A] flex-shrink-0" />
                                                <span>{e}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
