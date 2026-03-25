"use client";

import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, X } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useSearchParams } from 'next/navigation';

interface JitsiMeetingProps {
    roomId: string;
}

import { Copy, Video as VideoIcon, Users, BookOpen, Check, Share2 } from 'lucide-react';

export default function JitsiMeetingWrapper({ roomId }: JitsiMeetingProps) {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [resources, setResources] = useState<any[]>([]);

    const [jwt, setJwt] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const conversationId = searchParams.get('conversationId');
    const hostId = searchParams.get('hostId');

    React.useEffect(() => {
        console.log("JitsiMeeting: Initializing with roomId:", roomId);
        console.log("JitsiMeeting: JaaS App ID:", process.env.NEXT_PUBLIC_JAAS_APP_ID);

        const fetchToken = async () => {
            try {
                const res = await fetch('/api/auth/jaas-token');
                if (res.ok) {
                    const data = await res.json();
                    setJwt(data.token);
                }
            } catch (error) {
                console.error("JitsiMeeting: Error during token fetch:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchResources = async () => {
            try {
                const res = await fetch('/api/resources?type=Video');
                if (res.ok) {
                    const data = await res.json();
                    setResources(data);
                }
            } catch (err) {
                console.error("Failed to fetch resources", err);
            }
        };

        fetchToken();
        fetchResources();
    }, [roomId]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/meeting/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReadyToClose = async () => {
        // If we have context, post "Meeting Ended" message
        if (conversationId && hostId && user) {
            try {
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderId: user.uid,
                        conversationId: conversationId,
                        content: `🎥 Video meeting ended.`
                    })
                });
            } catch (error) {
                console.error("Failed to send end meeting message", error);
            }
        }

        // End Telemetry
        if (roomId) {
            try {
                await fetch('/api/communications/meetings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        meetingId: roomId,
                        action: 'end'
                    })
                });
            } catch (error) {
                console.error("Failed to send end meeting telemetry", error);
            }
        }

        router.back();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading user profile...</span>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#0f172a] relative overflow-hidden flex flex-col">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 text-white bg-slate-900/80 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 animate-spin" />
                </div>
            )}

            <JitsiMeeting
                domain="8x8.vc"
                roomName={`${process.env.NEXT_PUBLIC_JAAS_APP_ID}/${roomId}`}
                jwt={jwt || undefined}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableThirdPartyRequests: false,
                    prejoinPageEnabled: false,
                    enableWelcomePage: false,
                }}
                interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    HIDE_DEEP_LINKING_LOGO: true,
                    DEFAULT_BACKGROUND: '#0f172a',
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur', 'help', 'mute-everyone',
                        'security', 'invite', 'sharedvideo', 'participants-pane', 'shareaudio'
                    ],
                }}
                userInfo={{
                    displayName: user.displayName || 'Ashford User',
                    email: user.email || '',
                }}
                onApiReady={(externalApi) => {
                    setLoading(false);
                    externalApi.on('readyToClose', handleReadyToClose);
                    externalApi.on('videoConferenceLeft', handleReadyToClose);

                    // Start Telemetry
                    if (user && roomId) {
                        fetch('/api/communications/meetings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                meetingId: roomId,
                                conversationId: conversationId,
                                action: 'start',
                                participants: [{
                                    uid: user.uid,
                                    displayName: user.displayName || 'User',
                                    role: (user as any).role || 'student'
                                }]
                            })
                        }).catch(err => console.error("Telemetry error", err));
                    }
                }}
                onReadyToClose={handleReadyToClose}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                }}
            />

            {/* Premium Control Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 pointer-events-none">
                <div className="flex items-center gap-2 p-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto shadow-2xl">
                    <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Link Copied' : 'Invite People'}
                    </button>

                    <button
                        onClick={() => setShowResources(!showResources)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            showResources ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Tutorials & Resources
                    </button>
                    
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    
                    <div className="px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-white/70">Meeting Live</span>
                    </div>
                </div>
            </div>

            {/* Resources Modal/Sidebar */}
            {showResources && (
                <div className="absolute inset-y-0 right-0 w-80 bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 z-[60] p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white leading-tight">Tutorials</h3>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Supplemental Media</p>
                        </div>
                        <button onClick={() => setShowResources(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {resources.length > 0 ? resources.map((res: any) => (
                            <div key={res._id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all cursor-pointer">
                                <h4 className="font-bold text-white text-sm mb-1 group-hover:text-indigo-400">{res.title}</h4>
                                <p className="text-xs text-white/50 mb-3">{res.fileHint || 'Video tutorial'}</p>
                                <button 
                                    onClick={() => {
                                        // Instructions for Jitsi's Shared Video feature
                                        const link = res.url;
                                        navigator.clipboard.writeText(link);
                                        alert(`Link copied: ${link}\n\nUse Jitsi's "Share a video" feature from the toolbar and paste this link.`);
                                    }}
                                    className="w-full py-2 bg-white/10 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                                >
                                    Copy Video Link
                                </button>
                            </div>
                        )) : (
                            <div className="py-12 text-center">
                                <VideoIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-sm text-white/30 font-bold italic">No tutorials found for this course bundle.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-12 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                        <p className="text-[10px] text-indigo-400 font-bold mb-2 uppercase">Pro Tip</p>
                        <p className="text-xs text-indigo-100/70 leading-relaxed font-medium">To play these videos for everyone, click the three dots ⋮ in the meeting toolbar, select "Share a video", and paste the link.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
