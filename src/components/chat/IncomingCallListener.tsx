/**
 * IncomingCallListener — Global listener for incoming WebRTC calls
 * Shows a banner when another user calls, allowing accept/decline
 * Plays a ringtone sound while ringing
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import CallScreen from "./CallScreen";

/** Creates a repeating ringtone using Web Audio API */
function createRingtone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(ctx.destination);

    let stopped = false;
    let currentOsc: OscillatorNode | null = null;
    let timeout: ReturnType<typeof setTimeout>;

    const playTone = (freq: number, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopped) { resolve(); return; }
        const osc = ctx.createOscillator();
        currentOsc = osc;
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start();
        timeout = setTimeout(() => {
          osc.stop();
          osc.disconnect();
          currentOsc = null;
          resolve();
        }, duration);
      });
    };

    const ringLoop = async () => {
      while (!stopped) {
        await playTone(440, 400);
        if (stopped) break;
        await new Promise(r => { timeout = setTimeout(r, 100); });
        if (stopped) break;
        await playTone(480, 400);
        if (stopped) break;
        await new Promise(r => { timeout = setTimeout(r, 1500); });
      }
    };

    ringLoop();

    return () => {
      stopped = true;
      clearTimeout(timeout);
      try { currentOsc?.stop(); } catch {}
      try { ctx.close(); } catch {}
    };
  } catch {
    return () => {};
  }
}

interface IncomingCall {
  id: string;
  caller_id: string;
  call_type: "voice" | "video";
  caller_name: string;
  caller_avatar: string | null;
}

export default function IncomingCallListener() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [answeredCall, setAnsweredCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`incoming-calls-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "call_signals",
        filter: `callee_id=eq.${user.id}`,
      }, async (payload: any) => {
        const call = payload.new;
        if (call.status !== "ringing") return;

        // Fetch caller profile info
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", call.caller_id)
          .single();

        setIncoming({
          id: call.id,
          caller_id: call.caller_id,
          call_type: call.call_type,
          caller_name: profile?.full_name || "Unknown",
          caller_avatar: profile?.avatar_url || null,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Also listen for call ended/declined while ringing
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

  const handleAccept = useCallback(() => {
    if (!incoming) return;
    setAnsweredCall(incoming);
    setIncoming(null);
  }, [incoming]);

  const handleDecline = useCallback(async () => {
    if (!incoming) return;
    await (supabase as any).from("call_signals")
      .update({ status: "declined", ended_at: new Date().toISOString() })
      .eq("id", incoming.id);
    setIncoming(null);
  }, [incoming]);

  const handleCallEnd = useCallback(() => {
    setAnsweredCall(null);
  }, []);

  const initials = incoming
    ? (incoming.caller_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <>
      {/* Incoming call banner */}
      <AnimatePresence>
        {incoming && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[70] px-4"
            initial={{ y: -120 }}
            animate={{ y: 0 }}
            exit={{ y: -120 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)" }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/30">
                <AvatarImage src={incoming.caller_avatar || undefined} />
                <AvatarFallback className="text-sm font-bold bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {incoming.caller_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Incoming {incoming.call_type} call...
                </p>
              </div>
              {/* Decline */}
              <button
                onClick={handleDecline}
                className="h-12 w-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform"
              >
                <PhoneOff className="h-5 w-5" />
              </button>
              {/* Accept */}
              <button
                onClick={handleAccept}
                className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                {incoming.call_type === "video" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active answered call */}
      <AnimatePresence>
        {answeredCall && (
          <CallScreen
            recipientName={answeredCall.caller_name}
            recipientAvatar={answeredCall.caller_avatar}
            recipientId={answeredCall.caller_id}
            callType={answeredCall.call_type}
            existingCallId={answeredCall.id}
            onEnd={handleCallEnd}
          />
        )}
      </AnimatePresence>
    </>
  );
}
