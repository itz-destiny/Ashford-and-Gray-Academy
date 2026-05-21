import MeetingRoom from '@/components/meeting/MeetingRoom';

export default async function LiveClassRoomPage({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = await params;
    return <MeetingRoom roomId={roomId} />;
}
