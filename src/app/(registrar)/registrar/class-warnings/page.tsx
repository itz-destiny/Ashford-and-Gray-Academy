"use client";

import { LiveClassWarnings } from "@/components/class-warnings/LiveClassWarnings";
import { ShieldAlert } from "lucide-react";

export default function ClassWarningsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-amber-600" /> Class Warnings
                </h1>
                <p className="text-slate-500 font-medium">During a live class, pick the student who is defaulting and send a warning. It pops up on their own portal straight away and goes to their email.</p>
            </div>
            <LiveClassWarnings />
        </div>
    );
}
