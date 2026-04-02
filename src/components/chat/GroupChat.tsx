/**
 * GroupChat — Group conversation with multiple participants
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Loader2, Users, ImagePlus, X, Mic, Square } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface GroupChatProps {
  groupId: string;
  groupName: string;
  groupAvatar?: string | null;
  onClose: () => void;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  message: string;
  image_url: string | null;
  voice_url: string | null;
  message_type: string;
  reply_to_id: string | null;
  created_at: string;
}

interface Member {
  user_id: string;
  name: string;
  avatar: string | null;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday " + format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

export default function GroupChat({ groupId, groupName, groupAvatar, onClose }: GroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; message: string; senderName: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const voice = useVoiceRecorder();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Load members
  useEffect(() => {
    if (!user?.id) return;
    const loadMembers = async () => {
      const { data: memberData } = await (supabase as any)
        .from("chat_group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (memberData) {
        const userIds = memberData.map((m: any) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        setMembers(
          (profiles || []).map((p: any) => ({
            user_id: p.user_id,
            name: p.full_name || "User",
            avatar: p.avatar_url,
          }))
        );
      }
    };
    loadMembers();
  }, [groupId, user?.id]);

  // Load messages
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    };
    load();
  }, [groupId, user?.id, scrollToBottom]);

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`group-${groupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      }, (payload: any) => {
        const msg = payload.new as GroupMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "group_messages",
      }, (payload: any) => {
        if (payload.old?.id) {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, user?.id, scrollToBottom]);

  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return "You";
    return members.find((m) => m.user_id === senderId)?.name || "User";
  };

  const getSenderAvatar = (senderId: string) => {
    return members.find((m) => m.user_id === senderId)?.avatar || null;
  };

  const handleSend = async (imageUrl?: string, voiceUrl?: string) => {
    const text = input.trim();
    if (!text && !imageUrl && !voiceUrl) return;
    if (!user?.id || sending) return;

    const msgType = voiceUrl ? "voice" : imageUrl ? "image" : "text";
    setInput("");
    setReplyTo(null);
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: GroupMessage = {
      id: optimisticId,
      group_id: groupId,
      sender_id: user.id,
      message: text,
      image_url: imageUrl || null,
      voice_url: voiceUrl || null,
      message_type: msgType,
      reply_to_id: replyTo?.id || null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const insertData: any = {
        group_id: groupId,
        sender_id: user.id,
        message: text || "",
        message_type: msgType,
      };
      if (imageUrl) insertData.image_url = imageUrl;
      if (voiceUrl) insertData.voice_url = voiceUrl;
      if (replyTo) insertData.reply_to_id = replyTo.id;

      const { data, error } = await (supabase as any)
        .from("group_messages")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => prev.map((m) => m.id === optimisticId ? data : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  // Voice send
  useEffect(() => {
    if (voice.audioBlob && !voice.isRecording) {
      const upload = async () => {
        const ext = "webm";
        const path = `${user?.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("chat-media-files")
          .upload(path, voice.audioBlob!, { contentType: "audio/webm" });

        if (error) {
          toast.error("Failed to upload voice note");
          voice.clearBlob();
          return;
        }
        const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
        await handleSend(undefined, urlData.publicUrl);
        voice.clearBlob();
      };
      upload();
    }
  }, [voice.audioBlob, voice.isRecording]);

  // Image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-media-files").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
      await handleSend(urlData.publicUrl);
    } catch { toast.error("Failed to upload image"); }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = (groupName || "G").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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
        <div className="px-3 py-2 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <Avatar className="h-9 w-9 border-2 border-border/30">
            <AvatarImage src={groupAvatar || undefined} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{groupName}</p>
            <p className="text-[10px] text-muted-foreground">
              {members.length} members
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{members.length}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-sm">Group created</p>
            <p className="text-xs mt-1">Say hello to the group!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            const senderName = getSenderName(msg.sender_id);
            const senderAvatar = getSenderAvatar(msg.sender_id);
            const repliedMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;
            const isOptimistic = msg.id.startsWith("opt-");

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-1.5`}>
                {!isMe && (
                  <Avatar className="h-6 w-6 mt-1 shrink-0">
                    <AvatarImage src={senderAvatar || undefined} />
                    <AvatarFallback className="text-[8px] bg-muted">{senderName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isOptimistic ? "opacity-60" : ""}`}>
                  {/* Sender name for others */}
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5 px-1">{senderName}</p>
                  )}

                  {/* Replied message preview */}
                  {repliedMsg && (
                    <div className={`rounded-lg px-2.5 py-1.5 mb-0.5 border-l-2 border-primary/50 text-[10px] ${
                      isMe ? "bg-primary/20 text-primary-foreground/70" : "bg-muted/80 text-muted-foreground"
                    }`}>
                      <span className="font-semibold">{getSenderName(repliedMsg.sender_id)}</span>
                      <p className="truncate">{repliedMsg.message || "📷 Media"}</p>
                    </div>
                  )}

                  {/* Image */}
                  {msg.image_url && (
                    <div className={`rounded-2xl overflow-hidden mb-1 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}>
                      <img src={msg.image_url} alt="" className="max-w-full max-h-60 object-cover rounded-2xl" loading="lazy" />
                    </div>
                  )}

                  {/* Voice */}
                  {msg.message_type === "voice" && msg.voice_url && (
                    <div className={`px-3 py-2.5 rounded-2xl ${
                      isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      <VoiceMessagePlayer url={msg.voice_url} isMe={isMe} />
                    </div>
                  )}

                  {/* Text */}
                  {msg.message && msg.message_type !== "voice" && (
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setReplyTo({ id: msg.id, message: msg.message, senderName });
                      }}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <span className={`text-[9px] block text-right mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/50 border-t border-border/30 px-4 py-2 flex items-center gap-2 overflow-hidden"
          >
            <div className="w-1 h-8 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-primary">{replyTo.senderName}</p>
              <p className="text-xs text-muted-foreground truncate">{replyTo.message}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="h-7 w-7 rounded-full flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording overlay */}
      <AnimatePresence>
        {voice.isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive/5 border-t border-destructive/20 px-4 py-3 flex items-center gap-3"
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-destructive"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-sm font-medium text-foreground flex-1">
              Recording... {Math.floor(voice.duration / 60)}:{(voice.duration % 60).toString().padStart(2, "0")}
            </span>
            <button onClick={voice.cancelRecording} className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
              Cancel
            </button>
            <button onClick={voice.stopRecording} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Square className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {!voice.isRecording && (
        <div className="bg-background border-t border-border/30 px-3 py-2 flex items-center gap-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <button
            onClick={voice.startRecording}
            className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <Mic className="h-5 w-5" />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 px-4 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}
    </motion.div>
  );
}
