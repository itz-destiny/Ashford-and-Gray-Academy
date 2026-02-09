"use client";

import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, X } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useSearchParams } from 'next/navigation';

interface JitsiMeetingProps {
    roomId: string;
}

export default function JitsiMeetingWrapper({ roomId }: JitsiMeetingProps) {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(true);

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
                    console.log("JitsiMeeting: Token fetched successfully");
                    setJwt(data.token);
                } else {
                    console.error("JitsiMeeting: Failed to fetch token, status:", res.status);
                }
            } catch (error) {
                console.error("JitsiMeeting: Error during token fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchToken();
    }, [roomId]);

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
                        'security'
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
        </div>
    );
}
