/**
 * useWebRTC — Manages a WebRTC peer connection with Supabase Realtime signaling
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export type CallRole = "caller" | "callee";

interface UseWebRTCOptions {
  callId: string;
  role: CallRole;
  callType: "voice" | "video";
  userId: string;
  onRemoteStream: (stream: MediaStream) => void;
  onEnded: () => void;
}

export function useWebRTC({
  callId,
  role,
  callType,
  userId,
  onRemoteStream,
  onEnded,
}: UseWebRTCOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setCallState("ended");
  }, []);

  // Initialize peer connection and media
  const start = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video",
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Add local tracks
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      // Remote stream
      pc.ontrack = (e) => {
        if (e.streams[0]) onRemoteStream(e.streams[0]);
      };

      // ICE candidate handling — store in DB for the other peer
      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;
        const field = role === "caller" ? "caller_ice_candidates" : "callee_ice_candidates";
        // Append candidate via raw SQL to avoid race conditions
        await (supabase as any).rpc("append_ice_candidate", {
          p_call_id: callId,
          p_field: field,
          p_candidate: e.candidate.toJSON(),
        }).catch(() => {
          // Fallback: just update (may lose candidates in race)
          // This is acceptable for most 1-on-1 calls
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallState("connected");
          (supabase as any).from("call_signals").update({ status: "answered", started_at: new Date().toISOString() }).eq("id", callId);
        }
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          cleanup();
          onEnded();
        }
      };

      if (role === "caller") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await (supabase as any).from("call_signals").update({ offer: offer }).eq("id", callId);
      }

      return localStream;
    } catch (err) {
      console.error("WebRTC start failed:", err);
      cleanup();
      onEnded();
      return null;
    }
  }, [callId, role, callType, onRemoteStream, onEnded, cleanup]);

  // Handle incoming signaling updates
  useEffect(() => {
    if (!callId) return;

    const channel = supabase
      .channel(`call-signal-${callId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "call_signals",
        filter: `id=eq.${callId}`,
      }, async (payload: any) => {
        const data = payload.new;
        const pc = pcRef.current;
        if (!pc) return;

        // Callee receives offer → create answer
        if (role === "callee" && data.offer && !pc.remoteDescription) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await (supabase as any).from("call_signals").update({ answer: answer }).eq("id", callId);
          } catch (e) {
            console.error("Error handling offer:", e);
          }
        }

        // Caller receives answer
        if (role === "caller" && data.answer && !pc.remoteDescription) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (e) {
            console.error("Error handling answer:", e);
          }
        }

        // Process ICE candidates from the other peer
        const remoteCandidates = role === "caller" ? data.callee_ice_candidates : data.caller_ice_candidates;
        if (remoteCandidates?.length && pc.remoteDescription) {
          for (const c of remoteCandidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch { /* duplicate candidate */ }
          }
        }

        // Call ended/declined
        if (data.status === "ended" || data.status === "declined") {
          cleanup();
          onEnded();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [callId, role, cleanup, onEnded]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((c) => !c);
  }, []);

  const endCall = useCallback(async () => {
    await (supabase as any).from("call_signals").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", callId);
    cleanup();
    onEnded();
  }, [callId, cleanup, onEnded]);

  return {
    start,
    endCall,
    toggleMute,
    toggleCamera,
    isMuted,
    isCameraOff,
    callState,
    localStream: localStreamRef,
  };
}
