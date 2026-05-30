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
import type { LeadershipMember } from "@/lib/leadership-data";

export function ProfileDialog({
    member,
    variant = "secondary",
}: {
    member: LeadershipMember;
    variant?: "primary" | "secondary";
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === "primary" ? (
                    <Button className="h-12 px-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-none shadow-none border-none">
                        Read Full Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-3">{member.title}</p>
                    <DialogTitle asChild>
                        <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">{member.name}</h2>
                    </DialogTitle>
                    {member.postNominals && (
                        <p className="text-sm text-white/70 italic font-semibold mt-2">{member.postNominals}</p>
                    )}
                </div>

                {/* Body — scrollable, two-column on desktop */}
                <div className="overflow-y-auto">
                    <div className="grid md:grid-cols-[200px_1fr] gap-8 px-8 md:px-12 py-10">
                        <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden bg-slate-100">
                            <Image
                                src={member.photo}
                                alt={member.name}
                                fill
                                sizes="200px"
                                className="object-cover object-top"
                            />
                        </div>
                        <div className="space-y-4 text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                            {member.bio.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
