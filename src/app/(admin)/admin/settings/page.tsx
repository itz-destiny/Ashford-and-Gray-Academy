"use client";

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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">System Administration</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Academy <span className="text-[#C8A96A]">Settings.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Platform status, identity, and external integrations.</p>
                </div>
                {summary && (
                    <Badge className={cn(
                        "border-none rounded-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5",
                        summary.overallStatus === 'healthy' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                        {summary.overallStatus === 'healthy' ? '✓ All Systems Operational' : `⚠ ${summary.criticalAlerts || 0} alerts`}
                    </Badge>
                )}
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="p-8 pb-6">
                    <h2 className="text-lg font-serif text-[#0B1F3A] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#C8A96A]" />
                        Platform Health
                    </h2>
                    <p className="text-slate-400 text-sm">Real-time status of backing services.</p>
                </div>
                <div className="p-8 pt-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
                    ) : checks.length === 0 ? (
                        <p className="text-sm text-slate-400 font-serif italic text-center py-8">No health checks recorded yet. Status will populate after the first automated run.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {checks.map(c => {
                                const tint = statusTint(c.status);
                                return (
                                    <div key={c.service} className={cn("p-5 border border-[#0B1F3A]/5", tint.bg)}>
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
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                    <div className="p-8 pb-6">
                        <h2 className="text-lg font-serif text-[#0B1F3A] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#C8A96A]" />
                            Access & Identity
                        </h2>
                        <p className="text-slate-400 text-sm">Provisioning and audit links.</p>
                    </div>
                    <div className="p-8 pt-0 space-y-3">
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                            <Link href="/admin/users"><Shield className="w-4 h-4 mr-2" /> Manage users &amp; roles</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                            <Link href="/registrar/audit"><Database className="w-4 h-4 mr-2" /> View audit log</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                            <Link href="/registrar/users"><Shield className="w-4 h-4 mr-2" /> Invite staff</Link>
                        </Button>
                    </div>
                </div>

                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A]">
                    <div className="p-8 pb-6">
                        <h2 className="text-lg font-serif text-[#0B1F3A] flex items-center gap-2">
                            <Globe className="w-5 h-5 text-[#1F7A5A]" />
                            External Dashboards
                        </h2>
                        <p className="text-slate-400 text-sm">Configure providers from their own consoles.</p>
                    </div>
                    <div className="p-8 pt-0 space-y-3">
                        <ExternalLinkButton href="https://cloud.mongodb.com" label="MongoDB Atlas" />
                        <ExternalLinkButton href="https://console.firebase.google.com" label="Firebase Console" />
                        <ExternalLinkButton href="https://dashboard.paystack.com" label="Paystack Dashboard" />
                        <ExternalLinkButton href="https://cloud.livekit.io" label="LiveKit Cloud" />
                        <ExternalLinkButton href="https://resend.com/emails" label="Resend Email" />
                    </div>
                </div>
            </div>

            <div className="bg-[#0B1F3A] text-white border-t-4 border-t-[#C8A96A] overflow-hidden relative">
                <div className="p-8 pb-0 relative z-10">
                    <h2 className="text-lg font-serif flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#C8A96A]" />
                        Environment
                    </h2>
                </div>
                <div className="p-8 relative z-10 grid gap-3 md:grid-cols-3 text-xs">
                    <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Node</p>
                        <p className="font-bold">Node.js runtime</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Region</p>
                        <p className="font-bold">Vercel default</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-widest mb-1">Build</p>
                        <p className="font-bold">{process.env.NEXT_PUBLIC_APP_URL || 'local'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full h-12 px-4 border border-[#0B1F3A]/10 font-bold text-sm text-[#0B1F3A] hover:bg-[#F6F4F2] transition-colors"
        >
            <span>{label}</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
        </a>
    );
}
