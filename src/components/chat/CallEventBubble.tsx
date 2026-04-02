/**
 * CallEventBubble — Inline call event shown in chat timeline
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

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday " + format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

function formatDuration(s: number) {
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

  const icon = isMissed
    ? <PhoneMissed className="w-4 h-4" />
    : isOutgoing
      ? <PhoneOutgoing className="w-4 h-4" />
      : <PhoneIncoming className="w-4 h-4" />;

  const label = isMissed
    ? (isOutgoing ? "No Answer" : "Missed Call")
    : isOutgoing
      ? (isVideo ? "Outgoing Video Call" : "Outgoing Voice Call")
      : (isVideo ? "Incoming Video Call" : "Incoming Voice Call");

  const colorClass = isMissed ? "text-red-500" : "text-emerald-500";
  const bgClass = isMissed ? "bg-red-500/8" : "bg-emerald-500/8";
  const iconBg = isMissed ? "bg-red-500/10" : "bg-emerald-500/10";

  return (
    <div className="flex justify-center my-2">
      <button
        onClick={onCallback}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${bgClass} border border-border/20 hover:border-border/40 transition-all active:scale-[0.98] max-w-[85%]`}
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center ${colorClass} shrink-0`}>
          {isVideo ? <Video className="w-4 h-4" /> : icon}
        </div>

        {/* Info */}
        <div className="text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`${colorClass}`}>{icon}</span>
            <span className={`text-[13px] font-semibold ${colorClass}`}>{label}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground/60">{formatTime(createdAt)}</span>
            {durationSeconds > 0 && (
              <>
                <span className="text-muted-foreground/20 text-[10px]">•</span>
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">{formatDuration(durationSeconds)}</span>
              </>
            )}
          </div>
        </div>

        {/* Callback icon */}
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${colorClass} shrink-0 ml-1`}>
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
        </div>
      </button>
    </div>
  );
}
