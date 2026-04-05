/**
 * IncomingCallListener — Global listener for incoming WebRTC calls
 * Shows a banner when another user calls, allowing accept/decline
 * Plays a ringtone sound while ringing
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, PhoneOff, Video, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import CallScreen from "./CallScreen";
import CallPiP from "./CallPiP";
import { playIncomingRingtone, primeCallAudio, registerCallAudioUnlock } from "@/lib/callAudio";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { toast } from "sonner";

interface IncomingCall {
  id: string;
  caller_id: string;
  call_type: "voice" | "video";
  caller_name: string;
  caller_avatar: string | null;
}

interface IncomingCallPushDetail {
  call_id?: string;
  caller_id?: string;
  call_type?: "voice" | "video";
  caller_name?: string;
  caller_avatar?: string;
}

export default function IncomingCallListener() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [answeredCall, setAnsweredCall] = useState<IncomingCall | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [pipMode, setPipMode] = useState(false);
  const [pipData, setPipData] = useState<{ remoteStream: MediaStream | null; duration: number; isMuted: boolean; callType: "voice" | "video"; isCameraOff: boolean } | null>(null);
  const [pipControls, setPipControls] = useState<{ toggleMute: () => void; endCall: () => void; toggleCamera: () => void } | null>(null);
  const lastIncomingCallIdRef = useRef<string | null>(null);
  const originalTitleRef = useRef<string>(typeof document !== "undefined" ? document.title : "Zivo");
  const titleFlashTimerRef = useRef<number | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const mapIncomingCall = useCallback(async (call: { id: string; caller_id: string; call_type: "voice" | "video" }) => {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("full_name, avatar_url")
      .or(`id.eq.${call.caller_id},user_id.eq.${call.caller_id}`)
      .limit(1)
      .maybeSingle();

    return {
      id: call.id,
      caller_id: call.caller_id,
      call_type: call.call_type,
      caller_name: profile?.full_name || "Unknown",
      caller_avatar: profile?.avatar_url || null,
    } as IncomingCall;
  }, []);

  const hydratePendingIncomingCall = useCallback(async (preferredCallId?: string) => {
    if (!user?.id || incoming || answeredCall) return;

    let pendingCall: { id: string; caller_id: string; call_type: "voice" | "video" } | null = null;

    if (preferredCallId) {
      const { data } = await (supabase as any)
        .from("call_signals")
        .select("id, caller_id, call_type, status")
        .eq("id", preferredCallId)
        .eq("callee_id", user.id)
        .maybeSingle();

      if (data?.status === "ringing") {
        pendingCall = data;
      }
    }

    if (!pendingCall) {
      const minCreatedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("call_signals")
        .select("id, caller_id, call_type, created_at")
        .eq("callee_id", user.id)
        .eq("status", "ringing")
        .gte("created_at", minCreatedAt)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      pendingCall = data || null;
    }

    if (!pendingCall?.id) return;
    const mapped = await mapIncomingCall(pendingCall);
    setIncoming(mapped);
  }, [answeredCall, incoming, mapIncomingCall, user?.id]);

  useEffect(() => registerCallAudioUnlock(), []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingIncomingCallPush");
      if (!raw) return;

      sessionStorage.removeItem("pendingIncomingCallPush");
      const parsed = JSON.parse(raw) as IncomingCallPushDetail & { ts?: number };

      if (!parsed || typeof parsed !== "object") return;

      // Ignore stale pending payloads.
      if (parsed.ts && Date.now() - parsed.ts > 90_000) return;

      window.dispatchEvent(new CustomEvent("incoming-call-push", {
        detail: {
          call_id: parsed.call_id,
          caller_id: parsed.caller_id,
          call_type: parsed.call_type,
          caller_name: parsed.caller_name,
          caller_avatar: parsed.caller_avatar,
        },
      }));
    } catch {
      sessionStorage.removeItem("pendingIncomingCallPush");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const onSignal = async (payload: any) => {
      const call = payload.new;
      if (!call || call.status !== "ringing") return;

      if (answeredCall) {
        // If this update belongs to the active call we already accepted,
        // ignore it instead of force-declining the same call.
        if (answeredCall.id === call.id) {
          return;
        }

        await (supabase as any).from("call_signals")
          .update({ status: "declined", ended_at: new Date().toISOString() })
          .eq("id", call.id)
          .eq("status", "ringing");
        return;
      }

      const mapped = await mapIncomingCall(call);
      setIncoming(mapped);
    };

    const channel = supabase
      .channel(`incoming-calls-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "call_signals",
        filter: `callee_id=eq.${user.id}`,
      }, onSignal)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "call_signals",
        filter: `callee_id=eq.${user.id}`,
      }, onSignal)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [answeredCall, mapIncomingCall, user?.id]);

  useEffect(() => {
    void hydratePendingIncomingCall();
  }, [hydratePendingIncomingCall]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void hydratePendingIncomingCall();
      }
    };

    const onFocus = () => {
      void hydratePendingIncomingCall();
    };

    const onOnline = () => {
      void hydratePendingIncomingCall();
    };

    const onPageShow = () => {
      void hydratePendingIncomingCall();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [hydratePendingIncomingCall]);

  useEffect(() => {
    if (!user?.id) return;
    const timer = window.setInterval(() => {
      void hydratePendingIncomingCall();
    }, 4000);

    return () => window.clearInterval(timer);
  }, [hydratePendingIncomingCall, user?.id]);

  useEffect(() => {
    const onIncomingCallPush = (event: Event) => {
      const customEvent = event as CustomEvent<IncomingCallPushDetail>;
      const detail = customEvent.detail || {};
      const pushedCallId = detail.call_id || null;

      if (pushedCallId && lastIncomingCallIdRef.current === pushedCallId) return;

      if (pushedCallId && detail.caller_id && detail.call_type) {
        lastIncomingCallIdRef.current = pushedCallId;
        setIncoming((prev) => {
          if (prev?.id === pushedCallId) return prev;
          return {
            id: pushedCallId,
            caller_id: detail.caller_id!,
            call_type: detail.call_type!,
            caller_name: detail.caller_name || "Incoming call",
            caller_avatar: detail.caller_avatar || null,
          };
        });
      }

      void hydratePendingIncomingCall(pushedCallId || undefined);
    };

    window.addEventListener("incoming-call-push", onIncomingCallPush as EventListener);
    return () => {
      window.removeEventListener("incoming-call-push", onIncomingCallPush as EventListener);
    };
  }, [hydratePendingIncomingCall]);

  useEffect(() => {
    if (!incoming) return;
    const stopRing = playIncomingRingtone();
    return () => { stopRing(); };
  }, [incoming?.id]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!incoming) {
      if (titleFlashTimerRef.current) {
        clearInterval(titleFlashTimerRef.current);
        titleFlashTimerRef.current = null;
      }
      document.title = originalTitleRef.current;
      return;
    }

    originalTitleRef.current = document.title;
    let toggle = false;

    const applyTitle = () => {
      document.title = toggle
        ? `${incoming.call_type === "video" ? "Video" : "Voice"} call from ${incoming.caller_name}`
        : `Incoming ${incoming.call_type} call`;
      toggle = !toggle;
    };

    applyTitle();
    titleFlashTimerRef.current = window.setInterval(applyTitle, 1200);

    return () => {
      if (titleFlashTimerRef.current) {
        clearInterval(titleFlashTimerRef.current);
        titleFlashTimerRef.current = null;
      }
      document.title = originalTitleRef.current;
    };
  }, [incoming?.call_type, incoming?.caller_name, incoming?.id]);

  useEffect(() => {
    if (!incoming || Capacitor.isNativePlatform() || typeof navigator === "undefined" || !("vibrate" in navigator)) return;

    navigator.vibrate?.([250, 150, 250, 900]);
    const intervalId = window.setInterval(() => {
      navigator.vibrate?.([250, 150, 250, 900]);
    }, 2200);

    return () => {
      window.clearInterval(intervalId);
      navigator.vibrate?.(0);
    };
  }, [incoming?.id]);

  useEffect(() => {
    if (!incoming || !Capacitor.isNativePlatform()) return;

    const intervalId = window.setInterval(() => {
      void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [incoming?.id]);

  useEffect(() => {
    if (!incoming) return;

    // Auto-mark unanswered calls as missed after 45 seconds.
    const timeout = window.setTimeout(() => {
      (async () => {
        await (supabase as any).from("call_signals")
          .update({ status: "missed", ended_at: new Date().toISOString() })
          .eq("id", incoming.id)
          .eq("status", "ringing");
        setIncoming(null);
      })();
    }, 45000);

    return () => window.clearTimeout(timeout);
  }, [incoming]);

  useEffect(() => {
    if (!incoming) return;

    const channel = supabase
      .channel(`incoming-status-${incoming.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "call_signals",
        filter: `id=eq.${incoming.id}`,
      }, (payload: any) => {
        const data = payload.new;
        if (data.status === "ended" || data.status === "declined") {
          setIncoming(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [incoming?.id]);

  const handleAccept = useCallback(async () => {
    if (!incoming || isAccepting) return;
    setIsAccepting(true);

    try {
      await primeCallAudio();
    } catch {
      // Continue anyway. Audio unlock failure should not block call accept.
    }

    const { error: updateError } = await (supabase as any).from("call_signals")
      .update({ status: "answered" })
      .eq("id", incoming.id)
      .eq("callee_id", user?.id)
      .in("status", ["ringing", "answered"]);

    if (updateError) {
      console.error("[Call] Failed to accept incoming call:", updateError);
      toast.error("Could not answer call", { description: "Please try again." });
      setIsAccepting(false);
      return;
    }

    let confirmedStatus: string | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const { data: statusCheck } = await (supabase as any)
        .from("call_signals")
        .select("status")
        .eq("id", incoming.id)
        .eq("callee_id", user?.id)
        .maybeSingle();

      const nextStatus = statusCheck?.status ?? null;
      if (nextStatus === "answered") {
        confirmedStatus = nextStatus;
        break;
      }

      if (nextStatus === "declined" || nextStatus === "missed" || nextStatus === "ended") {
        confirmedStatus = nextStatus;
        break;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 220));
    }

    if (confirmedStatus === "answered") {
      lastIncomingCallIdRef.current = incoming.id;
      setAnsweredCall(incoming);
      setIncoming(null);
      setIsAccepting(false);
      return;
    }

    if (confirmedStatus === "declined" || confirmedStatus === "missed" || confirmedStatus === "ended") {
      setIncoming(null);
      setIsAccepting(false);
      return;
    }

    toast.error("Call answer did not sync", {
      description: "Please answer again. Network may be unstable.",
    });
    setIsAccepting(false);
  }, [incoming, isAccepting, user?.id]);

  const handleDecline = useCallback(async () => {
    if (!incoming) return;
    await (supabase as any).from("call_signals")
      .update({ status: "declined", ended_at: new Date().toISOString() })
      .eq("id", incoming.id);
    setIncoming(null);
  }, [incoming]);

  const handleCallEnd = useCallback(() => {
    setAnsweredCall(null);
    setPipMode(false);
    setPipData(null);
    setPipControls(null);
  }, []);

  const initials = incoming
    ? (incoming.caller_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  const incomingOverlay = (
    <AnimatePresence>
      {incoming && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-md flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/92 p-6 shadow-2xl"
            initial={{ y: 24, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col items-center text-center gap-3">
              <div className="relative">
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
                  <AvatarImage src={incoming.caller_avatar || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground leading-tight">
                  {incoming.caller_name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Incoming {incoming.call_type} call
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Tap answer to join</span>
              </div>

              <div className="w-full mt-2 flex items-center justify-center gap-6">
                <button
                  onClick={handleDecline}
                  aria-label="Decline incoming call"
                  title="Decline"
                  className="h-14 w-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform shadow-md"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  aria-label="Accept incoming call"
                  title="Accept"
                  className="h-14 w-14 rounded-full bg-green-500 text-white flex items-center justify-center active:scale-90 transition-transform shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {incoming.call_type === "video" ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <Phone className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="w-full flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                <span>Decline</span>
                <span>Answer</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const activeCallOverlay = (
    <AnimatePresence>
      {answeredCall && (
        <CallScreen
          recipientName={answeredCall.caller_name}
          recipientAvatar={answeredCall.caller_avatar}
          recipientId={answeredCall.caller_id}
          callType={answeredCall.call_type}
          existingCallId={answeredCall.id}
          minimized={pipMode}
          onEnd={handleCallEnd}
          onMinimize={(data) => {
            setPipData(data);
            setPipMode(true);
          }}
          onPipStateChange={(data) => {
            setPipData(data);
          }}
          onPipControlsChange={(controls) => {
            setPipControls(controls);
          }}
        />
      )}
    </AnimatePresence>
  );

  const pipOverlay = (
    <AnimatePresence>
      {answeredCall && pipMode && (
        <CallPiP
          remoteStream={pipData?.remoteStream || null}
          recipientName={answeredCall.caller_name}
          isMuted={pipData?.isMuted || false}
          duration={pipData?.duration || 0}
          callType={pipData?.callType || answeredCall.call_type}
          isCameraOff={pipData?.isCameraOff}
          onExpand={() => setPipMode(false)}
          onEndCall={() => {
            if (pipControls) {
              pipControls.endCall();
              return;
            }

            handleCallEnd();
          }}
          onToggleMute={() => {
            pipControls?.toggleMute();
          }}
          onToggleCamera={() => {
            if ((pipData?.callType || answeredCall.call_type) === "video") {
              pipControls?.toggleCamera();
            }
          }}
        />
      )}
    </AnimatePresence>
  );

  if (!portalRoot) {
    return (
      <>
        {incomingOverlay}
        {activeCallOverlay}
        {pipOverlay}
      </>
    );
  }

  return (
    <>
      {createPortal(incomingOverlay, portalRoot)}
      {createPortal(activeCallOverlay, portalRoot)}
      {createPortal(pipOverlay, portalRoot)}
    </>
  );
}
