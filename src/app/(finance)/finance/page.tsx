"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface FinanceStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayouts: number;
    failedTransactions: number;
    profitMargin: number;
}

export default function FinanceDashboardPage() {
    const [stats, setStats] = useState<FinanceStats>({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayouts: 0,
        failedTransactions: 0,
        profitMargin: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch transactions
                const transactionsRes = await fetch('/api/finance/transactions?limit=10');
                const data = await transactionsRes.json();

                if (data.transactions && Array.isArray(data.transactions)) {
                    const transactions = data.transactions;

                    // Calculate stats
                    const revenue = transactions
                        .filter(t => t.type === 'enrollment' && t.status === 'completed')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const expenses = transactions
                        .filter(t => ['payout', 'refund'].includes(t.type) && t.status === 'completed')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const pending = transactions
                        .filter(t => t.type === 'payout' && t.status === 'pending')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const failed = transactions.filter(t => t.status === 'failed').length;

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
    }, []);

    const statCards = [
        {
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            sub: `${stats.profitMargin}% profit margin`,
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            subColor: "text-emerald-600",
            href: "/finance/revenue"
        },
        {
            label: "Expenses",
            value: `$${stats.totalExpenses.toLocaleString()}`,
            icon: CreditCard,
            sub: "Payouts + Refunds",
            bg: "bg-orange-50",
            iconColor: "text-orange-600",
            subColor: "text-orange-600",
            href: "/finance/expenses"
        },
        {
            label: "Net Profit",
            value: `$${stats.netProfit.toLocaleString()}`,
            icon: TrendingUp,
            sub: `${stats.profitMargin}% margin`,
            bg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            subColor: "text-indigo-600",
            href: "/finance/profit"
        },
        {
            label: "Pending Payouts",
            value: `$${stats.pendingPayouts.toLocaleString()}`,
            icon: Wallet,
            sub: "Awaiting processing",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            subColor: "text-slate-500",
            href: "/finance/payouts"
        },
    ];

    const getStatusBadge = (status: string) => {
        const variants: any = {
            completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
            pending: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending" },
            failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
            refunded: { bg: "bg-orange-100", text: "text-orange-700", label: "Refunded" }
        };
        const variant = variants[status] || variants.pending;
        return <span className={`${variant.bg} ${variant.text} text-xs px-2 py-1 rounded-full font-medium`}>{variant.label}</span>;
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Financial Operations</h2>
                    <p className="text-sm text-slate-500 mt-1">Monitor revenue, expenses, and profit intelligence</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/finance/transactions">
                            <CreditCard className="h-4 w-4 mr-2" />
                            All Transactions
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/finance/reports">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Generate Report
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                                            {loading ? "..." : stat.value}
                                        </h2>
                                    </div>
                                    <div className={`${stat.bg} p-2.5 rounded-lg`}>
                                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-medium ${stat.subColor}`}>
                                    {stat.sub}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/finance/transactions">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Transaction ID</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((txn, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs">{txn._id?.slice(-8) || 'N/A'}</td>
                                            <td className="px-4 py-3 capitalize">
                                                <div className="flex items-center gap-2">
                                                    {txn.type === 'enrollment' ? (
                                                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <ArrowDownRight className="h-4 w-4 text-orange-600" />
                                                    )}
                                                    {txn.type}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{formatDate(txn.createdAt)}</td>
                                            <td className={`px-4 py-3 font-semibold ${txn.type === 'enrollment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {txn.type === 'enrollment' ? '+' : '-'}${txn.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(txn.status)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Monitoring */}
            {stats.failedTransactions > 0 && (
                <Card className="border-none shadow-sm bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-900">Risk Alert</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {stats.failedTransactions} failed transaction{stats.failedTransactions > 1 ? 's' : ''} detected. Review immediately.
                                </p>
                            </div>
                            <Button variant="destructive" asChild>
                                <Link href="/finance/risk">Review Now</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
