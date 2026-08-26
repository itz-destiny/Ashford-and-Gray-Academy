"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Users, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { format } from "date-fns";

type Attendee = {
    userId: string;
    displayName: string;
    email?: string;
    role?: string;
    joinedAt: string;
};

type LiveClassRecord = {
    _id: string;
    topic: string;
    courseTitle?: string | null;
    startTime: string;
    durationMinutes: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    enrolledCount: number;
    attendees: Attendee[];
};

export default function InstructorLiveClassHistoryPage() {
    const [classes, setClasses] = useState<LiveClassRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/api/live-classes/mine');
                const body = await res.json();
                if (body.success) setClasses(body.classes);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="mx-auto px-6 md:px-10 py-8 space-y-10 max-w-[1200px] animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tight mb-2 flex items-center gap-3">
                    <History className="w-8 h-8 text-[#C8A96A]" /> Live Class History
                </h1>
                <p className="text-slate-500 font-medium italic">
                    Every class you've hosted, and who actually attended.
                </p>
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
            )}

            {!loading && classes.length === 0 && (
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-12 text-center text-slate-400">
                        You haven't hosted a live class yet.
                    </CardContent>
                </Card>
            )}

            {!loading && classes.map((cls) => (
                <Card key={cls._id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <Badge className={
                                        cls.status === 'completed'
                                            ? "bg-slate-800 text-white border-none text-[9px] font-black uppercase tracking-wider"
                                            : cls.status === 'cancelled'
                                            ? "bg-rose-50 text-rose-600 border-none text-[9px] font-black uppercase tracking-wider"
                                            : "bg-emerald-50 text-emerald-700 border-none text-[9px] font-black uppercase tracking-wider"
                                    }>
                                        {cls.status}
                                    </Badge>
                                    {cls.courseTitle && (
                                        <span className="text-xs text-slate-400 font-medium truncate">{cls.courseTitle}</span>
                                    )}
                                </div>
                                <h3 className="font-black text-[#0B1F3A] text-lg truncate">{cls.topic}</h3>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(cls.startTime), 'EEE, MMM dd, yyyy · hh:mm a')} · {cls.durationMinutes} min
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 bg-[#0B1F3A]/5 px-4 py-2 rounded-xl">
                                <Users className="w-4 h-4 text-[#0B1F3A]" />
                                <span className="text-sm font-black text-[#0B1F3A]">
                                    {cls.attendees.length}{cls.enrolledCount ? ` / ${cls.enrolledCount}` : ''} attended
                                </span>
                            </div>
                        </div>

                        {cls.attendees.length > 0 && (
                            <div className="border-t pt-3 space-y-1.5">
                                {cls.attendees.map((a) => (
                                    <div key={a.userId} className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{a.displayName}</span>
                                        <span className="text-xs text-slate-400">{format(new Date(a.joinedAt), 'hh:mm a')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
