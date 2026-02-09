"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    History,
    Search,
    Filter,
    Download,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Shield,
    User,
    Database,
    AlertCircle,
    CheckCircle2,
    Info
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface AuditLog {
    _id: string;
    userName: string;
    userEmail: string;
    role: string;
    action: string;
    resource: string;
    status: 'success' | 'failure';
    timestamp: string;
    ipAddress?: string;
    metadata?: any;
    errorMessage?: string;
}

export default function RegistrarAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Detailed View State
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchLogs();
    }, [page, roleFilter, actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (actionFilter !== 'all') params.append('action', actionFilter);

            const res = await fetch(`/api/audit/logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'success'
            ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Success</Badge>
            : <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Failure</Badge>;
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('UPLOAD')) return 'text-indigo-600';
        if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-rose-600';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-amber-600';
        return 'text-slate-600';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        System Audit Logs
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Immutable record of all platform activities and administrative changes.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 rounded-2xl font-bold border-slate-200 shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Audit Trail
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-1 items-center gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by user or resource..."
                                    className="pl-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 h-11 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="border-none shadow-none focus:ring-0 w-[120px] h-full p-0">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                        <SelectItem value="registrar">Registrars</SelectItem>
                                        <SelectItem value="instructor">Instructors</SelectItem>
                                        <SelectItem value="student">Students</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl h-11 w-11 p-0">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                            <Button variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl h-11 w-11 p-0">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Identity</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action & Resource</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Context</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="h-16 bg-slate-50/20" />
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <History className="w-12 h-12 opacity-20" />
                                            <p className="font-bold">No activity logs found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log._id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-8 py-4 font-mono text-[11px] text-slate-400">
                                            {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 rounded-lg bg-slate-100">
                                                    <AvatarFallback className="text-[10px] font-black">{log.userName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm leading-tight">{log.userName}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{log.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn("font-black text-[11px] uppercase tracking-wider", getActionColor(log.action))}>
                                                    {log.action}
                                                </span>
                                                <span className="text-xs font-medium text-indigo-500/70">{log.resource}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(log.status)}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 gap-2 font-bold px-3">
                                                <Eye className="w-3.5 h-3.5" /> Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Security Protocols", desc: "Access managed via institutional encryption layers.", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { title: "Identity Verification", desc: "User activities linked to verified system accounts.", icon: User, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { title: "Data Integrity", desc: "Audit trail is immutable and permanently archived.", icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((feature, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-3xl p-6 bg-white border border-slate-50 flex gap-4">
                        <div className={cn("p-4 h-fit rounded-2xl", feature.bg, feature.color)}>
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 mb-1">{feature.title}</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detailed View Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedLog && (
                        <>
                            <DialogHeader className="p-10 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        {getStatusBadge(selectedLog.status)}
                                        <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                            ID: {selectedLog._id.slice(-8)}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-3xl font-black mb-2">{selectedLog.action}</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold text-base">
                                        Applied to {selectedLog.resource} resource by {selectedLog.userName}
                                    </DialogDescription>
                                </div>
                            </DialogHeader>
                            <div className="p-10 space-y-8 bg-white">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                                        <p className="font-bold text-slate-700">{format(new Date(selectedLog.timestamp), 'PPPP p')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</p>
                                        <p className="font-bold text-slate-700">{selectedLog.ipAddress || "Internal System"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Email</p>
                                        <p className="font-bold text-slate-700">{selectedLog.userEmail}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Role</p>
                                        <div className="pt-1">{selectedLog.role}</div>
                                    </div>
                                </div>

                                {selectedLog.metadata && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Info className="w-3 h-3" /> Event Metadata
                                        </p>
                                        <div className="bg-slate-50 p-6 rounded-2xl font-mono text-xs overflow-auto max-h-[200px] border border-slate-100">
                                            <pre className="text-slate-600">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.status === 'failure' && (
                                    <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100">
                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Error Diagnostic</p>
                                        <p className="text-sm font-bold text-rose-700 leading-relaxed">{selectedLog.errorMessage}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
