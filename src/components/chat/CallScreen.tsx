/**
 * CallScreen — Full-screen calling overlay with real WebRTC peer-to-peer calls
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWebRTC, CallRole } from "@/hooks/useWebRTC";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CallScreenProps {
  recipientName: string;
  recipientAvatar?: string | null;
  callType: "voice" | "video";
  recipientId: string;
  /** If provided, we're answering an existing call */
  existingCallId?: string;
  onEnd: () => void;
}

export default function CallScreen({
  recipientName,
  recipientAvatar,
  callType,
  recipientId,
  existingCallId,
  onEnd,
}: CallScreenProps) {
  const { user } = useAuth();
  const [callId, setCallId] = useState<string | null>(existingCallId || null);
  const [duration, setDuration] = useState(0);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const role: CallRole = existingCallId ? "callee" : "caller";
  const initials = (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleRemoteStream = useCallback((stream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(onEnd, 300);
  }, [onEnd]);

  const webrtc = useWebRTC({
    callId: callId || "",
    role,
    callType,
    userId: user?.id || "",
    onRemoteStream: handleRemoteStream,
    onEnded: handleEnded,
  });

  // Create call signal record (caller only)
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

  // Start WebRTC once we have a callId
  useEffect(() => {
    if (!callId) return;
    const init = async () => {
      const localStream = await webrtc.start(callId);
      if (localStream && localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = localStream;
      }
    };
    init();
  }, [callId]);

  // Timer when connected
  useEffect(() => {
    if (webrtc.callState === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [webrtc.callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-background"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 3rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 2rem)",
      }}
    >
      {/* Top section - avatar & status */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={recipientAvatar || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{recipientName}</h2>
        <p className="text-sm text-muted-foreground">
          {webrtc.callState === "ringing" && (callType === "video" ? "Video calling..." : "Calling...")}
          {webrtc.callState === "connected" && formatDuration(duration)}
          {webrtc.callState === "ended" && "Call ended"}
        </p>
        {webrtc.callState === "ringing" && (
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video area */}
      {callType === "video" && (
        <div className="flex-1 w-full max-w-sm mx-auto my-6 relative">
          {/* Remote video (full) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full rounded-2xl bg-muted/30 border border-border/20 object-cover"
          />
          {/* Local video (picture-in-picture) */}
          {!webrtc.isCameraOff && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-3 right-3 w-24 h-32 rounded-xl border-2 border-background object-cover shadow-lg"
            />
          )}
        </div>
      )}

      {callType === "voice" && <div className="flex-1" />}

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 pb-6">
        <button
          onClick={webrtc.toggleMute}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            webrtc.isMuted ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
          }`}
        >
          {webrtc.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <button
          onClick={webrtc.endCall}
          className="h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform"
        >
          <PhoneOff className="h-6 w-6" />
        </button>

        {callType === "video" ? (
          <button
            onClick={webrtc.toggleCamera}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              webrtc.isCameraOff ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            }`}
          >
            {webrtc.isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
        ) : (
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              isSpeaker ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
            }`}
          >
            <Volume2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
