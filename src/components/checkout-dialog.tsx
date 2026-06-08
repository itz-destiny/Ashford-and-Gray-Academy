"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Clock3, ArrowRight, Lock } from "lucide-react";
import type { Course } from "@/lib/types";
import { STATIC_COURSES } from "@/lib/courses-data";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, ApiAuthError } from "@/lib/api-client";

/**
 * Enrolment checkout. Opens when the URL carries `?dialog=<courseId>` — the
 * destination every "Apply" / "Submit Candidacy" button (and the post-login
 * redirect) funnels into. It resolves the course, then:
 *   - signed-out users are sent to sign up and bounced straight back here;
 *   - paid courses call /api/payments/initialize and redirect to Paystack;
 *   - free courses enrol directly via /api/enrollments.
 */
export function CheckoutDialog({ courses }: { courses: Course[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);

    const dialogId = searchParams.get("dialog");
    const course = useMemo(() => {
        if (!dialogId) return null;
        return (
            courses.find((c) => c.id === dialogId) ||
            STATIC_COURSES.find((c) => c.id === dialogId) ||
            null
        );
    }, [dialogId, courses]);

    const open = !!dialogId && !!course;
    const price = course?.price ?? 0;
    const isFree = price <= 0;
    const isSignedOut = !userLoading && !user;

    const priceLabel = useMemo(() => {
        if (!course) return "";
        if (isFree) return "Free";
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: course.currency || "NGN",
            maximumFractionDigits: 0,
        }).format(price);
    }, [course, price, isFree]);

    function close() {
        if (processing) return;
        // Drop the ?dialog= param without adding a history entry.
        router.replace(pathname, { scroll: false });
    }

    function goSignUp() {
        if (!course) return;
        const back = `${pathname}?dialog=${course.id}`;
        router.push(`/login?view=signup&redirectUrl=${encodeURIComponent(back)}`);
    }

    async function proceed() {
        if (!course) return;
        if (isSignedOut) {
            goSignUp();
            return;
        }

        setProcessing(true);
        try {
            if (!isFree) {
                const res = await apiFetch("/api/payments/initialize", {
                    method: "POST",
                    body: JSON.stringify({ courseId: course.id }),
                });
                const body = await res.json().catch(() => ({} as any));

                if (res.status === 409) {
                    toast({ title: "Already enrolled", description: "You're already enrolled in this programme." });
                    router.push(`/my-courses/${course.id}`);
                    return;
                }
                if (!res.ok || !body.authorizationUrl) {
                    toast({
                        variant: "destructive",
                        title: "Could not start payment",
                        description: body.error || "Please try again in a moment.",
                    });
                    setProcessing(false);
                    return;
                }
                // Hand off to Paystack's hosted checkout.
                window.location.href = body.authorizationUrl;
                return;
            }

            // Free programme — enrol directly.
            const res = await apiFetch("/api/enrollments", {
                method: "POST",
                body: JSON.stringify({ courseId: course.id }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as any));
                toast({
                    variant: "destructive",
                    title: "Enrolment failed",
                    description: body.error || "Please try again.",
                });
                setProcessing(false);
                return;
            }
            toast({ title: "You're enrolled", description: `Welcome to ${course.title}.` });
            router.push(`/my-courses/${course.id}`);
        } catch (err) {
            if (err instanceof ApiAuthError) {
                goSignUp();
                return;
            }
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: err instanceof Error ? err.message : "Please try again.",
            });
            setProcessing(false);
        }
    }

    if (!course) return null;

    const ctaLabel = isSignedOut
        ? "Sign in to enrol"
        : isFree
            ? "Enrol now"
            : "Proceed to secure payment";

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-none border border-slate-200 gap-0">
                <div className="relative h-40 bg-[#0B1F3A]">
                    <Image src={course.imageUrl} alt={course.title} fill sizes="512px" className="object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/40 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                        <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.35em]">{course.category}</span>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="text-2xl font-serif text-[#0B1F3A] leading-tight">{course.title}</DialogTitle>
                        <DialogDescription className="sr-only">Enrolment checkout for {course.title}</DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-[#0B1F3A]/60">
                        <span className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-[#C8A96A]" /> {course.duration} Weeks</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#1F7A5A]" /> {course.level}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Tuition</p>
                        <p className="text-3xl font-serif text-[#0B1F3A]">{priceLabel}</p>
                    </div>

                    <Button
                        onClick={proceed}
                        disabled={processing}
                        className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] border-none shadow-none transition-colors"
                    >
                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{ctaLabel} <ArrowRight className="ml-3 h-4 w-4" /></>}
                    </Button>

                    <p className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 font-medium">
                        <Lock className="w-3 h-3" />
                        {isFree
                            ? "Instant access to your course dashboard."
                            : "Secure payment by Paystack — you'll be redirected to complete enrolment."}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
