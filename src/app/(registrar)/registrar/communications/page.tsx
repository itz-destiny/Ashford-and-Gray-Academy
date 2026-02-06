"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function RegistrarCommunicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Institutional Relay</h2>
                <p className="text-sm text-slate-500 mt-1">Direct communication channel for staff and administrative coordination.</p>
            </div>

            <Communications />
        </div>
    );
}
