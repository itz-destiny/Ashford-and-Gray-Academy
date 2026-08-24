"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type Props = { roomId: string };

export default function MeetingRoom({ roomId }: Props) {
    const auth = useAuth();
    const { user, loading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [zoomSession, setZoomSession] = useState<{ liveClassId?: string; joinUrl?: string } | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (roomId.startsWith('course-')) {
                    const courseId = roomId.slice('course-'.length);
                    const res = await fetch(`/api/courses/${courseId}/live-classes`);
                    if (res.ok) {
                        const body = await res.json().catch(() => ({}));
                        if (body.success && Array.isArray(body.classes) && body.classes.length > 0) {
                            const cls = body.classes[0];
                            if (cls?.zoomJoinUrl) setZoomSession({ liveClassId: cls._id?.toString?.(), joinUrl: cls.zoomJoinUrl });
                        }
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, [roomId]);

    if (loading) return <Centered><Loader2 className="animate-spin" /></Centered>;
    if (!user || !auth?.currentUser) {
        return (
            <Centered>
                <Notice
                    title={'Sign in required'}
                    message={'Sign in required to join the class.'}
                    onAction={() => router.push('/login')}
                    actionLabel={'Sign in'}
                />
            </Centered>
        );
    }

    if (zoomSession?.joinUrl) {
        const handleJoin = async () => {
            try {
                if (!auth?.currentUser) return window.open(zoomSession.joinUrl, '_blank');
                const idToken = await auth.currentUser.getIdToken();
                await fetch(`/api/live-classes/${zoomSession.liveClassId}/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                }).catch(() => null);
                window.open(zoomSession.joinUrl, '_blank');
            } catch (e) {
                window.open(zoomSession.joinUrl, '_blank');
            }
        };

        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B1F3A] text-white">
                <h2 className="text-2xl font-serif mb-4">This class runs on Zoom</h2>
                <p className="text-slate-300 mb-6">To reduce website load, the live class runs on Zoom. Click below to join.</p>
                <div className="space-x-4">
                    <Button onClick={handleJoin} className="bg-[#C8A96A] text-[#0B1F3A] font-black px-6 py-3">Join Zoom</Button>
                    <Button onClick={() => router.push('/dashboard')} className="bg-white/5 text-white font-black px-6 py-3">Back</Button>
                </div>
            </div>
        );
    }

    return (
        <Centered>
            <Notice
                title={'No Zoom class scheduled'}
                message={'There is no Zoom session scheduled for this room. Please check the course timetable or contact the instructor.'}
                onAction={() => router.push('/dashboard')}
                actionLabel={'Back'}
            />
        </Centered>
    );
}

function Centered({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B1F3A] text-white">
            {children}
        </div>
    );
}

function Notice({
    title,
    message,
    onAction,
    actionLabel,
}: {
    title: string;
    message: string;
    onAction: () => void;
    actionLabel: string;
}) {
    return (
        <div className="max-w-md text-center space-y-6 px-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-serif">{title}</h2>
            <p className="text-slate-400">{message}</p>
            <Button
                onClick={onAction}
                className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-full h-12 px-10"
            >
                {actionLabel}
            </Button>
        </div>
    );
}
