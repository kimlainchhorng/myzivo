/**
 * GroupCallScreenV2 — full-screen LiveKit-backed group call.
 * Mount this when participant count is expected to exceed 4
 * (the existing mesh-based GroupCallScreen still handles ≤4).
 *
 * Usage:
 *   <GroupCallScreenV2 roomName="group-<id>" callType="video" onEnded={...} />
 */
import { useEffect } from "react";
import { Loader2, Lock, Radio } from "lucide-react";
import { useLiveKitCall } from "@/hooks/useLiveKitCall";
import GroupCallGrid from "./GroupCallGrid";
import GroupCallControls from "./GroupCallControls";
import CallReactionsOverlay from "./CallReactionsOverlay";
import CallReactionStrip from "./CallReactionStrip";

interface Props {
  roomName: string;
  callType?: "audio" | "video";
  onEnded?: () => void;
  startMicMuted?: boolean;
  startCamOff?: boolean;
  autoRecord?: boolean;
}

export default function GroupCallScreenV2({
  roomName,
  callType = "video",
  onEnded,
  startMicMuted,
  startCamOff,
  autoRecord,
}: Props) {
  const call = useLiveKitCall({
    roomName,
    callType,
    enabled: true,
    onEnded,
    startMicMuted,
    startCamOff,
    autoRecord,
  });

  // Auto-bubble out when the room ends.
  useEffect(() => {
    if (call.state === "ended") onEnded?.();
  }, [call.state, onEnded]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white">
      {/* Top bar */}
      <header
        className="flex shrink-0 items-center justify-between bg-black/40 px-4 backdrop-blur-xl"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)", paddingBottom: 10 }}
      >
        <div className="flex items-center gap-2 text-xs">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">Group Call</span>
          <span className="text-white/50">· {call.participants.length} in call</span>
        </div>
        {call.isRecording && (
          <span
            className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-lg ring-2 ring-rose-300/50"
            title="This call is being recorded and saved to the host's secure bucket"
          >
            <Radio className="h-3 w-3 animate-pulse" /> REC
          </span>
        )}
      </header>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden">
        {call.state === "connecting" && (
          <div className="grid h-full place-items-center text-sm text-white/70">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Connecting…
            </div>
          </div>
        )}

        {call.state === "error" && (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-rose-300">
            {call.error ?? "Could not join the call."}
          </div>
        )}

        {(call.state === "connected" || call.participants.length > 0) && (
          <>
            <GroupCallGrid
              participants={call.participants}
              screenShareSource={call.screenShareSource}
            />
            <CallReactionsOverlay reactions={call.reactions} />
          </>
        )}
      </div>

      {/* Controls */}
      <GroupCallControls
        micEnabled={call.micEnabled}
        camEnabled={call.camEnabled}
        isScreenSharing={call.isScreenSharing}
        handRaised={call.handRaised}
        isHost={call.isHost}
        isRecording={call.isRecording}
        onToggleMic={call.toggleMic}
        onToggleCam={call.toggleCam}
        onToggleScreen={call.toggleScreenShare}
        onToggleHand={call.toggleHandRaise}
        onReaction={call.sendReaction}
        onStartRecording={call.startRecording}
        onStopRecording={call.stopRecording}
        onLeave={call.leave}
      />
    </div>
  );
}
