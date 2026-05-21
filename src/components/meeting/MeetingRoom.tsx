"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2, AlertCircle, Shield, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type Props = { roomId: string };

type TokenResponse = {
    token: string;
    wsUrl: string;
    identity: string;
    role: 'instructor' | 'student' | 'admin';
};

type TokenState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; data: TokenResponse }
    | { status: 'error'; message: string };

async function fetchAccessToken(idToken: string, room: string): Promise<TokenResponse> {
    const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ room }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to join class (HTTP ${res.status})`);
    }
    return res.json();
}

export default function MeetingRoom({ roomId }: Props) {
    const auth = useAuth();
    const { user, loading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [state, setState] = useState<TokenState>({ status: 'idle' });
    const [recordingState, setRecordingState] = useState<'idle' | 'starting' | 'active' | 'stopping'>('idle');
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const canRecord = state.status === 'ready' &&
        (state.data.role === 'instructor' || state.data.role === 'admin') &&
        roomId.startsWith('course-');

    useEffect(() => {
        if (loading) return;
        if (!user || !auth?.currentUser) {
            setState({ status: 'error', message: 'Sign in required to join the class.' });
            return;
        }

        let cancelled = false;
        setState({ status: 'loading' });

        (async () => {
            try {
                const idToken = await auth.currentUser!.getIdToken();
                const data = await fetchAccessToken(idToken, roomId);
                if (!cancelled) setState({ status: 'ready', data });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Unknown error.';
                    setState({ status: 'error', message });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [auth, user, loading, roomId]);

    if (state.status === 'loading' || state.status === 'idle' || loading) {
        return (
            <Centered>
                <Loader2 className="w-10 h-10 animate-spin text-[#C8A96A]" />
                <p className="text-slate-300 mt-6 text-[10px] font-black uppercase tracking-[0.3em]">
                    Securing the Hall
                </p>
            </Centered>
        );
    }

    const startRecording = async () => {
        if (!auth?.currentUser) return;
        setRecordingState('starting');
        try {
            const idToken = await auth.currentUser.getIdToken();
            const res = await fetch('/api/livekit/recording/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ room: roomId }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
            setRecordingId(body.recordingId || body.egressId);
            setRecordingState('active');
            toast({ title: 'Recording started', description: 'This session is now being recorded.' });
        } catch (err: any) {
            setRecordingState('idle');
            toast({ variant: 'destructive', title: 'Could not start recording', description: err?.message || 'Try again.' });
        }
    };

    const stopRecording = async () => {
        if (!auth?.currentUser) return;
        setRecordingState('stopping');
        try {
            const idToken = await auth.currentUser.getIdToken();
            const res = await fetch('/api/livekit/recording/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ room: roomId }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
            setRecordingState('idle');
            setRecordingId(null);
            toast({ title: 'Recording saved', description: 'Processing will finish shortly; the file will appear on the course page.' });
        } catch (err: any) {
            setRecordingState('active');
            toast({ variant: 'destructive', title: 'Could not stop recording', description: err?.message || 'Try again.' });
        }
    };

    if (state.status === 'error') {
        const needsSignIn = state.message.toLowerCase().includes('sign in');
        return (
            <Centered>
                <Notice
                    title={needsSignIn ? 'Sign in required' : 'Unable to join class'}
                    message={state.message}
                    onAction={() => router.push(needsSignIn ? '/login' : '/')}
                    actionLabel={needsSignIn ? 'Sign in' : 'Go home'}
                />
            </Centered>
        );
    }

    return (
        <div className="h-screen w-full bg-[#0B1F3A] flex flex-col font-sans">
            <header className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#C8A96A]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-serif text-white tracking-tight">
                            Ashford &amp; Gray Academy
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                Live Class · {state.data.role}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {canRecord && (
                        recordingState === 'idle' ? (
                            <Button
                                onClick={startRecording}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full h-10 px-5 gap-2"
                            >
                                <Circle className="w-3 h-3 fill-current" /> Record
                            </Button>
                        ) : recordingState === 'starting' ? (
                            <Button disabled className="bg-rose-600/60 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full h-10 px-5 gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Starting…
                            </Button>
                        ) : recordingState === 'active' ? (
                            <Button
                                onClick={stopRecording}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full h-10 px-5 gap-2"
                            >
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                                </span>
                                Stop
                            </Button>
                        ) : (
                            <Button disabled className="bg-rose-600/60 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full h-10 px-5 gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                            </Button>
                        )
                    )}
                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                        Room · {roomId}
                    </span>
                </div>
            </header>

            <div className="flex-1 min-h-0 lk-academy">
                <LiveKitRoom
                    token={state.data.token}
                    serverUrl={state.data.wsUrl}
                    connect
                    video
                    audio
                    onDisconnected={() => router.push('/')}
                    data-lk-theme="default"
                    style={{ height: '100%' }}
                >
                    <VideoConference />
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </div>
        </div>
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
