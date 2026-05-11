import { WebRTCRoom } from '@/components/video/WebRTCRoom';

export default function LiveClassRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="h-[85vh] w-full">
      <WebRTCRoom roomId={params.roomId} />
    </div>
  );
}
