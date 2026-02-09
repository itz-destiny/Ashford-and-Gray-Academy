"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    Clock,
    GraduationCap,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Transaction {
    _id: string;
    userName: string;
    userEmail: string;
    courseName: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
}

export default function TuitionRevenuePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        todayRevenue: 0,
        completedCount: 0,
        pendingCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTuitionData();
    }, []);

    const fetchTuitionData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/finance/transactions?type=enrollment&limit=20');
            const data = await res.json();

            if (data.success) {
                setTransactions(data.transactions || []);

                // Calculate stats
                const completed = data.transactions.filter((t: Transaction) => t.status === 'completed');
                const pending = data.transactions.filter((t: Transaction) => t.status === 'pending');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayTxns = completed.filter((t: Transaction) =>
                    new Date(t.createdAt) >= today
                );

                setStats({
                    totalRevenue: data.summary?.totalAmount || 0,
                    pendingAmount: pending.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
                    todayRevenue: todayTxns.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
                    completedCount: completed.length,
                    pendingCount: pending.length
                });
            }
        } catch (error) {
            console.error('Error fetching tuition data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Tuition Revenue
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full px-4">Live</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Monitoring academic fees, installments, and payment collections.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50" onClick={fetchTuitionData}>
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        Generate Invoices
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), trend: `${stats.completedCount} Paid`, icon: DollarSign, color: "bg-emerald-500" },
                    { label: "Pending Fees", value: formatCurrency(stats.pendingAmount), trend: `${stats.pendingCount} Students`, icon: Clock, color: "bg-amber-500" },
                    { label: "Paid Today", value: formatCurrency(stats.todayRevenue), trend: "Last 24h", icon: TrendingUp, color: "bg-indigo-500" },
                    { label: "Enrollments", value: stats.completedCount.toString(), trend: "Completed", icon: GraduationCap, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-10 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 leading-tight">Recent Collections</CardTitle>
                            <CardDescription className="text-slate-400 font-bold">Live transaction stream from the student portal.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-10 h-11 bg-slate-50 border-none rounded-xl w-[260px] font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-100">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Access</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Term</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center text-slate-400 font-bold">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((txn) => (
                                        <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                                                        {txn.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{txn.userName || 'Unknown'}</span>
                                                        <span className="text-xs text-slate-400 font-bold">{txn.userEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{txn.courseName || 'Course Enrollment'}</span>
                                                    <span className="text-xs text-slate-400 font-bold italic">Spring 2026</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 font-black text-slate-900">{formatCurrency(txn.amount)}</td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                    <CreditCard className="w-4 h-4 opacity-50" />
                                                    {txn.paymentMethod || 'Card'}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <Badge className={
                                                    txn.status === "completed" ? "bg-emerald-100 text-emerald-700 border-none rounded-lg" :
                                                        txn.status === "pending" ? "bg-amber-100 text-amber-700 border-none rounded-lg" :
                                                            "bg-rose-100 text-rose-700 border-none rounded-lg"
                                                }>
                                                    {txn.status}
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="text-xs font-bold text-slate-400">{formatTimeAgo(txn.createdAt)}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
