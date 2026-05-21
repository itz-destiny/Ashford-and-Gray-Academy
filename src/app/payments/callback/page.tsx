"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiAuthError } from "@/lib/api-client";

type State =
    | { kind: "verifying" }
    | { kind: "success"; courseId?: string }
    | { kind: "failed"; message: string };

function CallbackInner() {
    const router = useRouter();
    const params = useSearchParams();
    const reference = params.get("reference") || params.get("trxref");
    const [state, setState] = useState<State>({ kind: "verifying" });

    useEffect(() => {
        if (!reference) {
            setState({ kind: "failed", message: "Missing payment reference." });
            return;
        }
        let cancelled = false;

        (async () => {
            try {
                const res = await apiFetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`);
                const body = await res.json();
                if (cancelled) return;
                if (!res.ok) {
                    setState({ kind: "failed", message: body.error || `HTTP ${res.status}` });
                    return;
                }
                if (body.status === "success") {
                    setState({ kind: "success", courseId: body.courseId });
                } else {
                    setState({
                        kind: "failed",
                        message: body.message || "Payment was not completed.",
                    });
                }
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiAuthError) {
                    router.replace(`/login?redirectUrl=/payments/callback?reference=${reference}`);
                    return;
                }
                const message = err instanceof Error ? err.message : "Verification failed.";
                setState({ kind: "failed", message });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reference, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] text-white p-6">
            <div className="max-w-md w-full text-center space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem]">
                {state.kind === "verifying" && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-[#C8A96A] mx-auto" />
                        <h1 className="font-serif text-3xl">Confirming your payment…</h1>
                        <p className="text-slate-400 text-sm">
                            This usually takes a few seconds. Please do not close this tab.
                        </p>
                    </>
                )}

                {state.kind === "success" && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h1 className="font-serif text-3xl">Payment confirmed.</h1>
                        <p className="text-slate-400">
                            Welcome to the Academy. Your enrollment is now active.
                        </p>
                        <Button
                            onClick={() =>
                                router.push(state.courseId ? `/my-courses/${state.courseId}` : "/my-courses")
                            }
                            className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-full h-12 px-10"
                        >
                            Open your course
                        </Button>
                    </>
                )}

                {state.kind === "failed" && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h1 className="font-serif text-3xl">Payment not completed.</h1>
                        <p className="text-slate-400 text-sm">{state.message}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Button
                                onClick={() => router.push("/courses")}
                                className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-full h-12 px-10"
                            >
                                Browse courses
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard")}
                                className="border-white/20 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] rounded-full h-12 px-10 bg-transparent"
                            >
                                Go to dashboard
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#C8A96A]" />
                </div>
            }
        >
            <CallbackInner />
        </Suspense>
    );
}
