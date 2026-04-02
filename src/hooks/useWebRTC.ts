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

interface CallSignalData {
  offer?: RTCSessionDescriptionInit | null;
  answer?: RTCSessionDescriptionInit | null;
  caller_ice_candidates?: RTCIceCandidateInit[] | null;
  callee_ice_candidates?: RTCIceCandidateInit[] | null;
  status?: string | null;
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
  const addedCandidatesCount = useRef(0);
  const startedRef = useRef(false);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    addedCandidatesCount.current = 0;
    setCallState("ended");
    startedRef.current = false;
  }, []);

  const processSignalData = useCallback(async (data: CallSignalData) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.status === "ended" || data.status === "declined") {
      cleanup();
      onEnded();
      return;
    }

    if (role === "callee" && data.offer && !pc.remoteDescription) {
      try {
        await pc.setRemoteDescription(data.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await (supabase as any)
          .from("call_signals")
          .update({ answer: { type: answer.type, sdp: answer.sdp } })
          .eq("id", callId);
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    }

    if (role === "caller" && data.answer && !pc.remoteDescription) {
      try {
        await pc.setRemoteDescription(data.answer);
      } catch (e) {
        console.error("Error handling answer:", e);
      }
    }

    const remoteCandidates = role === "caller" ? data.callee_ice_candidates : data.caller_ice_candidates;
    if (remoteCandidates?.length && pc.remoteDescription) {
      const newCandidates = remoteCandidates.slice(addedCandidatesCount.current);
      for (const candidate of newCandidates) {
        try {
          await pc.addIceCandidate(candidate);
          addedCandidatesCount.current += 1;
        } catch {
          // duplicate or invalid candidate, skip
        }
      }
    }
  }, [callId, cleanup, onEnded, role]);

  const syncExistingSignal = useCallback(async (activeCallId: string) => {
    try {
      const { data } = await (supabase as any)
        .from("call_signals")
        .select("offer, answer, caller_ice_candidates, callee_ice_candidates, status")
        .eq("id", activeCallId)
        .single();

      if (data) {
        await processSignalData(data);
      }
    } catch (err) {
      console.warn("Signal sync failed:", err);
    }
  }, [processSignalData]);

  const start = useCallback(async (activeCallId: string) => {
    if (startedRef.current || !activeCallId) return null;
    startedRef.current = true;
    setCallState("ringing");

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video",
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.ontrack = (e) => {
        if (e.streams[0]) onRemoteStream(e.streams[0]);
      };

      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;
        const field = role === "caller" ? "caller_ice_candidates" : "callee_ice_candidates";
        try {
          await (supabase as any).rpc("append_ice_candidate", {
            p_call_id: activeCallId,
            p_field: field,
            p_candidate: e.candidate.toJSON(),
          });
        } catch (err: any) {
          console.warn("ICE candidate append failed:", err);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallState("connected");
          (supabase as any).from("call_signals")
            .update({ status: "answered", started_at: new Date().toISOString() })
            .eq("id", activeCallId)
            .then(() => {});
        }
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          cleanup();
          onEnded();
        }
      };

      if (role === "caller") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await (supabase as any).from("call_signals")
          .update({ offer: { type: offer.type, sdp: offer.sdp } })
          .eq("id", activeCallId);
      }

      await syncExistingSignal(activeCallId);
      return localStream;
    } catch (err) {
      console.error("WebRTC start failed:", err);
      cleanup();
      onEnded();
      return null;
    }
  }, [callType, cleanup, onEnded, onRemoteStream, role, syncExistingSignal]);

  useEffect(() => {
    if (!callId) return;

    const channel = supabase
      .channel(`call-signal-${callId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "call_signals",
        filter: `id=eq.${callId}`,
      }, (payload: any) => {
        void processSignalData(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [callId, processSignalData]);

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
    await (supabase as any).from("call_signals")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", callId);
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
    peerConnection: pcRef,
  };
}
