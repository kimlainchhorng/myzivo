/**
 * PersonalChat — Full messenger-style 1-on-1 chat
 * Features: realtime messages, image/video/GIF sharing, emoji reactions, typing indicator, online status,
 * voice messages, reply threads, message search, disappearing messages, forward, pin, location sharing
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Loader2, Phone, X, Mic, Search, Plus, Pin, Settings, Image as ImageIcon, Smile, Palette, Zap, Shield, Video, History, FileText, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import CallScreen from "./CallScreen";
import CallPiP from "./CallPiP";
import { primeCallAudio } from "@/lib/callAudio";
import ChatMessageBubble from "./ChatMessageBubble";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import LocationShareBubble from "./LocationShareBubble";
import ChatSearch from "./ChatSearch";
import ChatAttachMenu from "./ChatAttachMenu";
import ChatNotificationSettings from "./ChatNotificationSettings";
import ChatMediaGallery from "./ChatMediaGallery";
import StickerKeyboard from "./StickerKeyboard";
import ChatPersonalization, { getWallpaperClass } from "./ChatPersonalization";
import ChatMiniApps from "./ChatMiniApps";
import ChatSecurity from "./ChatSecurity";
import CallHistoryPage from "./CallHistoryPage";
import { ChatMediaUploader } from "./ChatMediaUploader";
import CallEventBubble from "./CallEventBubble";
import { toast } from "sonner";
import { useChatPresence } from "@/hooks/useChatPresence";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useChatDraft } from "@/hooks/useChatDraft";

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
  video_url?: string | null;
  voice_url?: string | null;
  message_type?: string;
  delivered_at?: string | null;
  reply_to_id?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  location_label?: string | null;
  is_pinned?: boolean;
  expires_at?: string | null;
  created_at: string;
  is_read: boolean;
}

interface CallEvent {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: string;
  status: string;
  duration_seconds: number;
  created_at: string;
  _isCallEvent: true;
}

type TimelineItem = Message | CallEvent;

function isCallEvent(item: TimelineItem): item is CallEvent {
  return "_isCallEvent" in item;
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
  const [pipMode, setPipMode] = useState(false);
  const [pipData, setPipData] = useState<{ remoteStream: MediaStream | null; duration: number; isMuted: boolean } | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; message: string; isMe: boolean } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [disappearingMode, setDisappearingMode] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showStickerKeyboard, setShowStickerKeyboard] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showMiniApps, setShowMiniApps] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [chatStyle, setChatStyle] = useState({ wallpaper: "default", themeColor: "default", fontSize: "medium" });
  const [callEvents, setCallEvents] = useState<CallEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { isTyping: recipientTyping, isOnline: recipientOnline, setTyping } = useChatPresence(user?.id, recipientId);
  const voice = useVoiceRecorder();
  const { draft, updateDraft, clearDraft } = useChatDraft(user?.id, recipientId);

  // Sync draft to input on load
  useEffect(() => {
    if (draft && !input) setInput(draft);
  }, [draft]);

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
      const [msgRes, callRes] = await Promise.all([
        (supabase as any)
          .from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true })
          .limit(100),
        (supabase as any)
          .from("call_history")
          .select("*")
          .or(`and(caller_id.eq.${user.id},callee_id.eq.${recipientId}),and(caller_id.eq.${recipientId},callee_id.eq.${user.id})`)
          .order("created_at", { ascending: true })
          .limit(50),
      ]);
      const data = msgRes.data || [];
      setMessages(data);
      setCallEvents((callRes.data || []).map((c: any) => ({ ...c, _isCallEvent: true as const })));
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

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channelName = `dm-${[user.id, recipientId].sort().join("-")}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload: any) => {
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
            (supabase as any).from("direct_messages").update({ is_read: true, delivered_at: new Date().toISOString() }).eq("id", msg.id);
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages" }, (payload: any) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "direct_messages" }, (payload: any) => {
        if (payload.old?.id) setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, recipientId, scrollToBottom]);

  // Send
  const handleSend = async (opts?: {
    imageUrl?: string; voiceUrl?: string; videoUrl?: string;
    locationLat?: number; locationLng?: number; locationLabel?: string;
  }) => {
    const text = input.trim();
    const { imageUrl, voiceUrl, videoUrl, locationLat, locationLng, locationLabel } = opts || {};
    if (!text && !imageUrl && !voiceUrl && !videoUrl && locationLat == null) return;
    if (!user?.id || sending) return;

    const msgType = voiceUrl ? "voice" : videoUrl ? "video" : imageUrl ? "image" : locationLat != null ? "location" : "text";
    setInput("");
    clearDraft();
    const currentReply = replyTo;
    setReplyTo(null);
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: user.id,
      receiver_id: recipientId,
      message: text,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
      voice_url: voiceUrl || null,
      message_type: msgType,
      reply_to_id: currentReply?.id || null,
      location_lat: locationLat || null,
      location_lng: locationLng || null,
      location_label: locationLabel || null,
      is_pinned: false,
      expires_at: disappearingMode ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
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
        message_type: msgType,
      };
      if (imageUrl) insertData.image_url = imageUrl;
      if (videoUrl) insertData.video_url = videoUrl;
      if (voiceUrl) insertData.voice_url = voiceUrl;
      if (currentReply) insertData.reply_to_id = currentReply.id;
      if (locationLat != null) {
        insertData.location_lat = locationLat;
        insertData.location_lng = locationLng;
        insertData.location_label = locationLabel || "";
      }
      if (disappearingMode) {
        insertData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

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

  // Voice recording complete → upload
  useEffect(() => {
    if (voice.audioBlob && !voice.isRecording) {
      const upload = async () => {
        const path = `${user?.id}/${Date.now()}.webm`;
        const { error } = await supabase.storage
          .from("chat-media-files")
          .upload(path, voice.audioBlob!, { contentType: "audio/webm" });
        if (error) { toast.error("Failed to upload voice note"); voice.clearBlob(); return; }
        const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
        await handleSend({ voiceUrl: urlData.publicUrl });
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
    setUploadingMedia(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-media-files").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
      await handleSend({ imageUrl: urlData.publicUrl });
    } catch { toast.error("Failed to upload image"); }
    setUploadingMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Video upload
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("Video must be under 25MB"); return; }
    setUploadingMedia(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-media-files").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
      await handleSend({ videoUrl: urlData.publicUrl });
    } catch { toast.error("Failed to upload video"); }
    setUploadingMedia(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Location sharing
  const handleLocationShare = () => {
    if (!navigator.geolocation) { toast.error("Location not supported"); return; }
    toast.loading("Getting location...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss("loc");
        handleSend({
          locationLat: pos.coords.latitude,
          locationLng: pos.coords.longitude,
          locationLabel: "My Location",
        });
      },
      () => { toast.dismiss("loc"); toast.error("Location access denied"); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Forward message
  const handleForward = useCallback((id: string, message: string) => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied — paste it in another chat to forward");
  }, []);

  // Pin/unpin
  const handlePin = useCallback(async (id: string, pinned: boolean) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_pinned: pinned } : m));
    try {
      await (supabase as any).from("direct_messages").update({ is_pinned: pinned }).eq("id", id);
      toast.success(pinned ? "Message pinned" : "Message unpinned");
    } catch { toast.error("Failed to update pin"); }
  }, []);

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
        .from("direct_messages").select("*")
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user?.id})`)
        .order("created_at", { ascending: true }).limit(100);
      setMessages(data || []);
    }
  }, [user?.id, recipientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    updateDraft(e.target.value);
    setTyping(!!e.target.value.trim());
  };

  const scrollToMessage = useCallback((id: string) => {
    setHighlightedMsgId(id);
    const el = messageRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  }, []);

  // Pinned messages
  const pinnedMessages = messages.filter((m) => m.is_pinned);

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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-2xl border-b border-border/10 safe-area-top shadow-sm">
        <div className="px-2 py-2 flex items-center gap-2.5">
          <button onClick={onClose} className="min-h-[44px] min-w-[36px] flex items-center justify-center -ml-1 active:scale-90 transition-transform">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 shadow-sm">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            {recipientOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-background shadow-sm" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-foreground truncate leading-tight tracking-tight">{recipientName}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {recipientTyping ? (
                <span className="text-primary font-medium animate-pulse">typing...</span>
              ) : recipientOnline ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : disappearingMode ? (
                <span className="text-amber-500">⏱ Disappearing</span>
              ) : "Tap here for info"}
            </p>
          </div>

          {/* Primary actions: Video + Voice call */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => { void handleStartCall("video"); }} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all">
              <Video className="h-[19px] w-[19px] text-foreground/60" />
            </button>
            <button onClick={() => { void handleStartCall("voice"); }} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all">
              <Phone className="h-[18px] w-[18px] text-foreground/60" />
            </button>

            {/* Overflow menu for secondary actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all -mr-1">
                  <MoreVertical className="h-[18px] w-[18px] text-foreground/60" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-border/40">
              <DropdownMenuItem onClick={() => setShowSearch(true)} className="gap-2.5 text-[13px]">
                <Search className="w-4 h-4 text-muted-foreground" /> Search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMediaGallery(true)} className="gap-2.5 text-[13px]">
                <ImageIcon className="w-4 h-4 text-muted-foreground" /> Media & Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCallHistory(true)} className="gap-2.5 text-[13px]">
                <History className="w-4 h-4 text-muted-foreground" /> Call History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMiniApps(true)} className="gap-2.5 text-[13px]">
                <Zap className="w-4 h-4 text-muted-foreground" /> Mini Apps
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowPersonalization(true)} className="gap-2.5 text-[13px]">
                <Palette className="w-4 h-4 text-muted-foreground" /> Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowNotifSettings(true)} className="gap-2.5 text-[13px]">
                <Settings className="w-4 h-4 text-muted-foreground" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSecurity(true)} className="gap-2.5 text-[13px]">
                <Shield className="w-4 h-4 text-muted-foreground" /> Privacy
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Pinned messages bar */}
        {pinnedMessages.length > 0 && (
          <button
            onClick={() => scrollToMessage(pinnedMessages[pinnedMessages.length - 1].id)}
            className="w-full px-4 py-1.5 bg-primary/5 border-t border-primary/10 flex items-center gap-2 text-left"
          >
            <Pin className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[11px] text-foreground truncate flex-1">
              {pinnedMessages[pinnedMessages.length - 1].message || "📷 Media"}
            </span>
            <span className="text-[9px] text-muted-foreground">{pinnedMessages.length} pinned</span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <ChatSearch messages={messages} onClose={() => setShowSearch(false)} onScrollToMessage={scrollToMessage} currentUserId={user?.id} />
        )}
      </AnimatePresence>

      {/* Call overlay */}
      <AnimatePresence>
        {activeCall && !pipMode && (
          <CallScreen
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            recipientId={recipientId}
            callType={activeCall}
            onEnd={() => { setActiveCall(null); setPipMode(false); setPipData(null); }}
            onMinimize={(data) => {
              setPipData(data);
              setPipMode(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Picture-in-Picture floating call */}
      <AnimatePresence>
        {activeCall && pipMode && (
          <CallPiP
            remoteStream={pipData?.remoteStream || null}
            recipientName={recipientName}
            isMuted={pipData?.isMuted || false}
            duration={pipData?.duration || 0}
            onExpand={() => setPipMode(false)}
            onEndCall={() => { setActiveCall(null); setPipMode(false); setPipData(null); }}
            onToggleMute={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${getWallpaperClass(chatStyle.wallpaper)}`}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 && callEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Say hello to {recipientName}!</p>
          </div>
        ) : (
          (() => {
            // Merge messages and call events into a single timeline sorted by created_at
            const timeline: TimelineItem[] = [
              ...messages,
              ...callEvents,
            ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            return timeline.map((item) => {
              if (isCallEvent(item)) {
                return (
                  <CallEventBubble
                    key={`call-${item.id}`}
                    id={item.id}
                    callType={item.call_type as "voice" | "video"}
                    status={item.status}
                    isOutgoing={item.caller_id === user?.id}
                    durationSeconds={item.duration_seconds}
                    createdAt={item.created_at}
                    onCallback={() => handleStartCall(item.call_type as "voice" | "video")}
                    onDelete={async (callId) => {
                      await (supabase as any).from("call_events").delete().eq("id", callId);
                      toast.success("Call deleted");
                    }}
                  />
                );
              }

              const msg = item as Message;
              const isMe = msg.sender_id === user?.id;
              const repliedMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;
              const isHighlighted = highlightedMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  ref={(el) => { if (el) messageRefs.current.set(msg.id, el); }}
                  className={`transition-colors duration-500 rounded-xl ${isHighlighted ? "bg-primary/10" : ""}`}
                >
                  {/* Reply quote */}
                  {repliedMsg && (
                    <div
                      className={`mx-1 mb-0.5 px-2.5 py-1.5 rounded-lg border-l-2 border-primary/50 text-[10px] cursor-pointer ${
                        isMe ? "ml-auto max-w-[75%] bg-primary/10 text-foreground" : "max-w-[75%] bg-muted/60 text-muted-foreground"
                      }`}
                      onClick={() => scrollToMessage(repliedMsg.id)}
                    >
                      <span className="font-semibold">{repliedMsg.sender_id === user?.id ? "You" : recipientName}</span>
                      <p className="truncate">{repliedMsg.message || "📷 Media"}</p>
                    </div>
                  )}

                  {/* Location message */}
                  {msg.message_type === "location" && msg.location_lat != null && msg.location_lng != null ? (
                    <LocationShareBubble
                      lat={msg.location_lat}
                      lng={msg.location_lng}
                      label={msg.location_label || undefined}
                      isMe={isMe}
                      time={formatMsgTime(msg.created_at)}
                    />
                  ) : msg.message_type === "voice" && msg.voice_url ? (
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] min-w-[220px] px-3 py-2.5 rounded-2xl shadow-sm ${
                        isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                      } ${msg.id.startsWith("opt-") ? "opacity-60" : ""}`}>
                        <VoiceMessagePlayer url={msg.voice_url} isMe={isMe} />
                        <span className={`text-[9px] block text-right mt-1 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground/70"}`}>
                          {formatMsgTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <ChatMessageBubble
                      id={msg.id}
                      message={msg.message}
                      time={formatMsgTime(msg.created_at)}
                      isMe={isMe}
                      isRead={msg.is_read}
                      isDelivered={!!msg.delivered_at}
                      imageUrl={msg.image_url}
                      videoUrl={msg.video_url}
                      isPinned={msg.is_pinned}
                      expiresAt={msg.expires_at}
                      onReply={handleReply}
                      onDelete={handleDelete}
                      onForward={handleForward}
                      onPin={handlePin}
                    />
                  )}
                </div>
              );
            });
          })()
        )}

        {/* Typing indicator */}
        {recipientTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <motion.span className="h-2 w-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
              <motion.span className="h-2 w-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
              <motion.span className="h-2 w-2 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
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

      {/* Voice recording overlay */}
      <AnimatePresence>
        {voice.isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive/5 border-t border-destructive/20 px-3 py-2.5 flex items-center gap-3"
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-destructive shrink-0"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />

            {/* Live waveform visualization */}
            <div className="flex-1 flex items-center gap-[2px] h-7 overflow-hidden">
              {Array.from({ length: 24 }, (_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-destructive/60"
                  style={{ minHeight: 3 }}
                  animate={{
                    height: ["20%", `${30 + Math.random() * 70}%`, "20%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4 + Math.random() * 0.4,
                    delay: i * 0.03,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <span className="text-xs font-mono font-semibold text-destructive tabular-nums shrink-0">
              {Math.floor(voice.duration / 60)}:{(voice.duration % 60).toString().padStart(2, "0")}
            </span>

            <button
              onClick={voice.cancelRecording}
              className="text-[11px] text-muted-foreground px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={voice.stopRecording}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      {!voice.isRecording && (
        <div className="bg-background/95 backdrop-blur-sm border-t border-border/15 px-2.5 py-2 relative" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>
          <div className="flex items-end gap-1.5">
            {/* Attach */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={uploadingMedia}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  showAttachMenu ? "bg-primary text-primary-foreground rotate-45" : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {uploadingMedia ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Plus className="h-5 w-5" />}
              </button>
              <ChatAttachMenu
                open={showAttachMenu}
                onClose={() => setShowAttachMenu(false)}
                onImageSelect={() => fileInputRef.current?.click()}
                onVideoSelect={() => videoInputRef.current?.click()}
                onLocationShare={handleLocationShare}
                onToggleDisappearing={() => {
                  setDisappearingMode(!disappearingMode);
                  toast.success(disappearingMode ? "Disappearing messages OFF" : "Disappearing messages ON — messages auto-delete after 24h");
                }}
                disappearingEnabled={disappearingMode}
              />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={videoInputRef} type="file" accept="video/*,.gif" className="hidden" onChange={handleVideoSelect} />

            {/* Document upload */}
            <ChatMediaUploader
              recipientId={recipientId}
              onMediaSent={(opts) => {
                if (opts.imageUrl) handleSend({ imageUrl: opts.imageUrl });
                else if (opts.videoUrl) handleSend({ videoUrl: opts.videoUrl });
                else if (opts.fileUrl) handleSend({ imageUrl: opts.fileUrl });
              }}
              renderTrigger={(openFilePicker) => (
                <button onClick={openFilePicker} className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-muted/60 hover:text-muted-foreground active:scale-90 transition-all shrink-0">
                  <FileText className="h-[17px] w-[17px]" />
                </button>
              )}
            />

            {/* Input field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={disappearingMode ? "Disappearing message..." : "Message..."}
                className={`w-full h-11 pl-4 pr-12 rounded-full border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/20 transition-all shadow-sm ${
                  disappearingMode ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/30 border-border/15"
                }`}
              />
              {/* Inline icons inside input */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0">
                <button
                  onClick={() => setShowStickerKeyboard(!showStickerKeyboard)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    showStickerKeyboard ? "text-primary bg-primary/10" : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <Smile className="h-[19px] w-[19px]" />
                </button>
              </div>
            </div>

            {/* Send or Mic button — contextual */}
            {input.trim() ? (
              <button
                onClick={() => handleSend()}
                disabled={sending}
                className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0 shadow-md"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-[17px] w-[17px]" />}
              </button>
            ) : (
              <button
                onClick={voice.startRecording}
                className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/15 active:scale-90 transition-all shrink-0 shadow-sm"
              >
                <Mic className="h-[19px] w-[19px]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticker keyboard */}
      <AnimatePresence>
        {showStickerKeyboard && (
          <StickerKeyboard
            open={showStickerKeyboard}
            onClose={() => setShowStickerKeyboard(false)}
            onSendSticker={(sticker) => {
              setInput((prev) => prev + sticker);
              setShowStickerKeyboard(false);
              inputRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>

      {/* Notification settings */}
      <ChatNotificationSettings
        open={showNotifSettings}
        onClose={() => setShowNotifSettings(false)}
        chatPartnerId={recipientId}
        chatPartnerName={recipientName}
      />

      {/* Media gallery */}
      <AnimatePresence>
        {showMediaGallery && (
          <ChatMediaGallery
            open={showMediaGallery}
            onClose={() => setShowMediaGallery(false)}
            recipientId={recipientId}
            recipientName={recipientName}
          />
        )}
      </AnimatePresence>

      {/* Personalization */}
      <ChatPersonalization
        open={showPersonalization}
        onClose={() => setShowPersonalization(false)}
        chatPartnerId={recipientId}
        chatPartnerName={recipientName}
        onApply={(s) => setChatStyle(s)}
      />

      {/* Mini Apps */}
      <ChatMiniApps
        open={showMiniApps}
        onClose={() => setShowMiniApps(false)}
        chatPartnerId={recipientId}
        chatPartnerName={recipientName}
      />

      {/* Security */}
      <ChatSecurity
        open={showSecurity}
        onClose={() => setShowSecurity(false)}
        chatPartnerId={recipientId}
        chatPartnerName={recipientName}
        onBlock={onClose}
      />

      {/* Call History */}
      <AnimatePresence>
        {showCallHistory && (
          <CallHistoryPage
            onClose={() => setShowCallHistory(false)}
            onCallUser={(userId, type) => {
              setShowCallHistory(false);
              handleStartCall(type);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
