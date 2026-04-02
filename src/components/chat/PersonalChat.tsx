/**
 * PersonalChat — Full messenger-style 1-on-1 chat
 * Features: realtime messages, image sharing, emoji reactions, typing indicator, online status
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Loader2, Phone, Video, X, ImagePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import CallScreen from "./CallScreen";
import { primeCallAudio } from "@/lib/callAudio";
import ChatMessageBubble from "./ChatMessageBubble";
import { toast } from "sonner";
import { useChatPresence } from "@/hooks/useChatPresence";

interface PersonalChatProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  image_url: string | null;
  created_at: string;
  is_read: boolean;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday " + format(d, "h:mm a");
  return format(d, "MMM d, h:mm a");
}

export default function PersonalChat({ recipientId, recipientName, recipientAvatar, onClose }: PersonalChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeCall, setActiveCall] = useState<"voice" | "video" | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; message: string; isMe: boolean } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Presence: typing indicator + online status
  const { isTyping: recipientTyping, isOnline: recipientOnline, setTyping } = useChatPresence(user?.id, recipientId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  const handleStartCall = useCallback(async (type: "voice" | "video") => {
    await primeCallAudio();
    setActiveCall(type);
  }, []);

  // Load messages
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();

      if (data?.length) {
        const unread = data.filter((m: Message) => m.receiver_id === user.id && !m.is_read);
        if (unread.length) {
          await (supabase as any)
            .from("direct_messages")
            .update({ is_read: true })
            .eq("receiver_id", user.id)
            .eq("sender_id", recipientId)
            .eq("is_read", false);
        }
      }
    };
    load();
  }, [user?.id, recipientId, scrollToBottom]);

  // Realtime: INSERT + DELETE
  useEffect(() => {
    if (!user?.id) return;
    const channelName = `dm-${[user.id, recipientId].sort().join("-")}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
      }, (payload: any) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === recipientId) ||
          (msg.sender_id === recipientId && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
          if (msg.receiver_id === user.id) {
            (supabase as any).from("direct_messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "direct_messages",
      }, (payload: any) => {
        const oldMsg = payload.old;
        if (oldMsg?.id) {
          setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, recipientId, scrollToBottom]);

  // Send message with optimistic update
  const handleSend = async (imageUrl?: string) => {
    const text = input.trim();
    if (!text && !imageUrl) return;
    if (!user?.id || sending) return;

    setInput("");
    setReplyTo(null);
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: user.id,
      receiver_id: recipientId,
      message: text,
      image_url: imageUrl || null,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();
    setTyping(false);

    try {
      const insertData: any = {
        sender_id: user.id,
        receiver_id: recipientId,
        message: text || "",
      };
      if (imageUrl) insertData.image_url = imageUrl;

      const { data, error } = await (supabase as any)
        .from("direct_messages")
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
    inputRef.current?.focus();
  };

  // Image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat_uploads")
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("chat_uploads").getPublicUrl(path);
      await handleSend(urlData.publicUrl);
    } catch {
      toast.error("Failed to upload image");
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReply = useCallback((id: string, message: string, isMe: boolean) => {
    setReplyTo({ id, message, isMe });
    inputRef.current?.focus();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      const { error } = await (supabase as any).from("direct_messages").delete().eq("id", id).eq("sender_id", user?.id);
      if (error) throw error;
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete");
      const { data } = await (supabase as any)
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user?.id})`)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(data || []);
    }
  }, [user?.id, recipientId]);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const initials = (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-border/30">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            {/* Online indicator dot */}
            {recipientOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{recipientName}</p>
            <p className="text-[10px] text-muted-foreground">
              {recipientTyping ? (
                <span className="text-primary font-medium">typing...</span>
              ) : recipientOnline ? (
                <span className="text-green-600">Online</span>
              ) : (
                "Personal chat"
              )}
            </p>
          </div>
          <button
            onClick={() => { void handleStartCall("voice"); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Phone className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => { void handleStartCall("video"); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Video className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Call overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            recipientId={recipientId}
            callType={activeCall}
            onEnd={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Say hello to {recipientName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <ChatMessageBubble
                key={msg.id}
                id={msg.id}
                message={msg.message}
                time={formatMsgTime(msg.created_at)}
                isMe={isMe}
                isRead={msg.is_read}
                imageUrl={msg.image_url}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            );
          })
        )}

        {/* Typing indicator */}
        {recipientTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <motion.span
                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Reply preview bar */}
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
              <p className="text-[10px] font-semibold text-primary">{replyTo.isMe ? "You" : recipientName}</p>
              <p className="text-xs text-muted-foreground truncate">{replyTo.message}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="h-7 w-7 rounded-full flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="bg-background border-t border-border/30 px-3 py-2 flex items-center gap-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-10 px-4 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => handleSend()}
          disabled={(!input.trim() && !uploadingImage) || sending}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}
