/**
 * CallScreen — Full-screen calling overlay with WebRTC, quality indicator, recording, screen sharing, PiP
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Monitor, MonitorOff, Minimize2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebRTC, CallRole } from "@/hooks/useWebRTC";
import { useCallQuality } from "@/hooks/useCallQuality";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useCallRecording } from "@/hooks/useCallRecording";
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
  const [showRecordConsent, setShowRecordConsent] = useState(false);
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

    // Save call history
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

  // Hooks for enhancements — connected to live PeerConnection ref
  const qualityStats = useCallQuality(peerConnection);
  const screenShare = useScreenShare(peerConnection);
  const recording = useCallRecording({
    callHistoryId: callHistoryId || undefined,
    userId: user?.id || "",
  });

  // Create call signal
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

  // Start WebRTC
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

  // Ringback
  useEffect(() => {
    if (role !== "caller" || callState !== "ringing" || !callId) return;
    const stopRingback = playOutgoingRingback();
    return () => { stopRingback(); };
  }, [role, callId, callState]);

  // Watch for decline
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

  // Duration timer
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

  const handleRecordToggle = () => {
    if (recording.isRecording) {
      recording.stopRecording();
    } else {
      setShowRecordConsent(true);
    }
  };

  const confirmRecording = () => {
    setShowRecordConsent(false);
    const ls = localStream.current;
    const rs = remoteStreamRef.current;
    if (ls && rs) {
      recording.startRecording(ls, rs);
    } else {
      toast.error("Cannot record — streams not available");
    }
  };

  const statusText =
    callState === "ringing"
      ? role === "caller"
        ? callType === "video" ? "Video calling..." : "Calling..."
        : "Connecting..."
      : callState === "connected"
        ? formatDuration(duration)
        : "Call ended";

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-between"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 2.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1.5rem)",
        background: callType === "video"
          ? "hsl(var(--background))"
          : "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-3 flex items-center justify-between safe-area-top z-10">
        <CallQualityBadge stats={qualityStats} />
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button
              onClick={() => onMinimize({ remoteStream: remoteStreamRef.current, duration, isMuted })}
              className="h-9 w-9 rounded-full bg-foreground/5 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/10 transition-colors"
            >
              <Minimize2 className="h-4 w-4 text-foreground/70" />
            </button>
          )}
        </div>
      </div>

      {/* Caller info */}
      <div className="flex flex-col items-center gap-5 mt-12 px-6">
        <div className="relative">
          {callState === "ringing" && (
            <>
              <motion.div
                className="absolute -inset-3 rounded-full border-2 border-primary/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-6 rounded-full border border-primary/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
          <Avatar className="h-28 w-28 border-[3px] border-primary/10 shadow-xl">
            <AvatarImage src={recipientAvatar || undefined} />
            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{recipientName}</h2>
          <p className={`text-sm mt-1.5 font-medium ${callState === "connected" ? "text-primary tabular-nums" : "text-muted-foreground"}`}>
            {statusText}
          </p>
        </div>
        {callState === "ringing" && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
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
            className="w-full h-full rounded-3xl bg-muted/20 object-cover shadow-inner" />
          {!isCameraOff && (
            <motion.div
              drag
              dragMomentum={false}
              className="absolute bottom-4 right-4 cursor-grab active:cursor-grabbing"
            >
              <video ref={localVideoRef} autoPlay playsInline muted
                className="w-[90px] h-[120px] rounded-2xl border-[3px] border-background object-cover shadow-2xl" />
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
      <div className="w-full px-8 pb-4">
        <div className="flex items-center justify-center gap-5">
          <button onClick={toggleMute}
            className={`h-[52px] w-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isMuted ? "bg-destructive/15 text-destructive" : "bg-foreground/8 text-foreground/80"
            }`}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {callType === "video" ? (
            <>
              <button onClick={toggleCamera}
                className={`h-[52px] w-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isCameraOff ? "bg-destructive/15 text-destructive" : "bg-foreground/8 text-foreground/80"
                }`}>
                {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>
              <button onClick={screenShare.toggleSharing}
                className={`h-[52px] w-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  screenShare.isSharing ? "bg-primary/15 text-primary" : "bg-foreground/8 text-foreground/80"
                }`}>
                {screenShare.isSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <button onClick={() => setIsSpeaker(!isSpeaker)}
              className={`h-[52px] w-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
                isSpeaker ? "bg-primary/15 text-primary" : "bg-foreground/8 text-foreground/80"
              }`}>
              <Volume2 className="h-5 w-5" />
            </button>
          )}

          <button onClick={handleRecordToggle}
            className={`h-[52px] w-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
              recording.isRecording ? "bg-destructive/15 text-destructive" : "bg-foreground/8 text-foreground/80"
            }`}>
            {recording.isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>

          <button onClick={() => { void endCall(); }}
            className="h-[60px] w-[60px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-destructive/25">
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Recording consent modal */}
      <AnimatePresence>
        {showRecordConsent && (
          <motion.div
            className="absolute inset-0 z-[65] bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background border border-border/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-base font-bold text-foreground mb-2">Record this call?</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Both parties will be notified. Recordings are saved securely and can be deleted anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecordConsent(false)}
                  className="flex-1 h-11 rounded-2xl bg-muted text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRecording}
                  className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform shadow-sm"
                >
                  Start Recording
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
