"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Star, ChevronDown, ChevronUp, Loader2, AlertTriangle,
    MessageSquareQuote, Users2,
} from "lucide-react";

interface Comment {
    courseTitle: string;
    likedMost?: string;
    improvement?: string;
    otherComments?: string;
    submittedAt: string;
}

interface FacilitatorFeedback {
    instructorUid: string | null;
    instructorName: string;
    courseTitles: string[];
    responseCount: number;
    avg: { overallRating: number; clarity: number; approachable: number; timeManagement: number; engagement: number };
    avgScore: number;
    comments: Comment[];
}

function scoreColor(score: number): string {
    if (score >= 4.5) return "text-[#1F7A5A]";
    if (score >= 3.5) return "text-[#C8A96A]";
    if (score >= 2.5) return "text-amber-600";
    return "text-rose-600";
}

function Stars({ score }: { score: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn("w-4 h-4", i <= Math.round(score) ? "fill-[#C8A96A] text-[#C8A96A]" : "text-slate-200")} />
            ))}
        </div>
    );
}

export default function RegistrarFeedbackPage() {
    const [facilitators, setFacilitators] = useState<FacilitatorFeedback[] | null>(null);
    const [totalResponses, setTotalResponses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const fetchFeedback = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch('/api/registrar/feedback');
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not load feedback.');
            setFacilitators(data.facilitators || []);
            setTotalResponses(data.totalResponses || 0);
        } catch (err: any) {
            setError(err.message || 'Could not load feedback.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

    const toggle = (key: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1200px] mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">
                    Facilitator <span className="text-[#C8A96A]">Feedback.</span>
                </h1>
                <p className="text-slate-500 font-medium font-serif">
                    {totalResponses} response{totalResponses === 1 ? '' : 's'} submitted by students so far.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-400" />
                    <p className="text-slate-500">{error}</p>
                </div>
            ) : facilitators && facilitators.length > 0 ? (
                <div className="space-y-4">
                    {facilitators.map((f) => {
                        const key = f.instructorUid || f.instructorName;
                        const isOpen = expanded.has(key);
                        return (
                            <Card key={key} className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none overflow-hidden">
                                <CardHeader
                                    className="p-6 cursor-pointer hover:bg-[#F6F4F2]/50 transition-colors"
                                    onClick={() => toggle(key)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <p className="font-serif text-lg text-[#0B1F3A]">{f.instructorName}</p>
                                            <p className="text-sm text-slate-500 truncate">{f.courseTitles.join(', ')}</p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Stars score={f.avgScore} />
                                                <span className={cn("text-sm font-black", scoreColor(f.avgScore))}>{f.avgScore.toFixed(1)} / 5</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end text-slate-400">
                                                    <Users2 className="w-3.5 h-3.5" />
                                                    <span className="font-black text-[#0B1F3A]">{f.responseCount}</span>
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Responses</p>
                                            </div>
                                            {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                                        </div>
                                    </div>
                                </CardHeader>
                                {isOpen && (
                                    <CardContent className="p-6 pt-0 border-t border-[#0B1F3A]/5 space-y-6">
                                        <div className="grid sm:grid-cols-5 gap-3 pt-4">
                                            {[
                                                ['Overall', f.avg.overallRating],
                                                ['Clarity', f.avg.clarity],
                                                ['Approachable', f.avg.approachable],
                                                ['Time Mgmt', f.avg.timeManagement],
                                                ['Engagement', f.avg.engagement],
                                            ].map(([label, val]) => (
                                                <div key={label as string} className="bg-[#F6F4F2]/60 px-3 py-3 text-center">
                                                    <p className={cn("text-xl font-black", scoreColor(val as number))}>{(val as number).toFixed(1)}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {f.comments.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <MessageSquareQuote className="w-4 h-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Written Comments</p>
                                                </div>
                                                {f.comments.map((c, i) => (
                                                    <div key={i} className="bg-white border border-[#0B1F3A]/10 px-5 py-4 space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {c.courseTitle} &middot; {new Date(c.submittedAt).toLocaleDateString()}
                                                        </p>
                                                        {c.likedMost && <p className="text-sm text-slate-700"><span className="font-bold text-[#1F7A5A]">Liked most: </span>{c.likedMost}</p>}
                                                        {c.improvement && <p className="text-sm text-slate-700"><span className="font-bold text-amber-700">Could improve: </span>{c.improvement}</p>}
                                                        {c.otherComments && <p className="text-sm text-slate-700"><span className="font-bold text-[#0B1F3A]">Other: </span>{c.otherComments}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white border border-[#0B1F3A]/10">
                    <Badge variant="outline" className="rounded-none">No feedback yet</Badge>
                    <p className="text-slate-400 font-serif italic">Nothing submitted through the feedback form yet.</p>
                </div>
            )}
        </div>
    );
}
