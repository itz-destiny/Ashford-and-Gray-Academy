
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    CheckCircle2, XCircle, ExternalLink, RefreshCw,
    CreditCard, Loader2, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

type PendingPayment = {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    courseId: string;
    courseName: string;
    amount: number;
    currency: string;
    proofUrl: string | null;
    submittedAt: string;
};

export default function AdminPaymentsPage() {
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const [pending, setPending] = useState<PendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<Record<string, 'approve' | 'reject' | null>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchPending = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await apiFetch('/api/payments/manual/pending');
            if (res.ok) {
                const data = await res.json();
                setPending(data.pending || []);
            }
        } catch (err) {
            console.error('Failed to fetch pending payments:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!userLoading && user) fetchPending();
    }, [user, userLoading, fetchPending]);

    async function handleAction(transactionId: string, action: 'approve' | 'reject') {
        setProcessing(prev => ({ ...prev, [transactionId]: action }));
        try {
            const res = await apiFetch('/api/payments/manual/approve', {
                method: 'POST',
                body: JSON.stringify({ transactionId, action }),
            });
            const data = await res.json();
            if (res.ok) {
                toast({
                    title: action === 'approve' ? 'Payment approved' : 'Payment rejected',
                    description: action === 'approve'
                        ? 'The student has been enrolled and notified.'
                        : 'The payment request has been rejected.',
                });
                setPending(prev => prev.filter(p => p.id !== transactionId));
            } else {
                toast({ variant: 'destructive', title: 'Action failed', description: data.error || 'Please try again.' });
            }
        } catch (err) {
            toast({ variant: 'destructive', title: 'Network error', description: 'Could not process the action.' });
        } finally {
            setProcessing(prev => ({ ...prev, [transactionId]: null }));
        }
    }

    const safeDate = (d: string) => {
        const p = new Date(d);
        return Number.isNaN(p.getTime()) ? null : p;
    };

    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] bg-[#FAF9F6]">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Payment Approvals</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">
                        Manual Payments
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">
                        Review bank transfer proofs and approve or reject student enrolment requests.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className={cn(
                        "px-5 py-2 rounded-none font-black text-[10px] uppercase tracking-widest border-none",
                        pending.length > 0 ? "bg-[#C8A96A] text-[#0B1F3A]" : "bg-[#1F7A5A] text-white"
                    )}>
                        {pending.length} Pending
                    </Badge>
                    <Button
                        variant="outline"
                        onClick={fetchPending}
                        disabled={loading}
                        className="h-12 px-6 rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Proof Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 bg-[#0B1F3A]/90 flex items-center justify-center p-6 cursor-pointer"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div className="max-w-3xl w-full max-h-[80vh] overflow-auto bg-white border-t-4 border-t-[#C8A96A]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[#0B1F3A]/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A]">Proof of Payment</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-none hover:bg-[#F6F4F2]"
                                onClick={() => setPreviewUrl(null)}
                            >
                                <XCircle className="w-5 h-5 text-[#0B1F3A]" />
                            </Button>
                        </div>
                        <div className="p-6">
                            <img src={previewUrl} alt="Proof of payment" className="w-full h-auto object-contain" />
                        </div>
                    </div>
                </div>
            )}

            {/* Pending List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200/50 animate-pulse rounded-none border border-[#0B1F3A]/5" />
                    ))}
                </div>
            ) : pending.length > 0 ? (
                <div className="space-y-4">
                    {pending.map((payment) => {
                        const submitted = safeDate(payment.submittedAt);
                        const isProcessing = !!processing[payment.id];

                        return (
                            <div key={payment.id} className="bg-white border border-[#0B1F3A]/10 shadow-sm border-l-4 border-l-[#C8A96A]">
                                {/* Main row */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8">
                                    {/* Student info */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="font-black text-[#0B1F3A] text-base">{payment.userName}</p>
                                        <p className="text-xs text-slate-400 font-medium">{payment.userEmail}</p>
                                    </div>

                                    {/* Course */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Programme</p>
                                        <p className="font-black text-[#0B1F3A] text-sm truncate">{payment.courseName}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex-shrink-0 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                        <p className="font-black text-[#1F7A5A] text-lg">
                                            {(payment.currency || 'NGN')} {payment.amount.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <div className="flex-shrink-0 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted</p>
                                        <p className="text-[10px] font-black text-[#0B1F3A]">
                                            {submitted ? format(submitted, 'MMM dd, yyyy · HH:mm') : '—'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {payment.proofUrl && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setPreviewUrl(payment.proofUrl)}
                                                className="h-11 px-4 rounded-none border-[#0B1F3A]/10 hover:border-[#C8A96A] font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] bg-white shadow-none"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2 text-[#C8A96A]" />
                                                View Proof
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleAction(payment.id, 'reject')}
                                            disabled={isProcessing}
                                            variant="outline"
                                            className="h-11 px-5 rounded-none border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest bg-white shadow-none"
                                        >
                                            {processing[payment.id] === 'reject' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><XCircle className="w-4 h-4 mr-2" /> Reject</>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(payment.id, 'approve')}
                                            disabled={isProcessing}
                                            className="h-11 px-5 rounded-none bg-[#1F7A5A] hover:bg-[#1a6b4e] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none"
                                        >
                                            {processing[payment.id] === 'approve' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] shadow-sm">
                    <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif text-[#0B1F3A] mb-3">All clear</h3>
                    <p className="text-slate-400 font-medium italic font-serif">No pending manual payment approvals.</p>
                </div>
            )}
        </div>
    );
}
