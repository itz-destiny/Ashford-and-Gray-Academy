"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp, DollarSign, Receipt, Wallet, AlertTriangle, Loader2 } from "lucide-react";
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight">Financial Reports</h1>
                <p className="text-slate-500 font-medium italic">Six-month revenue, expenses and top-performing courses.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <KpiCard label="Net Profit" value={`$${stats.net.toLocaleString()}`} icon={TrendingUp} tint="emerald" />
                <KpiCard label="Gross Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} tint="blue" />
                <KpiCard label="Refunds" value={`$${stats.refunds.toLocaleString()}`} icon={Receipt} tint="orange" />
                <KpiCard label="Payouts" value={`$${stats.payouts.toLocaleString()}`} icon={Wallet} tint="indigo" />
            </div>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A]">Last 6 Months</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-6 gap-4 items-end h-56">
                        {stats.months.map(m => (
                            <div key={m.key} className="flex flex-col items-center gap-2 group">
                                <div className="w-full flex gap-1 items-end h-44">
                                    <div className="flex-1 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${(m.revenue / stats.peak) * 100}%` }} title={`Revenue: $${m.revenue.toLocaleString()}`} />
                                    <div className="flex-1 bg-orange-400/80 hover:bg-orange-400 rounded-t-lg transition-all" style={{ height: `${(m.expenses / stats.peak) * 100}%` }} title={`Expenses: $${m.expenses.toLocaleString()}`} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-6 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Revenue</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-400 rounded-sm" /> Expenses</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-lg font-black text-[#0B1F3A]">Top Courses by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {stats.topCourses.length === 0 ? (
                            <p className="text-sm text-slate-400 font-bold italic text-center py-8">No completed enrollments yet.</p>
                        ) : stats.topCourses.map(([name, amount], i) => (
                            <div key={name} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600">{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#0B1F3A] truncate">{name}</p>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                        <div className="h-full bg-[#1F7A5A]" style={{ width: `${(amount / stats.topCourses[0][1]) * 100}%` }} />
                                    </div>
                                </div>
                                <p className="font-black text-[#0B1F3A]">${amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none rounded-[2.5rem] shadow-sm",
                    stats.failed > 0 ? "bg-rose-50" : "bg-emerald-50"
                )}>
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                            <AlertTriangle className={cn("h-5 w-5", stats.failed > 0 ? "text-rose-600" : "text-emerald-600")} />
                            Payment Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <p className="text-5xl font-black text-[#0B1F3A]">{stats.failed}</p>
                        <p className="text-sm font-bold text-slate-600">Failed transactions in the visible window.</p>
                        <Badge className={cn(
                            "border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1",
                            stats.failed > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                            {stats.failed > 0 ? 'Action recommended' : 'Healthy'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon: Icon, tint }: { label: string; value: string; icon: any; tint: string }) {
    const tints: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };
    return (
        <Card className="border-none bg-white rounded-[2rem] shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", tints[tint])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-[#0B1F3A]">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
