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

const inputClass =
    "h-12 rounded-none border border-slate-200 bg-white px-5 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] transition-colors";

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
            if (code === "auth/invalid-email") {
                toast({ variant: "destructive", title: "Check your email", description: "That doesn't look like a valid email address." });
            } else {
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
                    <div className="flex flex-col items-center gap-5 py-4">
                        <div className="w-16 h-16 bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 text-center max-w-sm leading-relaxed">
                            The reset link expires in 1 hour. If you don't see it, check your spam folder or try again.
                        </p>
                    </div>
                    <Button asChild className="w-full h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors">
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]">Email address</Label>
                    <Input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={submitting}
                        className={inputClass}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={submitting || !email}
                    className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors !mt-8"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send reset link <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>
            </form>
        </AuthForm>
    );
}
