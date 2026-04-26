/**
 * GroupCallEntryPage — Standalone entry that mounts the full group-call
 * launcher (lobby → LiveKit screen). Reachable at:
 *   /chat/call/group/:roomName        (video by default)
 *   /chat/call/group/:roomName?audio=1 (audio-only)
 */
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import GroupCallLauncher from "@/components/chat/call/GroupCallLauncher";

export default function GroupCallEntryPage() {
  const { roomName = "" } = useParams<{ roomName: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const callType = params.get("audio") === "1" ? "audio" : "video";

  if (!roomName) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-950 text-white">
        Missing room name.
      </div>
    );
  }

  return (
    <GroupCallLauncher
      roomName={roomName}
      callType={callType}
      onEnded={() => navigate(-1)}
    />
  );
}
