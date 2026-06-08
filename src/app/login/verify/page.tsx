"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
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
    // Where to send the user after verifying — carried from the "Apply" handoff
    // (e.g. /courses?dialog=<id>) so they resume checkout instead of dead-ending
    // on the dashboard. Only honour same-origin relative paths.
    const redirectParam = params.get("redirectUrl");
    const safeRedirect = redirectParam && redirectParam.startsWith("/") ? redirectParam : null;
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [requestedAt, setRequestedAt] = useState<number | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const isStaff2fa = purpose === "login_2fa";

    useEffect(() => {
        if (userLoading || !user || requestedAt) return;
        void requestCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userLoading]);

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
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
            router.push(safeRedirect || body.redirect || "/dashboard");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Verification failed", description: err?.message || "Network error." });
        } finally {
            setSubmitting(false);
        }
    }

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-6 h-6 animate-spin text-[#C8A96A]" />
            </div>
        );
    }
    if (!user) {
        if (typeof window !== "undefined") router.replace("/login");
        return null;
    }

    const codeComplete = digits.every((d) => d.length === 1);

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[1px] bg-[#C8A96A]" />
                <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">
                    {isStaff2fa ? "Two-Factor Authentication" : "Email Verification"}
                </span>
            </div>

            <div className="space-y-3 mb-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-[1.1]">
                    {isStaff2fa ? "Sign-in verification" : "Verify your email"}
                </h2>
                <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md">
                    {isStaff2fa
                        ? "Privileged accounts require a second factor. Enter the code we just sent to your registered email."
                        : "Enter the 6-digit code we sent to your inbox to activate your account."}
                </p>
            </div>

            <div className="space-y-7">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A] bg-slate-50 px-5 py-4 border border-slate-200">
                    <Mail className="h-4 w-4 text-[#1F7A5A]" />
                    <span className="truncate normal-case tracking-normal font-medium text-slate-600">{user.email}</span>
                </div>

                <div className="flex justify-between gap-2 sm:gap-3">
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                inputs.current[i] = el;
                            }}
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
                                "h-14 w-full text-center text-2xl font-black tracking-tight rounded-none bg-white border border-slate-200 focus:border-[#0B1F3A] focus:ring-0 outline-none transition-colors text-[#0B1F3A]",
                                d && "border-[#C8A96A]"
                            )}
                        />
                    ))}
                </div>

                <Button
                    onClick={() => submit()}
                    disabled={!codeComplete || submitting}
                    className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify <ArrowRight className="ml-3 h-4 w-4" /></>}
                </Button>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={requestCode}
                        disabled={cooldown > 0 || resending}
                        className="text-[10px] font-black text-[#0B1F3A] uppercase tracking-[0.3em] hover:text-[#C8A96A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 border-b border-[#C8A96A] pb-0.5"
                    >
                        <RefreshCw className={cn("h-3 w-3", resending && "animate-spin")} />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C8A96A]" />
                </div>
            }
        >
            <VerifyInner />
        </Suspense>
    );
}
