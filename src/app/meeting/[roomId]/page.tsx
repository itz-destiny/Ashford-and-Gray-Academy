import JitsiMeetingWrapper from "@/components/JitsiMeeting";

export default async function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    return <JitsiMeetingWrapper roomId={roomId} />;
}
