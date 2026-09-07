"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface ClassInfo {
    topic: string;
    courseTitle: string;
    startTime: string;
    alreadyCheckedIn: boolean;
}

// Meant to be pasted into the Zoom meeting's in-call chat by the instructor —
// students already on the call open it on their own phone, sign in if
// needed, and tap once to record their attendance.
export default function AttendPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: userLoading } = useUser();

    const [info, setInfo] = useState<ClassInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.replace(`/login?redirectUrl=${encodeURIComponent(pathname)}`);
            return;
        }
        apiFetch(`/api/live-classes/${id}/attendance`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Could not load this class.');
                setInfo(data);
                setConfirmed(!!data.alreadyCheckedIn);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, user, userLoading, router, pathname]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const res = await apiFetch(`/api/live-classes/${id}/attendance`, { method: 'POST' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Could not record your attendance.');
            }
            setConfirmed(true);
        } catch (err: any) {
            setError(err.message || 'Could not record your attendance.');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] px-6">
            <div className="w-full max-w-sm bg-white p-8 text-center space-y-6">
                {loading || userLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#0B1F3A] mx-auto" />
                ) : error ? (
                    <>
                        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                        <p className="text-slate-600 font-medium">{error}</p>
                    </>
                ) : confirmed ? (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <div>
                            <p className="font-serif text-xl text-[#0B1F3A]">You're marked present</p>
                            <p className="text-sm text-slate-500 mt-1">{info?.topic}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Attendance Check-In</p>
                        <div>
                            <p className="font-serif text-xl text-[#0B1F3A]">{info?.topic}</p>
                            <p className="text-sm text-slate-500 mt-1">{info?.courseTitle}</p>
                        </div>
                        <Button
                            onClick={handleConfirm}
                            disabled={confirming}
                            className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none"
                        >
                            {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm My Attendance"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
