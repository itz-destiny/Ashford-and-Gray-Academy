"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, Award, TrendingUp, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentGradesPage() {
    const { user } = useUser();
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ gpa: '0.00', enrolled: 0, certificates: 0, percentile: 'Top 100%' });

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const enRes = await fetch(`/api/enrollments?userId=${user.uid}`);
                const enrollments = await enRes.json();

                if (Array.isArray(enrollments)) {
                    const detailedPerformance = await Promise.all(enrollments.map(async (en: any) => {
                        const assRes = await fetch(`/api/assignments?courseId=${en.courseId._id}`);
                        const assignments = await assRes.json();

                        // Fetch all submissions for these assignments by this user
                        const submissions = await Promise.all(assignments.map(async (ass: any) => {
                            const subRes = await fetch(`/api/assignments?assignmentId=${ass._id}&userId=${user.uid}`);
                            return subRes.json();
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
                        ? detailedPerformance.reduce((acc, p) => acc + parseFloat(performanceData.find(pd => pd.courseId === p.courseId)?.score || p.score), 0) / detailedPerformance.length
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-indigo-600" />
                        Academic Achievement
                    </h1>
                    <p className="text-slate-500 font-medium">Track your scholarly progress and institutional standing.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-all">
                        <FileText className="w-4 h-4" /> Export Transcript
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-100 transition-all">
                        <Award className="w-4 h-4" /> Share Success
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                <GraduationCap className="w-6 h-6 text-indigo-100" />
                            </div>
                            <Badge className="bg-indigo-400/30 text-indigo-50 border-none backdrop-blur-md font-bold">GPA</Badge>
                        </div>
                        <h3 className="text-5xl font-black mb-1">{stats.gpa}</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Cumulative Average</p>
                    </CardContent>
                </Card>

                {[
                    { label: "Active Courses", value: stats.enrolled, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", badge: "Live" },
                    { label: "Certificates", value: stats.certificates, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", badge: "Earned" },
                    { label: "Class Percentile", value: stats.percentile, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", badge: "Rank" },
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/80 backdrop-blur-xl border border-white/20 hover:shadow-md transition-all group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-2 ${item.bg} rounded-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-none">{item.badge}</Badge>
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 mb-1">{item.value}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-2xl border border-white/20 overflow-hidden">
                <CardHeader className="bg-white/80 border-b border-slate-100 px-8 py-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Academic Inventory</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Verified grade metrics per enrolled curriculum.</CardDescription>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> High Mastery</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> In Progress</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-none">
                                    <TableHead className="font-bold text-slate-500 pl-8 h-12 uppercase text-[10px] tracking-widest">Course Syllabus</TableHead>
                                    <TableHead className="font-bold text-slate-500 h-12 uppercase text-[10px] tracking-widest">Mastery Progress</TableHead>
                                    <TableHead className="font-bold text-slate-500 h-12 uppercase text-[10px] tracking-widest">Latest Assessment</TableHead>
                                    <TableHead className="font-bold text-slate-500 h-12 uppercase text-[10px] tracking-widest text-center">Final Score</TableHead>
                                    <TableHead className="font-bold text-slate-500 h-12 uppercase text-[10px] tracking-widest text-center">Grade</TableHead>
                                    <TableHead className="text-right pr-8 h-12 uppercase text-[10px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map((data, i) => (
                                    <TableRow key={i} className="group border-b border-slate-50 hover:bg-indigo-50/20 transition-all">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex flex-col">
                                                <Link href={`/my-courses/${data.courseId}`} className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors text-base">
                                                    {data.courseTitle}
                                                </Link>
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Institutional Credit</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-64">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px] font-black text-slate-600">
                                                    <span>{data.progress}% Complete</span>
                                                    <span className={data.progress === 100 ? "text-emerald-600" : "text-amber-600"}>
                                                        {data.progress === 100 ? "Ready for Certificate" : "Learning"}
                                                    </span>
                                                </div>
                                                <Progress value={data.progress} className={`h-2 ${data.progress === 100 ? "bg-emerald-100 [&>div]:bg-emerald-500" : "bg-indigo-100 [&>div]:bg-indigo-500"}`} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{data.lastAssignment}</span>
                                                <span className="text-slate-400 text-[10px] font-medium tracking-tight">Grade: {data.lastGrade}/100</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-black text-slate-900 text-lg">{data.score}%</span>
                                                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">Weighted Avg</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${['A', 'A+'].includes(data.grade) ? "bg-emerald-100 text-emerald-700" :
                                                    ['B', 'B+'].includes(data.grade) ? "bg-blue-100 text-blue-700" :
                                                        "bg-amber-100 text-amber-700"
                                                }`}>
                                                {data.grade}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-all rounded-full px-4">
                                                Inspect <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(performanceData.length === 0 && !loading) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <GraduationCap className="w-16 h-16" />
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg uppercase tracking-widest">No Records Located</p>
                                                    <p className="text-slate-500 font-bold text-sm">Engagement required to generate academic metrics.</p>
                                                </div>
                                                <Button className="mt-4 bg-indigo-600 text-white font-bold" asChild>
                                                    <Link href="/courses">Explore Curriculum</Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-32 italic text-slate-400 font-bold tracking-widest animate-pulse">
                                            Retrieving Institutional Records...
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
