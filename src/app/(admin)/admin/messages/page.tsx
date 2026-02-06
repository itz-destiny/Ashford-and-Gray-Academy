"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function AdminMessagesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Communications</h1>
                <p className="text-slate-500">Video conferences and secure messaging with staff and students.</p>
            </div>
            <Communications />
        </div>
    );
}
