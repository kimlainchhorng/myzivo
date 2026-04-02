/**
 * CallScreen — Full-screen calling overlay with WebRTC, quality indicator, recording, screen sharing, PiP
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Monitor, MonitorOff, Circle, Square, Minimize2 } from "lucide-react";
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
  onMinimize?: () => void;
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
      {/* Top bar with quality + minimize */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-3 flex items-center justify-between safe-area-top">
        <CallQualityBadge stats={qualityStats} />
        <div className="flex items-center gap-2">
          {recording.isRecording && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Circle className="w-2 h-2 fill-current" /> REC {formatDuration(recording.recordingDuration)}
            </motion.div>
          )}
          {onMinimize && (
            <button onClick={onMinimize} className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center">
              <Minimize2 className="h-4 w-4 text-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={recipientAvatar || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{recipientName}</h2>
        <p className="text-sm text-muted-foreground">{statusText}</p>
        {callState === "ringing" && (
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="absolute h-0 w-0 opacity-0 pointer-events-none" />

      {callType === "video" && (
        <div className="flex-1 w-full max-w-sm mx-auto my-6 relative">
          <video ref={remoteVideoRef} autoPlay playsInline
            className="w-full h-full rounded-2xl bg-muted/30 border border-border/20 object-cover" />
          {!isCameraOff && (
            <video ref={localVideoRef} autoPlay playsInline muted
              className="absolute bottom-3 right-3 w-24 h-32 rounded-xl border-2 border-background object-cover shadow-lg" />
          )}
          {screenShare.isSharing && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center gap-1">
              <Monitor className="w-3 h-3" /> Sharing screen
            </div>
          )}
        </div>
      )}

      {callType === "voice" && <div className="flex-1" />}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pb-6 px-4">
        <button onClick={toggleMute}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
          }`}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {callType === "video" ? (
          <>
            <button onClick={toggleCamera}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                isCameraOff ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
              }`}>
              {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
            <button onClick={screenShare.toggleSharing}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                screenShare.isSharing ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
              }`}>
              {screenShare.isSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </button>
          </>
        ) : (
          <button onClick={() => setIsSpeaker(!isSpeaker)}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              isSpeaker ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
            }`}>
            <Volume2 className="h-5 w-5" />
          </button>
        )}

        {/* Record button */}
        <button onClick={handleRecordToggle}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            recording.isRecording ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
          }`}>
          {recording.isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>

        <button onClick={() => { void endCall(); }}
          className="h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform">
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>

      {/* Recording consent modal */}
      <AnimatePresence>
        {showRecordConsent && (
          <motion.div
            className="absolute inset-0 z-[65] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-base font-bold text-foreground mb-2">Record this call?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Both parties will be notified that this call is being recorded. Recordings are saved securely and can be deleted anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecordConsent(false)}
                  className="flex-1 h-10 rounded-xl bg-muted text-foreground text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRecording}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  Start Recording
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
