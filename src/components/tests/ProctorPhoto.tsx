"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Exam photos are served only to signed-in staff, so a plain <img src>
// can't load them — fetch with the auth header and show an object URL.
export function ProctorPhoto({ snapshotId, alt, className }: { snapshotId: string | null | undefined; alt: string; className?: string }) {
    const [url, setUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!snapshotId) return;
        let objectUrl: string | null = null;
        let cancelled = false;
        setFailed(false);
        apiFetch(`/api/proctor-snapshots/${snapshotId}`)
            .then(async res => {
                if (!res.ok) throw new Error();
                objectUrl = URL.createObjectURL(await res.blob());
                if (!cancelled) setUrl(objectUrl);
            })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [snapshotId]);

    if (!snapshotId || failed) {
        return (
            <div className={cn("bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold gap-1", className)}>
                <CameraOff className="w-5 h-5" />
                No photo
            </div>
        );
    }
    if (!url) {
        return <div className={cn("bg-slate-100 flex items-center justify-center", className)}><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className={cn("object-cover", className)} />;
}
