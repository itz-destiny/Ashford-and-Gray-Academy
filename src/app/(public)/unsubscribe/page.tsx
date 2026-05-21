"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function UnsubscribeRequestPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/newsletter/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Always show success — we don't reveal list membership.
            if (res.ok) {
                setSent(true);
            } else {
                const body = await res.json().catch(() => ({}));
                toast({ variant: "destructive", title: "Request failed", description: body.error || "Try again shortly." });
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Network error", description: err?.message || "Try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
                <div className="max-w-xl w-full text-center space-y-8">
                    <div className="w-20 h-20 rounded-3xl mx-auto bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-serif text-[#0B1F3A]">Check your inbox</h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            If <strong>{email}</strong> is on our subscriber list, we've sent a one-click unsubscribe link there. It may take a minute or two to arrive.
                        </p>
                    </div>
                    <Button asChild className="rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] px-8 h-12">
                        <Link href="/"><ArrowLeft className="mr-3 h-4 w-4" /> Return home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
            <div className="max-w-xl w-full space-y-10">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl mx-auto bg-slate-100 flex items-center justify-center">
                        <Mail className="w-7 h-7 text-slate-600" />
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A]">Unsubscribe</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        Lost the unsubscribe link? Enter your email below and we'll send a fresh one. The newsletter you received also contains a one-click unsubscribe link in its footer.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                    <div className="space-y-3">
                        <Label htmlFor="unsubscribe-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Subscriber email</Label>
                        <Input
                            id="unsubscribe-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            disabled={submitting}
                            className="h-14 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-6 font-medium shadow-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting || !email}
                        className="w-full h-14 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send unsubscribe link"}
                    </Button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Link href="/" className="hover:text-[#1F7A5A] transition-colors">Return home</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
