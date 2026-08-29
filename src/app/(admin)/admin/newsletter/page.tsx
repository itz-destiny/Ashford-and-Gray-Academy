"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Users, CheckCircle2, Hourglass, XCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Subscriber = {
    _id: string;
    email: string;
    source?: string;
    confirmedAt?: string;
    unsubscribedAt?: string;
    createdAt: string;
};

type Summary = { confirmed: number; pending: number; unsubscribed: number; total: number };

export default function AdminNewsletterPage() {
    const { user, loading: userLoading } = useUser();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [summary, setSummary] = useState<Summary>({ confirmed: 0, pending: 0, unsubscribed: 0, total: 0 });
    const [status, setStatus] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;
        const load = async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams({ limit: "500" });
                if (status !== "all") qs.set("status", status);
                const res = await apiFetch(`/api/newsletter?${qs.toString()}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setSubscribers(data.subscribers || []);
                setSummary(data.summary || { confirmed: 0, pending: 0, unsubscribed: 0, total: 0 });
            } catch (err) {
                console.error("newsletter fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user, userLoading, status]);

    const filtered = useMemo(() => {
        if (!search) return subscribers;
        const q = search.toLowerCase();
        return subscribers.filter(s => s.email.toLowerCase().includes(q));
    }, [subscribers, search]);

    const exportCsv = () => {
        const header = "email,status,source,subscribed_at,confirmed_at,unsubscribed_at\n";
        const rows = filtered.map(s => {
            const st = s.unsubscribedAt ? "unsubscribed" : s.confirmedAt ? "confirmed" : "pending";
            return [
                csvEscape(s.email),
                st,
                csvEscape(s.source || ""),
                s.createdAt || "",
                s.confirmedAt || "",
                s.unsubscribedAt || "",
            ].join(",");
        }).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Academy Outreach</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Newsletter <span className="text-[#C8A96A]">Subscribers.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Manage opt-ins for academy announcements.</p>
                </div>
                <Button onClick={exportCsv} disabled={filtered.length === 0} variant="outline" className="h-11 px-5 rounded-none border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <KpiCard label="Confirmed" value={summary.confirmed} icon={CheckCircle2} tint="emerald" />
                <KpiCard label="Pending" value={summary.pending} icon={Hourglass} tint="amber" />
                <KpiCard label="Unsubscribed" value={summary.unsubscribed} icon={XCircle} tint="rose" />
                <KpiCard label="Total ever" value={summary.total} icon={Users} tint="gold" />
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="p-8 grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-11 bg-white border-[#0B1F3A]/10 rounded-none md:w-[200px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending confirmation</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-[#0B1F3A]/5">
                            <tr>
                                <th className="px-8 py-5">Email</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Source</th>
                                <th className="px-8 py-5">Subscribed</th>
                                <th className="px-8 py-5">Confirmed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-serif italic">
                                    No subscribers match the current filters.
                                </td></tr>
                            ) : filtered.map(s => {
                                const st = s.unsubscribedAt ? "unsubscribed" : s.confirmedAt ? "confirmed" : "pending";
                                const variant = STATUS_STYLES[st];
                                return (
                                    <tr key={s._id} className="hover:bg-[#F6F4F2] transition-colors">
                                        <td className="px-8 py-4 font-bold text-[#0B1F3A]">{s.email}</td>
                                        <td className="px-8 py-4">
                                            <Badge className={cn("border-none rounded-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5", variant.bg, variant.text)}>
                                                {variant.label}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-4 text-slate-500 capitalize">{s.source || "—"}</td>
                                        <td className="px-8 py-4 text-slate-500">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                                        <td className="px-8 py-4 text-slate-500">{s.confirmedAt ? new Date(s.confirmedAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
    unsubscribed: { bg: "bg-slate-100", text: "text-slate-600", label: "Unsubscribed" },
};

function KpiCard({ label, value, icon: Icon, tint }: { label: string; value: number; icon: any; tint: string }) {
    const tints: Record<string, string> = {
        emerald: "bg-emerald-50 text-[#1F7A5A]",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-600",
        gold: "bg-[#C8A96A]/10 text-[#C8A96A]",
    };
    return (
        <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-6 flex items-center gap-4">
            <div className={cn("p-3", tints[tint])}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
                <p className="text-2xl font-serif text-[#0B1F3A]">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

function csvEscape(v: string): string {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
}
