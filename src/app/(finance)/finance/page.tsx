
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, History, Receipt } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Txn = {
    _id?: string;
    type: 'enrollment' | 'refund' | 'payout' | 'chargeback';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    createdAt: string;
};

interface FinanceStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayouts: number;
    failedTransactions: number;
    profitMargin: number;
}

export default function FinanceDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<FinanceStats>({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayouts: 0,
        failedTransactions: 0,
        profitMargin: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<Txn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;

        const fetchDashboardData = async () => {
            try {
                const transactionsRes = await apiFetch('/api/finance/transactions?limit=100');
                const data = await transactionsRes.json();

                if (data.transactions && Array.isArray(data.transactions)) {
                    const transactions: Txn[] = data.transactions;

                    const revenue = transactions
                        .filter((t: Txn) => t.type === 'enrollment' && t.status === 'completed')
                        .reduce((sum: number, t: Txn) => sum + t.amount, 0);

                    const expenses = transactions
                        .filter((t: Txn) => ['payout', 'refund'].includes(t.type) && t.status === 'completed')
                        .reduce((sum: number, t: Txn) => sum + t.amount, 0);

                    const pending = transactions
                        .filter((t: Txn) => t.type === 'payout' && t.status === 'pending')
                        .reduce((sum: number, t: Txn) => sum + t.amount, 0);

                    const failed = transactions.filter((t: Txn) => t.status === 'failed').length;

                    const netProfit = revenue - expenses;
                    const profitMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

                    setStats({
                        totalRevenue: revenue,
                        totalExpenses: expenses,
                        netProfit,
                        pendingPayouts: pending,
                        failedTransactions: failed,
                        profitMargin
                    });

                    setRecentTransactions(transactions.slice(0, 10));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [user, userLoading]);

    const statCards = [
        {
            label: "Total Earnings",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            sub: `${stats.profitMargin}% growth`,
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            subColor: "text-emerald-600",
            href: "/finance/transactions?type=enrollment"
        },
        {
            label: "Outgoing",
            value: `$${stats.totalExpenses.toLocaleString()}`,
            icon: CreditCard,
            sub: "Staff payments & refunds",
            bg: "bg-orange-50",
            iconColor: "text-orange-600",
            subColor: "text-orange-600",
            href: "/finance/payouts"
        },
        {
            label: "Balance",
            value: `$${stats.netProfit.toLocaleString()}`,
            icon: Wallet,
            sub: "Current academy funds",
            bg: "bg-[#0B1F3A]/5",
            iconColor: "text-[#0B1F3A]",
            subColor: "text-[#0B1F3A]",
            href: "/finance/reports"
        },
    ];

    const getStatusBadge = (status: string) => {
        const variants: any = {
            completed: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Paid" },
            pending: { bg: "bg-blue-50", text: "text-blue-600", label: "Processing" },
            failed: { bg: "bg-rose-50", text: "text-rose-600", label: "Failed" },
            refunded: { bg: "bg-orange-50", text: "text-orange-600", label: "Refunded" }
        };
        const variant = variants[status] || variants.pending;
        return <span className={`${variant.bg} ${variant.text} text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest`}>{variant.label}</span>;
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">Financial Overview</h1>
                    <p className="text-slate-500 font-medium italic">Track revenue, academy earnings, and outgoing payments.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="rounded-xl border-slate-100 font-bold text-xs uppercase tracking-tight">
                        <Link href="/finance/transactions">
                            <Receipt className="h-4 w-4 mr-2" />
                            Transactions
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#0B1F3A] hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-tight">
                        <Link href="/finance/reports">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Get Report
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-8 md:grid-cols-3">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border-none bg-white rounded-[2.5rem] group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h2 className="text-4xl font-black text-[#0B1F3A] mt-2">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <div className={cn("text-[10px] font-bold italic", stat.subColor)}>
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions */}
            <Card className="border-none bg-white rounded-[3rem] shadow-sm overflow-hidden">
                <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black text-[#0B1F3A] tracking-tight">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">
                        <Link href="/finance/transactions">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-50">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                                            No recent transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((txn, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 font-mono text-[10px] text-slate-400">#{txn._id?.slice(-8) || 'N/A'}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {txn.type === 'enrollment' ? (
                                                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <ArrowDownRight className="h-4 w-4 text-orange-500" />
                                                    )}
                                                    <span className="font-bold text-[#0B1F3A] capitalize">{txn.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500 font-medium">{formatDate(txn.createdAt)}</td>
                                            <td className={`px-6 py-5 font-black text-base ${txn.type === 'enrollment' ? 'text-emerald-600' : 'text-[#0B1F3A]'}`}>
                                                {txn.type === 'enrollment' ? '+' : '-'}${txn.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-right">{getStatusBadge(txn.status)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Attention Needed */}
            {stats.failedTransactions > 0 && (
                <Card className="border-none bg-rose-50 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shadow-rose-100">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-rose-900">Payment Alerts</h3>
                                <p className="text-sm text-rose-700 font-medium mt-1">
                                    {stats.failedTransactions} unsuccessful payment{stats.failedTransactions > 1 ? 's' : ''} detected. Please review these records.
                                </p>
                            </div>
                            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl" asChild>
                                <Link href="/finance/transactions?status=failed">Review Now</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
