"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Search, Users, CheckCircle2, Hourglass, XCircle, Download } from "lucide-react";
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        <Mail className="w-7 h-7 text-indigo-600" />
                        Newsletter Subscribers
                    </h1>
                    <p className="text-slate-500 font-medium italic">Manage opt-ins for academy announcements.</p>
                </div>
                <Button onClick={exportCsv} disabled={filtered.length === 0} variant="outline" className="rounded-xl font-bold gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <KpiCard label="Confirmed" value={summary.confirmed} icon={CheckCircle2} tint="emerald" />
                <KpiCard label="Pending" value={summary.pending} icon={Hourglass} tint="amber" />
                <KpiCard label="Unsubscribed" value={summary.unsubscribed} icon={XCircle} tint="rose" />
                <KpiCard label="Total ever" value={summary.total} icon={Users} tint="indigo" />
            </div>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A]">Subscribers</CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl md:w-[200px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending confirmation</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
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
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Subscribed</th>
                                    <th className="px-6 py-4">Confirmed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold italic">
                                        No subscribers match the current filters.
                                    </td></tr>
                                ) : filtered.map(s => {
                                    const st = s.unsubscribedAt ? "unsubscribed" : s.confirmedAt ? "confirmed" : "pending";
                                    const variant = STATUS_STYLES[st];
                                    return (
                                        <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-[#0B1F3A]">{s.email}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5", variant.bg, variant.text)}>
                                                    {variant.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 capitalize">{s.source || "—"}</td>
                                            <td className="px-6 py-4 text-slate-500">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                                            <td className="px-6 py-4 text-slate-500">{s.confirmedAt ? new Date(s.confirmedAt).toLocaleDateString() : "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
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
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-600",
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
                    <p className="text-2xl font-black text-[#0B1F3A]">{value.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function csvEscape(v: string): string {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
}
