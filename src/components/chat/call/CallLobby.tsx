/**
 * CallLobby — Pre-join screen shown before connecting to a LiveKit room.
 * Lets the user enable/disable mic & cam, and (for the host) toggle
 * cloud recording before the call begins.
 */
import { useEffect, useRef, useState } from "react";
import {
  Mic, MicOff, Video, VideoOff, Radio, X, ArrowRight,
  CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRecordingPreflight } from "@/hooks/useRecordingPreflight";

export interface CallLobbyResult {
  startMicMuted: boolean;
  startCamOff: boolean;
  autoRecord: boolean;
}

interface Props {
  roomName: string;
  callType?: "audio" | "video";
  /** Suggest record toggle visibility — actual host check still happens server-side */
  canRecord?: boolean;
  onCancel: () => void;
  onJoin: (result: CallLobbyResult) => void;
}

export default function CallLobby({
  roomName,
  callType = "video",
  canRecord = true,
  onCancel,
  onJoin,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "video");
  const [record, setRecord] = useState(false);
  const { status: bucketStatus, message: bucketMsg } = useRecordingPreflight(canRecord);
  const bucketReady = bucketStatus === "ready";
  const recordDisabled = !bucketReady;
  // Force off if bucket isn't ready
  useEffect(() => {
    if (recordDisabled && record) setRecord(false);
  }, [recordDisabled, record]);

  // Acquire local preview
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        toast.error(`Camera/mic unavailable: ${m}`);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [callType]);

  // Apply mic/cam preview toggles
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn]);
  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [camOn]);

  const handleJoin = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onJoin({
      startMicMuted: !micOn,
      startCamOff: !camOn,
      autoRecord: record,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white">
      <header
        className="flex shrink-0 items-center justify-between px-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/50">Ready to join</p>
          <h2 className="text-base font-semibold">{roomName}</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy invite link — shareable URL recipients can click to land on
              GroupCallEntryPage and join the same LiveKit room. */}
          <button
            type="button"
            onClick={async () => {
              const url = `${window.location.origin}/chat/call/group/${encodeURIComponent(roomName)}${callType === "audio" ? "?audio=1" : ""}`;
              try {
                await navigator.clipboard?.writeText(url);
                const { toast } = await import("sonner");
                toast.success("Invite link copied. Send it to anyone you want to join.");
              } catch {
                /* clipboard blocked */
              }
            }}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 inline-flex items-center gap-1.5"
            aria-label="Copy invite link"
          >
            Copy invite
          </button>
          <button
            onClick={onCancel}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Self preview */}
      <div className="relative mx-4 flex-1 overflow-hidden rounded-2xl bg-black/60">
        {callType === "video" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${camOn ? "" : "opacity-0"}`}
          />
        ) : null}
        {(!camOn || callType === "audio") && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white/60">
            <div className="flex flex-col items-center gap-2">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white/10">
                <VideoOff className="h-8 w-8" />
              </div>
              Camera off
            </div>
          </div>
        )}

        {/* In-preview controls */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button
            onClick={() => setMicOn((v) => !v)}
            className={`grid h-12 w-12 place-items-center rounded-full ${
              micOn ? "bg-white/15 hover:bg-white/25" : "bg-rose-500 hover:bg-rose-600"
            }`}
            aria-label={micOn ? "Mute mic" : "Unmute mic"}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          {callType === "video" && (
            <button
              onClick={() => setCamOn((v) => !v)}
              className={`grid h-12 w-12 place-items-center rounded-full ${
                camOn ? "bg-white/15 hover:bg-white/25" : "bg-rose-500 hover:bg-rose-600"
              }`}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            >
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="mx-4 mt-4 space-y-3">
        {canRecord && (
          <div
            className={`rounded-xl px-4 py-3 transition ${
              recordDisabled ? "bg-white/5 opacity-80" : "bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <Radio className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Record this call</p>
                  <p className="text-[11px] text-white/50">
                    Saved privately to the host's recordings
                  </p>
                </div>
              </div>
              <Switch
                checked={record}
                onCheckedChange={setRecord}
                disabled={recordDisabled}
                aria-label="Toggle cloud recording"
              />
            </div>

            {/* Pre-call summary: bucket status */}
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-black/30 px-3 py-2 text-[11px]">
              <div className="flex items-center gap-2">
                {bucketStatus === "checking" && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white/70" />
                    <span className="text-white/70">Checking storage…</span>
                  </>
                )}
                {bucketStatus === "ready" && (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">
                      Bucket ready · <span className="text-white/60">call-recordings</span>
                    </span>
                  </>
                )}
                {bucketStatus === "unavailable" && (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-foreground truncate">
                      Recording unavailable
                      {bucketMsg ? ` · ${bucketMsg}` : ""}
                    </span>
                  </>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${
                  record && bucketReady
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {record && bucketReady ? "REC ON" : "REC OFF"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="mx-4 mt-4 flex shrink-0 items-center gap-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={handleJoin}>
          Join call
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
