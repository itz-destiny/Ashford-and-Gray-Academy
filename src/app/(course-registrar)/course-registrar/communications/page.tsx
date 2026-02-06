"use client";

import { Communications } from "@/components/dashboard/Communications";

export default function CourseRegistrarCommunicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Academic Communications</h2>
                <p className="text-sm text-slate-500 mt-1">Coordinate with faculty and administrative staff regarding curriculum and student progress.</p>
            </div>

            <Communications />
        </div>
    );
}
