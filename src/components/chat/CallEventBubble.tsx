/**
 * CallEventBubble — Compact inline call event in chat timeline
 */
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface CallEventBubbleProps {
  callType: "voice" | "video";
  status: string;
  isOutgoing: boolean;
  durationSeconds: number;
  createdAt: string;
  onCallback?: () => void;
}

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function fmtDur(s: number) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function CallEventBubble({
  callType,
  status,
  isOutgoing,
  durationSeconds,
  createdAt,
  onCallback,
}: CallEventBubbleProps) {
  const isMissed = status === "missed" || status === "no_answer" || status === "declined";
  const isVideo = callType === "video";

  const label = isMissed
    ? (status === "declined" ? "Declined" : isOutgoing ? "No answer" : "Missed call")
    : isOutgoing
      ? (isVideo ? "Video call" : "Voice call")
      : (isVideo ? "Video call" : "Voice call");

  const dirLabel = isMissed ? "" : isOutgoing ? "Outgoing" : "Incoming";

  const color = isMissed ? "text-red-500" : "text-emerald-600 dark:text-emerald-400";
  const iconBg = isMissed ? "bg-red-500/10" : "bg-emerald-500/10";

  const DirIcon = isMissed
    ? PhoneMissed
    : isOutgoing ? PhoneOutgoing : PhoneIncoming;

  return (
    <div className="flex justify-center my-1.5">
      <div
        onClick={onCallback}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/20 cursor-pointer hover:bg-muted/60 active:scale-[0.97] transition-all select-none"
      >
        {/* Direction icon */}
        <DirIcon className={`w-3.5 h-3.5 ${color} shrink-0`} />

        {/* Label */}
        <span className={`text-[12px] font-medium ${color}`}>
          {dirLabel && <span className="text-muted-foreground/60">{dirLabel} </span>}
          {label}
        </span>

        {/* Duration or time */}
        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
          {durationSeconds > 0 ? fmtDur(durationSeconds) : fmtTime(createdAt)}
        </span>

        {/* Callback button */}
        <div className={`w-6 h-6 rounded-full ${iconBg} flex items-center justify-center ${color} shrink-0`}>
          {isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}
