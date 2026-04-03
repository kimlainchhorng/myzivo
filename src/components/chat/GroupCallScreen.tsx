/**
 * GroupCallScreen — Multi-party video/voice call with participant grid
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CallQualityBadge from "./CallQualityBadge";
import type { CallQualityStats } from "@/hooks/useCallQuality";

interface Participant {
  id: string;
  userId: string;
  name: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking: boolean;
}

interface GroupCallScreenProps {
  callType: "voice" | "video";
  participants: Participant[];
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  duration: number;
  quality?: CallQualityStats;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onInvite: () => void;
}

export default function GroupCallScreen({
  callType,
  participants,
  localStream,
  isMuted,
  isCameraOff,
  isScreenSharing,
  duration,
  quality,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onInvite,
}: GroupCallScreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const formatDur = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const totalParticipants = participants.length + 1; // +1 for self
  const gridCols = totalParticipants <= 2 ? 1 : totalParticipants <= 4 ? 2 : 3;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Group Call</span>
          <span className="text-xs text-muted-foreground">· {totalParticipants} people</span>
        </div>
        <div className="flex items-center gap-2">
          {quality && <CallQualityBadge stats={quality} />}
          <span className="text-xs font-mono text-muted-foreground">{formatDur(duration)}</span>
        </div>
      </div>

      {/* Participant grid */}
      <div className={`flex-1 p-2 grid gap-2`} style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridAutoRows: "1fr",
      }}>
        {/* Self tile */}
        <div className={`relative rounded-xl overflow-hidden border-2 ${
          !isMuted ? "border-primary/40" : "border-border/20"
        } bg-muted/30`}>
          {callType === "video" && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">You</AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className="px-2 py-0.5 rounded-full bg-background/80 text-[10px] font-medium text-foreground">You</span>
            {isMuted && <MicOff className="w-3 h-3 text-destructive" />}
          </div>
        </div>

        {/* Remote participants */}
        {participants.map((p) => (
          <ParticipantTile key={p.id} participant={p} isVideo={callType === "video"} />
        ))}

        {/* Add participant tile */}
        {totalParticipants < 8 && (
          <button
            onClick={onInvite}
            className="rounded-xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 px-6">
        <button
          onClick={onToggleMute}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
          }`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {callType === "video" && (
          <button
            onClick={onToggleCamera}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              isCameraOff ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            }`}
          >
            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
        )}

        <button
          onClick={onToggleScreenShare}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            isScreenSharing ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
          }`}
        >
          <Monitor className="h-5 w-5" />
        </button>

        <button
          onClick={onEndCall}
          className="h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  );
}

function ParticipantTile({ participant, isVideo }: { participant: Participant; isVideo: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      void videoRef.current.play().catch(() => {});
    }
  }, [participant.stream]);

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 ${
      participant.isSpeaking ? "border-primary/50" : "border-border/20"
    } bg-muted/30`}>
      {isVideo && !participant.isCameraOff && participant.stream ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">
              {participant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-[10px] font-medium text-foreground truncate max-w-[80px]">
          {participant.name}
        </span>
        {participant.isMuted && <MicOff className="w-3 h-3 text-destructive" />}
      </div>
      {participant.isSpeaking && (
        <motion.div
          className="absolute inset-0 border-2 border-green-500/30 rounded-xl"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </div>
  );
}
