/**
 * useLiveKitCall — Group video call backed by LiveKit Cloud SFU.
 *
 *   - Used when participant count > 4 (mesh becomes inefficient above that).
 *   - Mints a server-issued JWT via the `livekit-token` edge function.
 *   - Surfaces local + remote tracks, screen share, reactions (data channel),
 *     hand-raise (data channel), and recording controls.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  LocalParticipant,
  ParticipantEvent,
  DataPacket_Kind,
  ConnectionState,
  type LocalTrackPublication,
} from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LKParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isHost: boolean;
  micEnabled: boolean;
  camEnabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  cameraTrack: MediaStreamTrack | null;
  micTrack: MediaStreamTrack | null;
  screenTrack: MediaStreamTrack | null;
}

export interface ReactionEvent {
  id: string;          // unique key for animation
  participantId: string;
  emoji: string;
  ts: number;
}

interface DataMsg {
  type: "reaction" | "hand";
  emoji?: string;
  raised?: boolean;
}

interface UseLiveKitCallOptions {
  roomName: string;
  callType?: "audio" | "video";
  enabled: boolean;
  onEnded?: () => void;
  /** Pre-join intent: start with mic muted */
  startMicMuted?: boolean;
  /** Pre-join intent: start with camera off */
  startCamOff?: boolean;
  /** Host-only: kick off cloud recording immediately after connect */
  autoRecord?: boolean;
}

