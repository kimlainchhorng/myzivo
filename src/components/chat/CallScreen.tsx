/**
 * CallScreen — Full-screen calling overlay with WebRTC, quality indicator, screen sharing, PiP
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Monitor, MonitorOff, Minimize2, MessageCircle, WifiOff, SwitchCamera, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebRTC, CallRole, WebRTCFailure, classifyWebRTCFailure } from "@/hooks/useWebRTC";
import { useCallQuality } from "@/hooks/useCallQuality";
import { useScreenShare } from "@/hooks/useScreenShare";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { playOutgoingRingback } from "@/lib/callAudio";
import CallQualityBadge from "./CallQualityBadge";
import CallReactions from "./CallReactions";
import AudioVisualizer from "./AudioVisualizer";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CallScreenProps {
  recipientName: string;
  recipientAvatar?: string | null;
  callType: "voice" | "video";
  recipientId: string;
  existingCallId?: string;
  onEnd: () => void;
  onMinimize?: (data: { remoteStream: MediaStream | null; duration: number; isMuted: boolean; callType: "voice" | "video"; isCameraOff: boolean }) => void;
  minimized?: boolean;
  onPipStateChange?: (data: { remoteStream: MediaStream | null; duration: number; isMuted: boolean; callType: "voice" | "video"; isCameraOff: boolean }) => void;
  onPipControlsChange?: (controls: { toggleMute: () => void; endCall: () => void; toggleCamera: () => void } | null) => void;
}

export default function CallScreen({
  recipientName,
  recipientAvatar,
  callType,
  recipientId,
  existingCallId,
  onEnd,
  onMinimize,
  minimized = false,
  onPipStateChange,
  onPipControlsChange,
}: CallScreenProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [callId, setCallId] = useState<string | null>(existingCallId || null);
  const [callHistoryId, setCallHistoryId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [remoteAccepted, setRemoteAccepted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const endReasonRef = useRef<"declined" | "no_answer" | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const reminderPushSentRef = useRef(false);
  const createCallFiredRef = useRef(false);
  const pipControlsChangeRef = useRef(onPipControlsChange);
  const pipStateChangeRef = useRef(onPipStateChange);
  const pipActionFnsRef = useRef({
    toggleMute: () => {},
    endCall: async () => {},
    toggleCamera: () => {},
  });

  const handleCallFailure = useCallback((failure: WebRTCFailure) => {
    toast.error(failure.title, {
      description: failure.description,
    });
  }, []);

  const role: CallRole = existingCallId ? "callee" : "caller";
  const initials = (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const sendIncomingCallPush = useCallback(async (newCallId: string, mode: "initial" | "reminder" = "initial") => {
    if (!user?.id || !recipientId || recipientId === user.id) return;

    // Fetch caller profile from profiles table for accurate name & avatar
    let callerName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Incoming call";
    let callerAvatar = "";

    try {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) callerName = profile.full_name;
      if (profile?.avatar_url) callerAvatar = profile.avatar_url;
    } catch {
      // fallback to user_metadata values above
    }

    const sendPushAttempt = async (attempt: number) => {
      try {
        const { error } = await supabase.functions.invoke("send-push-notification", {
          body: {
            user_id: recipientId,
            notification_type: "incoming_call",
            title: callerName,
            body: mode === "reminder"
              ? callType === "video" ? "Still video calling you" : "Still voice calling you"
              : callType === "video" ? "Video calling you" : "Voice calling you",
            image_url: callerAvatar || undefined,
            data: {
              type: "incoming_call",
              call_id: newCallId,
              call_type: callType,
              caller_id: user.id,
              caller_name: callerName,
              caller_avatar: callerAvatar,
              ring_stage: mode,
            },
          },
        });

        if (error) throw error;
      } catch (pushError) {
        if (attempt < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 600 * (attempt + 1)));
          await sendPushAttempt(attempt + 1);
          return;
        }
        console.error("[Call] Failed to send incoming call push:", pushError);
      }
    };

    await sendPushAttempt(0);
  }, [callType, recipientId, user?.email, user?.id, user?.user_metadata]);

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
    setRemoteAccepted(false);

    const resolvedStatus =
      endReasonRef.current === "declined"
        ? "declined"
        : endReasonRef.current === "no_answer"
          ? "no_answer"
          : duration > 0
            ? "answered"
            : "missed";

    if (user?.id && callId) {
      (supabase as any).from("call_history").insert({
        caller_id: role === "caller" ? user.id : recipientId,
        callee_id: role === "caller" ? recipientId : user.id,
        call_type: callType,
        status: resolvedStatus,
        duration_seconds: duration,
        call_signal_id: callId,
      }).then(({ data }: any) => {
        if (data?.[0]?.id) setCallHistoryId(data[0].id);
      });
    }

    if (role === "caller" && user?.id && (resolvedStatus === "no_answer" || resolvedStatus === "declined")) {
      const callLabel = callType === "video" ? "video" : "voice";
      const message = resolvedStatus === "declined"
        ? `Missed ${callLabel} call (declined)`
        : `Missed ${callLabel} call (no answer)`;

      void (supabase as any).from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: recipientId,
        message,
        message_type: "text",
      });
    }

    endReasonRef.current = null;

    setTimeout(onEnd, 300);
  }, [onEnd, user?.id, callId, role, recipientId, callType, duration]);

  const {
    start, endCall, toggleMute, toggleCamera,
    isMuted, isCameraOff, isReconnecting, callState, localStream, peerConnection,
  } = useWebRTC({
    callId: callId || "",
    role,
    callType,
    userId: user?.id || "",
    onRemoteStream: handleRemoteStream,
    onEnded: handleEnded,
    onFailure: handleCallFailure,
  });

  const qualityStats = useCallQuality(peerConnection);
  const screenShare = useScreenShare(peerConnection);

  useEffect(() => {
    pipControlsChangeRef.current = onPipControlsChange;
  }, [onPipControlsChange]);

  useEffect(() => {
    pipStateChangeRef.current = onPipStateChange;
  }, [onPipStateChange]);

  useEffect(() => {
    pipActionFnsRef.current = {
      toggleMute,
      endCall,
      toggleCamera,
    };
  }, [endCall, toggleCamera, toggleMute]);

  useEffect(() => {
    if (!pipControlsChangeRef.current) return;
    pipControlsChangeRef.current({
      toggleMute: () => {
        pipActionFnsRef.current.toggleMute();
      },
      endCall: () => {
        void pipActionFnsRef.current.endCall();
      },
      toggleCamera: () => {
        pipActionFnsRef.current.toggleCamera();
      },
    });

    return () => {
      pipControlsChangeRef.current?.(null);
    };
  }, []);

  useEffect(() => {
    if (existingCallId || !user?.id || callId || createCallFiredRef.current) return;
    createCallFiredRef.current = true;
    const create = async () => {
      // Preflight local media first. If caller cannot access required devices,
      // do not create a ringing signal on the remote side.
      try {
        const preflightStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        preflightStream.getTracks().forEach((track) => track.stop());
      } catch (mediaErr) {
        handleCallFailure(classifyWebRTCFailure(mediaErr, callType));
        onEnd();
        return;
      }

      const nowIso = new Date().toISOString();
      const stalePairWindow = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      // Always create a fresh outgoing call ID. Before doing so, close any
      // stale open rows for this same caller/callee pair.
      const { data: openPairCalls } = await (supabase as any)
        .from("call_signals")
        .select("id, status")
        .eq("caller_id", user.id)
        .eq("callee_id", recipientId)
        .in("status", ["ringing", "answered"])
        .is("ended_at", null)
        .gte("created_at", stalePairWindow)
        .order("created_at", { ascending: false })
        .limit(10);

      const staleRingingPairIds = (openPairCalls || [])
        .filter((row: any) => row.status === "ringing")
        .map((row: any) => row.id);

      const staleAnsweredPairIds = (openPairCalls || [])
        .filter((row: any) => row.status === "answered")
        .map((row: any) => row.id);

      if (staleRingingPairIds.length) {
        await (supabase as any)
          .from("call_signals")
          .update({ status: "missed", ended_at: nowIso })
          .in("id", staleRingingPairIds)
          .eq("status", "ringing");
      }

      if (staleAnsweredPairIds.length) {
        await (supabase as any)
          .from("call_signals")
          .update({ status: "ended", ended_at: nowIso })
          .in("id", staleAnsweredPairIds)
          .eq("status", "answered");
      }

      const nowMs = Date.now();
      const minCreatedAt = new Date(nowMs - 12 * 60 * 60 * 1000).toISOString();
      const ringingStaleMs = 90 * 1000;
      const answeredWithoutStartStaleMs = 90 * 1000;
      const answeredStaleMs = 3 * 60 * 60 * 1000;

      const { data: possibleActiveCalls } = await (supabase as any)
        .from("call_signals")
        .select("id, caller_id, callee_id, status, created_at, started_at")
        .or(`caller_id.eq.${recipientId},callee_id.eq.${recipientId}`)
        .in("status", ["ringing", "answered"])
        .is("ended_at", null)
        .gte("created_at", minCreatedAt)
        .order("created_at", { ascending: false })
        .limit(10);

      const candidateIds = (possibleActiveCalls || []).map((row: any) => row.id).filter(Boolean);
      const historicalSignalIds = new Set<string>();

      if (candidateIds.length) {
        const { data: existingHistoryRows } = await (supabase as any)
          .from("call_history")
          .select("call_signal_id")
          .in("call_signal_id", candidateIds)
          .limit(50);

        for (const row of existingHistoryRows || []) {
          if (row?.call_signal_id) {
            historicalSignalIds.add(row.call_signal_id);
          }
        }
      }

      const staleMissedIds: string[] = [];
      const staleEndedIds: string[] = [];

      const activeForRecipient = (possibleActiveCalls || []).find((row: any) => {
        const otherPartyId = row.caller_id === recipientId ? row.callee_id : row.caller_id;

        // Ignore rows that are only between current user and this recipient;
        // those are handled via stale-pair cleanup and should not trigger busy.
        if (otherPartyId === user.id) {
          return false;
        }

        const createdMs = new Date(row.created_at).getTime();
        const startedMs = row.started_at ? new Date(row.started_at).getTime() : null;
        const hasHistory = historicalSignalIds.has(row.id);

        const isStaleRinging = row.status === "ringing" && (hasHistory || nowMs - createdMs > ringingStaleMs);
        const isStaleAnswered = row.status === "answered" && (
          hasHistory
          || (!startedMs && nowMs - createdMs > answeredWithoutStartStaleMs)
          || (startedMs ? nowMs - startedMs > answeredStaleMs : false)
        );

        if (isStaleRinging) {
          staleMissedIds.push(row.id);
          return false;
        }

        if (isStaleAnswered) {
          staleEndedIds.push(row.id);
          return false;
        }

        return true;
      });

      if (staleMissedIds.length) {
        await (supabase as any)
          .from("call_signals")
          .update({ status: "missed", ended_at: new Date().toISOString() })
          .in("id", staleMissedIds)
          .eq("status", "ringing");
      }

      if (staleEndedIds.length) {
        await (supabase as any)
          .from("call_signals")
          .update({ status: "ended", ended_at: new Date().toISOString() })
          .in("id", staleEndedIds)
          .eq("status", "answered");
      }

      if (activeForRecipient?.id) {
        toast.info("User is busy", { description: "They are currently in another call." });
        await (supabase as any).from("call_history").insert({
          caller_id: user.id,
          callee_id: recipientId,
          call_type: callType,
          status: "busy",
          duration_seconds: 0,
        });

        await (supabase as any).from("direct_messages").insert({
          sender_id: user.id,
          receiver_id: recipientId,
          message: `${callType === "video" ? "Video" : "Voice"} call attempt (busy)`,
          message_type: "text",
        });

        onEnd();
        return;
      }

      const { data, error } = await (supabase as any).from("call_signals").insert({
        caller_id: user.id,
        callee_id: recipientId,
        call_type: callType,
      }).select("id").single();

      if (error) {
        console.error("[Call] Failed to create call signal:", error);
        toast.error("Failed to start call");
        onEnd();
        return;
      }

      if (data?.id) {
        setCallId(data.id);
        reminderPushSentRef.current = false;
        await sendIncomingCallPush(data.id);
      }
    };
    void create();
  }, [user?.id, recipientId, callType, existingCallId, callId, onEnd, sendIncomingCallPush]);

  useEffect(() => {
    if (role !== "caller" || !callId || callState !== "ringing" || remoteAccepted || reminderPushSentRef.current) return;

    const reminderTimer = window.setTimeout(() => {
      (async () => {
        const { data } = await (supabase as any)
          .from("call_signals")
          .select("status")
          .eq("id", callId)
          .maybeSingle();

        if (data?.status !== "ringing") return;
        reminderPushSentRef.current = true;
        await sendIncomingCallPush(callId, "reminder");
      })();
    }, 12000);

    return () => window.clearTimeout(reminderTimer);
  }, [callId, callState, remoteAccepted, role, sendIncomingCallPush]);

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
    if (role !== "caller" || callState !== "ringing" || remoteAccepted || !callId) return;
    const stopRingback = playOutgoingRingback();
    return () => { stopRingback(); };
  }, [role, callId, callState, remoteAccepted]);

  useEffect(() => {
    if (role !== "caller" || callState !== "ringing" || remoteAccepted || !callId) return;

    const timeout = window.setTimeout(() => {
      (async () => {
        const { data: liveCall } = await (supabase as any)
          .from("call_signals")
          .select("status")
          .eq("id", callId)
          .maybeSingle();

        // Guard race: if callee already accepted around timeout boundary,
        // do not force a no-answer hangup.
        if (liveCall?.status !== "ringing") return;

        const { data: markedMissed } = await (supabase as any).from("call_signals")
          .update({ status: "missed", ended_at: new Date().toISOString() })
          .eq("id", callId)
          .eq("status", "ringing")
          .select("id")
          .maybeSingle();

        if (!markedMissed?.id) return;

        endReasonRef.current = "no_answer";
        toast.info("No answer", { description: "Call ended after 45 seconds." });
        await endCall();
      })();
    }, 45000);

    return () => window.clearTimeout(timeout);
  }, [callId, callState, endCall, remoteAccepted, role]);

  useEffect(() => {
    if (role !== "caller" || !callId) return;
    const channel = supabase
      .channel(`caller-watch-${callId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "call_signals",
        filter: `id=eq.${callId}`,
      }, (payload: any) => {
        if (payload.new.status === "answered") {
          setRemoteAccepted(true);
          return;
        }
        if (payload.new.status === "declined") {
          endReasonRef.current = "declined";
          void endCall();
          return;
        }
        if (payload.new.status === "missed") {
          if (remoteAccepted || callState === "connected") {
            return;
          }
          endReasonRef.current = "no_answer";
          void endCall();
          return;
        }
        if (payload.new.status === "ended") {
          void endCall();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [role, callId, callState, endCall, remoteAccepted]);

  useEffect(() => {
    if (role !== "caller" || !callId || callState === "ended") return;

    const intervalId = window.setInterval(() => {
      (async () => {
        const { data } = await (supabase as any)
          .from("call_signals")
          .select("status")
          .eq("id", callId)
          .maybeSingle();

        const status = data?.status;
        if (status === "answered") {
          setRemoteAccepted(true);
          return;
        }

        if (status === "declined") {
          endReasonRef.current = "declined";
          await endCall();
          return;
        }

        if (status === "missed" && !(remoteAccepted || callState === "connected")) {
          endReasonRef.current = "no_answer";
          await endCall();
          return;
        }

        if (status === "ended") {
          await endCall();
        }
      })();
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [role, callId, callState, endCall, remoteAccepted]);

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
        ? remoteAccepted
          ? "Connecting..."
          : callType === "video" ? "Video calling..." : "Calling..."
        : "Connecting..."
      : callState === "connected"
        ? formatDuration(duration)
        : "Call ended";

  const handleOpenChat = useCallback(() => {
    onMinimize?.({
      remoteStream: remoteStreamRef.current,
      duration,
      isMuted,
      callType,
      isCameraOff,
    });

    navigate("/chat", {
      state: {
        openChat: {
          recipientId,
          recipientName,
          recipientAvatar,
        },
      },
    });
  }, [callType, duration, isCameraOff, isMuted, navigate, onMinimize, recipientAvatar, recipientId, recipientName]);

  useEffect(() => {
    if (!minimized || !pipStateChangeRef.current) return;
    pipStateChangeRef.current({
      remoteStream: remoteStreamRef.current,
      duration,
      isMuted,
      callType,
      isCameraOff,
    });
  }, [callType, duration, isCameraOff, isMuted, minimized]);

  // Flip camera (switch front/back on mobile)
  const handleFlipCamera = useCallback(async () => {
    const stream = localStream?.current ?? localStream;
    if (!stream || !(stream instanceof MediaStream)) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    const constraints = videoTrack.getConstraints();
    const currentFacing = (constraints as any).facingMode;
    const newFacing = currentFacing === "environment" ? "user" : "environment";
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      if (peerConnection?.current) {
        const sender = peerConnection.current.getSenders().find((s: any) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(newTrack);
      }
      stream.removeTrack(videoTrack);
      videoTrack.stop();
      stream.addTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch { /* not supported */ }
  }, [localStream, peerConnection]);

  if (minimized) {
    return null;
  }

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

  // Full-screen video layout
    const constraints = videoTrack.getConstraints();
    const currentFacing = (constraints as any).facingMode;
    const newFacing = currentFacing === "environment" ? "user" : "environment";
    try {

  // Full-screen video layout
  if (callType === "video") {
    return (
      <motion.div
        className="fixed inset-0 z-[60] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Remote video — full screen background */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-5 flex items-center justify-between z-20"
          style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 1rem)" }}>
          <CallQualityBadge stats={qualityStats} />
          <div className="flex items-center gap-2">
            {onMinimize && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onMinimize({ remoteStream: remoteStreamRef.current, duration, isMuted, callType, isCameraOff })}
                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"
              >
                <Minimize2 className="h-4 w-4 text-white/80" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Caller info overlay — top center */}
        <div className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center"
          style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 3.5rem), 4.5rem)" }}>
          <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">{recipientName}</h2>
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mt-0.5 font-medium ${callState === "connected" ? "text-emerald-400 tabular-nums" : "text-white/70"}`}
          >
            {statusText}
          </motion.p>
          {callState === "ringing" && (
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.3, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
          {isReconnecting && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-200">
              <WifiOff className="h-3.5 w-3.5" /> Reconnecting call...
            </div>
          )}
        </div>

        {/* Screen share badge */}
        {screenShare.isSharing && (
          <div className="absolute top-20 left-5 z-20 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold flex items-center gap-1.5 shadow-lg">
            <Monitor className="w-3 h-3" /> Sharing screen
          </div>
        )}

        {/* Local video — draggable PiP */}
        {!isCameraOff && (
          <motion.div
            drag
            dragMomentum={false}
            className="absolute bottom-36 right-4 cursor-grab active:cursor-grabbing z-20"
          >
            <div className="relative">
              <video ref={localVideoRef} autoPlay playsInline muted
                className="w-[110px] h-[150px] rounded-2xl border-2 border-white/20 object-cover shadow-2xl" />
              {/* Flip camera mini-button on PiP */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleFlipCamera}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <SwitchCamera className="h-3.5 w-3.5 text-white/80" />
              </motion.button>
            </div>
          </motion.div>
        )}

        <audio ref={remoteAudioRef} autoPlay playsInline className="absolute h-0 w-0 opacity-0 pointer-events-none" />

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4"
          style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 0.75rem), 1.25rem)" }}>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 px-4 py-4 shadow-2xl">
            <div className="flex items-center justify-around">
              {/* Mute */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={toggleMute}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isMuted ? "bg-white/25 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </motion.button>
                <span className="text-[10px] text-white/50 font-medium">{isMuted ? "Unmute" : "Mute"}</span>
              </div>

              {/* Camera */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={toggleCamera}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isCameraOff ? "bg-white/25 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </motion.button>
                <span className="text-[10px] text-white/50 font-medium">{isCameraOff ? "Start" : "Stop"}</span>
              </div>

              {/* Reactions */}
              <div className="flex flex-col items-center gap-1.5">
                <CallReactions variant="dark" />
                <span className="text-[10px] text-white/50 font-medium">React</span>
              </div>

              {/* Screen Share */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={screenShare.toggleSharing}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    screenShare.isSharing ? "bg-emerald-500/30 text-emerald-400" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {screenShare.isSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </motion.button>
                <span className="text-[10px] text-white/50 font-medium">Screen</span>
              </div>

              {/* End Call */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => { void endCall(); }}
                  className="h-14 w-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/40"
                >
                  <PhoneOff className="h-6 w-6" />
                </motion.button>
                <span className="text-[10px] text-white/50 font-medium">End</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Voice call layout — FaceTime 2026 style
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
        background: "linear-gradient(165deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.4) 50%, hsl(var(--primary) / 0.08) 100%)",
      }}
    >
      {/* Ambient blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-5 flex items-center justify-between z-10"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 1rem)" }}>
        <CallQualityBadge stats={qualityStats} />
        <div className="flex items-center gap-2">
          {onMinimize && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onMinimize({ remoteStream: remoteStreamRef.current, duration, isMuted, callType, isCameraOff })}
              className="h-10 w-10 rounded-full bg-foreground/5 backdrop-blur-xl flex items-center justify-center border border-border/10"
            >
              <Minimize2 className="h-4 w-4 text-foreground/60" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Caller info */}
      <div className="flex flex-col items-center gap-4 mt-14 px-6 relative z-[1]">
        <div className="relative">
          {callState === "ringing" && (
            <>
              <motion.div className="absolute -inset-5 rounded-full"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="absolute -inset-10 rounded-full"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }} />
              <motion.div className="absolute -inset-16 rounded-full"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04), transparent 70%)" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 1, ease: "easeInOut" }} />
            </>
          )}
          {callState === "connected" && (
            <motion.div className="absolute -inset-2 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <Avatar className="h-36 w-36 border-4 border-primary/8 shadow-2xl relative z-[1]">
            <AvatarImage src={recipientAvatar || undefined} />
            <AvatarFallback className="text-5xl font-bold bg-primary/5 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center mt-3">
          <h2 className="text-[28px] font-bold text-foreground tracking-tight">{recipientName}</h2>
          <motion.p key={statusText} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`text-[15px] mt-1 font-semibold ${callState === "connected" ? "text-primary tabular-nums" : "text-muted-foreground"}`}>
            {statusText}
          </motion.p>
        </div>
        {callState === "ringing" && (
          <div className="flex gap-2 mt-1">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="h-2.5 w-2.5 rounded-full bg-primary/60"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.4, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }} />
            ))}
          </div>
        )}
        {isReconnecting && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-semibold text-amber-600 border border-amber-500/10">
            <WifiOff className="h-3.5 w-3.5" /> Reconnecting...
          </div>
        )}
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="absolute h-0 w-0 opacity-0 pointer-events-none" />
      <div className="flex-1" />

      {/* Controls — FaceTime glassmorphic pill */}
      <div className="w-full px-5 pb-4 relative z-[1]">
        <div className="bg-foreground/[0.04] backdrop-blur-2xl rounded-[28px] border border-border/10 px-5 py-5 shadow-xl">
          <div className="flex items-end justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={toggleMute}
                className={`h-[54px] w-[54px] rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-foreground/90 text-background shadow-lg"
                    : "bg-foreground/[0.06] text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </motion.button>
              <span className="text-[10px] text-muted-foreground/70 font-medium">{isMuted ? "Unmute" : "Mute"}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`h-[54px] w-[54px] rounded-full flex items-center justify-center transition-all ${
                  isSpeaker
                    ? "bg-foreground/90 text-background shadow-lg"
                    : "bg-foreground/[0.06] text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                <Volume2 className="h-5 w-5" />
              </motion.button>
              <span className="text-[10px] text-muted-foreground/70 font-medium">Speaker</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleOpenChat}
                className="h-[54px] w-[54px] rounded-full flex items-center justify-center transition-all bg-foreground/[0.06] text-foreground/60 hover:bg-foreground/10"
              >
                <MessageCircle className="h-5 w-5" />
              </motion.button>
              <span className="text-[10px] text-muted-foreground/70 font-medium">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { void endCall(); }}
                className="h-[60px] w-[60px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/30"
              >
                <PhoneOff className="h-6 w-6" />
              </motion.button>
              <span className="text-[10px] text-muted-foreground/70 font-medium">End</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
