"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Globe, Activity, Cpu, Database, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HealthCheck = {
    service: string;
    status: 'healthy' | 'degraded' | 'critical';
    responseTime?: number;
    metadata?: Record<string, any>;
    lastChecked?: string;
};

export default function AdminSettingsPage() {
    const { user, loading: userLoading } = useUser();
    const [checks, setChecks] = useState<HealthCheck[]>([]);
    const [summary, setSummary] = useState<{ overallStatus?: string; criticalAlerts?: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !user) return;
        const fetchHealth = async () => {
            try {
                const res = await apiFetch('/api/admin/system-health');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setChecks(data.checks || []);
                setSummary(data.summary || null);
            } catch (err) {
                console.error('system-health fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, [user, userLoading]);

    const statusTint = (status?: string) => {
        if (status === 'healthy') return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
        if (status === 'degraded') return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
        return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        <Settings className="w-7 h-7 text-indigo-600" />
                        Academy Settings
                    </h1>
                    <p className="text-slate-500 font-medium italic">Platform status, identity, and external integrations.</p>
                </div>
                {summary && (
                    <Badge className={cn(
                        "border-none font-bold text-xs uppercase tracking-widest px-3 py-1",
                        summary.overallStatus === 'healthy' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                        {summary.overallStatus === 'healthy' ? '✓ All Systems Operational' : `⚠ ${summary.criticalAlerts || 0} alerts`}
                    </Badge>
                )}
            </div>

            <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Platform Health
                    </CardTitle>
                    <CardDescription className="text-slate-400">Real-time status of backing services.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
                    ) : checks.length === 0 ? (
                        <p className="text-sm text-slate-400 font-bold italic text-center py-8">No health checks recorded yet. Status will populate after the first automated run.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {checks.map(c => {
                                const tint = statusTint(c.status);
                                return (
                                    <div key={c.service} className={cn("p-5 rounded-2xl border border-slate-100", tint.bg)}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-black text-[#0B1F3A] capitalize">{c.service}</span>
                                            <span className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", tint.text)}>
                                                <span className={cn("w-2 h-2 rounded-full animate-pulse", tint.dot)} />
                                                {c.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                                            {c.responseTime != null && <span>Response: {c.responseTime}ms</span>}
                                            {c.lastChecked && <span>Checked: {new Date(c.lastChecked).toLocaleTimeString()}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Access & Identity
                        </CardTitle>
                        <CardDescription className="text-slate-400">Provisioning and audit links.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-3">
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-2xl font-bold">
                            <Link href="/admin/users"><Shield className="w-4 h-4 mr-2" /> Manage users &amp; roles</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-2xl font-bold">
                            <Link href="/registrar/audit"><Database className="w-4 h-4 mr-2" /> View audit log</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-2xl font-bold">
                            <Link href="/registrar/users"><Shield className="w-4 h-4 mr-2" /> Invite staff</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                            <Globe className="w-5 h-5 text-emerald-600" />
                            External Dashboards
                        </CardTitle>
                        <CardDescription className="text-slate-400">Configure providers from their own consoles.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-3">
                        <ExternalLinkButton href="https://cloud.mongodb.com" label="MongoDB Atlas" />
                        <ExternalLinkButton href="https://console.firebase.google.com" label="Firebase Console" />
                        <ExternalLinkButton href="https://dashboard.paystack.com" label="Paystack Dashboard" />
                        <ExternalLinkButton href="https://cloud.livekit.io" label="LiveKit Cloud" />
                        <ExternalLinkButton href="https://resend.com/emails" label="Resend Email" />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none bg-[#0B1F3A] text-white rounded-[2.5rem] shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-[#C8A96A]/10" />
                <CardHeader className="p-8 pb-0 relative z-10">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#C8A96A]" />
                        Environment
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 relative z-10 grid gap-3 md:grid-cols-3 text-xs">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Node</p>
                        <p className="font-bold">Node.js runtime</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Region</p>
                        <p className="font-bold">Vercel default</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Build</p>
                        <p className="font-bold">{process.env.NEXT_PUBLIC_APP_URL || 'local'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full h-12 px-4 rounded-2xl border border-slate-100 font-bold text-sm text-[#0B1F3A] hover:bg-slate-50 transition-colors"
        >
            <span>{label}</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
        </a>
    );
}
