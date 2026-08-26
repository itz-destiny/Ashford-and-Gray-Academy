"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Plus, Loader2, Users } from "lucide-react";

interface Assessment {
    _id: string;
    title: string;
    type: 'test' | 'exam';
    courseId: string | null;
    status: 'draft' | 'published';
    totalPoints: number;
    questions: any[];
    createdAt: string;
}

export default function InstructorTestsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/assessments');
            if (res.ok) setAssessments(await res.json());
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load", description: "Could not load your tests." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Tests &amp; Exams
                        <Badge variant="outline" className="rounded-full px-3">{assessments.length}</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Author tests, assign them to a course or the whole cohort, and grade results.</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-indigo-100">
                    <Link href="/instructor/tests/new"><Plus className="w-4 h-4 mr-2" /> Create Test</Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : assessments.length === 0 ? (
                <Card className="border-none shadow-lg shadow-slate-100 rounded-3xl">
                    <CardContent className="p-16 text-center text-slate-400">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No tests yet</p>
                        <p className="text-sm">Create your first test or exam to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(a => (
                        <Link key={a._id} href={`/instructor/tests/${a._id}`}>
                            <Card className="border-none shadow-lg shadow-slate-100 rounded-2xl hover:shadow-xl transition-shadow h-full">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <Badge className={a.status === 'published' ? "bg-emerald-100 text-emerald-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                                            {a.status === 'published' ? 'Published' : 'Draft'}
                                        </Badge>
                                        <Badge variant="outline" className="uppercase text-[10px]">{a.type}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{a.title}</h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            {a.courseId ? 'Course-specific' : 'Whole Cohort'} · {a.questions.length} questions · {a.totalPoints} pts
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
