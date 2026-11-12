"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Loader2, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Two ways to land here:
//   /live-classes/{liveClassId}     — Join links
//   /live-classes/course-{courseId} — legacy link format baked into
//     already-sent class-reminder emails (see api/cron/class-reminders);
//     resolves to that course's current live class.
async function resolveLiveClassId(roomId: string): Promise<string | null> {
    if (!roomId.startsWith('course-')) return roomId;
    const courseId = roomId.slice('course-'.length);
    try {
        const res = await apiFetch(`/api/courses/${courseId}/live-classes`);
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const cls = body?.success && Array.isArray(body.classes) ? body.classes[0] : null;
        return cls?._id ? String(cls._id) : null;
    } catch {
        return null;
    }
}

// Opens the class straight in Zoom (the Zoom app, or zoom.us in the browser),
// exactly like joining from the Zoom link. There is no in-website meeting
// room any more: it had to download ~15 MB of Zoom software first, which
// took minutes on mobile data.
export default function LiveClassRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();

    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.replace(`/login?redirectUrl=${encodeURIComponent(`/live-classes/${roomId}`)}`);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const liveClassId = await resolveLiveClassId(String(roomId));
                if (!liveClassId) throw new Error('There is no live class here right now. Check the timetable or contact your instructor.');
                const res = await apiFetch(`/api/live-classes/${liveClassId}/join-link`);
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.url) throw new Error(data.error || 'Could not open this class.');
                if (cancelled) return;
                setUrl(data.url);
                window.location.href = data.url;
            } catch (err: any) {
                if (!cancelled) setError(err?.message || 'Could not open this class.');
            }
        })();
        return () => { cancelled = true; };
    }, [roomId, user, userLoading, router]);

    const back = () => {
        const role = (user as any)?.role;
        router.push(role === 'instructor' ? '/instructor/schedule' : role === 'admin' ? '/admin' : role === 'live_monitor' ? '/monitor' : '/schedule');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#0B1F3A] text-white px-6 text-center">
            {error ? (
                <>
                    <AlertTriangle className="h-10 w-10 text-rose-400" />
                    <p className="font-serif text-lg max-w-md">{error}</p>
                    <Button variant="outline" className="mt-2 border-white/30 text-white hover:bg-white/10 gap-2" onClick={back}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </>
            ) : (
                <>
                    <Loader2 className="h-10 w-10 animate-spin text-[#C8A96A]" />
                    <p className="font-serif text-lg">Opening your class in Zoom…</p>
                    {url && (
                        <>
                            <p className="text-sm text-white/60 max-w-xs">If Zoom didn&apos;t open, tap the button below.</p>
                            <Button asChild className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black gap-2">
                                <a href={url}><ExternalLink className="h-4 w-4" /> Open Zoom</a>
                            </Button>
                            <button onClick={back} className="text-xs text-white/50 underline mt-2">Back to my schedule</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
