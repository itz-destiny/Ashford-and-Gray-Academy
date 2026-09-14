"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from "lucide-react";

interface LookupResult {
    uid: string;
    displayName: string;
    email: string;
    role: string;
    roleTitle: string;
    lastSignInTime: string | null;
    hasLoggedIn: boolean;
}

export default function MonitorUserLookupPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<LookupResult | null>(null);
    const [resetting, setResetting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await apiFetch(`/api/admin/users?email=${encodeURIComponent(email.trim())}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Could not find that account.");
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Could not find that account.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!result) return;
        setResetting(true);
        try {
            const res = await apiFetch(`/api/admin/users/${result.uid}/reset`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Could not reset this account.");
            toast({ title: "Reset & sent", description: `A new temporary password and magic login link were emailed to ${result.email}.` });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Reset failed", description: err.message || "Could not reset this account." });
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center px-6 py-16 gap-8">
            <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">IT Tools</p>
                <h1 className="font-serif text-2xl text-white">User Lookup &amp; Reset</h1>
                <p className="text-white/50 text-sm max-w-sm">Check whether an account has logged in, and reset it with one click.</p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
                <Input
                    type="email"
                    required
                    placeholder="account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-none bg-white/[0.03] border-white/20 text-white placeholder:text-white/30"
                />
                <Button type="submit" disabled={loading} className="h-12 px-6 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-xs uppercase tracking-widest rounded-none shrink-0">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
            </form>

            {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] p-6 space-y-5">
                    <div>
                        <p className="text-white font-serif text-xl">{result.displayName}</p>
                        <p className="text-white/50 text-sm">{result.email}</p>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{result.roleTitle}</p>
                    </div>

                    <div className={`flex items-center gap-2 text-sm font-bold ${result.hasLoggedIn ? "text-emerald-400" : "text-amber-400"}`}>
                        {result.hasLoggedIn ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {result.hasLoggedIn
                            ? `Logged in — last on ${new Date(result.lastSignInTime!).toLocaleString()}`
                            : "Has never logged in"}
                    </div>

                    <Button
                        onClick={handleReset}
                        disabled={resetting}
                        className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none"
                    >
                        {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                        Reset Password &amp; Send Magic Link
                    </Button>
                </div>
            )}
        </div>
    );
}
