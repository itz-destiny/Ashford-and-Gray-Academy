"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import {
    DollarSign, CreditCard, Wallet, TrendingUp, AlertTriangle,
    ArrowUpRight, ArrowDownRight, Receipt, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

type Txn = {
    _id?: string;
    type: 'enrollment' | 'refund' | 'payout' | 'chargeback';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency?: string;
    createdAt: string;
};

type FinanceStats = {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayouts: number;
    failedTransactions: number;
    profitMargin: number;
};

const safeDate = (d: string) => {
    const p = new Date(d);
    return Number.isNaN(p.getTime()) ? null : p;
};

const fmtAmt = (amount: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export default function FinanceDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState<FinanceStats>({
        totalRevenue: 0, totalExpenses: 0, netProfit: 0,
        pendingPayouts: 0, failedTransactions: 0, profitMargin: 0,
    });
    const [transactions, setTransactions] = useState<Txn[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await apiFetch('/api/finance/transactions?limit=100');
            const data = await res.json();
            if (data.transactions && Array.isArray(data.transactions)) {
                const txns: Txn[] = data.transactions;
                const revenue = txns
                    .filter(t => t.type === 'enrollment' && t.status === 'completed')
                    .reduce((s, t) => s + t.amount, 0);
                const expenses = txns
                    .filter(t => ['payout', 'refund'].includes(t.type) && t.status === 'completed')
                    .reduce((s, t) => s + t.amount, 0);
                const pendingPayouts = txns
                    .filter(t => t.type === 'payout' && t.status === 'pending')
                    .reduce((s, t) => s + t.amount, 0);
                const failed = txns.filter(t => t.status === 'failed').length;
                const netProfit = revenue - expenses;
                setStats({
                    totalRevenue: revenue,
                    totalExpenses: expenses,
                    netProfit,
                    pendingPayouts,
                    failedTransactions: failed,
                    profitMargin: revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0,
                });
                setTransactions(txns.slice(0, 10));
            }
        } catch (err) {
            console.error('Finance dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!userLoading && user) {
            fetchData();
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }
    }, [user, userLoading, fetchData]);

    const kpis = [
        {
            label: "Total Earnings", value: fmtAmt(stats.totalRevenue),
            icon: DollarSign, sub: `${stats.profitMargin}% profit margin`,
            subColor: "text-[#1F7A5A]", href: "/finance/transactions?type=enrollment",
        },
        {
            label: "Outgoing", value: fmtAmt(stats.totalExpenses),
            icon: CreditCard, sub: "Payouts & refunds",
            subColor: "text-rose-500", href: "/finance/payouts",
        },
        {
            label: "Net Balance", value: fmtAmt(stats.netProfit),
            icon: Wallet, sub: "Current academy funds",
            subColor: "text-[#0B1F3A]", href: "/finance/reports",
        },
    ];

    const getStatusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            completed: { cls: "bg-[#1F7A5A]/10 text-[#1F7A5A]", label: "Paid" },
            pending:   { cls: "bg-[#C8A96A]/10 text-[#C8A96A]", label: "Pending" },
            failed:    { cls: "bg-rose-50 text-rose-600",        label: "Failed" },
            cancelled: { cls: "bg-slate-100 text-slate-400",     label: "Cancelled" },
        };
        const v = map[status] || map.pending;
        return <span className={cn("text-[9px] px-3 py-1 font-black uppercase tracking-widest", v.cls)}>{v.label}</span>;
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
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Financial Overview</h1>
                    <p className="text-slate-500 font-medium font-serif">Track revenue, academy earnings, and outgoing payments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                        <Link href="/finance/transactions"><Receipt className="h-4 w-4 mr-2 text-[#C8A96A]" />Transactions</Link>
                    </Button>
                    <Button asChild className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                        <Link href="/finance/reports"><TrendingUp className="h-4 w-4 mr-2" />Reports</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpis.map((k, i) => (
                    <Link key={i} href={k.href}>
                        <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{k.label}</p>
                                <k.icon className="w-5 h-5 text-[#C8A96A]" />
                            </div>
                            <p className="text-3xl font-serif text-[#0B1F3A] mb-3">{loading ? '—' : k.value}</p>
                            <p className={cn("text-[10px] font-black uppercase tracking-widest", k.subColor)}>{k.sub}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Alert Banner */}
            {!loading && stats.failedTransactions > 0 && (
                <div className="bg-white border border-rose-200 border-l-4 border-l-rose-500 p-6 flex items-center gap-6">
                    <AlertTriangle className="h-6 w-6 text-rose-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-black text-rose-800 text-sm">
                            {stats.failedTransactions} failed payment{stats.failedTransactions > 1 ? 's' : ''} require review
                        </p>
                    </div>
                    <Button asChild className="h-10 px-5 rounded-none bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-none">
                        <Link href="/finance/transactions?status=failed">Review Now</Link>
                    </Button>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="flex items-center justify-between p-8 pb-4">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">Recent Transactions</h2>
                    <Button variant="ghost" size="sm" asChild className="text-[#C8A96A] hover:text-[#0B1F3A] font-black uppercase text-[9px] tracking-widest rounded-none">
                        <Link href="/finance/transactions">View All</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F6F4F2] text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-[#0B1F3A]/10">
                            <tr>
                                <th className="px-8 py-4">Reference</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-8 py-4">
                                            <div className="h-6 bg-slate-100 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium italic font-serif">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : transactions.map((txn, i) => {
                                const d = safeDate(txn.createdAt);
                                const isIncome = txn.type === 'enrollment';
                                return (
                                    <tr key={i} className="hover:bg-[#F6F4F2]/50 transition-colors">
                                        <td className="px-8 py-5 font-mono text-[10px] text-slate-400">#{txn._id?.slice(-8) || 'N/A'}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {isIncome
                                                    ? <ArrowUpRight className="h-4 w-4 text-[#1F7A5A]" />
                                                    : <ArrowDownRight className="h-4 w-4 text-rose-400" />}
                                                <span className="font-black text-[#0B1F3A] text-[10px] uppercase tracking-widest">{txn.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                                            {d ? format(d, 'MMM dd, yyyy') : '—'}
                                        </td>
                                        <td className={cn("px-6 py-5 font-black text-sm", isIncome ? "text-[#1F7A5A]" : "text-[#0B1F3A]")}>
                                            {isIncome ? '+' : '-'}{fmtAmt(txn.amount, txn.currency)}
                                        </td>
                                        <td className="px-6 py-5 text-right">{getStatusBadge(txn.status)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-6 flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-[#1F7A5A]" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Profit Margin</p>
                        <p className="text-2xl font-serif text-[#1F7A5A]">{stats.profitMargin}%</p>
                    </div>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6 flex items-center gap-4">
                    <Wallet className="h-8 w-8 text-[#C8A96A]" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pending Payouts</p>
                        <p className="text-2xl font-serif text-[#0B1F3A]">{fmtAmt(stats.pendingPayouts)}</p>
                    </div>
                </div>
                <div className={cn(
                    "border border-[#0B1F3A]/10 border-t-4 p-6 flex items-center gap-4",
                    stats.failedTransactions > 0 ? "bg-rose-50 border-t-rose-500" : "bg-white border-t-[#0B1F3A]"
                )}>
                    <AlertTriangle className={cn("h-8 w-8", stats.failedTransactions > 0 ? "text-rose-500" : "text-slate-300")} />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Failed Transactions</p>
                        <p className={cn("text-2xl font-serif", stats.failedTransactions > 0 ? "text-rose-600" : "text-[#0B1F3A]")}>
                            {stats.failedTransactions}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
