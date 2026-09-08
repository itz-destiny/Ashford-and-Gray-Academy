"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Radio, Video, AlertTriangle } from "lucide-react";

interface CurrentClass {
    liveClassId: string;
    topic: string;
    courseTitle: string;
    startTime: string;
    durationMinutes: number;
    zoomJoinUrl?: string;
}

interface MonitorStatus {
    slotNumber: number;
    totalSlots: number;
    current: CurrentClass | null;
}

const POLL_MS = 20_000;

export default function MonitorPage() {
    const [status, setStatus] = useState<MonitorStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await apiFetch('/api/live-monitor/current');
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || 'Could not load your monitor status.');
                setStatus(null);
                return;
            }
            setError(null);
            setStatus(data);
        } catch {
            setError('Could not reach the server. Retrying…');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const t = setInterval(fetchStatus, POLL_MS);
        return () => clearInterval(t);
    }, [fetchStatus]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#C8A96A]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <AlertTriangle className="w-10 h-10 text-rose-400" />
                <p className="text-white font-serif text-lg max-w-sm">{error}</p>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={fetchStatus}>
                    Try Again
                </Button>
            </div>
        );
    }

    const current = status?.current;

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10 text-center">
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Assigned Monitor Slot</p>
                <p className="text-6xl font-serif text-white">
                    {status?.slotNumber}<span className="text-white/30 text-3xl"> / {status?.totalSlots}</span>
                </p>
            </div>

            {current ? (
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] p-8 space-y-6">
                    <div className="flex items-center justify-center gap-2 text-rose-400">
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Now</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white text-xl font-serif">{current.topic}</p>
                        <p className="text-white/50 text-sm font-medium">{current.courseTitle}</p>
                    </div>
                    <Button
                        onClick={() => current.zoomJoinUrl && window.open(current.zoomJoinUrl, '_blank', 'noopener,noreferrer')}
                        disabled={!current.zoomJoinUrl}
                        className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-xs uppercase tracking-widest rounded-none"
                    >
                        <Video className="w-4 h-4 mr-2" /> Join Class
                    </Button>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-8 space-y-2">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Idle</p>
                    <p className="text-white/70 font-serif text-lg">Nothing is live in this slot right now.</p>
                    <p className="text-white/30 text-xs">This screen checks automatically — no need to refresh.</p>
                </div>
            )}
        </div>
    );
}
