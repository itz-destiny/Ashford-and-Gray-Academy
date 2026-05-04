import React from "react";
import MeetingRoom from "@/components/meeting/MeetingRoom";

export default async function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    
    return <MeetingRoom roomId={roomId} />;
}
