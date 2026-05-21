"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useUser } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Loader2, Play, Clock, FileVideo, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Recording = {
    _id: string;
    egressId: string;
    status: 'starting' | 'active' | 'ending' | 'complete' | 'failed' | 'aborted';
    startedAt: string;
    endedAt?: string;
    durationSec?: number;
    fileSize?: number;
    hasFile: boolean;
    error?: string;
};

const STATUS_TINTS: Record<string, { bg: string; text: string; label: string }> = {
    complete: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Ready" },
    active: { bg: "bg-rose-50", text: "text-rose-700", label: "Recording" },
    starting: { bg: "bg-amber-50", text: "text-amber-700", label: "Starting" },
    ending: { bg: "bg-amber-50", text: "text-amber-700", label: "Processing" },
    failed: { bg: "bg-rose-100", text: "text-rose-700", label: "Failed" },
    aborted: { bg: "bg-slate-100", text: "text-slate-600", label: "Aborted" },
};

export function RecordingsList({ courseId }: { courseId: string }) {
    const { user, loading: userLoading } = useUser();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);
    const [playLoadingId, setPlayLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (userLoading || !user) return;
        const load = async () => {
            try {
                const res = await apiFetch(`/api/recordings?courseId=${courseId}`);
                if (!res.ok) {
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setRecordings(data.recordings || []);
            } catch (err) {
                console.error('recordings fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
        // Re-poll every 30s — picks up active → complete transitions without manual refresh.
        const iv = setInterval(load, 30_000);
        return () => clearInterval(iv);
    }, [courseId, user, userLoading]);

    const handlePlay = async (rec: Recording) => {
        if (!rec.hasFile) return;
        setPlayLoadingId(rec._id);
        try {
            const res = await apiFetch(`/api/recordings/${rec._id}/playback`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `HTTP ${res.status}`);
            }
            const { url } = await res.json();
            setPlaying({ id: rec._id, url });
        } catch (err) {
            console.error('playback url failed:', err);
        } finally {
            setPlayLoadingId(null);
        }
    };

    return (
        <Card className="border-none bg-white rounded-[2.5rem] shadow-sm">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg font-black text-[#0B1F3A] flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#1F7A5A]" />
                    Class Recordings
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                ) : recordings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold italic">
                        <FileVideo className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                        No recordings yet. They appear here a few minutes after each live class ends.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recordings.map(rec => {
                            const tint = STATUS_TINTS[rec.status] || STATUS_TINTS.failed;
                            return (
                                <div key={rec._id} className="border border-slate-100 rounded-2xl p-5">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0B1F3A] shrink-0">
                                                <Video className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-[#0B1F3A] truncate">
                                                    {new Date(rec.startedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                                    {rec.durationSec && (
                                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDuration(rec.durationSec)}</span>
                                                    )}
                                                    {rec.fileSize && (
                                                        <span>{formatBytes(rec.fileSize)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5", tint.bg, tint.text)}>
                                                {tint.label}
                                            </Badge>
                                            {rec.hasFile && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePlay(rec)}
                                                    disabled={playLoadingId === rec._id}
                                                    className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl h-9 px-4 gap-2"
                                                >
                                                    {playLoadingId === rec._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                    Watch
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {rec.error && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 font-medium">
                                            <AlertTriangle className="w-3 h-3" />
                                            {rec.error}
                                        </div>
                                    )}
                                    {playing?.id === rec._id && playing.url && (
                                        <div className="mt-4">
                                            <video
                                                src={playing.url}
                                                controls
                                                autoPlay
                                                className="w-full rounded-xl bg-black aspect-video"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function formatBytes(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
    return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
