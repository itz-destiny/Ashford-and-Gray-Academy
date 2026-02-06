"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function FinanceCommunicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Institutional Communications</h2>
                <p className="text-sm text-slate-500 mt-1">Connect with faculty, staff, and institutional leadership.</p>
            </div>

            <Communications />
        </div>
    );
}
