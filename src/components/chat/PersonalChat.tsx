/**
 * PersonalChat — iMessage 2026-style 1-on-1 chat
 * Features: realtime messages, image/video/GIF sharing, emoji reactions, typing indicator, online status,
 * voice messages, reply threads, message search, disappearing messages, forward, pin, location sharing,
 * message effects (confetti, fireworks, hearts, lasers)
 */
import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Phone from "lucide-react/dist/esm/icons/phone";
import X from "lucide-react/dist/esm/icons/x";
import Mic from "lucide-react/dist/esm/icons/mic";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pin from "lucide-react/dist/esm/icons/pin";
import Settings from "lucide-react/dist/esm/icons/settings";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Smile from "lucide-react/dist/esm/icons/smile";
import Palette from "lucide-react/dist/esm/icons/palette";
import Zap from "lucide-react/dist/esm/icons/zap";
import Shield from "lucide-react/dist/esm/icons/shield";
import Video from "lucide-react/dist/esm/icons/video";
import History from "lucide-react/dist/esm/icons/history";
import FileText from "lucide-react/dist/esm/icons/file-text";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import PhoneCall from "lucide-react/dist/esm/icons/phone-call";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { primeCallAudio } from "@/lib/callAudio";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatAttachMenu from "./ChatAttachMenu";
import type { StickerSendPayload } from "./StickerKeyboard";
import { getWallpaperClass, getWallpaperStyle } from "./ChatPersonalization";
import CallEventBubble from "./CallEventBubble";

// Lazy-loaded panels (only downloaded when user opens them)
const CallScreen = lazy(() => import("./CallScreen"));
const CallPiP = lazy(() => import("./CallPiP"));
const VoiceMessagePlayer = lazy(() => import("./VoiceMessagePlayer"));
const LocationShareBubble = lazy(() => import("./LocationShareBubble"));
const ChatSearch = lazy(() => import("./ChatSearch"));
const ChatNotificationSettings = lazy(() => import("./ChatNotificationSettings"));
const ChatMediaGallery = lazy(() => import("./ChatMediaGallery"));
const ChatPersonalization = lazy(() => import("./ChatPersonalization"));
const ChatMiniApps = lazy(() => import("./ChatMiniApps"));
const ChatSecurity = lazy(() => import("./ChatSecurity"));
const CallHistoryPage = lazy(() => import("./CallHistoryPage"));
const ChatMediaUploader = lazy(() => import("./ChatMediaUploader").then(m => ({ default: m.ChatMediaUploader })));
const LockedMediaPricePicker = lazy(() => import("./LockedMediaPricePicker"));
const ChatContactInfo = lazy(() => import("./ChatContactInfo"));
const MessageScheduler = lazy(() => import("./MessageScheduler"));
const PinnedMessagesPanel = lazy(() => import("./PinnedMessagesPanel"));
import { detectMessageEffect, type EffectType } from "./MessageEffects";
const MessageEffects = lazy(() => import("./MessageEffects"));
import { toast } from "sonner";
import { useChatPresence } from "@/hooks/useChatPresence";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useChatDraft } from "@/hooks/useChatDraft";

const StickerKeyboard = lazy(() => import("./StickerKeyboard"));

interface PersonalChatProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  onClose: () => void;
  autoStartCall?: "voice" | "video" | null;
  onCallStarted?: () => void;
  /** Render inline (inside parent) instead of fixed full-screen overlay */
  inline?: boolean;
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
  locked_price_cents?: number | null;
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

