"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { ShieldAlert, Loader2 } from "lucide-react";

interface Warning { _id: string; reason: string; note?: string; classTopic: string; courseTitle: string; issuedByName: string; createdAt: string }

/**
 * Student side of live-class warnings: checks every 30 seconds and shows any
 * warning a staff member has given as a full-screen pop-up until the student
 * taps "I understand".
 */
export function ClassWarningAlert() {
    const { user } = useUser();
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [total, setTotal] = useState(0);
    const [acking, setAcking] = useState(false);

    const check = useCallback(async () => {
        try {
            const res = await apiFetch('/api/class-warnings/mine');
            if (!res.ok) return;
            const data = await res.json();
            setWarnings(data.warnings || []); setTotal(data.total || 0);
        } catch { /* try again next round */ }
    }, []);

    useEffect(() => {
        if (!user || (user as any).role !== 'student') return;
        void check();
        const t = setInterval(check, 30_000);
        const onFocus = () => void check();
        window.addEventListener('focus', onFocus);
        return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
    }, [user, check]);

    const w = warnings[0];
    if (!w) return null;

    const ack = async () => {
        setAcking(true);
        try { await apiFetch(`/api/class-warnings/${w._id}/ack`, { method: 'POST' }); } catch { /* ignore */ }
        setWarnings(prev => prev.slice(1)); setAcking(false);
    };

    return (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-amber-500 px-6 py-5 text-white flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest opacity-80">Official warning</p>
                        <p className="text-xl font-black leading-tight">You have been warned in class</p>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-3 text-slate-800">
                    <p className="text-sm text-slate-500">{w.classTopic || w.courseTitle}</p>
                    <p className="text-lg font-black">{w.reason}</p>
                    {w.note && <p className="text-sm bg-amber-50 border-l-4 border-amber-400 px-3 py-2">{w.note}</p>}
                    <p className="text-sm">Please correct this straight away. This warning has been recorded on your file{total > 1 ? ` (${total} warnings so far)` : ''}.</p>
                    <p className="text-xs text-slate-400">From {w.issuedByName} · {new Date(w.createdAt).toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <div className="px-6 pb-6">
                    <button type="button" onClick={() => void ack()} disabled={acking}
                        className="w-full rounded-xl bg-[#0B1F3A] text-white font-black py-3 flex items-center justify-center gap-2 hover:bg-[#13305a]">
                        {acking && <Loader2 className="w-4 h-4 animate-spin" />} I understand
                    </button>
                </div>
            </div>
        </div>
    );
}
