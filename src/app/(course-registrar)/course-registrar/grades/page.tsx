"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ClipboardCheck,
    Search,
    Filter,
    MoreHorizontal,
    TrendingUp,
    Download,
    BookOpen,
    AlertCircle,
    CheckCircle2,
    Clock,
    User
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
    studentName: string;
    studentId: string;
    courseName: string;
    grade: string;
    score: number;
    status: 'Pass' | 'Fail' | 'Pending';
    submittedAt: string;
}

const gradeDistribution = [
    { name: 'A', value: 35, color: '#10b981' },
    { name: 'B', value: 42, color: '#3b82f6' },
    { name: 'C', value: 15, color: '#f59e0b' },
    { name: 'D', value: 5, color: '#ef4444' },
    { name: 'F', value: 3, color: '#1e293b' },
];

export default function CourseRegistrarGradesPage() {
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Mocking data for the initial view
        const mockGrades: GradeRecord[] = [
            { id: '1', studentName: 'Alice Johnson', studentId: 'ST-001', courseName: 'Introduction to Business', grade: 'A', score: 92, status: 'Pass', submittedAt: '2024-02-15T10:30:00Z' },
            { id: '2', studentName: 'Bob Smith', studentId: 'ST-002', courseName: 'Strategic Management', grade: 'B', score: 85, status: 'Pass', submittedAt: '2024-02-15T11:45:00Z' },
            { id: '3', studentName: 'Charlie Brown', studentId: 'ST-003', courseName: 'Economics 101', grade: 'Pending', score: 0, status: 'Pending', submittedAt: '2024-02-15T09:15:00Z' },
            { id: '4', studentName: 'Diana Prince', studentId: 'ST-004', courseName: 'Digital Marketing', grade: 'A', score: 98, status: 'Pass', submittedAt: '2024-02-14T16:20:00Z' },
            { id: '5', studentName: 'Edward Norton', studentId: 'ST-005', courseName: 'Software Engineering', grade: 'C', score: 72, status: 'Pass', submittedAt: '2024-02-14T14:10:00Z' },
        ];
        setGrades(mockGrades);
        setLoading(false);
    }, []);

    const filteredGrades = grades.filter(g =>
        g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pass': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black italic">PASS</Badge>;
            case 'Fail': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-black italic">FAIL</Badge>;
            default: return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none font-black italic uppercase">PENDING</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Academic Standing
                        <Badge variant="outline" className="rounded-full px-3">{grades.length} Total Records</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Monitoring institutional grading distributions and student performance audit logs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 rounded-xl px-6 font-bold border-slate-200 shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-2">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Grade Distribution
                        </CardTitle>
                        <CardDescription className="font-medium tracking-tight">Institutional grade frequency across all active departments.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                        <div className="h-[250px] w-full">
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
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                        {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <AlertCircle className="w-20 h-20" />
                        </div>
                        <h3 className="text-lg font-black mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500" /> At Risk Students
                        </h3>
                        <p className="text-slate-400 text-sm font-medium mb-6">Students with grades falling below institutional standards in the current semester.</p>
                        <div className="space-y-3">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center font-bold text-rose-500 text-xs">
                                            D
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-none">Student {i + 1}</p>
                                            <p className="text-[10px] text-slate-500">GPA: 1.4</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 p-0">Intervene</Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-indigo-600 text-white p-8 group">
                        <h3 className="text-lg font-black mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> High Achievers
                        </h3>
                        <p className="text-indigo-100 text-sm font-medium mb-6">Top 5% performing students eligible for institutional honors and grants.</p>
                        <Button className="w-full h-11 bg-white text-indigo-600 hover:bg-slate-50 font-black rounded-xl">Generate Dean's List</Button>
                    </Card>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search students, IDs or courses..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-2xl h-11 font-bold border-slate-200 shadow-sm">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" /> Filter Criteria
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Module</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Grade</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Numeric Score</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Standing</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6} className="h-16 bg-slate-50/20" />
                                    </TableRow>
                                ))
                            ) : filteredGrades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <ClipboardCheck className="w-12 h-12 opacity-20" />
                                            <p className="font-bold tracking-tight text-slate-900">No grading records found</p>
                                            <p className="text-sm font-medium">Try refining your search parameters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGrades.map((record) => (
                                    <TableRow key={record.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                                    <AvatarFallback className="bg-slate-50 text-[10px] font-black text-slate-400">
                                                        {record.studentName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">{record.studentName}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{record.studentId}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-bold text-slate-700 text-sm">
                                            {record.courseName}
                                        </TableCell>
                                        <TableCell className="py-4 font-black text-indigo-600">
                                            {record.grade}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1 w-24">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-900">{record.score}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            record.score >= 80 ? "bg-emerald-500" : record.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${record.score}%` }}
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
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Institutional Audit</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm text-slate-900">Review Submission</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <User className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm text-slate-900">Student Profile</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50 my-2" />
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-indigo-600 font-bold bg-indigo-50/50">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span className="font-bold text-sm">Update Grade</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
