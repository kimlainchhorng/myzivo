/**
 * GroupCallControls — bottom control bar for the LiveKit group call.
 */
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff,
  Hand, Smile, Circle, Square, PhoneOff,
} from "lucide-react";
import { useState } from "react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

const REACTIONS = ["👍", "❤️", "😂", "🎉", "👏", "🔥", "😮", "🙏"];

interface Props {
  micEnabled: boolean;
  camEnabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  isHost: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  onToggleHand: () => void;
  onReaction: (emoji: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onLeave: () => void;
}

export default function GroupCallControls(props: Props) {
  const [reactOpen, setReactOpen] = useState(false);

  const Btn = ({
    onClick, active, danger, children, label,
  }: {
    onClick: () => void; active?: boolean; danger?: boolean;
    children: React.ReactNode; label: string;
  }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-full transition ${
        danger
          ? "bg-rose-500 text-white hover:bg-rose-600"
          : active
          ? "bg-white text-zinc-900"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex shrink-0 items-center justify-center gap-2 bg-black/60 px-3 backdrop-blur-xl"
      style={{ paddingTop: 14, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}
    >
      <Btn onClick={props.onToggleMic} active={!props.micEnabled} label="Toggle microphone">
        {props.micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Btn>
      <Btn onClick={props.onToggleCam} active={!props.camEnabled} label="Toggle camera">
        {props.camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Btn>
      <Btn onClick={props.onToggleScreen} active={props.isScreenSharing} label="Share screen">
        {props.isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
      </Btn>
      <Btn onClick={props.onToggleHand} active={props.handRaised} label="Raise hand">
        <Hand className="h-5 w-5" />
      </Btn>

      <Popover open={reactOpen} onOpenChange={setReactOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Reactions"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <Smile className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-auto p-2">
          <div className="flex gap-1">
            {REACTIONS.map((emo) => (
              <button
                key={emo}
                onClick={() => {
                  props.onReaction(emo);
                  setReactOpen(false);
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-xl transition hover:bg-foreground/10"
              >
                {emo}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {props.isHost && (
        <Btn
          onClick={props.isRecording ? props.onStopRecording : props.onStartRecording}
          active={props.isRecording}
          label={props.isRecording ? "Stop recording" : "Start recording"}
        >
          {props.isRecording ? (
            <Square className="h-4 w-4 fill-rose-500 text-foreground" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </Btn>
      )}

      <Btn onClick={props.onLeave} danger label="Leave call">
        <PhoneOff className="h-5 w-5" />
      </Btn>
    </div>
  );
}
