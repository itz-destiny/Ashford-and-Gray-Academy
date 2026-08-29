"use client";

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

const STATUS_STYLES: Record<string, { cls: string; label: string }> = {
    completed: { cls: "bg-[#1F7A5A]/10 text-[#1F7A5A]", label: "Paid" },
    pending: { cls: "bg-[#C8A96A]/10 text-[#C8A96A]", label: "Pending" },
    failed: { cls: "bg-rose-50 text-rose-600", label: "Failed" },
    cancelled: { cls: "bg-slate-100 text-slate-500", label: "Cancelled" },
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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Payouts</h1>
                <p className="text-slate-500 font-medium font-serif">Instructor and affiliate disbursements.</p>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 flex items-center gap-4">
                    <Wallet className="h-8 w-8 text-[#C8A96A]" />
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Pending Payouts</p>
                        <p className="text-2xl font-serif text-[#0B1F3A] mt-2">₦{summary.pendingAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{summary.pendingCount} pending requests</p>
                    </div>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8 flex items-center gap-4">
                    <DollarSign className="h-8 w-8 text-[#1F7A5A]" />
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Paid This Month</p>
                        <p className="text-2xl font-serif text-[#0B1F3A] mt-2">₦{summary.paidThisMonth.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#0B1F3A] p-8 flex items-center gap-4">
                    <Users className="h-8 w-8 text-[#0B1F3A]" />
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Recipients</p>
                        <p className="text-2xl font-serif text-[#0B1F3A] mt-2">{summary.recipientCount}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-serif text-[#0B1F3A]">All Payouts</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F6F4F2] text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-[#0B1F3A]/10">
                            <tr>
                                <th className="px-8 py-4">Reference</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Processed</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right pr-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" /></td></tr>
                            ) : payouts.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium italic font-serif">
                                    <CreditCard className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                    No payouts have been recorded yet.
                                </td></tr>
                            ) : (
                                payouts.map(p => {
                                    const variant = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                                    return (
                                        <tr key={p._id} className="hover:bg-[#F6F4F2]/50 transition-colors">
                                            <td className="px-8 py-5 font-mono text-[10px] text-slate-400">#{p._id.slice(-8)}</td>
                                            <td className="px-6 py-5">
                                                <p className="font-black text-[#0B1F3A]">{p.instructorName || p.userName}</p>
                                                <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500 font-medium text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-slate-500 font-medium text-xs">{p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}</td>
                                            <td className="px-6 py-5 text-right font-black text-rose-600">-₦{p.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{p.currency}</span></td>
                                            <td className="px-6 py-5 text-right pr-8">
                                                <Badge className={cn("border-none rounded-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5", variant.cls)}>
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
            </div>
        </div>
    );
}
