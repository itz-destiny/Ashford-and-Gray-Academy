"use client";

import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { useDb } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function WebRTCRoom({ roomId }: { roomId: string }) {
  const { db } = useDb();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('Waiting to join...');

  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Setup WebRTC
    pc.current = new RTCPeerConnection(servers);
    
    // Setup remote stream
    const remoteMediaStream = new MediaStream();
    setRemoteStream(remoteMediaStream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteMediaStream;
    }

    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
    };

    pc.current.onconnectionstatechange = () => {
      setConnectionState(pc.current?.connectionState || 'unknown');
    };

    startWebcam();

    return () => {
      pc.current?.close();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });
      setConnectionState('Ready to join');
    } catch (error) {
      console.error('Error accessing webcam', error);
      setConnectionState('Camera access denied');
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(!localStream.getVideoTracks()[0].enabled);
    }
  };

  const createRoom = async () => {
    if (!db || !pc.current) return;
    setConnectionState('Creating room...');
    const roomRef = doc(collection(db, 'rooms'), roomId);
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(callerCandidatesCollection, event.candidate.toJSON());
      }
    };

    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);

    const roomWithOffer = {
      offer: {
        type: offerDescription.type,
        sdp: offerDescription.sdp,
      },
    };
    await setDoc(roomRef, roomWithOffer);

    onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!pc.current?.currentRemoteDescription && data && data.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current?.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate);
        }
      });
    });
  };

  const joinRoom = async () => {
    if (!db || !pc.current) return;
    setConnectionState('Joining room...');
    const roomRef = doc(collection(db, 'rooms'), roomId);
    const roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.exists()) {
      const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        }
      };

      const offerDescription = roomSnapshot.data().offer;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answerDescription);

      const roomWithAnswer = {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        },
      };
      await updateDoc(roomRef, roomWithAnswer);

      onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.current?.addIceCandidate(candidate);
          }
        });
      });
    } else {
      setConnectionState('Room not found');
    }
  };

  const hangUp = async () => {
    pc.current?.close();
    localStream?.getTracks().forEach(track => track.stop());
    window.history.back();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B1F3A] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
      {/* Videos Container */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        {/* Remote Video (Main) */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover rounded-[2rem] bg-slate-900 shadow-inner"
        />
        
        {/* Local Video (PIP) */}
        <div className="absolute bottom-8 right-8 w-48 aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Status Overlay */}
        <div className="absolute top-8 left-8 bg-[#C8A96A]/20 backdrop-blur-md border border-[#C8A96A]/30 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          {connectionState}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-white/5 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-white font-serif text-lg tracking-tight">Virtual Symposium</span>
                <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-widest">Room: {roomId}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full border-white/10 ${isAudioMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Button 
            variant="outline"
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full border-white/10 ${isVideoMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          <Button 
            onClick={hangUp}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={createRoom} className="bg-[#C8A96A] text-white hover:bg-[#B69759] font-black text-[10px] uppercase tracking-widest rounded-full h-12 px-6">
                Start Class (Host)
            </Button>
            <Button onClick={joinRoom} variant="outline" className="border-white/20 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest rounded-full h-12 px-6 bg-transparent">
                Join Class
            </Button>
        </div>
      </div>
    </div>
  );
}
