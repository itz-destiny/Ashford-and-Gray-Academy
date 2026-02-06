"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function RegistrarMessagesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Communications</h2>
                <p className="text-sm text-slate-500 mt-1">Message staff members and view conversations</p>
            </div>
            <Communications />
        </div>
    );
}
