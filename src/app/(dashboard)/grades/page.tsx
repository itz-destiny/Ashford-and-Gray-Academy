"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, Award, TrendingUp, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentGradesPage() {
    const { user } = useUser();
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ gpa: '0.00', enrolled: 0, certificates: 0, percentile: 'Top 100%' });

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [enRes, attemptsRes] = await Promise.all([
                    apiFetch('/api/enrollments'),
                    apiFetch('/api/attempts/mine'),
                ]);
                const enrollments = await enRes.json();
                const attemptsBody = await attemptsRes.json().catch(() => null);
                if (attemptsBody?.success) setTestResults(attemptsBody.results);

                if (Array.isArray(enrollments)) {
                    const detailedPerformance = await Promise.all(enrollments.map(async (en: any) => {
                        const assRes = await apiFetch(`/api/assignments?courseId=${en.courseId._id}`);
                        const assignments = await assRes.json().catch(() => []);

                        // Fetch all submissions for these assignments by this user
                        const submissions = await Promise.all((Array.isArray(assignments) ? assignments : []).map(async (ass: any) => {
                            const subRes = await apiFetch(`/api/assignments?assignmentId=${ass._id}&userId=${user.uid}`);
                            return subRes.json().catch(() => null);
                        }));

                        const gradedSubmissions = submissions.filter(s => s && s.grade !== undefined);
                        const totalPoints = gradedSubmissions.reduce((acc, s) => acc + s.grade, 0);
                        const possiblePoints = gradedSubmissions.length * 100; // Assuming 100 per assignment
                        const percentage = possiblePoints > 0 ? (totalPoints / possiblePoints) * 100 : 0;

                        const getLetterGrade = (p: number) => {
                            if (p >= 90) return 'A';
                            if (p >= 80) return 'B';
                            if (p >= 70) return 'C';
                            if (p >= 60) return 'D';
                            return 'F';
                        };

                        return {
                            courseId: en.courseId._id,
                            courseTitle: en.courseId.title,
                            progress: en.progress || 0,
                            score: percentage.toFixed(1),
                            grade: getLetterGrade(percentage),
                            lastAssignment: gradedSubmissions.length > 0 ? assignments.find((a: any) => a._id === gradedSubmissions[gradedSubmissions.length - 1].assignmentId)?.title : 'N/A',
                            lastGrade: gradedSubmissions.length > 0 ? gradedSubmissions[gradedSubmissions.length - 1].grade : 0
                        };
                    }));

                    setPerformanceData(detailedPerformance);

                    // Calculate stats
                    const avgScore = detailedPerformance.length > 0
                        ? detailedPerformance.reduce((acc, p) => acc + parseFloat(p.score), 0) / detailedPerformance.length
                        : 0;

                    const gpa = (avgScore / 25).toFixed(2); // Simple conversion to 4.0 scale

                    setStats({
                        gpa,
                        enrolled: enrollments.length,
                        certificates: detailedPerformance.filter(p => p.progress === 100).length,
                        percentile: `Top ${Math.max(1, 100 - Math.round(avgScore))}%`
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const gradeBadgeClass = (grade: string) => {
        if (['A', 'A+'].includes(grade)) return "bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/30";
        if (['B', 'B+'].includes(grade)) return "bg-[#0B1F3A]/5 text-[#0B1F3A] border border-[#0B1F3A]/10";
        return "bg-slate-50 text-slate-500 border border-slate-200";
    };

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academic Record</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        My <span className="text-[#C8A96A]">Grades.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                        Track your scholarly progress and standing across every enrolled programme.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="gap-2 h-12 px-6 rounded-none border border-[#0B1F3A]/10 hover:border-[#0B1F3A] bg-white text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest shadow-sm transition-all">
                        <FileText className="w-4 h-4" /> Export Transcript
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] rounded-none shadow-md bg-[#0B1F3A] text-white relative overflow-hidden group">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C8A96A]/10 rounded-full blur-[80px] opacity-60 group-hover:scale-125 transition-transform duration-1000" />
                    <CardContent className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-none flex items-center justify-center text-[#C8A96A]">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#C8A96A]">GPA</span>
                        </div>
                        <h3 className="text-5xl font-serif mb-1">{stats.gpa}</h3>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Cumulative Average</p>
                    </CardContent>
                </Card>

                {[
                    { label: "Active Courses", value: stats.enrolled, icon: BookOpen, badge: "Live" },
                    { label: "Certificates", value: stats.certificates, icon: Award, badge: "Earned" },
                    { label: "Class Percentile", value: stats.percentile, icon: TrendingUp, badge: "Rank" },
                ].map((item, i) => (
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

            {/* Table */}
            <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="flex justify-between items-end px-8 py-8 border-b border-[#0B1F3A]/10">
                    <div>
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Academic Record</h2>
                        <p className="text-slate-400 font-medium mt-2">Verified grade metrics per enrolled curriculum.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#C8A96A]" /> High Mastery</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#0B1F3A]/40" /> In Progress</span>
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#F6F4F2]/60">
                                <TableRow className="border-none">
                                    <TableHead className="font-black text-[#0B1F3A]/50 pl-8 h-14 uppercase text-[10px] tracking-widest">Course</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A]/50 h-14 uppercase text-[10px] tracking-widest">Progress</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A]/50 h-14 uppercase text-[10px] tracking-widest">Latest Assessment</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A]/50 h-14 uppercase text-[10px] tracking-widest text-center">Score</TableHead>
                                    <TableHead className="font-black text-[#0B1F3A]/50 h-14 uppercase text-[10px] tracking-widest text-center">Grade</TableHead>
                                    <TableHead className="text-right pr-8 h-14 uppercase text-[10px] tracking-widest font-black text-[#0B1F3A]/50">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map((data, i) => (
                                    <TableRow key={i} className="group border-b border-[#0B1F3A]/5 hover:bg-[#F6F4F2]/40 transition-all">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex flex-col">
                                                <Link href={`/my-courses/${data.courseId}`} className="font-serif text-[#0B1F3A] group-hover:text-[#C8A96A] transition-colors text-base">
                                                    {data.courseTitle}
                                                </Link>
                                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Institutional Credit</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-64">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                    <span>{data.progress}% Complete</span>
                                                    <span className={data.progress === 100 ? "text-[#1F7A5A]" : "text-[#C8A96A]"}>
                                                        {data.progress === 100 ? "Certificate Ready" : "Learning"}
                                                    </span>
                                                </div>
                                                <Progress value={data.progress} className={cn("h-1.5 rounded-none bg-slate-100", data.progress === 100 ? "[&>div]:bg-[#1F7A5A]" : "[&>div]:bg-[#C8A96A]")} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{data.lastAssignment}</span>
                                                <span className="text-slate-400 text-[10px] font-medium">Grade: {data.lastGrade}/100</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-serif text-[#0B1F3A] text-lg">{data.score}%</span>
                                                <span className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">Weighted Avg</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={cn("mx-auto w-10 h-10 rounded-none flex items-center justify-center font-black text-sm", gradeBadgeClass(data.grade))}>
                                                {data.grade}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button variant="ghost" size="sm" className="text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest hover:bg-[#F6F4F2] hover:text-[#C8A96A] transition-all rounded-none px-4">
                                                Inspect <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(performanceData.length === 0 && !loading) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-20 h-20 bg-[#F6F4F2] border border-[#0B1F3A]/10 rounded-none shadow-sm flex items-center justify-center text-slate-300">
                                                    <GraduationCap className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[#0B1F3A] text-2xl mb-2">No Records Yet</p>
                                                    <p className="text-slate-500 font-medium">Engagement is required to generate academic metrics.</p>
                                                </div>
                                                <Button asChild className="bg-[#0B1F3A] text-white hover:bg-[#C8A96A] font-black px-10 py-5 rounded-none shadow-lg transition-all text-[10px] uppercase tracking-widest mt-2">
                                                    <Link href="/courses">Explore Curriculum</Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-32 italic text-slate-400 font-serif tracking-wide animate-pulse">
                                            Retrieving academic records...
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
