"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "../auth-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Mail, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Purpose = "signup" | "login_2fa";

function VerifyInner() {
    const params = useSearchParams();
    const router = useRouter();
    const auth = useAuth();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();

    const purpose: Purpose = (params.get("purpose") as Purpose) || "signup";
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [requestedAt, setRequestedAt] = useState<number | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const isStaff2fa = purpose === "login_2fa";

    // Auto-request code on mount if user is signed in and no code was just sent.
    useEffect(() => {
        if (userLoading || !user || requestedAt) return;
        void requestCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userLoading]);

    // Cooldown ticker
    useEffect(() => {
        if (!requestedAt) return;
        const tick = () => {
            const elapsed = Math.floor((Date.now() - requestedAt) / 1000);
            const remaining = Math.max(0, 60 - elapsed);
            setCooldown(remaining);
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [requestedAt]);

    async function requestCode() {
        if (!auth?.currentUser) return;
        setResending(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch("/api/auth/otp/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ purpose }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast({ variant: "destructive", title: "Could not send code", description: body.error || "Try again shortly." });
                return;
            }
            setRequestedAt(Date.now());
            toast({ title: "Code sent", description: `Check ${user?.email ?? "your inbox"} for the 6-digit code.` });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Could not send code", description: err?.message || "Network error." });
        } finally {
            setResending(false);
        }
    }

    function handleDigit(index: number, value: string) {
        const clean = value.replace(/\D/g, "").slice(0, 1);
        const next = [...digits];
        next[index] = clean;
        setDigits(next);
        if (clean && index < 5) inputs.current[index + 1]?.focus();
    }

    function handleKey(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const arr = ["", "", "", "", "", ""];
        for (let i = 0; i < text.length; i++) arr[i] = text[i];
        setDigits(arr);
        const lastFilled = Math.min(text.length, 5);
        inputs.current[lastFilled]?.focus();
        if (text.length === 6) void submit(text);
    }

    async function submit(codeOverride?: string) {
        const code = codeOverride ?? digits.join("");
        if (code.length !== 6 || !auth?.currentUser) return;
        setSubmitting(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ purpose, code }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast({ variant: "destructive", title: "Verification failed", description: body.error || "Try again." });
                setDigits(["", "", "", "", "", ""]);
                inputs.current[0]?.focus();
                return;
            }
            toast({ title: isStaff2fa ? "Signed in" : "Email verified", description: isStaff2fa ? "Welcome back." : "Your account is ready." });
            router.push(body.redirect || "/dashboard");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Verification failed", description: err?.message || "Network error." });
        } finally {
            setSubmitting(false);
        }
    }

    if (userLoading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" /></div>;
    }
    if (!user) {
        if (typeof window !== "undefined") router.replace("/login");
        return null;
    }

    const codeComplete = digits.every(d => d.length === 1);

    return (
        <AuthForm
            title={isStaff2fa ? "Sign-in verification" : "Verify your email"}
            description={isStaff2fa
                ? "Privileged accounts require a second factor. Enter the code we just sent to your registered email."
                : "Enter the 6-digit code we sent to your inbox to activate your account."
            }
            footerText=""
            footerLinkText=""
        >
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] bg-slate-50 px-5 py-4 rounded-2xl">
                    <Mail className="h-4 w-4 text-[#1F7A5A]" />
                    <span className="truncate">{user.email}</span>
                </div>

                <div className="flex justify-between gap-2 sm:gap-3">
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleDigit(i, e.target.value)}
                            onKeyDown={(e) => handleKey(i, e)}
                            onPaste={handlePaste}
                            disabled={submitting}
                            className={cn(
                                "h-16 w-full text-center text-2xl font-black tracking-tight rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-[#1F7A5A] focus:bg-white outline-none transition-all",
                                d && "border-[#1F7A5A] bg-white"
                            )}
                        />
                    ))}
                </div>

                <Button
                    onClick={() => submit()}
                    disabled={!codeComplete || submitting}
                    className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={requestCode}
                        disabled={cooldown > 0 || resending}
                        className="text-[10px] font-black text-[#1F7A5A] uppercase tracking-widest hover:text-[#0B1F3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        <RefreshCw className={cn("h-3 w-3", resending && "animate-spin")} />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
                    </button>
                </div>
            </div>
        </AuthForm>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#C8A96A]" /></div>}>
            <VerifyInner />
        </Suspense>
    );
}
