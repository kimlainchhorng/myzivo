/**
 * GroupCallGrid — adaptive FaceTime-style grid (1 → 8 participants).
 * If anyone is sharing their screen, the grid collapses into a sidebar
 * and ScreenShareTile takes the spotlight.
 */
import { useMemo } from "react";
import VideoTile from "./VideoTile";
import ScreenShareTile from "./ScreenShareTile";
import type { LKParticipant } from "@/hooks/useLiveKitCall";

interface Props {
  participants: LKParticipant[];
  screenShareSource: LKParticipant | null;
  isRecording?: boolean;
  /** Forwarded to each VideoTile so the host sees the moderation menu. */
  viewerIsHost?: boolean;
  /** LiveKit room name — required for moderation actions. */
  roomName?: string;
}

function gridClass(n: number): string {
  if (n <= 1) return "grid-cols-1 grid-rows-1";
  if (n === 2) return "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1";
  if (n <= 4) return "grid-cols-2 grid-rows-2";
  if (n <= 6) return "grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2";
  return "grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2"; // up to 8
}

export default function GroupCallGrid({ participants, screenShareSource, isRecording = false, viewerIsHost = false, roomName }: Props) {
  const orderedParticipants = useMemo(() => {
    // Local first for predictability
    return [...participants].sort((a, b) => Number(b.isLocal) - Number(a.isLocal));
  }, [participants]);

  // SCREEN SHARE LAYOUT: spotlight + horizontal strip
  if (screenShareSource) {
    return (
      <div className="grid h-full grid-rows-[1fr_120px] gap-2 p-2 md:grid-cols-[1fr_220px] md:grid-rows-1">
        <div className="overflow-hidden rounded-2xl">
          <ScreenShareTile participant={screenShareSource} />
        </div>
        <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-y-auto">
          {orderedParticipants.map((p) => (
            <div key={p.identity} className="aspect-video h-full shrink-0 md:h-auto md:w-full">
              <VideoTile participant={p} isRecording={isRecording} viewerIsHost={viewerIsHost} roomName={roomName} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // NORMAL GRID
  const n = orderedParticipants.length;
  return (
    <div className={`grid h-full gap-2 p-2 ${gridClass(n)}`}>
      {orderedParticipants.map((p) => (
        <VideoTile key={p.identity} participant={p} isRecording={isRecording} viewerIsHost={viewerIsHost} roomName={roomName} />
      ))}
    </div>
  );
}
