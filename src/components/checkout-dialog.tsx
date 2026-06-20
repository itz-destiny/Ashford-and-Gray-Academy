"use client";

import { useMemo, useRef, useState } from "react";
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
import {
    Loader2, ShieldCheck, Clock3, ArrowRight, Lock,
    CreditCard, Building2, Upload, CheckCircle2, Copy,
} from "lucide-react";
import type { Course } from "@/lib/types";
import { STATIC_COURSES } from "@/lib/courses-data";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, ApiAuthError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type PaymentMethod = 'card' | 'bank';

const BANK_DETAILS = {
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Ashford & Gray Fusion Academy',
    sortCode: '058',
};

/**
 * Enrolment checkout. Opens when the URL carries `?dialog=<courseId>`.
 * Supports two payment methods:
 *   - Card (Paystack): redirects to Paystack hosted checkout
 *   - Bank Transfer: student uploads proof; admin approves to grant access
 */
export function CheckoutDialog({ courses }: { courses: Course[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();

    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (processing || uploading) return;
        setPaymentMethod('card');
        setProofFile(null);
        setSubmitted(false);
        router.replace(pathname, { scroll: false });
    }

    function goSignUp() {
        if (!course) return;
        const back = `${pathname}?dialog=${course.id}`;
        router.push(`/login?view=signup&redirectUrl=${encodeURIComponent(back)}`);
    }

    function copyAccountNumber() {
        navigator.clipboard.writeText(BANK_DETAILS.accountNumber).then(() => {
            toast({ title: "Copied", description: "Account number copied to clipboard." });
        });
    }

    async function handleCardPayment() {
        if (!course || isSignedOut) { goSignUp(); return; }

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
                window.location.href = body.authorizationUrl;
                return;
            }

            // Free course
            const res = await apiFetch("/api/enrollments", {
                method: "POST",
                body: JSON.stringify({ courseId: course.id }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as any));
                toast({ variant: "destructive", title: "Enrolment failed", description: body.error || "Please try again." });
                setProcessing(false);
                return;
            }
            toast({ title: "You're enrolled", description: `Welcome to ${course.title}.` });
            router.push(`/my-courses/${course.id}`);
        } catch (err) {
            if (err instanceof ApiAuthError) { goSignUp(); return; }
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: err instanceof Error ? err.message : "Please try again.",
            });
            setProcessing(false);
        }
    }

    async function handleBankTransferSubmit() {
        if (!course || isSignedOut) { goSignUp(); return; }
        if (!proofFile) {
            toast({ variant: "destructive", title: "No proof uploaded", description: "Please upload your payment screenshot." });
            return;
        }

        setUploading(true);
        try {
            // Step 1: Get a signed upload URL
            const signedRes = await apiFetch("/api/storage/signed-url", {
                method: "POST",
                body: JSON.stringify({
                    filename: proofFile.name,
                    contentType: proofFile.type,
                    category: "image",
                }),
            });
            if (!signedRes.ok) {
                const body = await signedRes.json().catch(() => ({} as any));
                toast({ variant: "destructive", title: "Upload failed", description: body.error || "Could not prepare upload." });
                setUploading(false);
                return;
            }
            const { uploadUrl, publicUrl } = await signedRes.json();

            // Step 2: PUT the file to Firebase Storage
            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": proofFile.type },
                body: proofFile,
            });
            if (!putRes.ok) {
                toast({ variant: "destructive", title: "Upload failed", description: "Could not upload your proof. Please try again." });
                setUploading(false);
                return;
            }

            // Step 3: Submit the manual payment record
            const manualRes = await apiFetch("/api/payments/manual", {
                method: "POST",
                body: JSON.stringify({ courseId: course.id, proofUrl: publicUrl }),
            });
            const manualBody = await manualRes.json().catch(() => ({} as any));

            if (manualRes.status === 409) {
                toast({ title: "Already submitted", description: "Your payment proof is already pending review." });
                setSubmitted(true);
                return;
            }
            if (!manualRes.ok) {
                toast({ variant: "destructive", title: "Submission failed", description: manualBody.error || "Please try again." });
                setUploading(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            if (err instanceof ApiAuthError) { goSignUp(); return; }
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setUploading(false);
        }
    }

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-none border border-slate-200 gap-0">
                {/* Course Image Banner */}
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

                    {/* Payment Method Toggle (only for paid courses) */}
                    {!isFree && !submitted && (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-4 border font-black text-[10px] uppercase tracking-widest transition-all",
                                    paymentMethod === 'card'
                                        ? "border-[#0B1F3A] bg-[#0B1F3A] text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-[#0B1F3A]/30"
                                )}
                            >
                                <CreditCard className="w-4 h-4" /> Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod('bank')}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-4 border font-black text-[10px] uppercase tracking-widest transition-all",
                                    paymentMethod === 'bank'
                                        ? "border-[#0B1F3A] bg-[#0B1F3A] text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-[#0B1F3A]/30"
                                )}
                            >
                                <Building2 className="w-4 h-4" /> Bank Transfer
                            </button>
                        </div>
                    )}

                    {/* Submitted confirmation */}
                    {submitted ? (
                        <div className="py-8 text-center space-y-4">
                            <CheckCircle2 className="w-14 h-14 text-[#1F7A5A] mx-auto" />
                            <h3 className="font-serif text-xl text-[#0B1F3A]">Proof submitted</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Your payment proof has been sent for review. An admin will verify and activate your enrolment — usually within 24 hours.
                            </p>
                            <Button
                                onClick={close}
                                className="w-full h-12 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] border-none shadow-none transition-colors"
                            >
                                Done
                            </Button>
                        </div>
                    ) : paymentMethod === 'card' || isFree ? (
                        // Card / Free flow
                        <>
                            <Button
                                onClick={handleCardPayment}
                                disabled={processing}
                                className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] border-none shadow-none transition-colors"
                            >
                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        {isSignedOut ? "Sign in to enrol" : isFree ? "Enrol now" : "Proceed to secure payment"}
                                        <ArrowRight className="ml-3 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <p className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 font-medium">
                                <Lock className="w-3 h-3" />
                                {isFree
                                    ? "Instant access to your course dashboard."
                                    : "Secure payment by Paystack — you'll be redirected to complete enrolment."}
                            </p>
                        </>
                    ) : (
                        // Bank Transfer flow
                        <div className="space-y-5">
                            {/* Bank account details */}
                            <div className="bg-[#F6F4F2] border border-[#0B1F3A]/10 p-6 space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]/60">Transfer To</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank</span>
                                        <span className="font-black text-[#0B1F3A] text-sm">{BANK_DETAILS.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#0B1F3A] text-sm">{BANK_DETAILS.accountNumber}</span>
                                            <button
                                                onClick={copyAccountNumber}
                                                className="text-[#C8A96A] hover:text-[#0B1F3A] transition-colors"
                                                title="Copy account number"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</span>
                                        <span className="font-black text-[#0B1F3A] text-sm">{BANK_DETAILS.accountName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                                        <span className="font-black text-[#1F7A5A] text-base">{priceLabel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Proof upload */}
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]/60 mb-3">Upload Payment Screenshot</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                                        proofFile
                                            ? "border-[#1F7A5A] bg-[#1F7A5A]/5"
                                            : "border-[#0B1F3A]/20 hover:border-[#C8A96A] bg-white"
                                    )}
                                >
                                    {proofFile ? (
                                        <div className="space-y-1">
                                            <CheckCircle2 className="w-8 h-8 text-[#1F7A5A] mx-auto" />
                                            <p className="font-black text-[#0B1F3A] text-sm mt-2">{proofFile.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to change</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                                            <p className="font-black text-[#0B1F3A] text-sm">Click to upload screenshot</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PNG, JPG or WebP · Max 10 MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleBankTransferSubmit}
                                disabled={uploading || !proofFile || isSignedOut}
                                className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] border-none shadow-none transition-colors"
                            >
                                {uploading ? (
                                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading proof…</>
                                ) : isSignedOut ? (
                                    "Sign in to submit"
                                ) : (
                                    <>Submit Payment Proof <ArrowRight className="ml-3 h-4 w-4" /></>
                                )}
                            </Button>

                            <p className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 font-medium">
                                <Lock className="w-3 h-3" />
                                Your proof is reviewed by our team — access granted within 24 hours.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
