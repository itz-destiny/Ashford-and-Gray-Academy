"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function StudentCommunicationsPage() {
    return (
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Exchange</h1>
                    <p className="text-slate-500 font-medium">Direct consultation with faculty, registrars, and support staff.</p>
                </div>
            </div>

            <Communications />
        </div>
    );
}
