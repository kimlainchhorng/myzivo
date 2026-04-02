/**
 * CallEventBubble — Sleek inline call event in chat timeline (right-aligned)
 */
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, ArrowUpRight, ArrowDownLeft } from "lucide-react";
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
    ? (status === "declined" ? "Declined" : isOutgoing ? "No answer" : "Missed")
    : isVideo ? "Video call" : "Voice call";

  return (
    <div className="flex justify-end my-1">
      <div
        onClick={onCallback}
        className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-2xl rounded-br-md cursor-pointer active:scale-[0.97] transition-all select-none ${
          isMissed
            ? "bg-red-50 dark:bg-red-500/8 border border-red-200/40 dark:border-red-500/15"
            : "bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200/40 dark:border-emerald-500/15"
        }`}
      >
        {/* Direction arrow */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isMissed ? "bg-red-100 dark:bg-red-500/15" : "bg-emerald-100 dark:bg-emerald-500/15"
        }`}>
          {isMissed ? (
            <PhoneMissed className="w-2.5 h-2.5 text-red-500" />
          ) : isOutgoing ? (
            <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>

        {/* Label + time */}
        <div className="flex flex-col -space-y-0.5">
          <span className={`text-[11px] font-semibold leading-tight ${
            isMissed ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
          }`}>
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums leading-tight">
            {fmtTime(createdAt)}{durationSeconds > 0 ? ` · ${fmtDur(durationSeconds)}` : ""}
          </span>
        </div>

        {/* Callback icon */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ml-0.5 ${
          isMissed
            ? "bg-red-100 dark:bg-red-500/15 text-red-500"
            : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        }`}>
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
}
