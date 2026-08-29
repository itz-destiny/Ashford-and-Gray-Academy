"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Search,
    Filter,
    Download,
    Clock,
    GraduationCap,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-4">
                        Tuition Revenue
                        <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] border-none rounded-none font-black text-[9px] uppercase tracking-widest">Live</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Monitoring academic fees, installments, and payment collections.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchTuitionData} className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                        <Download className="w-4 h-4 mr-2 text-[#C8A96A]" /> Export Report
                    </Button>
                    <Button className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        Generate Invoices
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), sub: `${stats.completedCount} Paid`, icon: DollarSign, accent: "border-t-[#1F7A5A]", color: "text-[#1F7A5A]" },
                    { label: "Pending Fees", value: formatCurrency(stats.pendingAmount), sub: `${stats.pendingCount} Students`, icon: Clock, accent: "border-t-[#C8A96A]", color: "text-[#C8A96A]" },
                    { label: "Paid Today", value: formatCurrency(stats.todayRevenue), sub: "Last 24h", icon: TrendingUp, accent: "border-t-[#0B1F3A]", color: "text-[#0B1F3A]" },
                    { label: "Enrollments", value: stats.completedCount.toString(), sub: "Completed", icon: GraduationCap, accent: "border-t-rose-400", color: "text-rose-500" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white border border-[#0B1F3A]/10 border-t-4 ${stat.accent} p-8 group hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-start justify-between mb-6">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-serif text-[#0B1F3A] mb-3">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1F7A5A]">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Recent Collections</h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">Live transaction stream from the student portal.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search students..."
                                className="pl-11 h-11 bg-white border border-[#0B1F3A]/10 rounded-none w-[260px] focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-none border-[#0B1F3A]/10">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F6F4F2] text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-[#0B1F3A]/10">
                            <tr>
                                <th className="px-8 py-4">Student Access</th>
                                <th className="px-6 py-4">Course / Term</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right pr-8">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium italic font-serif">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-[#F6F4F2]/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center font-black text-[#0B1F3A] text-xs">
                                                    {txn.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#0B1F3A]">{txn.userName || 'Unknown'}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{txn.userEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700">{txn.courseName || 'Course Enrollment'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-[#0B1F3A]">{formatCurrency(txn.amount)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                                <CreditCard className="w-4 h-4 opacity-50" />
                                                {txn.paymentMethod || 'Card'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge className={cn("border-none rounded-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5",
                                                txn.status === "completed" ? "bg-[#1F7A5A]/10 text-[#1F7A5A]" :
                                                    txn.status === "pending" ? "bg-[#C8A96A]/10 text-[#C8A96A]" :
                                                        "bg-rose-50 text-rose-600"
                                            )}>
                                                {txn.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <span className="text-xs font-bold text-slate-400">{formatTimeAgo(txn.createdAt)}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
