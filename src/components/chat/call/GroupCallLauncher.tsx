/**
 * GroupCallLauncher — Convenience wrapper that runs the pre-join lobby
 * and then mounts the LiveKit group call screen with the chosen settings.
 *
 * Usage:
 *   <GroupCallLauncher roomName="group-<id>" callType="video" onEnded={...} />
 */
import { useState } from "react";
import CallLobby, { type CallLobbyResult } from "./CallLobby";
import GroupCallScreenV2 from "./GroupCallScreenV2";

interface Props {
  roomName: string;
  callType?: "audio" | "video";
  onEnded?: () => void;
}

export default function GroupCallLauncher({ roomName, callType = "video", onEnded }: Props) {
  const [joined, setJoined] = useState<CallLobbyResult | null>(null);

  if (!joined) {
    return (
      <CallLobby
        roomName={roomName}
        callType={callType}
        canRecord
        onCancel={() => onEnded?.()}
        onJoin={setJoined}
      />
    );
  }

  return (
    <GroupCallScreenV2
      roomName={roomName}
      callType={callType}
      onEnded={onEnded}
      startMicMuted={joined.startMicMuted}
      startCamOff={joined.startCamOff}
      autoRecord={joined.autoRecord}
    />
  );
}
