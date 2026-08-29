"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DollarSign, Search, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Txn = {
    _id: string;
    userName: string;
    userEmail: string;
    courseName?: string;
    amount: number;
    currency: string;
    type: 'enrollment' | 'refund' | 'payout' | 'chargeback';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod?: string;
    createdAt: string;
};

const STATUS_STYLES: Record<string, { cls: string; label: string }> = {
    completed: { cls: "bg-[#1F7A5A]/10 text-[#1F7A5A]", label: "Completed" },
    pending: { cls: "bg-[#C8A96A]/10 text-[#C8A96A]", label: "Pending" },
    failed: { cls: "bg-rose-50 text-rose-600", label: "Failed" },
    cancelled: { cls: "bg-slate-100 text-slate-500", label: "Cancelled" },
};

export default function FinanceTransactionsPage() {
    const { user, loading: userLoading } = useUser();
    const params = useSearchParams();
    const [txns, setTxns] = useState<Txn[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [type, setType] = useState<string>(params.get("type") || "all");
    const [status, setStatus] = useState<string>(params.get("status") || "all");
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (userLoading || !user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams({ page: String(page), limit: "50" });
                if (type !== "all") qs.set("type", type);
                if (status !== "all") qs.set("status", status);
                const res = await apiFetch(`/api/finance/transactions?${qs.toString()}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setTxns(data.transactions || []);
                setPages(data.pagination?.pages || 1);
            } catch (err) {
                console.error("transactions fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, userLoading, type, status, page]);

    const filtered = txns.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.userName?.toLowerCase().includes(q) ||
            t.userEmail?.toLowerCase().includes(q) ||
            t.courseName?.toLowerCase().includes(q) ||
            t._id?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Transaction Ledger</h1>
                <p className="text-slate-500 font-medium font-serif">All payments processed by the academy.</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                <h2 className="text-2xl font-serif text-[#0B1F3A] mb-6">Search &amp; Filter</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Student, email or reference…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-11 bg-white border border-[#0B1F3A]/10 rounded-none focus-visible:ring-[#C8A96A]"
                        />
                    </div>
                    <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                        <SelectTrigger className="h-11 bg-white border border-[#0B1F3A]/10 rounded-none focus:ring-[#C8A96A]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="enrollment">Enrollment</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                            <SelectItem value="payout">Payout</SelectItem>
                            <SelectItem value="chargeback">Chargeback</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                        <SelectTrigger className="h-11 bg-white border border-[#0B1F3A]/10 rounded-none focus:ring-[#C8A96A]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F6F4F2] text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-[#0B1F3A]/10">
                            <tr>
                                <th className="px-8 py-4">Reference</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right pr-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium italic font-serif">
                                    <DollarSign className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                    No transactions match the current filters.
                                </td></tr>
                            ) : (
                                filtered.map(t => {
                                    const variant = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                                    const negative = t.type === 'refund' || t.type === 'payout' || t.type === 'chargeback';
                                    return (
                                        <tr key={t._id} className="hover:bg-[#F6F4F2]/50 transition-colors">
                                            <td className="px-8 py-5 font-mono text-[10px] text-slate-400">#{t._id.slice(-8)}</td>
                                            <td className="px-6 py-5">
                                                <p className="font-black text-[#0B1F3A] truncate max-w-[180px]">{t.userName}</p>
                                                <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{t.userEmail}</p>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500 font-medium truncate max-w-[180px]">{t.courseName || '—'}</td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 font-black text-[#0B1F3A] text-[10px] uppercase tracking-widest">
                                                    {negative ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" /> : <ArrowUpRight className="h-3.5 w-3.5 text-[#1F7A5A]" />}
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500 font-medium text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className={cn(
                                                "px-6 py-5 text-right font-black",
                                                negative ? "text-rose-600" : "text-[#1F7A5A]"
                                            )}>
                                                {negative ? '-' : '+'}₦{t.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{t.currency}</span>
                                            </td>
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

            {pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {pages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-10 px-5 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">Previous</Button>
                        <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))} className="h-10 px-5 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