export function useLiveKitCall({
  roomName,
  callType = "video",
  enabled,
  onEnded,
  startMicMuted = false,
  startCamOff = false,
  autoRecord = false,
}: UseLiveKitCallOptions) {
  const roomRef = useRef<Room | null>(null);
  const [state, setState] = useState<"connecting" | "connected" | "ended" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<LKParticipant[]>([]);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [micEnabled, setMicEnabled] = useState(!startMicMuted);
  const [camEnabled, setCamEnabled] = useState(callType === "video" && !startCamOff);
  const [handRaised, setHandRaised] = useState(false);

  /* ----------------- Refresh participant list ----------------- */
  const refreshParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const list: LKParticipant[] = [];
    const buildOne = (p: LocalParticipant | RemoteParticipant, isLocal: boolean) => {
      const camPub = p.getTrackPublication(Track.Source.Camera);
      const micPub = p.getTrackPublication(Track.Source.Microphone);
      const screenPub = p.getTrackPublication(Track.Source.ScreenShare);
      list.push({
        identity: p.identity,
        name: p.name || p.identity,
        isLocal,
        isHost: p.metadata === "host",
        micEnabled: !(micPub?.isMuted ?? true),
        camEnabled: !(camPub?.isMuted ?? true),
        isScreenSharing: Boolean(screenPub?.track),
        handRaised: false, // updated by data messages
        cameraTrack: (camPub?.track?.mediaStreamTrack as MediaStreamTrack | undefined) ?? null,
        micTrack: (micPub?.track?.mediaStreamTrack as MediaStreamTrack | undefined) ?? null,
        screenTrack: (screenPub?.track?.mediaStreamTrack as MediaStreamTrack | undefined) ?? null,
      });
    };
    buildOne(room.localParticipant, true);
    room.remoteParticipants.forEach((rp) => buildOne(rp, false));
    setParticipants(list);
  }, []);

  /* ----------------- Connect / disconnect ----------------- */
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    roomRef.current = room;

    const wireEvents = () => {
      room.on(RoomEvent.ParticipantConnected, refreshParticipants);
      room.on(RoomEvent.ParticipantDisconnected, refreshParticipants);
      room.on(RoomEvent.TrackSubscribed, refreshParticipants);
      room.on(RoomEvent.TrackUnsubscribed, refreshParticipants);
      room.on(RoomEvent.TrackMuted, refreshParticipants);
      room.on(RoomEvent.TrackUnmuted, refreshParticipants);
      room.on(RoomEvent.LocalTrackPublished, refreshParticipants);
      room.on(RoomEvent.LocalTrackUnpublished, refreshParticipants);
      room.on(RoomEvent.ConnectionStateChanged, (cs) => {
        if (cs === ConnectionState.Disconnected) {
          setState("ended");
          onEnded?.();
        } else if (cs === ConnectionState.Connected) {
          setState("connected");
        }
      });
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload)) as DataMsg;
          if (msg.type === "reaction" && msg.emoji && participant) {
            setReactions((prev) => [
              ...prev,
              { id: crypto.randomUUID(), participantId: participant.identity, emoji: msg.emoji!, ts: Date.now() },
            ]);
          }
          if (msg.type === "hand" && participant) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.identity === participant.identity ? { ...p, handRaised: Boolean(msg.raised) } : p,
              ),
            );
          }
        } catch {/* ignore */}
      });
    };

    (async () => {
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("livekit-token", {
          body: { roomName, callType },
        });
        if (fnErr) throw fnErr;
        if (!data?.token || !data?.url) throw new Error("Missing token");
        if (cancelled) return;

        setIsHost(Boolean(data.isHost));
        setSessionId(data.sessionId ?? null);

        wireEvents();
        await room.connect(data.url, data.token, {
          autoSubscribe: true,
        });
        if (cancelled) {
          await room.disconnect();
          return;
        }

        // Publish defaults
        await room.localParticipant.setMicrophoneEnabled(true);
        if (callType === "video") {
          await room.localParticipant.setCameraEnabled(true);
        }
        if (data.isHost) {
          await room.localParticipant.setMetadata("host");
        }
        refreshParticipants();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          setError(msg);
          setState("error");
          toast.error(`Could not join call: ${msg}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      void room.disconnect();
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, roomName]);

  /* ----------------- Auto-prune old reactions ----------------- */
  useEffect(() => {
    if (reactions.length === 0) return;
    const t = setInterval(() => {
      const cutoff = Date.now() - 3500;
      setReactions((prev) => prev.filter((r) => r.ts > cutoff));
    }, 1000);
    return () => clearInterval(t);
  }, [reactions.length]);

  /* ----------------- Controls ----------------- */
  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [micEnabled]);

  const toggleCam = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
  }, [camEnabled]);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      const next = !isScreenSharing;
      await room.localParticipant.setScreenShareEnabled(next);
      setIsScreenSharing(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Screen share failed: ${msg}`);
    }
  }, [isScreenSharing]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      const room = roomRef.current;
      if (!room) return;
      const data = new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji } satisfies DataMsg));
      await room.localParticipant.publishData(data, { reliable: true });
      // Show our own reaction immediately
      setReactions((prev) => [
        ...prev,
        { id: crypto.randomUUID(), participantId: room.localParticipant.identity, emoji, ts: Date.now() },
      ]);
    },
    [],
  );

  const toggleHandRaise = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !handRaised;
    setHandRaised(next);
    const data = new TextEncoder().encode(JSON.stringify({ type: "hand", raised: next } satisfies DataMsg));
    await room.localParticipant.publishData(data, { reliable: true });
  }, [handRaised]);

  const startRecording = useCallback(async () => {
    if (!sessionId || !isHost) return;
    const { error: e } = await supabase.functions.invoke("livekit-recording", {
      body: { sessionId, action: "start" },
    });
    if (e) {
      toast.error(`Could not start recording: ${e.message}`);
      return;
    }
    setIsRecording(true);
    toast.success("Recording started");
  }, [sessionId, isHost]);

  const stopRecording = useCallback(async () => {
    if (!sessionId || !isHost) return;
    const { error: e } = await supabase.functions.invoke("livekit-recording", {
      body: { sessionId, action: "stop" },
    });
    if (e) {
      toast.error(`Could not stop recording: ${e.message}`);
      return;
    }
    setIsRecording(false);
    toast.success("Recording saved");
  }, [sessionId, isHost]);

  const leave = useCallback(async () => {
    const room = roomRef.current;
    if (room) await room.disconnect();
    setState("ended");
    onEnded?.();
  }, [onEnded]);

  const screenShareSource = useMemo(
    () => participants.find((p) => p.isScreenSharing) ?? null,
    [participants],
  );

  return {
    state,
    error,
    participants,
    screenShareSource,
    reactions,
    isHost,
    isRecording,
    isScreenSharing,
    micEnabled,
    camEnabled,
    handRaised,
    sessionId,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    sendReaction,
    toggleHandRaise,
    startRecording,
    stopRecording,
    leave,
  };
}
