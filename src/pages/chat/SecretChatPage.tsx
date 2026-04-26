/**
 * SecretChatPage — full-screen E2E encrypted 1-on-1 chat (Signal-style).
 * Text-only v1. Lives at /chat/secret/:partnerId.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Send, Lock, ShieldCheck, Clock, Trash2, RefreshCw, MoreVertical,
  Plus, Image as ImageIcon, Video as VideoIcon, Mic, Paperclip,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSecretChat } from "@/hooks/useSecretChat";
import SafetyNumberSheet from "@/components/chat/SafetyNumberSheet";
import SecretMediaBubble from "@/components/chat/SecretMediaBubble";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SEOHead from "@/components/SEOHead";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TTL_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Off", value: null },
  { label: "1 minute", value: 60 },
  { label: "1 hour", value: 60 * 60 },
  { label: "1 day", value: 60 * 60 * 24 },
];

export default function SecretChatPage() {
  const { partnerId = "" } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [sasOpen, setSasOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    chatId,
    loading,
    error,
    messages,
    send,
    sendMedia,
    decryptMedia,
    ttlSeconds,
    setTtl,
    getSafetyNumber,
    resetKeys,
    deleteMessage,
  } = useSecretChat(partnerId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerAccept, setPickerAccept] = useState<string>("*/*");
  const [attachOpen, setAttachOpen] = useState(false);

  const openPicker = (accept: string) => {
    setPickerAccept(accept);
    setAttachOpen(false);
    // Defer so the input picks up the new accept value.
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const f of Array.from(files)) {
      await sendMedia(f);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const { data: partner } = useQuery({
    queryKey: ["secret-chat-partner", partnerId],
    enabled: Boolean(partnerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", partnerId)
        .maybeSingle();
      if (error) throw error;
      return data as { full_name: string | null; avatar_url: string | null } | null;
    },
  });

  const partnerName = partner?.full_name ?? "Contact";

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const ttlLabel = useMemo(() => {
    if (!ttlSeconds) return null;
    if (ttlSeconds < 60) return `${ttlSeconds}s`;
    if (ttlSeconds < 3600) return `${Math.round(ttlSeconds / 60)}m`;
    if (ttlSeconds < 86400) return `${Math.round(ttlSeconds / 3600)}h`;
    return `${Math.round(ttlSeconds / 86400)}d`;
  }, [ttlSeconds]);

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-b from-indigo-950/10 via-background to-background">
      <SEOHead title={`Secret · ${partnerName}`} description="End-to-end encrypted conversation" />

      {/* Header */}
      <header
        className="flex shrink-0 items-center gap-2 border-b border-indigo-500/20 bg-background/85 px-3 backdrop-blur-xl"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)", paddingBottom: 10 }}
      >
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="-ml-1 rounded-full p-2 hover:bg-foreground/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar className="h-9 w-9 ring-2 ring-indigo-500/30">
          <AvatarImage src={partner?.avatar_url ?? undefined} />
          <AvatarFallback>{partnerName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="truncate">{partnerName}</span>
          </div>
          <div className="text-[10.5px] text-indigo-500/80">End-to-end encrypted</div>
        </div>

        {ttlLabel && (
          <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold text-indigo-500">
            <Clock className="h-3 w-3" /> {ttlLabel}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Options" className="rounded-full p-2 hover:bg-foreground/5">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setSasOpen(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Verify Safety Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Disappearing messages
            </div>
            {TTL_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.label}
                onClick={() => void setTtl(opt.value)}
                className={ttlSeconds === opt.value ? "bg-accent" : ""}
              >
                <Clock className="mr-2 h-4 w-4" /> {opt.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void resetKeys()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset encryption keys
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {loading && (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Setting up encryption…
          </div>
        )}

        {error && (
          <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
            <div className="mb-1 text-sm font-semibold">This is a Secret Chat</div>
            <div className="text-xs text-muted-foreground">
              Messages are end-to-end encrypted on your devices. ZIVO cannot read them.
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className="group relative max-w-[78%]">
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      mine
                        ? "bg-indigo-500 text-white"
                        : "bg-muted text-foreground"
                    } ${m.failed ? "opacity-60 italic" : ""}`}
                  >
                    {m.plaintext}
                  </div>
                  <div
                    className={`mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
                    {m.expires_at && <Clock className="h-2.5 w-2.5" />}
                    {mine && (
                      <button
                        onClick={() => void deleteMessage(m.id)}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                        aria-label="Delete message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          void send(draft);
          setDraft("");
        }}
        className="flex shrink-0 items-end gap-2 border-t border-border/40 bg-background/85 px-3 backdrop-blur-xl"
        style={{
          paddingTop: 10,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (draft.trim()) {
                void send(draft);
                setDraft("");
              }
            }
          }}
          placeholder={chatId ? "Send an encrypted message" : "Connecting…"}
          disabled={!chatId || loading}
          rows={1}
          className="max-h-32 min-h-[38px] flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || !chatId}
          className="h-9 w-9 rounded-full bg-indigo-500 hover:bg-indigo-600"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <SafetyNumberSheet
        open={sasOpen}
        onOpenChange={setSasOpen}
        getSafetyNumber={getSafetyNumber}
        partnerName={partnerName}
      />
    </div>
  );
}