export default function PersonalChat({ recipientId, recipientName, recipientAvatar, onClose, autoStartCall, onCallStarted, inline = false }: PersonalChatProps) {
  const { user } = useAuth();

  // Notify global listener that this chat is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("chat-opened", { detail: { recipientId } }));
    return () => {
      window.dispatchEvent(new CustomEvent("chat-closed"));
    };
  }, [recipientId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, { emoji: string; count: number; hasMyReaction: boolean }[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeCall, setActiveCall] = useState<"voice" | "video" | null>(null);
  const [pipMode, setPipMode] = useState(false);
  const [pipData, setPipData] = useState<{ remoteStream: MediaStream | null; duration: number; isMuted: boolean; callType: "voice" | "video"; isCameraOff: boolean } | null>(null);
  const [pipControls, setPipControls] = useState<{ toggleMute: () => void; endCall: () => void; toggleCamera: () => void } | null>(null);
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
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);
  const [showLockedPricePicker, setShowLockedPricePicker] = useState(false);
  const [pendingLockedFile, setPendingLockedFile] = useState<File | null>(null);
  const [chatStyle, setChatStyle] = useState({ wallpaper: "default", themeColor: "default", fontSize: "medium" });
  const [callEvents, setCallEvents] = useState<CallEvent[]>([]);
  const [dismissedMissedCallId, setDismissedMissedCallId] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<EffectType>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const lockedImageInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const timelineRef = useRef<HTMLDivElement>(null);

  const { isTyping: recipientTyping, isOnline: recipientOnline, lastSeen: recipientLastSeen, setTyping } = useChatPresence(user?.id, recipientId);
  const voice = useVoiceRecorder();
  const { draft, updateDraft, clearDraft } = useChatDraft(user?.id, recipientId);

  // Sync draft to input on load
  useEffect(() => {
    if (draft && !input) setInput(draft);
  }, [draft]);

  // Load saved chat personalization on mount
  useEffect(() => {
    if (!user?.id || !recipientId) return;
    const loadStyle = async () => {
      const { data } = await (supabase as any)
        .from("chat_settings")
        .select("wallpaper, theme_color, font_size")
        .eq("user_id", user.id)
        .eq("chat_partner_id", recipientId)
        .maybeSingle();
      if (data) {
        setChatStyle({
          wallpaper: data.wallpaper || "default",
          themeColor: data.theme_color || "default",
          fontSize: data.font_size || "medium",
        });
      }
    };
    loadStyle();
  }, [user?.id, recipientId]);

  const isNearBottomRef = useRef(true);

  const scrollToBottom = useCallback((force?: boolean) => {
    if (!force && !isNearBottomRef.current) return;
    // Use multiple attempts to ensure DOM is rendered
    const doScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    // Immediate + deferred to catch both fast and slow renders
    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 100);
      setTimeout(doScroll, 300);
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Consider "near bottom" if within 150px of the bottom
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    const timeline = timelineRef.current;
    if (!scroller || !timeline || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (!isNearBottomRef.current) return;
      scroller.scrollTop = scroller.scrollHeight;
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
      });
    });

    observer.observe(timeline);
    return () => observer.disconnect();
  }, [messages.length, callEvents.length]);

  useEffect(() => {
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  const handleStartCall = useCallback(async (type: "voice" | "video") => {
    void primeCallAudio();
    setActiveCall(type);
  }, []);

  // Auto-start call from profile page deep-link
  const autoStartFiredRef = useRef(false);
  useEffect(() => {
    if (autoStartCall && !autoStartFiredRef.current && !loading) {
      autoStartFiredRef.current = true;
      void handleStartCall(autoStartCall);
      onCallStarted?.();
    }
  }, [autoStartCall, loading, handleStartCall, onCallStarted]);

  const sendChatPush = useCallback(async (messageType: string, messageText: string) => {
    if (!user?.id || !recipientId || recipientId === user.id) return;

    let senderName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Someone";

    // Fetch sender's profile for accurate name & avatar
    let senderAvatarUrl = "";
    try {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.full_name) senderName = profile.full_name;
      senderAvatarUrl = profile?.avatar_url || "";
    } catch { /* ignore */ }

    let preview = "";
    if (messageType === "image") preview = "Sent you a photo 📷";
    else if (messageType === "locked_image") preview = "Sent you a locked photo 🔒📷";
    else if (messageType === "video") preview = "Sent you a video 🎥";
    else if (messageType === "locked_video") preview = "Sent you a locked video 🔒🎥";
    else if (messageType === "voice") preview = "Sent you a voice message 🎤";
    else if (messageType === "location") preview = "Shared a location 📍";
    else if (messageType === "sticker") preview = "Sent a sticker 🎭";
    else if (messageType === "gif") preview = "Sent a GIF";
    else if (messageText.trim()) {
      const trimmed = messageText.trim();
      preview = trimmed.length > 100 ? `${trimmed.slice(0, 97)}...` : trimmed;
    } else {
      preview = "Sent you a message";
    }

    try {
      await supabase.functions.invoke("send-push-notification", {
        body: {
          user_id: recipientId,
          notification_type: "chat_message",
          title: senderName,
          body: preview,
          data: {
            type: "chat_message",
            sender_id: user.id,
            sender_name: senderName,
            sender_avatar_url: senderAvatarUrl,
            action_url: `/chat`,
          },
          image_url: senderAvatarUrl,
        },
      });
    } catch (pushError) {
      console.error("[Chat] Failed to send push notification:", pushError);
    }
  }, [recipientId, user]);

  // Scroll to bottom after messages render (when loading transitions to false)
  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      scrollToBottom(true);
    }
  }, [loading, messages.length, scrollToBottom]);

  // Load messages
  useEffect(() => {
    if (!user?.id) return;
    initialScrollDone.current = false;
    const load = async () => {
      setLoading(true);
      const [msgRes, callRes] = await Promise.all([
        (supabase as any)
          .from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(200),
        (supabase as any)
          .from("call_history")
          .select("*")
          .or(`and(caller_id.eq.${user.id},callee_id.eq.${recipientId}),and(caller_id.eq.${recipientId},callee_id.eq.${user.id})`)
          .order("created_at", { ascending: true })
          .limit(50),
      ]);
      const data = (msgRes.data || []).reverse();
      setMessages(data);
      setCallEvents((callRes.data || []).map((c: any) => ({ ...c, _isCallEvent: true as const })));
      setLoading(false);

      // Batch-load all reactions in ONE query instead of per-message
      const msgIds = data.filter((m: Message) => !m.id.startsWith("opt-")).map((m: Message) => m.id);
      if (msgIds.length > 0) {
        const { data: reactionsData } = await (supabase as any)
          .from("message_reactions")
          .select("message_id, emoji, user_id")
          .in("message_id", msgIds);
        if (reactionsData) {
          const grouped: Record<string, Record<string, { count: number; hasMyReaction: boolean }>> = {};
          for (const r of reactionsData) {
            if (!grouped[r.message_id]) grouped[r.message_id] = {};
            if (!grouped[r.message_id][r.emoji]) grouped[r.message_id][r.emoji] = { count: 0, hasMyReaction: false };
            grouped[r.message_id][r.emoji].count++;
            if (r.user_id === user.id) grouped[r.message_id][r.emoji].hasMyReaction = true;
          }
          const map: Record<string, { emoji: string; count: number; hasMyReaction: boolean }[]> = {};
          for (const [msgId, emojis] of Object.entries(grouped)) {
            map[msgId] = Object.entries(emojis).map(([emoji, v]) => ({ emoji, ...v }));
          }
          setReactionsMap(map);
        }
      }

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

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `call-history-${[user.id, recipientId].sort().join("-")}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_history" }, (payload: any) => {
        const call = payload.new as Omit<CallEvent, "_isCallEvent">;
        if (
          (call.caller_id === user.id && call.callee_id === recipientId) ||
          (call.caller_id === recipientId && call.callee_id === user.id)
        ) {
          setCallEvents((prev) => {
            if (prev.some((item) => item.id === call.id)) return prev;
            return [...prev, { ...call, _isCallEvent: true as const }];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [recipientId, user?.id]);

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
    scrollToBottom(true);
    setTyping(false);

    // Trigger message effect if detected
    const effect = detectMessageEffect(text);
    if (effect) setActiveEffect(effect);

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
      void sendChatPush(msgType, text);
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

  // Locked media: first show price picker
  const handleLockedMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const isVideo = file.type.startsWith("video");
    const maxSize = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) { toast.error(`File must be under ${isVideo ? "25MB" : "5MB"}`); return; }
    setPendingLockedFile(file);
    setShowLockedPricePicker(true);
    if (lockedImageInputRef.current) lockedImageInputRef.current.value = "";
  };

  // Locked media: upload after price confirmed
  const handleLockedMediaConfirm = async (priceCents: number) => {
    setShowLockedPricePicker(false);
    const file = pendingLockedFile;
    setPendingLockedFile(null);
    if (!file || !user?.id) return;
    const isVideo = file.type.startsWith("video");
    setUploadingMedia(true);
    try {
      const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
      const path = `${user.id}/locked_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-media-files").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);
      const messageType = isVideo ? "locked_video" : "locked_image";
      const priceLabel = `$${(priceCents / 100).toFixed(2)}`;
      const label = isVideo ? `🔒 Locked Video · ${priceLabel}` : `🔒 Locked Photo · ${priceLabel}`;
      const text = input.trim();
      setInput("");
      clearDraft();
      setSending(true);
      const optimisticId = `opt-${Date.now()}`;
      const optimisticMsg: Message = {
        id: optimisticId, sender_id: user.id, receiver_id: recipientId,
        message: text || label,
        image_url: isVideo ? null : urlData.publicUrl,
        video_url: isVideo ? urlData.publicUrl : null,
        voice_url: null, message_type: messageType,
        reply_to_id: null, location_lat: null, location_lng: null, location_label: null,
        is_pinned: false, expires_at: null, created_at: new Date().toISOString(), is_read: false,
        locked_price_cents: priceCents,
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      scrollToBottom(true);

      const { data, error: insertErr } = await (supabase as any)
        .from("direct_messages")
        .insert({
          sender_id: user.id, receiver_id: recipientId,
          message: text || label,
          image_url: isVideo ? null : urlData.publicUrl,
          video_url: isVideo ? urlData.publicUrl : null,
          message_type: messageType,
          locked_price_cents: priceCents,
        })
        .select().single();
      if (insertErr) throw insertErr;
      setMessages((prev) => prev.map((m) => m.id === optimisticId ? data : m));
      void sendChatPush(messageType, text || label);
    } catch { toast.error("Failed to upload locked media"); }
    setUploadingMedia(false);
    setSending(false);
  };


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

  const handleQuickPanelSend = useCallback(async (payload: StickerSendPayload) => {
    if (!user?.id || sending) return;
    const text = payload.text?.trim();
    if (!text) return;

    const msgType = payload.messageType === "sticker" || payload.messageType === "gif"
      ? payload.messageType
      : "text";

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      sender_id: user.id,
      receiver_id: recipientId,
      message: text,
      image_url: null,
      video_url: null,
      voice_url: null,
      message_type: msgType,
      reply_to_id: null,
      location_lat: null,
      location_lng: null,
      location_label: null,
      is_pinned: false,
      expires_at: null,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const { data, error } = await (supabase as any)
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          receiver_id: recipientId,
          message: text,
          message_type: msgType,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => prev.map((m) => m.id === optimisticId ? data : m));
      void sendChatPush(msgType, text);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error("Failed to send item");
    }

    setShowStickerKeyboard(false);
    inputRef.current?.focus();
  }, [recipientId, scrollToBottom, sendChatPush, sending, user?.id]);

  const scrollToMessage = useCallback((id: string) => {
    setHighlightedMsgId(id);
    const el = messageRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  }, []);

  // Pinned messages
  const pinnedMessages = useMemo(() => messages.filter((m) => m.is_pinned), [messages]);

  // Memoize merged + sorted timeline to avoid re-sorting on every render
  const timeline = useMemo<TimelineItem[]>(() => {
    return [...messages, ...callEvents].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages, callEvents]);

  const latestMissedCall = useMemo(() => {
    return [...callEvents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find((event) => ["missed", "no_answer", "declined"].includes(event.status));
  }, [callEvents]);

  const initials = useMemo(
    () => (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    [recipientName]
  );

  // Stabilize CallEventBubble callbacks
  const handleCallDelete = useCallback(async (callId: string) => {
    await (supabase as any).from("call_events").delete().eq("id", callId);
    setCallEvents(prev => prev.filter(c => c.id !== callId));
    toast.success("Call deleted");
  }, []);

  const handleCallDeleteAll = useCallback(async () => {
    setCallEvents(prev => {
      const ids = prev.map(c => c.id);
      if (ids.length > 0) {
        (supabase as any).from("call_events").delete().in("id", ids).then(() => {
          toast.success(`${ids.length} call${ids.length > 1 ? "s" : ""} deleted`);
        });
      }
      return [];
    });
  }, []);

  return (
    <motion.div
      className={inline
        ? "absolute inset-0 z-50 flex flex-col overflow-hidden h-full w-full bg-background"
        : "fixed inset-0 z-[1300] bg-background flex flex-col overflow-hidden"
      }
      initial={inline ? { opacity: 0 } : { x: "100%" }}
      animate={inline ? { opacity: 1 } : { x: 0 }}
      exit={inline ? { opacity: 0 } : { x: "100%" }}
      transition={inline ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/5 safe-area-top">
        <div className="px-2 py-2.5 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[36px] flex items-center justify-center -ml-1 active:scale-90 transition-transform">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="relative shrink-0">
            <Avatar className="h-[42px] w-[42px] ring-2 ring-border/10">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback className="text-xs font-bold bg-primary/8 text-primary">{initials}</AvatarFallback>
            </Avatar>
            {recipientOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
            )}
          </div>
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setShowContactInfo(true)}>
            <p className="text-[15px] font-semibold text-foreground truncate leading-tight">{recipientName}</p>
            <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">
              {recipientTyping ? (
                <span className="text-primary font-medium animate-pulse">typing...</span>
              ) : recipientOnline ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : disappearingMode ? (
                <span className="text-amber-500">⏱ Disappearing</span>
              ) : recipientLastSeen ? (
                <span className="text-muted-foreground">Last seen {recipientLastSeen}</span>
              ) : "Tap here for info"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { void handleStartCall("video"); }}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-blue-500/10 active:bg-blue-500/15 transition-colors"
            >
              <Video className="h-5 w-5 text-blue-500" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { void handleStartCall("voice"); }}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-emerald-500/10 active:bg-emerald-500/15 transition-colors"
            >
              <Phone className="h-[19px] w-[19px] text-emerald-500" />
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted/50 active:scale-90 transition-all -mr-1">
                  <MoreVertical className="h-5 w-5 text-foreground/50" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-52 bg-background/95 backdrop-blur-xl border-border/30 shadow-xl shadow-black/10 rounded-xl p-1.5">
              <DropdownMenuItem onClick={() => setShowSearch(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Search className="w-[18px] h-[18px] text-muted-foreground" /> Search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMediaGallery(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <ImageIcon className="w-[18px] h-[18px] text-muted-foreground" /> Media & Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCallHistory(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <History className="w-[18px] h-[18px] text-muted-foreground" /> Call History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMiniApps(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Zap className="w-[18px] h-[18px] text-muted-foreground" /> Mini Apps
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-border/15" />
              <DropdownMenuItem onClick={() => setShowPinnedPanel(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Pin className="w-[18px] h-[18px] text-muted-foreground" /> Pinned Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPersonalization(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Palette className="w-[18px] h-[18px] text-muted-foreground" /> Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowNotifSettings(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Settings className="w-[18px] h-[18px] text-muted-foreground" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSecurity(true)} className="gap-3 text-[14px] font-medium rounded-lg px-3 py-2.5 cursor-pointer">
                <Shield className="w-[18px] h-[18px] text-muted-foreground" /> Privacy
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Pinned messages bar */}
        {pinnedMessages.length > 0 && (
          <button
            onClick={() => setShowPinnedPanel(true)}
            className="w-full px-4 py-1.5 bg-primary/5 border-t border-primary/10 flex items-center gap-2 text-left"
          >
            <Pin className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[11px] text-foreground truncate flex-1">
              {pinnedMessages[pinnedMessages.length - 1].message || "📷 Media"}
            </span>
            <span className="text-[9px] text-muted-foreground">{pinnedMessages.length} pinned</span>
          </button>
        )}

        {latestMissedCall && latestMissedCall.id !== dismissedMissedCallId && !activeCall && (
          <div className="w-full px-4 py-2 border-t border-amber-500/15 bg-amber-500/8 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-amber-700 truncate">
                {latestMissedCall.call_type === "video" ? "Missed video call" : "Missed voice call"}
              </p>
              <p className="text-[11px] text-amber-700/70 truncate">
                {latestMissedCall.status === "declined"
                  ? "Call was declined. Tap below to call back."
                  : "Tap below to call back quickly."}
              </p>
            </div>
            <button
              onClick={() => { void handleStartCall(latestMissedCall.call_type as "voice" | "video"); }}
              title={latestMissedCall.call_type === "video" ? "Call back with video" : "Call back with voice"}
              aria-label={latestMissedCall.call_type === "video" ? "Call back with video" : "Call back with voice"}
              className="h-9 px-3 rounded-full bg-amber-500 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0"
            >
              {latestMissedCall.call_type === "video" ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
              Call back
            </button>
            <button
              onClick={() => setDismissedMissedCallId(latestMissedCall.id)}
              title="Dismiss missed call banner"
              aria-label="Dismiss missed call banner"
              className="h-8 w-8 rounded-full flex items-center justify-center text-amber-700/70 hover:bg-amber-500/10 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeCall && pipMode && (
          <button
            onClick={() => setPipMode(false)}
            className="w-full px-4 py-2 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between gap-2 text-left"
          >
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
              <PhoneCall className="w-3.5 h-3.5" />
              Return to call
            </span>
            <span className="text-[11px] tabular-nums text-emerald-700/80">
              {`${Math.floor((pipData?.duration || 0) / 60).toString().padStart(2, "0")}:${((pipData?.duration || 0) % 60).toString().padStart(2, "0")}`}
            </span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <Suspense fallback={null}>
            <ChatSearch messages={messages} onClose={() => setShowSearch(false)} onScrollToMessage={scrollToMessage} currentUserId={user?.id} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Call overlay */}
      <AnimatePresence>
        {activeCall && (
          <Suspense fallback={null}>
            <CallScreen
              recipientName={recipientName}
              recipientAvatar={recipientAvatar}
              recipientId={recipientId}
              callType={activeCall}
              minimized={pipMode}
              onEnd={() => { setActiveCall(null); setPipMode(false); setPipData(null); setPipControls(null); }}
              onMinimize={(data) => {
                setPipData(data);
                setPipMode(true);
              }}
              onPipStateChange={(data) => {
                setPipData(data);
              }}
              onPipControlsChange={(controls) => {
                setPipControls(controls);
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Picture-in-Picture floating call */}
      <AnimatePresence>
        {activeCall && pipMode && (
          <Suspense fallback={null}>
            <CallPiP
              remoteStream={pipData?.remoteStream || null}
              recipientName={recipientName}
              isMuted={pipData?.isMuted || false}
              duration={pipData?.duration || 0}
              callType={pipData?.callType}
              isCameraOff={pipData?.isCameraOff}
              onExpand={() => setPipMode(false)}
              onEndCall={() => {
                if (pipControls) {
                  pipControls.endCall();
                  return;
                }
                setActiveCall(null);
                setPipMode(false);
                setPipData(null);
              }}
              onToggleMute={() => {
                pipControls?.toggleMute();
              }}
              onToggleCamera={() => {
                if ((pipData?.callType || activeCall) === "video") {
                  pipControls?.toggleCamera();
                }
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col ${getWallpaperClass(chatStyle.wallpaper)}`}
        style={{
          ...getWallpaperStyle(chatStyle.wallpaper),
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
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
          <div ref={timelineRef} className="mt-auto space-y-2">
            {timeline.map((item) => {
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
                      onDelete={handleCallDelete}
                      onDeleteAll={handleCallDeleteAll}
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
                        messageType={msg.message_type}
                        senderId={msg.sender_id}
                        lockedPriceCents={msg.locked_price_cents}
                        initialReactions={reactionsMap[msg.id]}
                        onReply={handleReply}
                        onDelete={handleDelete}
                        onForward={handleForward}
                        onPin={handlePin}
                      />
                    )}
                  </div>
                );
            })}

            {/* Typing indicator — 2026 style */}
            {recipientTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="flex justify-start px-1"
              >
                <div className="bg-muted/70 backdrop-blur-xl rounded-[22px] rounded-bl-[6px] px-4 py-3 flex items-center gap-2 shadow-sm border border-border/10">
                  <div className="flex items-center gap-1">
                    <motion.span className="h-[6px] w-[6px] rounded-full bg-primary/60" animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0 }} />
                    <motion.span className="h-[6px] w-[6px] rounded-full bg-primary/60" animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.15 }} />
                    <motion.span className="h-[6px] w-[6px] rounded-full bg-primary/60" animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.3 }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">{recipientName.split(" ")[0]} is typing</span>
                </div>
              </motion.div>
            )}
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
        <div className="bg-background/80 backdrop-blur-2xl border-t border-border/5 px-2.5 py-2 relative" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>
          <div className="flex items-end gap-1.5">
            {/* Attach */}
            <div className="relative shrink-0">
              <button
                data-attach-trigger
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={uploadingMedia}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  showAttachMenu ? "bg-primary text-primary-foreground rotate-45" : "text-muted-foreground/60 hover:bg-muted/50"
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
                onLockedImageSelect={() => lockedImageInputRef.current?.click()}

              />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={videoInputRef} type="file" accept="video/*,.gif" className="hidden" onChange={handleVideoSelect} />
            <input ref={lockedImageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleLockedMediaSelect} />

            {/* Locked media price picker */}
            {showLockedPricePicker && (
              <Suspense fallback={null}>
                <LockedMediaPricePicker
                  open={showLockedPricePicker}
                  onClose={() => { setShowLockedPricePicker(false); setPendingLockedFile(null); }}
                  onConfirm={handleLockedMediaConfirm}
                />
              </Suspense>
            )}

            {/* Document upload */}
            <ChatMediaUploader
              recipientId={recipientId}
              onMediaSent={(opts) => {
                if (opts.imageUrl) handleSend({ imageUrl: opts.imageUrl });
                else if (opts.videoUrl) handleSend({ videoUrl: opts.videoUrl });
                else if (opts.fileUrl) handleSend({ imageUrl: opts.fileUrl });
              }}
              renderTrigger={(openFilePicker) => (
                <button onClick={openFilePicker} className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground/60 hover:bg-muted/50 active:scale-90 transition-all shrink-0">
                  <FileText className="h-[18px] w-[18px]" />
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
                className={`w-full h-11 pl-4 pr-12 rounded-full text-[14.5px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all ${
                  disappearingMode
                    ? "bg-amber-500/5 border border-amber-500/15 focus:ring-2 focus:ring-amber-500/10"
                    : "bg-muted/30 border border-border/10 focus:ring-2 focus:ring-primary/15 focus:border-primary/20"
                }`}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  onClick={() => setShowStickerKeyboard(!showStickerKeyboard)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    showStickerKeyboard ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Send or Mic */}
            {input.trim() ? (
              <button
                onClick={() => handleSend()}
                onContextMenu={(e) => { e.preventDefault(); setShowScheduler(true); }}
                disabled={sending}
                className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all shrink-0 shadow-sm"
                title="Long press to schedule"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-[17px] w-[17px]" />}
              </button>
            ) : (
              <button
                onClick={voice.startRecording}
                className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/15 active:scale-90 transition-all shrink-0"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticker keyboard */}
      <AnimatePresence>
        {showStickerKeyboard && (
          <Suspense fallback={null}>
            <StickerKeyboard
              open={showStickerKeyboard}
              onClose={() => setShowStickerKeyboard(false)}
              onSendSticker={(payload) => { void handleQuickPanelSend(payload); }}
              onStartVoice={() => voice.startRecording()}
              onOpenCamera={() => fileInputRef.current?.click()}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Notification settings */}
      {showNotifSettings && (
        <Suspense fallback={null}>
          <ChatNotificationSettings
            open={showNotifSettings}
            onClose={() => setShowNotifSettings(false)}
            chatPartnerId={recipientId}
            chatPartnerName={recipientName}
          />
        </Suspense>
      )}

      {/* Media gallery */}
      {showMediaGallery && (
        <Suspense fallback={null}>
          <ChatMediaGallery
            open={showMediaGallery}
            onClose={() => setShowMediaGallery(false)}
            recipientId={recipientId}
            recipientName={recipientName}
          />
        </Suspense>
      )}

      {/* Personalization */}
      {showPersonalization && (
        <Suspense fallback={null}>
          <ChatPersonalization
            open={showPersonalization}
            onClose={() => setShowPersonalization(false)}
            chatPartnerId={recipientId}
            chatPartnerName={recipientName}
            onApply={(s) => setChatStyle(s)}
          />
        </Suspense>
      )}

      {/* Mini Apps */}
      {showMiniApps && (
        <Suspense fallback={null}>
          <ChatMiniApps
            open={showMiniApps}
            onClose={() => setShowMiniApps(false)}
            chatPartnerId={recipientId}
            chatPartnerName={recipientName}
          />
        </Suspense>
      )}

      {/* Security */}
      {showSecurity && (
        <Suspense fallback={null}>
          <ChatSecurity
            open={showSecurity}
            onClose={() => setShowSecurity(false)}
            chatPartnerId={recipientId}
            chatPartnerName={recipientName}
            onBlock={onClose}
          />
        </Suspense>
      )}

      {/* Call History */}
      {showCallHistory && (
        <Suspense fallback={null}>
          <CallHistoryPage
            onClose={() => setShowCallHistory(false)}
            onCallUser={(userId, type) => {
              setShowCallHistory(false);
              handleStartCall(type);
            }}
          />
        </Suspense>
      )}

      {/* Contact Info */}
      {showContactInfo && (
        <Suspense fallback={null}>
          <ChatContactInfo
            recipientId={recipientId}
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            isOnline={recipientOnline}
            lastSeen={recipientLastSeen}
            onClose={() => setShowContactInfo(false)}
            onStartCall={(type) => { setShowContactInfo(false); void handleStartCall(type); }}
            onOpenMediaGallery={() => { setShowContactInfo(false); setShowMediaGallery(true); }}
            onOpenSearch={() => { setShowContactInfo(false); setShowSearch(true); }}
            onOpenCallHistory={() => { setShowContactInfo(false); setShowCallHistory(true); }}
            onOpenPersonalization={() => { setShowContactInfo(false); setShowPersonalization(true); }}
            onOpenSecurity={() => { setShowContactInfo(false); setShowSecurity(true); }}
            onOpenMiniApps={() => { setShowContactInfo(false); setShowMiniApps(true); }}
            onOpenNotifSettings={() => { setShowContactInfo(false); setShowNotifSettings(true); }}
          />
        </Suspense>
      )}

      {/* Message Scheduler */}
      {showScheduler && (
        <Suspense fallback={null}>
          <MessageScheduler
            open={showScheduler}
            onClose={() => setShowScheduler(false)}
            message={input}
            onSchedule={async (scheduledAt) => {
              if (!user?.id || !input.trim()) return;
              try {
                await (supabase as any).from("scheduled_messages").insert({
                  sender_id: user.id,
                  receiver_id: recipientId,
                  message: input.trim(),
                  scheduled_at: scheduledAt.toISOString(),
                });
                setInput("");
                clearDraft();
                setShowScheduler(false);
                toast.success(`Message scheduled for ${format(scheduledAt, "MMM d, h:mm a")}`);
              } catch {
                toast.error("Failed to schedule message");
              }
            }}
          />
        </Suspense>
      )}

      {/* Pinned Messages Panel */}
      {showPinnedPanel && (
        <Suspense fallback={null}>
          <PinnedMessagesPanel
            open={showPinnedPanel}
            onClose={() => setShowPinnedPanel(false)}
            messages={pinnedMessages.map(m => ({
              id: m.id,
              message: m.message,
              sender_name: m.sender_id === user?.id ? "You" : recipientName,
              time: formatMsgTime(m.created_at),
              isMe: m.sender_id === user?.id,
            }))}
            onJumpToMessage={scrollToMessage}
            onUnpin={(id) => handlePin(id, false)}
          />
        </Suspense>
      )}

      {/* Message effects overlay */}
      {activeEffect && (
        <Suspense fallback={null}>
          <MessageEffects effect={activeEffect} onComplete={() => setActiveEffect(null)} />
        </Suspense>
      )}
    </motion.div>
  );
}
