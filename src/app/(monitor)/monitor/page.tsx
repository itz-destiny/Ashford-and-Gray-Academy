"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Radio, Video, AlertTriangle, MonitorPlay, Clock } from "lucide-react";

interface LiveClassItem {
    liveClassId: string;
    topic: string;
    courseTitle: string;
    startTime: string;
    durationMinutes: number;
    zoomJoinUrl?: string;
}

const POLL_MS = 20_000;

export default function MonitorPage() {
    const [classes, setClasses] = useState<LiveClassItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);

    const fetchClasses = useCallback(async () => {
        try {
            const res = await apiFetch('/api/live-monitor/current');
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || 'Could not load live classes.');
                setClasses(null);
                return;
            }
            setError(null);
            setClasses(data.classes || []);
        } catch {
            setError('Could not reach the server. Retrying…');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleJoin = useCallback(async (liveClassId: string) => {
        setJoinError(null);
        setJoiningId(liveClassId);
        try {
            const res = await apiFetch(`/api/live-classes/${liveClassId}/start-url`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.startUrl) {
                setJoinError(data.error || 'Could not get a host link for this class.');
                return;
            }
            window.open(data.startUrl, '_blank', 'noopener,noreferrer');
        } catch {
            setJoinError('Could not reach the server. Try again.');
        } finally {
            setJoiningId(null);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
        const t = setInterval(fetchClasses, POLL_MS);
        return () => clearInterval(t);
    }, [fetchClasses]);

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
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={fetchClasses}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center px-6 py-12 gap-8">
            <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Live Classes</p>
                <p className="text-white/50 text-sm">Pick any class below to join as host/co-host and monitor it.</p>
            </div>

            {joinError && (
                <p className="text-rose-400 text-sm max-w-md text-center">{joinError}</p>
            )}

            {classes && classes.length > 0 ? (
                <div className="w-full max-w-2xl space-y-4">
                    {classes.map((cls) => {
                        const isLive = new Date(cls.startTime).getTime() <= Date.now();
                        return (
                            <div
                                key={cls.liveClassId}
                                className="bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className={`flex items-center gap-2 ${isLive ? 'text-rose-400' : 'text-white/40'}`}>
                                        {isLive ? (
                                            <>
                                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Live Now</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                                                    Starts {new Date(cls.startTime).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-white text-lg font-serif truncate">{cls.topic}</p>
                                    <p className="text-white/50 text-sm font-medium truncate">{cls.courseTitle}</p>
                                </div>
                                <Button
                                    onClick={() => handleJoin(cls.liveClassId)}
                                    disabled={joiningId === cls.liveClassId}
                                    className="h-12 px-6 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-xs uppercase tracking-widest rounded-none shrink-0"
                                >
                                    {joiningId === cls.liveClassId ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Video className="w-4 h-4 mr-2" />
                                    )}
                                    Join
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-8 space-y-2 text-center">
                    <MonitorPlay className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Idle</p>
                    <p className="text-white/70 font-serif text-lg">No classes scheduled right now.</p>
                    <p className="text-white/30 text-xs">This screen checks automatically — no need to refresh.</p>
                </div>
            )}
        </div>
    );
}
