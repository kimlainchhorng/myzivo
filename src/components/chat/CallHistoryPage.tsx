/**
 * CallHistoryPage — Full call log with voicemail playback
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Play, Trash2, Voicemail, ArrowLeft, Loader2 } from "lucide-react";
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
  if (isYesterday(d)) return "Yesterday " + format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
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

export default function CallHistoryPage({ onClose, onCallUser }: CallHistoryPageProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"calls" | "voicemail">("calls");
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

  const getCallIcon = (call: CallRecord) => {
    const isOutgoing = call.caller_id === user?.id;
    if (call.status === "missed" || call.status === "no_answer") return <PhoneMissed className="w-4 h-4 text-destructive" />;
    if (isOutgoing) return <PhoneOutgoing className="w-4 h-4 text-primary" />;
    return <PhoneIncoming className="w-4 h-4 text-green-500" />;
  };

  const getCallLabel = (call: CallRecord) => {
    const isOutgoing = call.caller_id === user?.id;
    if (call.status === "missed") return isOutgoing ? "No answer" : "Missed";
    if (call.status === "declined") return "Declined";
    return isOutgoing ? "Outgoing" : "Incoming";
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1">Call History</h1>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-2">
          {(["calls", "voicemail"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {t === "calls" ? "Calls" : `Voicemail${voicemails.length ? ` (${voicemails.length})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : tab === "calls" ? (
          calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
              <Phone className="h-8 w-8 mb-2" />
              <p className="text-sm">No call history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {calls.map((call) => {
                const otherUserId = call.caller_id === user?.id ? call.callee_id : call.caller_id;
                return (
                  <button
                    key={call.id}
                    onClick={() => onCallUser?.(otherUserId, call.call_type as "voice" | "video")}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {otherUserId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{otherUserId.slice(0, 8)}...</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getCallIcon(call)}
                        <span>{getCallLabel(call)}</span>
                        {call.call_type === "video" && <Video className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{formatCallTime(call.created_at)}</p>
                      {call.duration_seconds > 0 && (
                        <p className="text-[10px] text-muted-foreground">{formatDuration(call.duration_seconds)}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* Voicemail tab */
          voicemails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
              <Voicemail className="h-8 w-8 mb-2" />
              <p className="text-sm">No voicemails</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {voicemails.map((vm) => (
                <div key={vm.id} className="px-4 py-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {vm.caller_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{vm.caller_id.slice(0, 8)}...</p>
                    {vm.transcription && (
                      <p className="text-xs text-muted-foreground truncate">{vm.transcription}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{formatCallTime(vm.created_at)} · {formatDuration(vm.duration_seconds)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (playingVm === vm.id) {
                          setPlayingVm(null);
                        } else {
                          setPlayingVm(vm.id);
                          const audio = new Audio(vm.audio_url);
                          audio.play();
                          audio.onended = () => setPlayingVm(null);
                          // Mark as read
                          if (!vm.is_read) {
                            (supabase as any).from("voicemails").update({ is_read: true }).eq("id", vm.id);
                            setVoicemails((prev) => prev.map((v) => v.id === vm.id ? { ...v, is_read: true } : v));
                          }
                        }
                      }}
                      className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                    >
                      <Play className={`w-4 h-4 ${playingVm === vm.id ? "animate-pulse" : ""}`} />
                    </button>
                    <button
                      onClick={() => deleteVoicemail(vm.id)}
                      className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {!vm.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
