"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import {
    ClipboardCheck,
    Search,
    MoreHorizontal,
    TrendingUp,
    Download,
    Mail,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface GradeRecord {
    id: string;
    studentUid: string;
    studentName: string;
    studentEmail: string;
    assessmentTitle: string;
    courseTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: 'submitted' | 'graded';
    submittedAt?: string;
}

const GRADE_BANDS = [
    { name: 'A', min: 90, color: '#1F7A5A' },
    { name: 'B', min: 80, color: '#0B1F3A' },
    { name: 'C', min: 70, color: '#C8A96A' },
    { name: 'D', min: 60, color: '#f59e0b' },
    { name: 'F', min: 0, color: '#e11d48' },
];

function bandFor(percentage: number): string {
    return GRADE_BANDS.find((b) => percentage >= b.min)?.name || 'F';
}

export default function CourseRegistrarGradesPage() {
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/course-registrar/grades');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) setGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGrades = grades.filter(g =>
        g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const gradedOnly = grades.filter(g => g.status === 'graded');
    const gradeDistribution = GRADE_BANDS.map((band) => ({
        name: band.name,
        color: band.color,
        value: gradedOnly.filter((g) => bandFor(g.percentage) === band.name).length,
    }));

    const atRisk = [...gradedOnly].filter(g => g.percentage < 50).sort((a, b) => a.percentage - b.percentage).slice(0, 3);
    const topPerformers = [...gradedOnly].filter(g => g.percentage >= 90);

    const getStatusBadge = (status: string) => {
        return status === 'graded'
            ? <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] border-none rounded-none font-black">GRADED</Badge>
            : <Badge className="bg-slate-100 text-slate-700 border-none rounded-none font-black uppercase">AWAITING GRADE</Badge>;
    };

    const downloadCsv = (rows: GradeRecord[], filename: string) => {
        const csv = [
            ['Student', 'Email', 'Assessment', 'Course', 'Score', 'Max Score', 'Percentage', 'Status'],
            ...rows.map(r => [r.studentName, r.studentEmail, r.assessmentTitle, r.courseTitle, r.score, r.maxScore, `${r.percentage}%`, r.status]),
        ].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Academic <span className="text-[#C8A96A]">Standing.</span>
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none font-black text-[10px] uppercase tracking-widest px-3 py-1">{grades.length} Total Records</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Real test and exam results across every course, drawn from graded attempts.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={grades.length === 0}
                        onClick={() => downloadCsv(grades, `academic-standing-${new Date().toISOString().slice(0, 10)}.csv`)}
                        className="h-11 px-6 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none gap-2"
                    >
                        <Download className="w-4 h-4 text-[#C8A96A]" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                    <div className="p-8 pb-2">
                        <h2 className="text-xl font-serif text-[#0B1F3A] flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#C8A96A]" /> Grade Distribution
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Real graded test/exam results across every course.</p>
                    </div>
                    <div className="p-8 pt-0">
                        <div className="h-[250px] w-full">
                            {gradedOnly.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400 font-serif italic">
                                    No graded attempts yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={gradeDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F6F4F2' }}
                                            contentStyle={{ borderRadius: 0, border: '1px solid rgba(11,31,58,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                                            {gradeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <AlertCircle className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="text-lg font-serif text-white mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400" /> At Risk Students
                        </h3>
                        <p className="text-white/60 text-sm font-medium mb-6">Students scoring below 50% on their most recent graded assessments.</p>
                        <div className="space-y-3">
                            {atRisk.length === 0 ? (
                                <p className="text-white/40 text-xs font-bold italic">No at-risk results right now.</p>
                            ) : atRisk.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-500/20 flex items-center justify-center font-black text-rose-400 text-xs">
                                            {bandFor(r.percentage)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white leading-none">{r.studentName}</p>
                                            <p className="text-[10px] text-white/40 mt-1">{r.percentage}% · {r.assessmentTitle}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push('/course-registrar/communications')}
                                        className="h-7 text-[10px] font-black uppercase text-[#C8A96A] hover:text-white p-0"
                                    >
                                        Message
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8 group">
                        <h3 className="text-lg font-serif text-[#0B1F3A] mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#1F7A5A]" /> High Achievers
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">{topPerformers.length} result{topPerformers.length === 1 ? '' : 's'} at 90% or above.</p>
                        <Button
                            disabled={topPerformers.length === 0}
                            onClick={() => downloadCsv(topPerformers, `deans-list-${new Date().toISOString().slice(0, 10)}.csv`)}
                            className="w-full h-11 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none shadow-none"
                        >
                            Export Dean's List
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="p-8 border-b border-[#0B1F3A]/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search students, assessments, or courses..."
                                className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/10">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment / Course</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Grade</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Standing</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6} className="h-16 bg-slate-50/30" />
                                    </TableRow>
                                ))
                            ) : filteredGrades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <ClipboardCheck className="w-12 h-12 opacity-20" />
                                            <p className="font-bold font-serif text-[#0B1F3A]">No grading records found</p>
                                            <p className="text-sm font-medium">Try refining your search, or check back once students have taken tests.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGrades.map((record) => (
                                    <TableRow key={record.id} className="group hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 rounded-none border border-[#0B1F3A]/10">
                                                    <AvatarFallback className="bg-[#F6F4F2] text-[10px] font-black text-[#0B1F3A] rounded-none">
                                                        {record.studentName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#0B1F3A] leading-tight">{record.studentName}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{record.studentEmail}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-slate-700 text-sm">
                                            <div className="flex flex-col">
                                                <span>{record.assessmentTitle}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{record.courseTitle}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-black text-[#0B1F3A]">
                                            {record.status === 'graded' ? bandFor(record.percentage) : '—'}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1 w-24">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-[#0B1F3A]">{record.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full",
                                                            record.percentage >= 80 ? "bg-[#1F7A5A]" : record.percentage >= 50 ? "bg-[#C8A96A]" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${record.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(record.status)}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-none hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-none p-2 shadow-xl border-[#0B1F3A]/10">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push('/course-registrar/communications')}
                                                        className="rounded-none flex items-center gap-3 p-3 cursor-pointer"
                                                    >
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm text-[#0B1F3A]">Message Student</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
