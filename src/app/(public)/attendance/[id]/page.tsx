"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface ClassInfo {
    topic: string;
    courseTitle: string;
    startTime: string;
}

// A public, no-login attendance sign-in — meant to be shared as a link (or
// QR code) for students already on the call to open on their own phone.
// They type the email their account uses and tap once; no dashboard
// sign-in required.
export default function PublicAttendancePage() {
    const { id } = useParams<{ id: string }>();

    const [info, setInfo] = useState<ClassInfo | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmedName, setConfirmedName] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/live-classes/${id}/attendance/public`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Could not load this class.');
                setInfo(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch(`/api/live-classes/${id}/attendance/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Could not record your attendance.');
            setConfirmedName(data.name || null);
        } catch (err: any) {
            setError(err.message || 'Could not record your attendance.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] px-6">
            <div className="w-full max-w-sm bg-white p-8 text-center space-y-6">
                {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
                ) : confirmedName ? (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <div>
                            <p className="font-serif text-xl text-[#0B1F3A]">You're marked present, {confirmedName.split(' ')[0]}</p>
                            <p className="text-sm text-slate-500 mt-1">{info?.topic}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Attendance Check-In</p>
                        {info && (
                            <div>
                                <p className="font-serif text-xl text-[#0B1F3A]">{info.topic}</p>
                                <p className="text-sm text-slate-500 mt-1">{info.courseTitle}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                required
                                placeholder="you@ashfordandgrayfusionacademy.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-none text-center"
                            />
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-rose-600 text-sm">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Attendance"}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
