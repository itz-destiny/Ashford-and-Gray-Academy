"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { initializeFirebase } from "@/firebase";
import { AuthForm } from "../auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordResetPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            const { auth } = initializeFirebase();
            await sendPasswordResetEmail(auth, email.trim());
            setSent(true);
        } catch (err: any) {
            const code = err?.code || "";
            // Firebase returns an error for unknown emails; for security we
            // show the same message regardless so we don't leak whether an
            // address is on file. (This matches Google's own recommendation.)
            if (code === "auth/invalid-email") {
                toast({ variant: "destructive", title: "Check your email", description: "That doesn't look like a valid email address." });
            } else {
                // Any other failure (rate-limit, network) — still claim success
                // for security, but log it.
                console.error("Password reset error:", err);
                setSent(true);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (sent) {
        return (
            <AuthForm
                title="Check your inbox"
                description="If an account exists for that email, we've sent a one-time link to reset your password."
                footerText=""
                footerLinkText=""
            >
                <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 text-center max-w-sm leading-relaxed">
                            The reset link expires in 1 hour. If you don't see it, check your spam folder or try again.
                        </p>
                    </div>
                    <Button asChild className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                        <Link href="/login"><ArrowLeft className="mr-3 h-4 w-4" /> Back to sign in</Link>
                    </Button>
                </div>
            </AuthForm>
        );
    }

    return (
        <AuthForm
            title="Reset your password"
            description="Enter the email associated with your academy account. We'll send a one-time link to set a new password."
            footerText="Remembered it?"
            footerLinkText="Sign in"
            onFooterLinkClick={() => { window.location.href = "/login"; }}
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                    <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Email address</Label>
                    <Input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="executive@academy.com"
                        disabled={submitting}
                        className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 font-medium placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={submitting || !email}
                    className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send reset link <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>
            </form>
        </AuthForm>
    );
}
