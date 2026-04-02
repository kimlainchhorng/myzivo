/**
 * CallHistoryPage — Modern 2026-style call log with voicemail playback
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video,
  Play, Pause, Trash2, Voicemail, ArrowLeft, Loader2,
  Clock, PhoneCall, VideoIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface CallRecord {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: string;
  status: string;
  duration_seconds: number;
  created_at: string;
}

interface VoicemailRecord {
  id: string;
  caller_id: string;
  audio_url: string;
  duration_seconds: number;
  transcription: string | null;
  is_read: boolean;
  created_at: string;
}

function formatCallTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function formatDuration(s: number) {
  if (s === 0) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface CallHistoryPageProps {
  onClose: () => void;
  onCallUser?: (userId: string, type: "voice" | "video") => void;
}

type TabType = "all" | "missed" | "voicemail";

export default function CallHistoryPage({ onClose, onCallUser }: CallHistoryPageProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("all");
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [voicemails, setVoicemails] = useState<VoicemailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVm, setPlayingVm] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const [callsRes, vmRes] = await Promise.all([
        (supabase as any)
          .from("call_history")
          .select("*")
          .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(50),
        (supabase as any)
          .from("voicemails")
          .select("*")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setCalls(callsRes.data || []);
      setVoicemails(vmRes.data || []);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const deleteVoicemail = async (id: string) => {
    setVoicemails((prev) => prev.filter((v) => v.id !== id));
    await (supabase as any).from("voicemails").delete().eq("id", id);
    toast.success("Voicemail deleted");
  };

  const isMissed = (call: CallRecord) =>
    call.status === "missed" || call.status === "no_answer" || call.status === "declined";

  const filteredCalls = tab === "missed" ? calls.filter(isMissed) : calls;
  const missedCount = calls.filter(isMissed).length;
  const unreadVm = voicemails.filter((v) => !v.is_read).length;

  const getCallMeta = (call: CallRecord) => {
    const isOutgoing = call.caller_id === user?.id;
    const isVideo = call.call_type === "video";

    if (call.status === "missed" || call.status === "no_answer") {
      return {
        icon: <PhoneMissed className="w-4 h-4" />,
        label: isOutgoing ? "No Answer" : "Missed Call",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        ringColor: "ring-red-500/20",
      };
    }
    if (call.status === "declined") {
      return {
        icon: <PhoneMissed className="w-4 h-4" />,
        label: "Declined",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        ringColor: "ring-red-500/20",
      };
    }
    if (isOutgoing) {
      return {
        icon: isVideo ? <Video className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />,
        label: isVideo ? "Outgoing Video" : "Outgoing Call",
        color: "text-primary",
        bgColor: "bg-primary/10",
        ringColor: "ring-primary/20",
      };
    }
    return {
      icon: isVideo ? <Video className="w-4 h-4" /> : <PhoneIncoming className="w-4 h-4" />,
      label: isVideo ? "Incoming Video" : "Incoming Call",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      ringColor: "ring-emerald-500/20",
    };
  };

  const tabs: { key: TabType; label: string; badge?: number }[] = [
    { key: "all", label: "All" },
    { key: "missed", label: "Missed", badge: missedCount },
    { key: "voicemail", label: "Voicemail", badge: unreadVm },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Calls</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  tab === t.key ? "bg-background text-primary" : "bg-destructive text-white"
                }`}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : tab !== "voicemail" ? (
          /* Calls List */
          filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-muted-foreground/40">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                {tab === "missed" ? <PhoneMissed className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
              </div>
              <p className="text-sm font-medium">
                {tab === "missed" ? "No missed calls" : "No call history yet"}
              </p>
              <p className="text-xs mt-1">Your calls will appear here</p>
            </div>
          ) : (
            <div className="py-1">
              {filteredCalls.map((call, i) => {
                const meta = getCallMeta(call);
                const otherUserId = call.caller_id === user?.id ? call.callee_id : call.caller_id;
                const isVideo = call.call_type === "video";

                return (
                  <motion.button
                    key={call.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onCallUser?.(otherUserId, call.call_type as "voice" | "video")}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 active:bg-muted/50 transition-colors text-left"
                  >
                    {/* Avatar with call type indicator */}
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-border/20">
                        <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                          {otherUserId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.bgColor} ring-2 ring-background flex items-center justify-center ${meta.color}`}>
                        {isVideo ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        isMissed(call) ? "text-red-500" : "text-foreground"
                      }`}>
                        {otherUserId.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={meta.color}>{meta.icon}</span>
                        <span className={`text-xs ${meta.color} font-medium`}>{meta.label}</span>
                        {call.duration_seconds > 0 && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDuration(call.duration_seconds)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Time + action */}
                    <div className="flex flex-col items-end gap-1">
                      <p className={`text-[11px] font-medium ${
                        isMissed(call) ? "text-red-400" : "text-muted-foreground"
                      }`}>
                        {formatCallTime(call.created_at)}
                      </p>
                      <div className={`w-8 h-8 rounded-full ${meta.bgColor} flex items-center justify-center ${meta.color}`}>
                        {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )
        ) : (
          /* Voicemail tab */
          voicemails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-muted-foreground/40">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <Voicemail className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium">No voicemails</p>
              <p className="text-xs mt-1">Voicemails will appear here</p>
            </div>
          ) : (
            <div className="py-1">
              {voicemails.map((vm, i) => (
                <motion.div
                  key={vm.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-border/20">
                      <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                        {vm.caller_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-500/15 ring-2 ring-background flex items-center justify-center text-amber-500">
                      <Voicemail className="w-2.5 h-2.5" />
                    </div>
                    {!vm.is_read && (
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!vm.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {vm.caller_id.slice(0, 8)}...
                    </p>
                    {vm.transcription && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{vm.transcription}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                      <span>{formatCallTime(vm.created_at)}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(vm.duration_seconds)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (playingVm === vm.id) {
                          setPlayingVm(null);
                        } else {
                          setPlayingVm(vm.id);
                          const audio = new Audio(vm.audio_url);
                          audio.play();
                          audio.onended = () => setPlayingVm(null);
                          if (!vm.is_read) {
                            (supabase as any).from("voicemails").update({ is_read: true }).eq("id", vm.id);
                            setVoicemails((prev) => prev.map((v) => v.id === vm.id ? { ...v, is_read: true } : v));
                          }
                        }
                      }}
                      className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                    >
                      {playingVm === vm.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteVoicemail(vm.id)}
                      className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
