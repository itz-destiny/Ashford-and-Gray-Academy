"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Loader2, Clock } from "lucide-react";

interface Assessment {
    _id: string;
    title: string;
    type: 'test' | 'exam';
    courseId: string | null;
    durationMinutes: number;
    opensAt: string;
    closesAt: string;
    questions: any[];
    totalPoints: number;
}

export default function StudentTestsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/api/assessments').then(async res => {
            if (res.ok) setAssessments(await res.json());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const now = Date.now();
    const available = assessments.filter(a => now >= new Date(a.opensAt).getTime() && now <= new Date(a.closesAt).getTime());
    const upcoming = assessments.filter(a => now < new Date(a.opensAt).getTime());
    const closed = assessments.filter(a => now > new Date(a.closesAt).getTime());

    const Section = ({ title, items }: { title: string; items: Assessment[] }) => (
        items.length === 0 ? null : (
            <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(a => (
                        <Link key={a._id} href={`/tests/${a._id}`}>
                            <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl hover:shadow-xl transition-shadow h-full">
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="uppercase text-[10px]">{a.type}</Badge>
                                        <Badge className="bg-indigo-100 text-indigo-700 border-none">{a.courseId ? 'Course' : 'Whole Cohort'}</Badge>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-lg leading-tight">{a.title}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                        <Clock className="w-3.5 h-3.5" /> {a.durationMinutes} min · {a.questions.length} questions
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        )
    );

    return (
        <div className="space-y-10 p-6 md:p-10 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tests &amp; Exams</h1>
                <p className="text-slate-500 font-medium">Tests for your course, and any set for the whole cohort.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : assessments.length === 0 ? (
                <Card className="border-none shadow-lg shadow-slate-100 rounded-3xl">
                    <CardContent className="p-16 text-center text-slate-400">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No tests available right now</p>
                        <p className="text-sm">Check back later — your facilitators will publish tests here.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Section title="Available Now" items={available} />
                    <Section title="Upcoming" items={upcoming} />
                    <Section title="Closed" items={closed} />
                </>
            )}
        </div>
    );
}
