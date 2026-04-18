/**
 * LiveWebRTCVideo — Mesh-WebRTC viewer for any live_streams row.
 *
 * Same handshake as PairedStreamViewer, but reusable for the public watcher
 * page (LiveStreamPage). One <RTCPeerConnection> per viewer, signaled through
 * the existing `live_stream_signals` table + Supabase Realtime.
 *
 * Topology: 1 publisher (phone) → N viewers, mesh. Practical cap ~3-5 viewers
 * before the publisher's upstream bandwidth saturates. For larger audiences
 * an SFU is required.
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ICE_SERVERS,
  getIceServers,
  logSelectedCandidatePair,
  sendSignal,
  subscribeSignals,
} from "@/lib/liveWebrtc";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  streamId: string;
  /** Visual class for the underlying <video>. */
  className?: string;
  /** Whether to start audio muted (TikTok-style autoplay default). */
  muted?: boolean;
  /** Optional callback when the connection becomes "live". */
  onLive?: () => void;
};

type State =
  | "waiting-for-offer"
  | "negotiating"
  | "connecting"
  | "live"
  | "disconnected";

export default function LiveWebRTCVideo({
  streamId,
  className = "absolute inset-0 w-full h-full object-cover bg-black",
  muted = true,
  onLive,
}: Props) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<State>("waiting-for-offer");

  useEffect(() => {
    if (!streamId) return;

    let active = true;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let restartAttempted = false;
    const pendingIce: RTCIceCandidateInit[] = [];

    setState("waiting-for-offer");
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    // Upgrade to TURN as soon as the edge function returns.
    getIceServers().then((servers) => {
      if (!active) return;
      try {
        pc.setConfiguration({ iceServers: servers });
      } catch (e) {
        console.warn("[live-viewer] setConfiguration failed", e);
      }
    });

    const flushIce = async () => {
      while (pendingIce.length) {
        const c = pendingIce.shift()!;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
          console.warn("[live-viewer] queued ICE failed", e);
        }
      }
    };

    pc.ontrack = (ev) => {
      if (videoRef.current && ev.streams[0]) {
        videoRef.current.srcObject = ev.streams[0];
        videoRef.current.muted = muted;
        videoRef.current
          .play()
          .catch((e) => console.warn("[live-viewer] autoplay blocked", e));
        setState("live");
        onLive?.();
      }
    };
...
  // Apply muted prop changes live (so the watcher's mute toggle works).
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      if (videoRef.current.srcObject) {
        videoRef.current
          .play()
          .catch((e) => console.warn("[live-viewer] play() after mute toggle failed", e));
      }
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      data-state={state}
    />
  );
}
