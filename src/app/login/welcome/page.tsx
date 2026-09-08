"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithToken } from "@/firebase/auth";
import { AuthForm } from "../auth-form";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

// Landing page for a welcome email's "Access My Dashboard" link — exchanges
// the one-time token for a real sign-in, so a new user never has to type an
// email + temporary password. On success, LoginForm's own role-based
// redirect (triggered by the now-signed-in auth state) takes it from there,
// and ForcePasswordChangeModal picks up immediately after.
function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"working" | "error">("working");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setError("This link is missing its login token.");
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/auth/magic-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    throw new Error(data.error || "This link is no longer valid.");
                }
                const { error: signInError } = await signInWithToken(data.customToken);
                if (signInError) throw new Error(signInError);
                if (!cancelled) router.replace("/login");
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "This link is no longer valid.");
                    setStatus("error");
                }
            }
        })();

        return () => { cancelled = true; };
    }, [token, router]);

    if (status === "error") {
        return (
            <AuthForm
                title="Link Expired"
                description="This sign-in link is no longer valid — it may have already been used, or your password has already been set."
                showGoogleSignIn={false}
            >
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 h-12 px-6 bg-[#0B1F3A] text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#1F7A5A] transition-colors"
                >
                    Go to Sign In <ArrowRight className="h-4 w-4" />
                </Link>
            </AuthForm>
        );
    }

    return (
        <AuthForm title="Signing You In" description="Just a moment while we open your dashboard." showGoogleSignIn={false}>
            <div className="flex items-center gap-3 text-slate-500 font-medium">
                <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
                Verifying your link…
            </div>
        </AuthForm>
    );
}

export default function WelcomePage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh] text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">
                    Loading
                </div>
            }
        >
            <WelcomeContent />
        </Suspense>
    );
}
