/**
 * ChatMessageBubble — iMessage 2026-style message bubble
 * Features: long-press actions (reply/delete/copy/forward/pin), swipe-to-reply, emoji reactions, image/video display
 * Design: Glassmorphic iMessage aesthetic with gradient bubbles, tail shapes, and depth effects
 */
import { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense, type ComponentType, type SVGProps } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Reply from "lucide-react/dist/esm/icons/reply";
import ReadReceipt, { type ReadReceiptStatus } from "@/components/chat/ReadReceipt";
import Copy from "lucide-react/dist/esm/icons/copy";
import Forward from "lucide-react/dist/esm/icons/forward";
import Pin from "lucide-react/dist/esm/icons/pin";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import Timer from "lucide-react/dist/esm/icons/timer";
import Play from "lucide-react/dist/esm/icons/play";
import X from "lucide-react/dist/esm/icons/x";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import Heart from "lucide-react/dist/esm/icons/heart";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Pause from "lucide-react/dist/esm/icons/pause";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Lock from "lucide-react/dist/esm/icons/lock";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Languages from "lucide-react/dist/esm/icons/languages";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { openExternalUrl } from "@/lib/openExternalUrl";
import { findZivoTrackBySlug } from "@/lib/zivoSessions";
import ExternalLinkWarning from "@/components/security/ExternalLinkWarning";
import { assessLinkSync } from "@/hooks/useLinkRisk";
import { assessChatMessageRisk, assessIncomingChatRisk } from "@/lib/security/chatContentSafety";

import { ILLUSTRATED_PACKS } from "@/config/illustratedStickers";
import { getAnimatedStickerUrl } from "@/config/animatedStickerMap";
import { getStickerMotionSpec } from "./stickerMotion";
import SpoilerText from "./SpoilerText";
import onlyfansBrandLogo from "@/assets/brand-logos/onlyfans.png";

// Lazy-load TransparentStickerVideo — heavy chroma-key/WebGL component
const TransparentStickerVideo = lazy(() => import("./TransparentStickerVideo").then(m => ({ default: m.TransparentStickerVideo })));
const REACTION_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥", "🎉", "😍"];

type IconLike = ComponentType<SVGProps<SVGSVGElement>>;

type TranslationResponse = {
  translated_text?: string;
  translation?: string;
  text?: string;
  source_language?: string;
};

type MessageReactionRow = {
  emoji: string;
  user_id: string;
};

type StoreProfileRow = {
  name: string | null;
};

type UserPostRow = {
  media_url: string | null;
  media_type: string | null;
  caption: string | null;
  user_id: string | null;
};

type ProfileLookupRow = {
  full_name: string | null;
  avatar_url: string | null;
};

const dbFrom = (table: string): any => (supabase as any).from(table);

type ParsedStickerMessage = {
  id: string;
  src: string;
  fallbackSrc?: string;
  animatedSrc?: string;
};

type ParsedGifMessage = {
  label?: string;
  url: string;
};

const STICKER_LIBRARY = ILLUSTRATED_PACKS
  .flatMap((pack) => pack.stickers)
  .reduce<Record<string, { id: string; src: string }>>((acc, sticker) => {
    acc[sticker.id.toLowerCase()] = { id: sticker.id, src: sticker.src };
    return acc;
  }, {});

function normalizeStickerId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^sticker[:\-_]/, "")
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
}

function resolveStickerById(rawId: string): { id: string; src: string } | null {
  const key = normalizeStickerId(rawId);
  return STICKER_LIBRARY[key] || null;
}

function isVideoAssetUrl(value: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(value);
}

function isImageAssetUrl(value: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(value);
}

function parseStickerMessage(messageText: string, msgType?: string): ParsedStickerMessage | null {
  const trimmed = messageText.trim();
  if (!trimmed) return null;

  const bracketMatch = trimmed.match(/^\[sticker:([^\]:]+)(?::(.+))?\]$/i);
  if (bracketMatch) {
    const rawId = bracketMatch[1].trim();
    const explicitSrc = bracketMatch[2]?.trim();
    const resolved = resolveStickerById(rawId);
    const stickerId = resolved?.id || rawId;
    const mappedAnimatedSrc = getAnimatedStickerUrl(stickerId);

    const explicitAnimatedSrc = explicitSrc && isVideoAssetUrl(explicitSrc) ? explicitSrc : undefined;
    const explicitFallbackSrc = explicitSrc && isImageAssetUrl(explicitSrc) ? explicitSrc : undefined;
    const animatedSrc = explicitAnimatedSrc || mappedAnimatedSrc;
    const fallbackSrc = resolved?.src || explicitFallbackSrc;
    const src = fallbackSrc || "";

    if (explicitSrc) {
      return {
        id: stickerId,
        src,
        fallbackSrc,
        animatedSrc,
      };
    }

    if (resolved) {
      return { id: resolved.id, src: resolved.src, animatedSrc };
    }

    if (animatedSrc) {
      return { id: stickerId, src, fallbackSrc, animatedSrc };
    }
  }

  if (msgType === "sticker") {
    const resolved = resolveStickerById(trimmed);
    if (resolved) {
      return {
        id: resolved.id,
        src: resolved.src,
        animatedSrc: getAnimatedStickerUrl(resolved.id),
      };
    }
  }

  return null;
}

function parseGifMessage(messageText: string, msgType?: string): ParsedGifMessage | null {
  const trimmed = messageText.trim();
  if (!trimmed) return null;

  const gifMatch = trimmed.match(/^\[gif\]\s*([^:]+):\s*(https?:\/\/\S+)$/i);
  if (gifMatch) {
    return { label: gifMatch[1].trim(), url: gifMatch[2].trim() };
  }

  if (msgType === "gif") {
    const urlMatch = trimmed.match(/https?:\/\/\S+/i);
    if (urlMatch) return { url: urlMatch[0].trim() };
  }

  return null;
}

