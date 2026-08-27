"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentGradesPage() {
    const { user } = useUser();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [enRes, attemptsRes] = await Promise.all([
                    apiFetch('/api/enrollments'),
                    apiFetch('/api/attempts/mine'),
                ]);
                const enrollmentsBody = await enRes.json().catch(() => []);
                const attemptsBody = await attemptsRes.json().catch(() => null);
                if (Array.isArray(enrollmentsBody)) setEnrollments(enrollmentsBody);
                if (attemptsBody?.success) setTestResults(attemptsBody.results);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const gradedResults = testResults.filter((r) => r.status === 'graded' && r.percentage !== null);
    const averageScore = gradedResults.length > 0
        ? Math.round(gradedResults.reduce((sum, r) => sum + r.percentage, 0) / gradedResults.length)
        : null;
    const certificatesEarned = enrollments.filter((e) => (e.progress || 0) === 100).length;

    const kpis = [
        { label: 'Active Courses', value: enrollments.length, icon: BookOpen, badge: 'Live' },
        { label: 'Certificates', value: certificatesEarned, icon: Award, badge: 'Earned' },
        { label: 'Average Test Score', value: averageScore === null ? '—' : `${averageScore}%`, icon: TrendingUp, badge: 'Tests' },
    ];

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academic Record</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                    My <span className="text-[#C8A96A]">Grades.</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                    Track your scholarly progress and test results across every enrolled programme.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {kpis.map((item, i) => (
                    <Card key={i} className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white hover:border-[#C8A96A] transition-colors group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-12 h-12 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none flex items-center justify-center text-[#0B1F3A] group-hover:scale-105 transition-transform">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <Badge className="bg-[#F6F4F2] text-slate-500 border border-[#0B1F3A]/5 rounded-none font-black text-[9px] uppercase tracking-widest">{item.badge}</Badge>
                            </div>
                            <h3 className="text-4xl font-serif text-[#0B1F3A] mb-1">{item.value}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Test & Exam Results — real, automatically scored the moment an
                MCQ/true-false attempt is submitted. Short-answer questions
                show as pending until an instructor grades them. */}
            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="px-8 py-8 border-b border-[#0B1F3A]/10">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">Test &amp; Exam Results</h2>
                    <p className="text-slate-400 font-medium mt-2">Automatically scored the moment you submit.</p>
                </div>
                <CardContent className="p-0">
                    {testResults.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 font-serif italic">
                            {loading ? 'Loading…' : "You haven't taken a test yet."}
                        </div>
                    ) : (
                        <div className="divide-y divide-[#0B1F3A]/5">
                            {testResults.map((r) => (
                                <div key={r._id} className="flex items-center justify-between px-8 py-5">
                                    <div>
                                        <p className="font-serif text-[#0B1F3A]">{r.title}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            {r.type} · {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                    {r.status === 'pending' ? (
                                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-black text-[9px] uppercase tracking-widest rounded-none">
                                            Awaiting Grading
                                        </Badge>
                                    ) : (
                                        <div className="text-right">
                                            <p className="font-serif text-[#0B1F3A] text-lg">{r.percentage}%</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.score}/{r.maxScore} pts</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Course progress — real Enrollment.progress, nothing derived */}
            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="px-8 py-8 border-b border-[#0B1F3A]/10">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">Course Progress</h2>
                    <p className="text-slate-400 font-medium mt-2">Your completion across every enrolled programme.</p>
                </div>
                <CardContent className="p-0">
                    {enrollments.length === 0 && !loading ? (
                        <div className="text-center py-24 text-slate-400 font-serif italic">
                            You aren't enrolled in any courses yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-[#0B1F3A]/5">
                            {enrollments.map((en) => (
                                <div key={en.id} className="flex items-center justify-between gap-6 px-8 py-6">
                                    <Link href={`/my-courses/${en.courseId}`} className="font-serif text-[#0B1F3A] hover:text-[#C8A96A] transition-colors">
                                        {en.course?.title || 'Untitled Course'}
                                    </Link>
                                    <div className="w-56 space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                            <span>{en.progress || 0}% Complete</span>
                                            <span className={(en.progress || 0) === 100 ? "text-[#1F7A5A]" : "text-[#C8A96A]"}>
                                                {(en.progress || 0) === 100 ? "Certificate Ready" : "Learning"}
                                            </span>
                                        </div>
                                        <Progress value={en.progress || 0} className={cn("h-1.5 rounded-none bg-slate-100", (en.progress || 0) === 100 ? "[&>div]:bg-[#1F7A5A]" : "[&>div]:bg-[#C8A96A]")} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
