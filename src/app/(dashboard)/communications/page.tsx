"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function StudentCommunicationsPage() {
    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-12 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">My Messages</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                    Academic <span className="text-[#C8A96A]">Dialogue.</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                    Direct consultation with your programme instructors and the academy office.
                </p>
            </div>

            <Communications />
        </div>
    );
}
