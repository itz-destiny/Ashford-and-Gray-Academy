"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function AdminCommunicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Administrative Communications</h2>
                <p className="text-sm text-slate-500 mt-1">Institutional-wide dialogue management and staff coordination hub.</p>
            </div>

            <Communications />
        </div>
    );
}
