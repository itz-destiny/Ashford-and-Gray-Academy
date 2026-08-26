"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function InstructorCommunicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Communications</h1>
                <p className="text-slate-500 text-sm">Message students enrolled in the courses you teach.</p>
            </div>
            <Communications />
        </div>
    );
}
