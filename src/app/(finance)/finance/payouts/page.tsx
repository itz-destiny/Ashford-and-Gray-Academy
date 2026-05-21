"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, Wallet, Users, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Payout = {
    _id: string;
    userName: string;
    userEmail: string;
    instructorName?: string;
    instructorId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: string;
    processedAt?: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Paid" },
    pending: { bg: "bg-blue-50", text: "text-blue-700", label: "Pending" },
    failed: { bg: "bg-rose-50", text: "text-rose-700", label: "Failed" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-600", label: "Cancelled" },
};

export default function FinancePayoutsPage() {
    const { user, loading: userLoading } = useUser();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;
        const fetchData = async () => {
            try {
                const res = await apiFetch('/api/finance/transactions?type=payout&limit=200');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setPayouts(data.transactions || []);
            } catch (err) {
                console.error('payouts fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, userLoading]);

    const summary = useMemo(() => {
        const pending = payouts.filter(p => p.status === 'pending');
        const completed = payouts.filter(p => p.status === 'completed');
        const recipients = new Set(payouts.map(p => p.instructorId || p.userEmail));
        return {
            pendingAmount: pending.reduce((s, p) => s + p.amount, 0),
            pendingCount: pending.length,
            paidThisMonth: completed.filter(p => new Date(p.processedAt || p.createdAt).getMonth() === new Date().getMonth())
                .reduce((s, p) => s + p.amount, 0),
            recipientCount: recipients.size,
        };
    }, [payouts]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">Payouts</h1>
                <p className="text-slate-500 font-medium italic">Instructor and affiliate disbursements.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-2xl"><Wallet className="h-5 w-5 text-blue-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">${summary.pendingAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{summary.pendingCount} pending requests</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid This Month</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">${summary.paidThisMonth.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white rounded-[2rem] shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl"><Users className="h-5 w-5 text-orange-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipients</p>
                            <p className="text-2xl font-black text-[#0B1F3A]">{summary.recipientCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A]">All Payouts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/70 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Processed</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" /></td></tr>
                                ) : payouts.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold italic">
                                        <CreditCard className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                        No payouts have been recorded yet.
                                    </td></tr>
                                ) : (
                                    payouts.map(p => {
                                        const variant = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                                        return (
                                            <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400">#{p._id.slice(-8)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#0B1F3A]">{p.instructorName || p.userName}</p>
                                                    <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-slate-500">{p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}</td>
                                                <td className="px-6 py-4 text-right font-black text-orange-600">-${p.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{p.currency}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5", variant.bg, variant.text)}>
                                                        {variant.label}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