interface ChatMessageBubbleProps {
  id: string;
  message: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isPinned?: boolean;
  expiresAt?: string | null;
  messageType?: string;
  senderId?: string;
  lockedPriceCents?: number | null;
  /** ISO timestamp of last edit, if any */
  editedAt?: string | null;
  /** ISO timestamp of message creation — used to enforce 48h edit window */
  createdAt?: string | null;
  /** Pre-loaded reactions from parent (avoids N+1 queries) */
  initialReactions?: { emoji: string; count: number; reactedByMe: boolean }[];
  onReply: (id: string, message: string, isMe: boolean) => void;
  onDelete: (id: string) => void;
  /** Optional Telegram-style "Delete for me" — hides only on this device. */
  onDeleteForMe?: (id: string) => void;
  onForward?: (id: string, message: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  onEdit?: (id: string, currentText: string) => void;
  /** Save (forward to Saved Messages). Hidden when the chat IS Saved Messages. */
  onSave?: (id: string) => void;
  /** True when the current chat is the user's own Saved Messages. */
  hideSave?: boolean;
  /** Display name of the original sender, when this message was forwarded. */
  forwardedFromName?: string | null;
  /** User id of the original sender, used to navigate to their profile from the header. */
  forwardedFromUserId?: string | null;
}

const ChatMessageBubble = memo(function ChatMessageBubble({
  id, message, time, isMe, isRead, isDelivered, imageUrl, videoUrl, isPinned, expiresAt, messageType, senderId, lockedPriceCents,
  editedAt, createdAt,
  initialReactions,
  onReply, onDelete, onDeleteForMe, onForward, onPin, onEdit, onSave, hideSave, forwardedFromName, forwardedFromUserId,
}: ChatMessageBubbleProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteSub, setShowDeleteSub] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const messageRisk = useMemo(() => isMe ? { warnings: [] } : assessChatMessageRisk(message || ""), [message, isMe]);
  const incomingRisk = useMemo(
    () => isMe ? null : assessIncomingChatRisk(message || ""),
    [message, isMe],
  );
  const isLockedType = messageType === "locked_image" || messageType === "locked_video";
  const [isLocked, setIsLocked] = useState(isLockedType && !isMe);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const unlockPrice = lockedPriceCents && lockedPriceCents > 0 ? lockedPriceCents : 99;
  const unlockPriceLabel = `$${(unlockPrice / 100).toFixed(2)}`;
  const [reactions, setReactions] = useState<{ emoji: string; count: number; reactedByMe: boolean }[]>(initialReactions || []);
  const [openDown, setOpenDown] = useState(false);
  const [showStickerBurst, setShowStickerBurst] = useState(false);
  const [translation, setTranslation] = useState<{ text: string; sourceLang?: string } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const canEdit = isMe && !!createdAt && (Date.now() - new Date(createdAt).getTime() < 48 * 60 * 60 * 1000) && !!message?.trim() && !imageUrl && !videoUrl;

  const handleEdit = useCallback(() => {
    if (!onEdit) return;
    onEdit(id, message);
    setShowActions(false);
    setShowReactions(false);
  }, [id, message, onEdit]);

  const handleTranslate = useCallback(async () => {
    setShowActions(false);
    setShowReactions(false);
    if (!message?.trim()) return;
    if (translation) { setShowTranslation((v) => !v); return; }
    setTranslating(true);
    setShowTranslation(true);
    try {
      const target = (navigator.language || "en").split("-")[0];
      const { data, error } = await supabase.functions.invoke("translate-caption", {
        body: { text: message, target_language: target },
      });
      if (error) throw error;
      const translationData = (data || {}) as TranslationResponse;
      const translated = translationData.translated_text || translationData.translation || translationData.text;
      if (translated) {
        setTranslation({ text: translated, sourceLang: translationData.source_language });
      } else {
        toast.error("Could not translate");
        setShowTranslation(false);
      }
    } catch (err) {
      console.error("translate failed", err);
      toast.error("Translation unavailable");
      setShowTranslation(false);
    } finally {
      setTranslating(false);
    }
  }, [message, translation]);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const hasMoved = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const parsedSticker = useMemo(() => parseStickerMessage(message || "", messageType), [message, messageType]);
  const parsedGif = useMemo(() => parseGifMessage(message || "", messageType), [message, messageType]);

  useEffect(() => {
    if (!parsedSticker || parsedSticker.animatedSrc) {
      setShowStickerBurst(false);
      return;
    }
    setShowStickerBurst(true);
    const timer = setTimeout(() => setShowStickerBurst(false), 420);
    return () => clearTimeout(timer);
  }, [id, parsedSticker]);

  // Check if already unlocked
  useEffect(() => {
    if (!isLockedType || isMe || !id || id.startsWith("opt-")) return;
    const checkUnlock = async () => {
      try {
        const { data } = await supabase.functions.invoke("verify-media-unlock", {
          body: { message_id: id },
        });
        if (data?.unlocked) setIsLocked(false);
      } catch {
        // Ignore unlock probe failures; user can still manually unlock.
      }
    };
    checkUnlock();
  }, [id, isLockedType, isMe]);

  // Unlock payment handler — uses in-app browser on native, redirect on web
  const handleUnlockPayment = useCallback(async () => {
    if (unlockLoading) return;
    setUnlockLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("unlock-media-checkout", {
        body: { message_id: id, seller_id: senderId || "", amount_cents: unlockPrice },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL");

      if (Capacitor.isNativePlatform()) {
        // Native: open in-app browser, then verify on close
        const { Browser } = await import("@capacitor/browser");
        const verifyOnClose = async () => {
          // Small delay to let Stripe process
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const { data: vData } = await supabase.functions.invoke("verify-media-unlock", {
              body: { message_id: id },
            });
            if (vData?.unlocked) {
              setIsLocked(false);
              toast.success("Media unlocked! 🔓");
            } else {
              toast.info("Payment processing — media will unlock shortly");
            }
          } catch {
            // Ignore transient verification errors after checkout close.
          }
          setUnlockLoading(false);
        };
        await Browser.addListener("browserFinished", () => {
          verifyOnClose();
          Browser.removeAllListeners();
        });
        await Browser.open({ url: data.url });
      } else {
        // Web: redirect in same tab — auto-verify happens on /chat?unlocked= redirect
        window.location.href = data.url;
      }
    } catch {
      toast.error("Payment failed to start");
      setUnlockLoading(false);
    }
  }, [id, senderId, unlockPrice, unlockLoading]);

  // Load reactions only if not pre-loaded from parent
  useEffect(() => {
    if (!id || id.startsWith("opt-") || initialReactions) return;
    const load = async () => {
      const { data } = await dbFrom("message_reactions")
        .select("emoji, user_id")
        .eq("message_id", id);
      const reactionRows = (data || []) as MessageReactionRow[];
      if (reactionRows.length > 0) {
        const grouped = reactionRows.reduce((acc: Record<string, { count: number; reactedByMe: boolean }>, r) => {
          if (!acc[r.emoji]) acc[r.emoji] = { count: 0, reactedByMe: false };
          acc[r.emoji].count++;
          if (r.user_id === user?.id) acc[r.emoji].reactedByMe = true;
          return acc;
        }, {} as Record<string, { count: number; reactedByMe: boolean }>);
        setReactions(Object.entries(grouped).map(([emoji, v]) => ({ emoji, count: v.count, reactedByMe: v.reactedByMe })));
      }
    };
    load();
  }, [id, user?.id, initialReactions]);

  const toggleReaction = async (emoji: string) => {
    if (!user?.id || id.startsWith("opt-")) return;
    const existing = reactions.find((r) => r.emoji === emoji && r.reactedByMe);
    if (existing) {
      await dbFrom("message_reactions").delete()
        .eq("message_id", id).eq("user_id", user.id).eq("emoji", emoji);
      setReactions((prev) =>
        prev.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, reactedByMe: false } : r)
            .filter((r) => r.count > 0)
      );
    } else {
      await dbFrom("message_reactions").insert({
        message_id: id, user_id: user.id, emoji,
      });
      setReactions((prev) => {
        const found = prev.find((r) => r.emoji === emoji);
        if (found) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r);
        return [...prev, { emoji, count: 1, reactedByMe: true }];
      });
    }
    setShowReactions(false);
    setShowActions(false);
  };

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    hasMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      // Check if bubble is in top half of viewport → open menu downward
      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        setOpenDown(rect.top < 320);
      }
      setShowActions(true);
      setShowReactions(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 400);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handlePointerMove = useCallback(() => {
    hasMoved.current = true;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if ((!isMe && info.offset.x > 60) || (isMe && info.offset.x < -60)) {
      onReply(id, message, isMe);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }, [id, message, isMe, onReply]);

  const handleTap = useCallback(() => {
    if (didLongPress.current || hasMoved.current) return;
    if (showActions) { setShowActions(false); setShowReactions(false); return; }
    // Double-tap = ❤️ reaction (Telegram/Instagram style)
    const now = Date.now();
    if (now - lastTapTime.current < 320 && !id.startsWith("opt-")) {
      toggleReaction("❤️");
      if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
    }
    lastTapTime.current = now;
  }, [showActions, id, toggleReaction]);

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success("Copied to clipboard");
    }
    setShowActions(false);
    setShowReactions(false);
  };

  const handleForward = () => {
    onForward?.(id, message);
    setShowActions(false);
    setShowReactions(false);
  };

  const handlePin = () => {
    onPin?.(id, !isPinned);
    setShowActions(false);
    setShowReactions(false);
  };

  const isOptimistic = id.startsWith("opt-");
  const isDisappearing = !!expiresAt;
  const receiptStatus: ReadReceiptStatus = isOptimistic
    ? "sending"
    : isRead
    ? "read"
    : isDelivered
    ? "delivered"
    : "sent";

  return (
    <div
      ref={bubbleRef}
      className={`chat-no-callout flex ${isMe ? "justify-end" : "justify-start"} relative px-1`}
      onContextMenu={(e) => e.preventDefault()}
      onContextMenuCapture={(e) => e.preventDefault()}
      onDragStartCapture={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none", WebkitTapHighlightColor: "transparent" }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: isMe ? -80 : 0, right: isMe ? 0 : 80 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        dragSnapToOrigin
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={handleTap}
        className={`${parsedSticker ? "w-fit max-w-none" : "max-w-[78%]"} select-none touch-pan-y ${isOptimistic ? "opacity-60" : ""}`}
      >
        {/* Pin indicator */}
        {isPinned && (
          <div className={`flex items-center gap-1 mb-0.5 text-[9px] text-primary ${isMe ? "justify-end" : "justify-start"}`}>
            <Pin className="w-2.5 h-2.5" />
            <span className="font-medium">Pinned</span>
          </div>
        )}

        {/* Forwarded-from header — Telegram parity. Shown when this message
            was created via a forward action (forwarded_from_user_id is set). */}
        {forwardedFromName && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (forwardedFromUserId) navigate(`/user/${forwardedFromUserId}`);
            }}
            className={`flex items-center gap-1 mb-1 text-[10.5px] text-muted-foreground/90 hover:text-foreground transition-colors ${isMe ? "justify-end ml-auto" : "justify-start"}`}
          >
            <Forward className="w-2.5 h-2.5 opacity-60" />
            <span className="italic">Forwarded from</span>
            <span className="font-semibold not-italic">{forwardedFromName}</span>
          </button>
        )}

        {/* Video — compact reel-style thumbnail (normal or locked) */}
        {videoUrl && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!didLongPress.current && !isLocked) setShowVideoPlayer(true);
            }}
            className={`overflow-hidden mb-1 relative cursor-pointer w-[180px] ${isMe ? "ml-auto" : ""}`}
          >
            <div className={`rounded-2xl overflow-hidden relative bg-muted ${isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`}>
              <video
                src={`${videoUrl}#t=0.1`}
                className={`w-full aspect-[4/5] object-cover transition-all duration-300 ${isLocked ? "blur-xl scale-105" : ""}`}
                playsInline
                preload="none"
                muted
                crossOrigin="anonymous"
                style={{ pointerEvents: "none" }}
                onLoadedData={(e) => {
                  const v = e.currentTarget;
                  if (v.readyState >= 2) v.currentTime = 0.1;
                }}
              />
              {/* Locked overlay for video */}
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl">
                  <div className="h-14 w-14 rounded-full bg-background/90 flex items-center justify-center shadow-lg mb-2">
                    <Lock className="h-6 w-6 text-foreground" />
                  </div>
                  <p className="text-white text-xs font-semibold mb-2 drop-shadow">Locked Video</p>
                  <button
                    disabled={unlockLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlockPayment();
                    }}
                    className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
                  >
                    {unlockLoading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    ) : (
                      <DollarSign className="h-3.5 w-3.5" />
                    )}
                    Unlock · {unlockPriceLabel}
                  </button>
                </div>
              )}
              {/* Normal video overlay */}
              {!isLocked && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-4.5 w-4.5 text-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 10 10" className="w-2 h-2"><circle cx="5" cy="5" r="4" fill="#ef4444" /></svg>
                      <span className="text-[10px] font-bold text-white tracking-wide">Video</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
                      <Play className="h-2.5 w-2.5 text-white" fill="white" />
                      <span className="text-[9px] font-semibold text-white">Play</span>
                    </div>
                  </div>
                </>
              )}
              {/* Lock badge for sender */}
              {isLockedType && isMe && (
                <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-white" />
                 <span className="text-[10px] text-white font-medium">Locked · {unlockPriceLabel}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image — normal or locked */}
        {imageUrl && !videoUrl && (
          <div className={`rounded-2xl overflow-hidden mb-1 shadow-sm relative ${isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"}`}>
            <img
              src={imageUrl}
              alt=""
              className={`max-w-full max-h-60 object-cover rounded-2xl transition-all duration-300 ${isLocked ? "blur-xl scale-105" : ""}`}
              loading="lazy"
            />
            {/* Locked overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-2xl">
                <div className="h-14 w-14 rounded-full bg-background/90 flex items-center justify-center shadow-lg mb-2">
                  <Lock className="h-6 w-6 text-foreground" />
                </div>
                <p className="text-white text-xs font-semibold mb-2 drop-shadow">Locked Photo</p>
                <button
                  disabled={unlockLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlockPayment();
                  }}
                  className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
                >
                  {unlockLoading ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : (
                    <DollarSign className="h-3.5 w-3.5" />
                  )}
                  Unlock · {unlockPriceLabel}
                </button>
              </div>
            )}
            {/* Lock badge for sender */}
            {isLockedType && isMe && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Lock className="h-3 w-3 text-white" />
                <span className="text-[10px] text-white font-medium">Locked · {unlockPriceLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Message body */}
        {message && (() => {
          // Sticker rendering (supports legacy + current formats)
          if (parsedSticker) {
            const stickerFallbackSrc =
              (parsedSticker.fallbackSrc && isImageAssetUrl(parsedSticker.fallbackSrc))
                ? parsedSticker.fallbackSrc
                : (parsedSticker.src && isImageAssetUrl(parsedSticker.src) ? parsedSticker.src : undefined);
            const hasAnimatedSticker = Boolean(parsedSticker.animatedSrc);
            const stickerMotion = hasAnimatedSticker ? null : getStickerMotionSpec(parsedSticker.id);
            return (
              <div className="py-1">
                <div className="h-24 w-24 sm:h-28 sm:w-28 bg-transparent">
                    {hasAnimatedSticker ? (
                      <Suspense fallback={<div className="h-full w-full bg-muted/20 rounded-2xl animate-pulse" />}>
                        <TransparentStickerVideo
                          src={parsedSticker.animatedSrc!}
                          fallbackSrc={stickerFallbackSrc}
                          alt={parsedSticker.id}
                          preload="auto"
                          renderMode="webgl"
                          whiteKeyEnabled={true}
                        />
                      </Suspense>
                    ) : stickerFallbackSrc ? (
                      <motion.div
                        className="relative h-full w-full"
                        initial={{ scale: 0, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16, mass: 0.8 }}
                      >
                        <img
                          src={stickerFallbackSrc}
                          alt={parsedSticker.id}
                          className="h-full w-full object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                          loading="lazy"
                        />
                      </motion.div>
                    ) : (
                      <div className="h-full w-full rounded-2xl bg-muted/30 border border-border/20 grid place-items-center text-3xl">
                        🙂
                      </div>
                    )}
                </div>
                <div className={`mt-1 flex items-center ${isMe ? "justify-end pr-1" : "justify-start pl-1"}`}>
                  <span className="text-[11px] text-muted-foreground/60">{time}</span>
                </div>
              </div>
            );
          }

          // GIF rendering for lively chat feel
          if (parsedGif) {
            return (
              <div className="p-1.5">
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`overflow-hidden rounded-2xl border border-border/25 bg-muted/20 w-[180px] ${isMe ? "ml-auto" : ""}`}
                >
                  <img
                    src={parsedGif.url}
                    alt={parsedGif.label || "GIF"}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                </motion.div>
                <div className="flex items-center gap-1 justify-end px-1 pb-1 mt-1">
                  <span className={`text-[10px] ${isMe ? "text-muted-foreground/60" : "text-muted-foreground/60"}`}>{time}</span>
                  {isMe && <ReadReceipt status={receiptStatus} className="h-3 w-3" />}
                </div>
              </div>
            );
          }

          const urlRegex = /(https?:\/\/[^\s]+)/gi;
          const urls = message.match(urlRegex);
          const hasLink = urls && urls.length > 0;
          const linkUrl = hasLink ? urls[0] : null;
          const textWithoutUrl = hasLink ? message.replace(urlRegex, "").trim() : message;

          return (
            <div
              className={`text-[14.5px] leading-[1.5] relative overflow-hidden ${
                isMe
                  ? "rounded-[22px] rounded-br-[6px] shadow-sm"
                  : "rounded-[22px] rounded-bl-[6px] shadow-sm"
              }`}
              style={{
                background: isMe
                  ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))"
                  : "hsl(var(--muted) / 0.7)",
                backdropFilter: isMe ? "none" : "blur(20px)",
              }}
            >
              {/* Subtle inner glow for sent messages */}
              {isMe && (
                <div className="absolute inset-0 rounded-[22px] pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
              )}

              {/* Text portion — supports Telegram-style ||spoiler|| markers. */}
              {textWithoutUrl && (
                <p className={`whitespace-pre-wrap break-words px-4 pt-3 pb-1 relative z-[1] ${
                  isMe ? "text-primary-foreground" : "text-foreground"
                }`}>
                  <SpoilerText text={textWithoutUrl} variant="bold" />
                </p>
              )}

              {!isMe && incomingRisk?.hasBlocked && (
                <p className="px-4 pb-1 text-[10px] font-semibold text-red-600">
                  Phishing/impersonation link blocked — do not click.
                </p>
              )}
              {!isMe && !incomingRisk?.hasBlocked && (incomingRisk?.hasSuspicious || messageRisk.warnings.length > 0) && (
                <p className="px-4 pb-1 text-[10px] font-medium text-amber-600">
                  Suspicious link pattern detected. Open carefully.
                </p>
              )}

              {/* Rich link preview — suppressed when inbound scan flagged the link as blocked */}
              {linkUrl && !(incomingRisk?.hasBlocked) && (
                <LinkPreviewCard url={linkUrl} isMe={isMe} hasText={!!textWithoutUrl} messageText={message} />
              )}

              {/* Inline translation */}
              {showTranslation && (
                <div className={`mx-3 mb-2 mt-0.5 px-3 py-2 rounded-xl text-[13px] leading-snug border ${
                  isMe
                    ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground/90"
                    : "bg-background/60 border-border/40 text-foreground"
                }`}>
                  {translating ? (
                    <span className="flex items-center gap-1.5 opacity-70">
                      <Loader2 className="h-3 w-3 animate-spin" /> Translating…
                    </span>
                  ) : translation ? (
                    <>
                      <p className={`text-[10px] uppercase tracking-wide mb-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}>
                        Translated{translation.sourceLang ? ` from ${translation.sourceLang}` : ""}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{translation.text}</p>
                    </>
                  ) : null}
                </div>
              )}

              {/* Timestamp — iMessage style */}
              <div className="flex items-center gap-1 justify-end px-4 pb-2 -mt-0.5 relative z-[1]">
                {isDisappearing && <Timer className={`h-2.5 w-2.5 ${isMe ? "text-primary-foreground/40" : "text-muted-foreground/40"}`} />}
                {editedAt && (
                  <span className={`text-[10px] italic ${isMe ? "text-primary-foreground/45" : "text-muted-foreground/45"}`}>
                    edited
                  </span>
                )}
                <span className={`text-[10px] font-medium ${isMe ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
                  {time}
                </span>
                {isMe && <ReadReceipt status={receiptStatus} tone="onPrimary" />}
              </div>
            </div>
          );
        })()}

      </motion.div>

      {/* Long-press popup */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
              onClick={() => { setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: openDown ? -6 : 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: openDown ? -6 : 6 }}
              transition={{ type: "spring", damping: 26, stiffness: 420 }}
              className={`absolute z-50 ${openDown ? "top-full mt-3 flex-col-reverse" : "bottom-full mb-3 flex-col"} flex gap-2 ${isMe ? "right-0 items-end" : "left-0 items-start"}`}
            >
              {/* Emoji reactions row */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 }}
                  className="bg-background shadow-lg shadow-black/10 border border-border/30 rounded-full px-1.5 py-1 flex items-center gap-0 max-w-[calc(100vw-32px)]"
                >
                  {REACTION_EMOJIS.map((emoji, i) => (
                    <motion.button
                      key={emoji}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.025 * i, type: "spring", stiffness: 500 }}
                      onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                      className="h-[36px] w-[36px] flex items-center justify-center rounded-full hover:bg-muted/50 transition-all text-[20px] hover:scale-110 active:scale-90 duration-150"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="bg-background shadow-lg shadow-black/10 border border-border/30 rounded-xl overflow-hidden min-w-[190px]"
              >
                <AnimatePresence mode="wait">
                  {!showDeleteSub ? (
                    <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                      <MsgMenuItem icon={Reply} label="Reply" onClick={() => { onReply(id, message, isMe); setShowActions(false); setShowReactions(false); }} />
                      {canEdit && onEdit && (
                        <MsgMenuItem icon={Pencil} label="Edit" onClick={handleEdit} />
                      )}
                      {message?.trim() && !isMe && (
                        <MsgMenuItem icon={Languages} label={translation ? (showTranslation ? "Hide translation" : "Show translation") : "Translate"} onClick={handleTranslate} />
                      )}
                      <MsgMenuItem icon={Copy} label="Copy" onClick={handleCopy} />
                      <MsgMenuItem icon={Forward} label="Forward" onClick={handleForward} />
                      {onSave && !hideSave && (
                        <MsgMenuItem icon={Bookmark} label="Save" onClick={() => { onSave(id); setShowActions(false); setShowReactions(false); }} />
                      )}
                      <MsgMenuItem icon={Pin} label={isPinned ? "Unpin" : "Pin"} onClick={handlePin} active={isPinned} />
                      <MsgMenuItem icon={Trash2} label="Delete" onClick={() => setShowDeleteSub(true)} destructive chevron />
                    </motion.div>
                  ) : (
                    <motion.div key="delete" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.1 }}>
                      {isMe && (
                        <MsgMenuItem icon={Trash2} label="Delete for everyone" onClick={() => { onDelete(id); setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }} destructive />
                      )}
                      <MsgMenuItem icon={Trash2} label="Delete for me" onClick={() => { (onDeleteForMe ?? onDelete)(id); setShowActions(false); setShowReactions(false); setShowDeleteSub(false); }} destructive />
                      <div className="border-t border-border/30">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteSub(false); }}
                          className="w-full py-2.5 text-center text-[13px] font-medium text-muted-foreground hover:bg-muted/30 active:bg-muted/50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Reel-style video player */}
      <AnimatePresence>
        {showVideoPlayer && videoUrl && (
          <ReelVideoPlayer videoUrl={videoUrl} onClose={() => setShowVideoPlayer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
});

/** Reel-style fullscreen video player */
function ReelVideoPlayer({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    hideControlsAfterDelay();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [hideControlsAfterDelay]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    hideControlsAfterDelay();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onClick={togglePlay}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        loop
        onTimeUpdate={handleTimeUpdate}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Top bar */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent pt-[max(env(safe-area-inset-top),12px)] px-4 pb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-[15px] font-bold">Reels</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Center play/pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-side action buttons (Reel-style) */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${liked ? "bg-red-500/20" : "bg-white/10"}`}>
            <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-[10px] font-semibold">Like</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[10px] font-semibold">Reply</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[10px] font-semibold">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleMute}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </div>
          <span className="text-white text-[10px] font-semibold">{isMuted ? "Unmute" : "Mute"}</span>
        </motion.button>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent pb-[max(env(safe-area-inset-bottom),8px)] px-4 pt-6">
        <div
          className="w-full h-1 rounded-full bg-white/20 cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}


function ActionBtn({ icon: Icon, label, onClick, destructive, active }: {
  icon: IconLike; label: string; onClick: () => void; destructive?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:scale-[0.98] ${
        destructive
          ? "hover:bg-red-50 dark:hover:bg-red-500/5 text-red-500"
          : active
          ? "bg-primary/5 text-primary"
          : "hover:bg-muted/40 text-foreground"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-70" />
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

function MsgMenuItem({ icon: Icon, label, onClick, destructive, active, chevron }: {
  icon: IconLike; label: string; onClick: () => void; destructive?: boolean; active?: boolean; chevron?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:bg-muted/60 border-b border-border/15 last:border-b-0 ${
        destructive ? "text-destructive hover:bg-destructive/5" : active ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/30"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-70" />
      <span className="text-[14px] font-medium flex-1">{label}</span>
      {chevron && <ChevronRight className="h-4 w-4 opacity-30" />}
    </button>
  );
}

type LegacyMusicShareMeta = {
  title: string;
  artist: string;
  genre?: string;
  duration?: string;
  soundPath: string;
  previewUrl?: string;
};

function slugifySoundName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeSoundSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseLegacyMusicShare(messageText?: string | null): LegacyMusicShareMeta | null {
  if (!messageText) return null;

  // Extract embedded `Preview: <url>` line BEFORE stripping URLs.
  const previewMatch = messageText.match(/^\s*Preview:\s*(https?:\/\/\S+)\s*$/im);
  const previewUrl = previewMatch?.[1];

  const cleaned = messageText
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/\r/g, "");

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headerLine = lines.find((line) => /[\u{1F3B5}\u{1F3B6}]/u.test(line) || /[—-]/u.test(line)) ?? lines[0];
  const headerMatch = headerLine?.match(/^(?:[\u{1F3B5}\u{1F3B6}]\s*)?(.+?)\s+[—-]\s+(.+)$/u);
  if (!headerMatch) return null;

  const title = headerMatch[1].trim();
  const artist = headerMatch[2].replace(/Listen:?$/i, "").trim();
  if (!title || !artist) return null;

  const metaLine = lines.find((line) => /·/.test(line) && /\d+:\d+/.test(line));
  const metaMatch = metaLine?.match(/^(.+?)\s+·\s+(\d+:\d+)$/);

  return {
    title,
    artist,
    genre: metaMatch?.[1]?.trim(),
    duration: metaMatch?.[2]?.trim(),
    soundPath: `/sound/${slugifySoundName(title)}`,
    previewUrl,
  };
}

/* ── Link Preview Card ─────────────────────────────────────────── */
type SocialPlatformId = "facebook" | "onlyfans" | "instagram" | "x" | "tiktok" | "youtube" | "snapchat" | "telegram" | "linkedin";

const SOCIAL_HOST_MAP: { match: RegExp; id: SocialPlatformId; label: string; color: string; textColor: string; brandImage?: string }[] = [
  { match: /(^|\.)facebook\.com$|(^|\.)fb\.com$/i,    id: "facebook",  label: "Facebook",  color: "bg-[#1877F2]", textColor: "text-white" },
  { match: /(^|\.)onlyfans\.com$/i,                    id: "onlyfans",  label: "OnlyFans",  color: "bg-white",     textColor: "text-[#00AFF0]", brandImage: onlyfansBrandLogo },
  { match: /(^|\.)instagram\.com$/i,                   id: "instagram", label: "Instagram", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", textColor: "text-white" },
  { match: /(^|\.)(x\.com|twitter\.com)$/i,            id: "x",         label: "X",         color: "bg-black", textColor: "text-white" },
  { match: /(^|\.)tiktok\.com$/i,                      id: "tiktok",    label: "TikTok",    color: "bg-black", textColor: "text-white" },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/i,         id: "youtube",   label: "YouTube",   color: "bg-[#FF0000]", textColor: "text-white" },
  { match: /(^|\.)snapchat\.com$/i,                    id: "snapchat",  label: "Snapchat",  color: "bg-[#FFFC00]", textColor: "text-black" },
  { match: /(^|\.)t\.me$|(^|\.)telegram\.me$/i,        id: "telegram",  label: "Telegram",  color: "bg-[#229ED9]", textColor: "text-white" },
  { match: /(^|\.)linkedin\.com$/i,                    id: "linkedin",  label: "LinkedIn",  color: "bg-[#0A66C2]", textColor: "text-white" },
];

function detectSocialPlatform(host: string) {
  return SOCIAL_HOST_MAP.find((p) => p.match.test(host)) || null;
}

function LinkPreviewCard({ url, isMe, hasText, messageText }: { url: string; isMe: boolean; hasText: boolean; messageText?: string }) {
  const navigate = useNavigate();
  const [warnOpen, setWarnOpen] = useState(false);
  const [preview, setPreview] = useState<{
    mediaUrl?: string | null;
    mediaType?: "image" | "video";
    label: string;
    description: string;
    authorName?: string;
    authorAvatar?: string | null;
    internalPath?: string;
    audioUrl?: string;
    socialPlatform?: { id: SocialPlatformId; label: string; color: string; textColor: string; brandImage?: string };
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let alive = true;
    const fetchPreview = async () => {
      try {
        const u = new URL(url);
        const p = u.pathname + u.search;

        // Detect known external social platforms — render as a colored chip card.
        const social = detectSocialPlatform(u.hostname);
        if (social) {
          const handle = u.pathname.replace(/^\/+/, "").replace(/^@/, "").split(/[/?#]/)[0];
          if (alive) {
            setPreview({
              label: handle ? `@${handle}` : social.label,
              description: handle ? social.label : `Open on ${social.label}`,
              socialPlatform: social,
            });
          }
          return;
        }

        const legacyMusicShare = parseLegacyMusicShare(messageText);
        const soundSlugMatch = p.match(/\/sound\/([^/?#]+)/i);
        // Also treat Apple Music / iTunes URLs as music shares when the
        // message body matches the music card format.
        const isMusicHost = /(^|\.)(music\.apple|itunes\.apple|spotify|soundcloud|youtu)\.[a-z.]+$/i.test(u.hostname) || u.hostname.includes("soundhelix");

        if (soundSlugMatch || (isMusicHost && legacyMusicShare)) {
          const resolvedSlug = soundSlugMatch?.[1] || slugifySoundName(legacyMusicShare?.title || "original-sound");
          const soundTitle = legacyMusicShare?.title || humanizeSoundSlug(resolvedSlug);
          const soundDescription = legacyMusicShare
            ? [legacyMusicShare.artist, legacyMusicShare.genre, legacyMusicShare.duration].filter(Boolean).join(" · ")
            : "Tap to open sound on ZIVO";

          const knownTrack = findZivoTrackBySlug(resolvedSlug);
          // Prefer the embedded `Preview: <url>` line (iTunes / dynamic
          // sources); fall back to our static catalog (Zivo Sessions).
          const audioUrl = legacyMusicShare?.previewUrl || knownTrack?.previewUrl;
          if (alive) {
            setPreview({
              label: soundTitle,
              description: soundDescription || "Tap to open sound on ZIVO",
              internalPath: `/sound/${resolvedSlug}`,
              audioUrl,
            });
          }
          return;
        }

        // Extract post ID from feed URLs like ?post=uuid
        const postMatch = p.match(/[?&]post=([a-f0-9-]{36})/i);
        if (postMatch) {
          const postId = postMatch[1];
          // Try store_posts first
          const { data: storePost } = await supabase
            .from("store_posts")
            .select("media_urls, media_type, caption, store_id")
            .eq("id", postId)
            .maybeSingle();

          if (storePost && alive) {
            const mediaUrls = Array.isArray(storePost.media_urls) ? storePost.media_urls : [];
            // Get store name
            let storeName = "ZIVO";
            if (storePost.store_id) {
              const { data: store } = await supabase
                .from("store_profiles")
                .select("name, logo_url")
                .eq("id", storePost.store_id)
                .maybeSingle();
              const storeProfile = store as StoreProfileRow | null;
              if (storeProfile?.name) storeName = storeProfile.name;
            }
            setPreview({
              mediaUrl: mediaUrls[0] as string || null,
              mediaType: storePost.media_type === "video" ? "video" : "image",
              label: storePost.caption ? (storePost.caption as string).slice(0, 60) : "Shared Post",
              description: storeName,
            });
            return;
          }

          // Try user_posts
          const { data: userPostData } = await dbFrom("user_posts")
            .select("media_url, media_type, caption, user_id")
            .eq("id", postId)
            .maybeSingle();
          const userPost = userPostData as UserPostRow | null;

          if (userPost && alive) {
            let authorName = "Someone";
            let authorAvatar: string | null = null;
            if (userPost.user_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("user_id", userPost.user_id)
                .maybeSingle();
                const authorProfile = profile as ProfileLookupRow | null;
                if (authorProfile) {
                  authorName = authorProfile.full_name || "Someone";
                  authorAvatar = authorProfile.avatar_url || null;
              }
            }
            setPreview({
              mediaUrl: userPost.media_url,
              mediaType: userPost.media_type === "video" ? "video" : "image",
              label: userPost.caption ? String(userPost.caption).slice(0, 60) : "Shared Post",
              description: authorName,
              authorName,
              authorAvatar,
            });
            return;
          }
        }

        // Fallback for other link types
        if (p.includes("/feed") || postMatch) {
          if (alive) setPreview({ label: "Shared Post", description: "Tap to view on ZIVO" });
        } else if (p.includes("/reels")) {
          if (alive) setPreview({ label: "Shared Reel", description: "Tap to watch on ZIVO" });
        } else if (p.includes("/profile") || p.includes("/user")) {
          if (alive) setPreview({ label: "Profile", description: "Tap to view profile" });
        } else if (p.includes("/store") || p.includes("/shop")) {
          if (alive) setPreview({ label: "Store", description: "Tap to view store" });
        } else {
          if (alive) setPreview({ label: u.hostname.replace("www.", ""), description: "Tap to open link" });
        }
      } catch {
        if (alive) setPreview({ label: "Link", description: "Tap to open" });
      }
    };
    fetchPreview();
    return () => { alive = false; };
  }, [url, messageText]);

  if (!preview) {
    return (
      <div className={`mx-1.5 mb-1.5 ${!hasText ? "mt-1.5" : "mt-0.5"} h-16 rounded-2xl ${
        isMe ? "bg-primary-foreground/[0.06]" : "bg-background/50"
      } animate-pulse`} />
    );
  }

  const hasMedia = !!preview.mediaUrl;

  // Check if this is an internal ZIVO link
  const isInternalLink = (() => {
    try {
      const u = new URL(url);
      return u.hostname.includes("lovable") || u.hostname.includes("hizovo") || u.hostname === window.location.hostname;
    } catch { return false; }
  })();

  // Extract the in-app path from the URL
  const getInAppPath = () => {
    try {
      const u = new URL(url);
      return u.pathname + u.search + u.hash;
    } catch { return "/"; }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (preview.internalPath) {
      navigate(preview.internalPath);
      return;
    }

    if (isInternalLink) {
      navigate(getInAppPath());
    } else {
      setWarnOpen(true);
    }
  };

  return (
    <>
    <ExternalLinkWarning
      url={url}
      open={warnOpen}
      onOpenChange={setWarnOpen}
      onConfirm={(u) => { void openExternalUrl(u); }}
    />
    <div
      onClick={handleClick}
      className={`block mx-1.5 mb-1.5 ${!hasText ? "mt-1.5" : "mt-0.5"} rounded-2xl overflow-hidden cursor-pointer ${
        isMe ? "bg-primary-foreground/[0.08]" : "bg-background/70"
      } active:scale-[0.97] transition-transform`}
    >
      {/* Media thumbnail */}
      {hasMedia && (
        <div className="relative w-full h-36 bg-black/20 overflow-hidden">
          {preview.mediaType === "video" ? (
            <>
              <video
                src={`${preview.mediaUrl}#t=0.5`}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </div>
            </>
          ) : (
            <img src={preview.mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          )}
          {/* ZIVO badge on media */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-black/40 text-white backdrop-blur-sm">
            ZIVO
          </div>
        </div>
      )}

      {/* If no media, show gradient placeholder — themed for known social platforms */}
      {!hasMedia && (
        <div className={`h-14 flex items-center justify-center relative ${
          preview.socialPlatform ? preview.socialPlatform.color : (isMe ? "bg-primary-foreground/[0.06]" : "bg-foreground/[0.04]")
        }`}>
          {preview.socialPlatform?.brandImage && (
            <img
              src={preview.socialPlatform.brandImage}
              alt={preview.socialPlatform.label}
              className="h-9 w-auto object-contain"
            />
          )}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
            preview.socialPlatform
              ? `bg-black/25 ${preview.socialPlatform.textColor}`
              : (isMe ? "bg-primary-foreground/20 text-primary-foreground/60" : "bg-foreground/10 text-foreground/40")
          }`}>
            {preview.socialPlatform ? preview.socialPlatform.label : "ZIVO"}
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="px-3 py-2 flex items-center gap-2.5">
        {preview.authorAvatar && (
          <img src={preview.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold truncate ${isMe ? "text-primary-foreground" : "text-foreground"}`}>
            {preview.label}
          </p>
          <p className={`text-[11px] mt-0.5 truncate ${isMe ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
            {preview.description}
          </p>
          {preview.audioUrl && (
            <audio
              ref={audioRef}
              src={preview.audioUrl}
              preload="none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )}
          {!isInternalLink && (() => {
            const r = assessLinkSync(url);
            if (r.level === "blocked") {
              return <p className="text-[10px] mt-1 font-semibold text-destructive flex items-center gap-1">⚠ Blocked — {r.warnings[0]}</p>;
            }
            if (r.level === "suspicious") {
              return <p className="text-[10px] mt-1 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">⚠ Suspicious — {r.warnings[0]}</p>;
            }
            if (r.level === "trusted") {
              return <p className="text-[10px] mt-1 font-semibold text-primary flex items-center gap-1">✓ Verified partner</p>;
            }
            return <p className="text-[10px] mt-1 text-muted-foreground">External link</p>;
          })()}
        </div>
        {preview.audioUrl ? (
          <button
            type="button"
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const a = audioRef.current;
              if (!a) return;
              if (a.paused) { void a.play(); } else { a.pause(); }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition active:scale-90 ${
              isMe ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {isPlaying
              ? <Pause className="w-4 h-4" fill="currentColor" />
              : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>
        ) : (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            isMe ? "bg-primary-foreground/15" : "bg-primary/10"
          }`}>
            <ChevronRight className={`w-4 h-4 ${isMe ? "text-primary-foreground/60" : "text-primary"}`} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ChatMessageBubble;
