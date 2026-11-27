"use client";

import { LiveClassWarnings } from "@/components/class-warnings/LiveClassWarnings";

export default function MonitorWarningsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
            <div className="space-y-1">
                <h1 className="text-2xl font-black text-white tracking-tight">Class Warnings</h1>
                <p className="text-white/60 text-sm">Pick a class, then the student who is defaulting. The warning pops up on their portal and goes to their email.</p>
            </div>
            <LiveClassWarnings />
        </div>
    );
}
