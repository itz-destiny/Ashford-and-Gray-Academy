"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Receipt, Wallet, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Txn = {
    _id: string;
    amount: number;
    currency: string;
    type: 'enrollment' | 'refund' | 'payout' | 'chargeback';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: string;
    courseName?: string;
};

export default function FinanceReportsPage() {
    const { user, loading: userLoading } = useUser();
    const [txns, setTxns] = useState<Txn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;
        const fetchData = async () => {
            try {
                const res = await apiFetch('/api/finance/transactions?limit=500');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setTxns(data.transactions || []);
            } catch (err) {
                console.error('reports fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, userLoading]);

    const stats = useMemo(() => {
        const completed = txns.filter(t => t.status === 'completed');
        const revenue = completed.filter(t => t.type === 'enrollment').reduce((s, t) => s + t.amount, 0);
        const refunds = completed.filter(t => t.type === 'refund').reduce((s, t) => s + t.amount, 0);
        const payouts = completed.filter(t => t.type === 'payout').reduce((s, t) => s + t.amount, 0);
        const failed = txns.filter(t => t.status === 'failed').length;
        const net = revenue - refunds - payouts;

        // Last 6 months
        const months: { key: string; label: string; revenue: number; expenses: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            months.push({ key, label: d.toLocaleDateString('en', { month: 'short' }), revenue: 0, expenses: 0 });
        }
        for (const t of completed) {
            const d = new Date(t.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const bucket = months.find(m => m.key === key);
            if (!bucket) continue;
            if (t.type === 'enrollment') bucket.revenue += t.amount;
            else if (t.type === 'refund' || t.type === 'payout') bucket.expenses += t.amount;
        }
        const peak = Math.max(1, ...months.map(m => Math.max(m.revenue, m.expenses)));

        // Top courses
        const byCourse: Record<string, number> = {};
        for (const t of completed.filter(t => t.type === 'enrollment')) {
            const name = t.courseName || 'Uncategorized';
            byCourse[name] = (byCourse[name] || 0) + t.amount;
        }
        const topCourses = Object.entries(byCourse).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return { revenue, refunds, payouts, net, failed, months, peak, topCourses };
    }, [txns]);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>;
    }

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Financial Reports</h1>
                <p className="text-slate-500 font-medium font-serif">Six-month revenue, expenses and top-performing courses.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <KpiCard label="Net Profit" value={`₦${stats.net.toLocaleString()}`} icon={TrendingUp} accent="border-t-[#1F7A5A]" iconColor="text-[#1F7A5A]" />
                <KpiCard label="Gross Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={DollarSign} accent="border-t-[#C8A96A]" iconColor="text-[#C8A96A]" />
                <KpiCard label="Refunds" value={`₦${stats.refunds.toLocaleString()}`} icon={Receipt} accent="border-t-rose-400" iconColor="text-rose-500" />
                <KpiCard label="Payouts" value={`₦${stats.payouts.toLocaleString()}`} icon={Wallet} accent="border-t-[#0B1F3A]" iconColor="text-[#0B1F3A]" />
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                <h2 className="text-2xl font-serif text-[#0B1F3A] mb-6">Last 6 Months</h2>
                <div className="grid grid-cols-6 gap-4 items-end h-56">
                    {stats.months.map(m => (
                        <div key={m.key} className="flex flex-col items-center gap-2 group">
                            <div className="w-full flex gap-1 items-end h-44">
                                <div className="flex-1 bg-[#1F7A5A]/80 hover:bg-[#1F7A5A] transition-all" style={{ height: `${(m.revenue / stats.peak) * 100}%` }} title={`Revenue: ₦${m.revenue.toLocaleString()}`} />
                                <div className="flex-1 bg-rose-400/80 hover:bg-rose-400 transition-all" style={{ height: `${(m.expenses / stats.peak) * 100}%` }} title={`Expenses: ₦${m.expenses.toLocaleString()}`} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-6 mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#1F7A5A]" /> Revenue</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-400" /> Expenses</span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                    <h2 className="text-2xl font-serif text-[#0B1F3A] mb-6">Top Courses by Revenue</h2>
                    <div className="space-y-4">
                        {stats.topCourses.length === 0 ? (
                            <p className="text-sm text-slate-400 font-medium italic font-serif text-center py-8">No completed enrollments yet.</p>
                        ) : stats.topCourses.map(([name, amount], i) => (
                            <div key={name} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center font-black text-[#0B1F3A]">{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[#0B1F3A] truncate">{name}</p>
                                    <div className="h-1.5 bg-slate-100 overflow-hidden mt-1.5">
                                        <div className="h-full bg-[#1F7A5A]" style={{ width: `${(amount / stats.topCourses[0][1]) * 100}%` }} />
                                    </div>
                                </div>
                                <p className="font-black text-[#0B1F3A]">₦{amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cn(
                    "border border-[#0B1F3A]/10 border-t-4 p-8",
                    stats.failed > 0 ? "bg-rose-50 border-t-rose-500" : "bg-white border-t-[#1F7A5A]"
                )}>
                    <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-2 mb-6">
                        <AlertTriangle className={cn("h-5 w-5", stats.failed > 0 ? "text-rose-600" : "text-[#1F7A5A]")} />
                        Payment Health
                    </h2>
                    <p className="text-5xl font-serif text-[#0B1F3A]">{stats.failed}</p>
                    <p className="text-sm font-medium text-slate-600 mt-3 mb-4">Failed transactions in the visible window.</p>
                    <Badge className={cn(
                        "border-none rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1",
                        stats.failed > 0 ? "bg-rose-100 text-rose-700" : "bg-[#1F7A5A]/10 text-[#1F7A5A]"
                    )}>
                        {stats.failed > 0 ? 'Action recommended' : 'Healthy'}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon: Icon, accent, iconColor }: { label: string; value: string; icon: any; accent: string; iconColor: string }) {
    return (
        <div className={cn("bg-white border border-[#0B1F3A]/10 border-t-4 p-8", accent)}>
            <div className="flex items-start justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <p className="text-2xl font-serif text-[#0B1F3A]">{value}</p>
        </div>
    );
}
