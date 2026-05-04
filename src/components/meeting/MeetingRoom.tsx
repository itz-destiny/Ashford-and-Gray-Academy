"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useDb } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  getDoc, 
  updateDoc,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    PhoneOff, 
    Settings, 
    Copy, 
    Users, 
    MessageSquare,
    Shield,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function MeetingRoom({ roomId }: { roomId: string }) {
  const db = useDb();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const peerConnection = new RTCPeerConnection(servers);
        pc.current = peerConnection;

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
          console.log("Track received:", event.streams[0]);
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnectionStatus('connected');
        };

        peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') setConnectionStatus('connected');
            if (peerConnection.connectionState === 'disconnected') setConnectionStatus('disconnected');
        };

        // Signaling logic using Firestore
        const roomRef = doc(db, 'meetings', roomId);
        const roomSnapshot = await getDoc(roomRef);

        const offerCandidates = collection(roomRef, 'offerCandidates');
        const answerCandidates = collection(roomRef, 'answerCandidates');

        if (!roomSnapshot.exists() || !roomSnapshot.data()?.offer) {
          // I am the Caller
          console.log("Creating room...");
          
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(offerCandidates, event.candidate.toJSON());
            }
          };

          const offerDescription = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offerDescription);

          await setDoc(roomRef, {
            offer: {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            },
            createdAt: new Date().toISOString(),
          });

          onSnapshot(roomRef, (snapshot) => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data?.answer) {
              const answerDescription = new RTCSessionDescription(data.answer);
              peerConnection.setRemoteDescription(answerDescription);
            }
          });

          onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                peerConnection.addIceCandidate(new RTCIceCandidate(data));
              }
            });
          });
        } else {
          // I am the Callee
          console.log("Joining room...");
          
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(answerCandidates, event.candidate.toJSON());
            }
          };

          const roomData = roomSnapshot.data();
          const offerDescription = roomData.offer;
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

          const answerDescription = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answerDescription);

          await updateDoc(roomRef, {
            answer: {
              type: answerDescription.type,
              sdp: answerDescription.sdp,
            },
          });

          onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                peerConnection.addIceCandidate(new RTCIceCandidate(data));
              }
            });
          });
        }
      } catch (error) {
        console.error("Error starting WebRTC:", error);
      }
    };

    startWebRTC();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      pc.current?.close();
    };
  }, [roomId, db]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Ashford & Gray Academy</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Secure Live Session</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">2 Participants</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={copyRoomId}
          >
            <Copy className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative p-4 md:p-6 lg:p-8 bg-gradient-to-b from-slate-950 to-black overflow-hidden flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto w-full relative z-10">
          
          {/* Remote Participant (Main View) */}
          <div className="relative group aspect-video lg:aspect-auto h-full min-h-[300px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 hover:border-indigo-500/30">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-3xl">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center animate-pulse">
                    <Users className="w-10 h-10 text-indigo-500" />
                  </div>
                  <div className="absolute -inset-4 border-2 border-dashed border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Waiting for others...</h3>
                <p className="text-slate-400 text-sm mt-2">Share the link to start the lecture</p>
              </div>
            )}
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold tracking-wide">Remote Student</span>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    <Info className="w-4 h-4" />
                </Button>
            </div>
          </div>

          {/* Local Participant (Self View) */}
          <div className="relative group aspect-video lg:aspect-auto h-full min-h-[300px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 hover:border-emerald-500/30">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                isVideoOff && "hidden"
              )}
            />
            
            {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                        <VideoOff className="w-10 h-10 text-slate-500" />
                    </div>
                    <span className="mt-4 text-slate-400 font-medium">Your camera is off</span>
                </div>
            )}

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-semibold tracking-wide">You (Instructor)</span>
              {isMuted && <MicOff className="w-3 h-3 text-rose-500" />}
            </div>

            <div className="absolute bottom-4 right-4">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                    <div className="px-3 py-1 flex items-center gap-2">
                        <div className="flex gap-[2px]">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: `${i * 0.1}s`}} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Live Audio</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      </main>

      {/* Footer Controls */}
      <footer className="px-6 py-8 flex items-center justify-center bg-gradient-to-t from-slate-950 to-transparent">
        <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-2xl px-8 py-4 rounded-[32px] border border-white/10 shadow-2xl">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className={cn(
                "rounded-2xl w-14 h-14 transition-all duration-300 transform active:scale-95",
                !isMuted && "bg-slate-800 hover:bg-slate-700 text-white"
            )}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className={cn(
                "rounded-2xl w-14 h-14 transition-all duration-300 transform active:scale-95",
                !isVideoOff && "bg-slate-800 hover:bg-slate-700 text-white"
            )}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          <div className="w-[1px] h-10 bg-white/10 mx-2" />

          <Button
            variant="secondary"
            size="icon"
            className="rounded-2xl w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white transition-all duration-300 transform active:scale-95"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-2xl w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white transition-all duration-300 transform active:scale-95"
          >
            <Settings className="w-6 h-6" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-2xl w-16 h-16 shadow-lg shadow-rose-500/20 transition-all duration-300 transform hover:scale-110 active:scale-90"
            onClick={() => window.location.href = '/'}
          >
            <PhoneOff className="w-8 h-8 fill-current" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
