"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Completed" },
    pending: { bg: "bg-blue-50", text: "text-blue-700", label: "Pending" },
    failed: { bg: "bg-rose-50", text: "text-rose-700", label: "Failed" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-600", label: "Cancelled" },
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">Transaction Ledger</h1>
                    <p className="text-slate-500 font-medium italic">All payments processed by the academy.</p>
                </div>
            </div>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A]">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid gap-4 md:grid-cols-3">
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Student, email or reference…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                        />
                    </div>
                    <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                        <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="enrollment">Enrollment</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                            <SelectItem value="payout">Payout</SelectItem>
                            <SelectItem value="chargeback">Chargeback</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                        <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/70 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-bold italic">
                                        <DollarSign className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                        No transactions match the current filters.
                                    </td></tr>
                                ) : (
                                    filtered.map(t => {
                                        const variant = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                                        const negative = t.type === 'refund' || t.type === 'payout' || t.type === 'chargeback';
                                        return (
                                            <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400">#{t._id.slice(-8)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#0B1F3A] truncate max-w-[180px]">{t.userName}</p>
                                                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{t.userEmail}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium truncate max-w-[180px]">{t.courseName || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 font-bold text-[#0B1F3A] capitalize">
                                                        {negative ? <ArrowDownRight className="h-3.5 w-3.5 text-orange-500" /> : <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                <td className={cn(
                                                    "px-6 py-4 text-right font-black",
                                                    negative ? "text-orange-600" : "text-emerald-600"
                                                )}>
                                                    {negative ? '-' : '+'}${t.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{t.currency}</span>
                                                </td>
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

            {pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {page} of {pages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                        <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
