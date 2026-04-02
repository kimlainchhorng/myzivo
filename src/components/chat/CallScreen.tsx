/**
 * CallScreen — Full-screen calling overlay with WebRTC, quality indicator, screen sharing, PiP
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Monitor, MonitorOff, Minimize2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebRTC, CallRole } from "@/hooks/useWebRTC";
import { useCallQuality } from "@/hooks/useCallQuality";
import { useScreenShare } from "@/hooks/useScreenShare";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { playOutgoingRingback } from "@/lib/callAudio";
import CallQualityBadge from "./CallQualityBadge";
import { toast } from "sonner";

interface CallScreenProps {
  recipientName: string;
  recipientAvatar?: string | null;
  callType: "voice" | "video";
  recipientId: string;
  existingCallId?: string;
  onEnd: () => void;
  onMinimize?: (data: { remoteStream: MediaStream | null; duration: number; isMuted: boolean }) => void;
}

export default function CallScreen({
  recipientName,
  recipientAvatar,
  callType,
  recipientId,
  existingCallId,
  onEnd,
  onMinimize,
}: CallScreenProps) {
  const { user } = useAuth();
  const [callId, setCallId] = useState<string | null>(existingCallId || null);
  const [callHistoryId, setCallHistoryId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const role: CallRole = existingCallId ? "callee" : "caller";
  const initials = (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleRemoteStream = useCallback((stream: MediaStream) => {
    remoteStreamRef.current = stream;
    if (callType === "video") {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        void remoteVideoRef.current.play().catch(() => {});
      }
      return;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.muted = false;
      void remoteAudioRef.current.play().catch(() => {});
    }
  }, [callType]);

  const handleEnded = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (user?.id && callId) {
      (supabase as any).from("call_history").insert({
        caller_id: role === "caller" ? user.id : recipientId,
        callee_id: role === "caller" ? recipientId : user.id,
        call_type: callType,
        status: duration > 0 ? "answered" : "missed",
        duration_seconds: duration,
        call_signal_id: callId,
      }).then(({ data }: any) => {
        if (data?.[0]?.id) setCallHistoryId(data[0].id);
      });
    }

    setTimeout(onEnd, 300);
  }, [onEnd, user?.id, callId, role, recipientId, callType, duration]);

  const {
    start, endCall, toggleMute, toggleCamera,
    isMuted, isCameraOff, callState, localStream, peerConnection,
  } = useWebRTC({
    callId: callId || "",
    role,
    callType,
    userId: user?.id || "",
    onRemoteStream: handleRemoteStream,
    onEnded: handleEnded,
  });

  const qualityStats = useCallQuality(peerConnection);
  const screenShare = useScreenShare(peerConnection);

  useEffect(() => {
    if (existingCallId || !user?.id || callId) return;
    const create = async () => {
      const { data } = await (supabase as any).from("call_signals").insert({
        caller_id: user.id,
        callee_id: recipientId,
        call_type: callType,
      }).select("id").single();
      if (data?.id) setCallId(data.id);
    };
    create();
  }, [user?.id, recipientId, callType, existingCallId, callId]);

  useEffect(() => {
    if (!callId) return;
    const init = async () => {
      const localStr = await start(callId);
      if (localStr && localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = localStr;
      }
    };
    void init();
  }, [callId, callType, start]);

  useEffect(() => {
    if (role !== "caller" || callState !== "ringing" || !callId) return;
    const stopRingback = playOutgoingRingback();
    return () => { stopRingback(); };
  }, [role, callId, callState]);

  useEffect(() => {
    if (role !== "caller" || !callId) return;
    const channel = supabase
      .channel(`caller-watch-${callId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "call_signals",
        filter: `id=eq.${callId}`,
      }, (payload: any) => {
        if (payload.new.status === "declined" || payload.new.status === "ended") {
          void endCall();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [role, callId, endCall]);

  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const statusText =
    callState === "ringing"
      ? role === "caller"
        ? callType === "video" ? "Video calling..." : "Calling..."
        : "Connecting..."
      : callState === "connected"
        ? formatDuration(duration)
        : "Call ended";

  // Control button helper
  const ControlBtn = ({ onClick, active, activeColor = "destructive", children, size = "default" }: {
    onClick: () => void;
    active?: boolean;
    activeColor?: "destructive" | "primary";
    children: React.ReactNode;
    size?: "default" | "large";
  }) => {
    const sizeClass = size === "large" ? "h-16 w-16" : "h-14 w-14";
    return (
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        className={`${sizeClass} rounded-full flex flex-col items-center justify-center transition-all ${
          active
            ? activeColor === "destructive"
              ? "bg-destructive/12 text-destructive"
              : "bg-primary/12 text-primary"
            : "bg-foreground/6 text-foreground/60 hover:bg-foreground/10"
        }`}
      >
        {children}
      </motion.button>
    );
  };

  const ControlLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[10px] mt-1 text-muted-foreground font-medium">{children}</span>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 2.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1.5rem)",
        background: callType === "video"
          ? "hsl(var(--background))"
          : "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.5) 100%)",
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-5 flex items-center justify-between z-10"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 1rem)" }}>
        <CallQualityBadge stats={qualityStats} />
        <div className="flex items-center gap-2">
          {onMinimize && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onMinimize({ remoteStream: remoteStreamRef.current, duration, isMuted })}
              className="h-10 w-10 rounded-full bg-foreground/5 backdrop-blur-md flex items-center justify-center border border-border/20"
            >
              <Minimize2 className="h-4 w-4 text-foreground/60" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Caller info */}
      <div className="flex flex-col items-center gap-4 mt-14 px-6">
        <div className="relative">
          {/* Ripple rings while ringing */}
          {callState === "ringing" && (
            <>
              <motion.div
                className="absolute -inset-4 rounded-full border-2 border-primary/15"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -inset-8 rounded-full border border-primary/8"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -inset-12 rounded-full border border-primary/5"
                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
              />
            </>
          )}
          {/* Connected glow */}
          {callState === "connected" && (
            <div className="absolute -inset-1 rounded-full bg-primary/10 blur-md" />
          )}
          <Avatar className="h-32 w-32 border-4 border-primary/10 shadow-2xl relative z-[1]">
            <AvatarImage src={recipientAvatar || undefined} />
            <AvatarFallback className="text-4xl font-bold bg-primary/8 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center mt-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{recipientName}</h2>
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mt-1 font-medium ${callState === "connected" ? "text-primary tabular-nums" : "text-muted-foreground"}`}
          >
            {statusText}
          </motion.p>
        </div>

        {/* Ringing dots */}
        {callState === "ringing" && (
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.3, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="absolute h-0 w-0 opacity-0 pointer-events-none" />

      {/* Video area */}
      {callType === "video" && (
        <div className="flex-1 w-full px-4 my-4 relative">
          <video ref={remoteVideoRef} autoPlay playsInline
            className="w-full h-full rounded-3xl bg-muted/10 object-cover shadow-inner border border-border/10" />
          {!isCameraOff && (
            <motion.div
              drag
              dragMomentum={false}
              className="absolute bottom-4 right-4 cursor-grab active:cursor-grabbing"
            >
              <video ref={localVideoRef} autoPlay playsInline muted
                className="w-[100px] h-[130px] rounded-2xl border-[3px] border-background object-cover shadow-2xl" />
            </motion.div>
          )}
          {screenShare.isSharing && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold flex items-center gap-1.5 shadow-lg">
              <Monitor className="w-3 h-3" /> Sharing screen
            </div>
          )}
        </div>
      )}

      {callType === "voice" && <div className="flex-1" />}

      {/* Controls */}
      <div className="w-full px-6 pb-4">
        <div className="flex items-end justify-center gap-5">
          {/* Mute */}
          <div className="flex flex-col items-center">
            <ControlBtn onClick={toggleMute} active={isMuted}>
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </ControlBtn>
            <ControlLabel>{isMuted ? "Unmute" : "Mute"}</ControlLabel>
          </div>

          {callType === "video" ? (
            <>
              {/* Camera */}
              <div className="flex flex-col items-center">
                <ControlBtn onClick={toggleCamera} active={isCameraOff}>
                  {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </ControlBtn>
                <ControlLabel>{isCameraOff ? "Start" : "Stop"}</ControlLabel>
              </div>
              {/* Screen Share */}
              <div className="flex flex-col items-center">
                <ControlBtn onClick={screenShare.toggleSharing} active={screenShare.isSharing} activeColor="primary">
                  {screenShare.isSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </ControlBtn>
                <ControlLabel>Screen</ControlLabel>
              </div>
            </>
          ) : (
            <>
              {/* Speaker */}
              <div className="flex flex-col items-center">
                <ControlBtn onClick={() => setIsSpeaker(!isSpeaker)} active={isSpeaker} activeColor="primary">
                  <Volume2 className="h-5 w-5" />
                </ControlBtn>
                <ControlLabel>Speaker</ControlLabel>
              </div>
              {/* Chat */}
              <div className="flex flex-col items-center">
                <ControlBtn onClick={() => toast.info("Opening chat...")}>
                  <MessageCircle className="h-5 w-5" />
                </ControlBtn>
                <ControlLabel>Chat</ControlLabel>
              </div>
            </>
          )}

          {/* End call */}
          <div className="flex flex-col items-center">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { void endCall(); }}
              className="h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-xl shadow-destructive/25"
            >
              <PhoneOff className="h-6 w-6" />
            </motion.button>
            <ControlLabel>End</ControlLabel>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
