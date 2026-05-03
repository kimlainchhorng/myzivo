/**
 * ChatHubPage — Unified messaging hub with category tabs:
 * Personal, Shop, Support, Ride + Group chats
 * 2026-style design with premium UI
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { useState, useEffect, useMemo, useRef, lazy, Suspense, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageCircleIcon from "lucide-react/dist/esm/icons/message-circle";
import StoreIcon from "lucide-react/dist/esm/icons/store";
import Headphones from "lucide-react/dist/esm/icons/headphones";
import Car from "lucide-react/dist/esm/icons/car";
import Search from "lucide-react/dist/esm/icons/search";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import X from "lucide-react/dist/esm/icons/x";
import Bell from "lucide-react/dist/esm/icons/bell";
import { ChatBellPopover } from "@/components/notifications/ChatBellPopover";
import Users from "lucide-react/dist/esm/icons/users";
import Plus from "lucide-react/dist/esm/icons/plus";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Radar from "lucide-react/dist/esm/icons/radar";
import Radio from "lucide-react/dist/esm/icons/radio";
import Settings from "lucide-react/dist/esm/icons/settings";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import Square from "lucide-react/dist/esm/icons/square";

import Check from "lucide-react/dist/esm/icons/check";
import SquarePen from "lucide-react/dist/esm/icons/square-pen";
import CheckCheck from "lucide-react/dist/esm/icons/check-check";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Mic from "lucide-react/dist/esm/icons/mic";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Phone from "lucide-react/dist/esm/icons/phone";
import Video from "lucide-react/dist/esm/icons/video";
import Pin from "lucide-react/dist/esm/icons/pin";
import BellOff from "lucide-react/dist/esm/icons/bell-off";
import Archive from "lucide-react/dist/esm/icons/archive";
import ArchiveRestore from "lucide-react/dist/esm/icons/archive-restore";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import MapPinned from "lucide-react/dist/esm/icons/map-pinned";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import HardDrive from "lucide-react/dist/esm/icons/hard-drive";
import SwipeableRow from "@/components/chat/SwipeableRow";
import ChatRowActionsSheet, { type ChatRowActionsTarget } from "@/components/chat/ChatRowActionsSheet";
import NewChatFab from "@/components/chat/NewChatFab";
import AddContactSheet from "@/components/chat/AddContactSheet";
import MyChannelsStrip from "@/components/chat/MyChannelsStrip";
import GlobalChatSearch from "@/components/chat/GlobalChatSearch";
import SuggestedContactsRow from "@/components/chat/SuggestedContactsRow";
import { useChatPrefs } from "@/hooks/useChatPrefs";
import { useBulkPresence } from "@/hooks/useBulkPresence";
import { useTypingBus } from "@/hooks/useTypingBus";
import { useContactRequests } from "@/hooks/useContactRequests";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { withRedirectParam } from "@/lib/authRedirect";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PullToRefresh from "@/components/shared/PullToRefresh";
import SEOHead from "@/components/SEOHead";
import { useCallback } from "react";
import { assessChatMessageRisk, sanitizeOutgoingMessage } from "@/lib/security/chatContentSafety";
import { validateExternalUrl } from "@/lib/urlSafety";
import VerifiedBadge from "@/components/VerifiedBadge";
import { isBlueVerified } from "@/lib/verification";

// Lazy-load heavy sub-pages/components
const GroupChat = lazy(() => import("@/components/chat/GroupChat"));
const CreateGroupModal = lazy(() => import("@/components/chat/CreateGroupModal"));
const StoreLiveChat = lazy(() => import("@/components/grocery/StoreLiveChat"));
const PersonalChat = lazy(() => import("@/components/chat/PersonalChat"));
const ChatStories = lazy(() => import("@/components/chat/ChatStories"));

// Lazy-load sticker packs config (300+ PNG imports)
let _illustratedPacks: any[] | null = null;
const getIllustratedPacks = () => {
  if (_illustratedPacks) return _illustratedPacks;
  import("@/config/illustratedStickers").then(m => { _illustratedPacks = m.ILLUSTRATED_PACKS; });
  return [];
};

type ChatCategory = "personal" | "shop" | "support" | "ride";
type BuiltInChatFolder = "all" | "unread" | "mentions" | "personal" | "groups" | "shop" | "support" | "ride";

// Telegram-style @mention detection — match `@handle` (≥2 chars, alphanumeric/underscore)
// preceded by start-of-string or whitespace so we don't catch email addresses.
const MENTION_RE = /(?:^|\s)@[a-zA-Z0-9_]{2,}/;
function lastMessageHasMention(text: string | undefined | null): boolean {
  if (!text) return false;
  return MENTION_RE.test(text);
}

interface CategoryTab {
  id: ChatCategory;
  label: string;
  icon: typeof MessageCircleIcon;
  emptyTitle: string;
  emptyDesc: string;
  emptyIcon: string;
}

interface FolderTab {
  id: string;
  label: string;
  category: ChatCategory; // which underlying data source to fetch
}

interface BulkSelectableChat {
  id: string;
  unread?: number;
  isGroup?: boolean;
}

const categories: CategoryTab[] = [
  { id: "personal", label: "Personal", icon: MessageCircleIcon, emptyTitle: "No conversations yet", emptyDesc: "Start chatting with friends and family", emptyIcon: "💬" },
  { id: "shop", label: "Shop", icon: StoreIcon, emptyTitle: "No shop chats", emptyDesc: "Your conversations with stores will appear here", emptyIcon: "🛍️" },
  { id: "support", label: "Support", icon: Headphones, emptyTitle: "Need help?", emptyDesc: "Contact our support team anytime", emptyIcon: "🎧" },
  { id: "ride", label: "Ride", icon: Car, emptyTitle: "No ride chats", emptyDesc: "Messages from your drivers will show here", emptyIcon: "🚗" },
];

const builtInFolders: FolderTab[] = [
  { id: "all", label: "All", category: "personal" },
  { id: "unread", label: "Unread", category: "personal" },
  { id: "mentions", label: "@ Mentions", category: "personal" },
  { id: "personal", label: "Personal", category: "personal" },
  { id: "groups", label: "Groups", category: "personal" },
  { id: "shop", label: "Shop", category: "shop" },
  { id: "support", label: "Support", category: "support" },
  { id: "ride", label: "Ride", category: "ride" },
];

const FOLDER_STORAGE_KEY = "zivo:chat-folder";
const LAST_OPEN_CHAT_KEY = "zivo:last-open-chat";

type PersistedOpenChat =
  | { kind: "personal"; id: string; name: string; avatar?: string | null; isVerified?: boolean }
  | { kind: "group"; id: string; name: string; avatar?: string | null }
  | { kind: "shop"; storeId: string; name: string; logo?: string | null };

function formatChatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

// Sticker lookup is rebuilt lazily once the dynamic import of illustratedStickers
// resolves. Previously this ran once at module load and locked in an empty map
// because getIllustratedPacks() returns [] until the import promise resolves —
// so sticker previews never showed their image. We invalidate when the pack
// count changes (cheap O(1) check).
let _stickerLookup: Record<string, { src: string; alt: string }> = {};
let _stickerLookupSize = -1;
function getStickerLookup() {
  const packs = getIllustratedPacks();
  if (packs.length !== _stickerLookupSize) {
    _stickerLookup = packs.flatMap((p) => p.stickers).reduce<Record<string, { src: string; alt: string }>>(
      (acc, s) => {
        acc[s.id.toLowerCase()] = { src: s.src, alt: s.alt };
        return acc;
      },
      {}
    );
    _stickerLookupSize = packs.length;
  }
  return _stickerLookup;
}

// Bounded cache for hot per-row parsing helpers. Chat lists call these once per
// row per render, and the inputs (message strings) repeat heavily — so a small
// LRU-ish Map gives a real win without unbounded memory growth.
function makeBoundedCache<K, V>(capacity: number) {
  const map = new Map<K, V>();
  return {
    get(key: K, compute: () => V): V {
      const hit = map.get(key);
      if (hit !== undefined) return hit;
      const value = compute();
      if (map.size >= capacity) {
        // Drop oldest insertion (Map iteration order is insertion order).
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
      }
      map.set(key, value);
      return value;
    },
  };
}

const _previewCache = makeBoundedCache<string, string>(500);
const _iconCache = makeBoundedCache<string, JSX.Element | null>(500);
const _typeCache = makeBoundedCache<string, { hasMedia: boolean; hasLink: boolean; hasFile: boolean }>(500);

function parseStickerPreview(message: string): { src: string; alt: string } | null {
  const m = message.trim().match(/^\[sticker:([^\]:]+)(?::(.+))?\]$/i);
  if (!m) return null;
  const id = m[1].trim().toLowerCase();
  const entry = getStickerLookup()[id];
  if (entry) return entry;
  const explicitSrc = m[2]?.trim();
  if (explicitSrc) return { src: explicitSrc, alt: id };
  return { src: "", alt: id };
}

// Replace ||spoiler|| segments with block-character redaction for chat list previews.
// (Inside an open conversation, the bubble uses <SpoilerText> for tap-to-reveal; here
// previews are plain text so we permanently redact.)
function redactSpoilers(text: string): string {
  return text.replace(/\|\|([^|]+)\|\|/g, (_, inner: string) => "▒".repeat(Math.max(3, Math.min(inner.length, 12))));
}

function parseRichMessagePreview(message: string): string {
  return _previewCache.get(message, () => {
    const trimmed = message.trim();
    if (!trimmed) return "";
    if (/^\[sticker:([^\]:]+)(?::(.+))?\]$/i.test(trimmed)) return "Sticker";

    try {
      let parsed = JSON.parse(message);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (parsed && parsed.__rich && parsed.payload) {
        const { type, label } = parsed.payload;
        switch (type) {
          case "location": return "📍 Store Location";
          case "qr": return "💳 Payment QR";
          case "tracking": return "📦 Delivery Update";
          case "product": return "🛒 Product";
          case "order": return "📋 Order Details";
          case "poll": return `📊 Poll: ${parsed.payload.question || ""}`;
          default: return label || `📎 ${type || "Attachment"}`;
        }
      }
    } catch { /* not JSON — fall through */ }

    return redactSpoilers(message);
  });
}

function getMessagePreviewIcon(message: string) {
  return _iconCache.get(message, () => {
    if (message === "📷 Image" || message.includes("[image]")) return <ImageIcon className="w-3.5 h-3.5 text-muted-foreground inline mr-1 shrink-0" />;
    if (message.includes("[voice]") || message.startsWith("🎤")) return <Mic className="w-3.5 h-3.5 text-muted-foreground inline mr-1 shrink-0" />;
    if (message.includes("[location]") || message.startsWith("📍")) return <MapPin className="w-3.5 h-3.5 text-muted-foreground inline mr-1 shrink-0" />;
    if (message.includes("[video]") || message.startsWith("🎥")) return <Video className="w-3.5 h-3.5 text-muted-foreground inline mr-1 shrink-0" />;
    if (message.startsWith("📎")) return null;
    return null;
  });
}

function detectPreviewType(message: string): { hasMedia: boolean; hasLink: boolean; hasFile: boolean } {
  return _typeCache.get(message, () => {
    const lower = String(message || "").toLowerCase();
    const hasLink = /https?:\/\//i.test(lower);
    const hasMedia =
      lower.includes("[image]") ||
      lower.includes("📷") ||
      lower.includes("[video]") ||
      lower.includes("🎥") ||
      lower.includes("sticker") ||
      /\.(png|jpe?g|webp|gif|avif|mp4|webm|mov)(\?|#|$)/i.test(lower);
    const hasFile =
      lower.includes("[file]") ||
      lower.includes("attachment") ||
      lower.includes("document") ||
      /\.(pdf|docx?|xlsx?|pptx?|zip|rar|txt)(\?|#|$)/i.test(lower);
    return { hasMedia, hasLink, hasFile };
  });
}

const personalHubMenu = [
  { label: "Contacts", icon: UserPlus, action: "contacts" },
  { label: "Find Contacts", icon: Search, action: "find-contacts" },
  { label: "Contact Requests", icon: Users, action: "contact-requests" },
  { label: "People Nearby", icon: Radar, action: "nearby" },
  { label: "Broadcast Lists", icon: Radio, action: "broadcasts" },
  { label: "Folders", icon: Settings, action: "folders" },
  { label: "Privacy & Security", icon: Settings, action: "privacy" },
  { label: "Active Sessions", icon: Bell, action: "sessions" },
  { label: "Storage & Cache", icon: HardDrive, action: "storage" },
] as const;

export default function ChatHubPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [folder, setFolderState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(FOLDER_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return "all";
  });
  const setFolder = (f: string) => {
    setFolderState(f);
    try { localStorage.setItem(FOLDER_STORAGE_KEY, f); } catch {}
  };
  const builtInActiveFolder = builtInFolders.find((f) => f.id === folder);
  const active: ChatCategory = builtInActiveFolder?.category || "personal";
  const setActive = (c: ChatCategory) => setFolder(c);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Telegram-style: pressing "/" anywhere on the chat hub focuses the search input.
  // Skips when the user is already typing in another input/textarea or with a modifier key.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const [searchFilter, setSearchFilter] = useState<"chats" | "media" | "links" | "files">("chats");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  // Telegram-style: collapse Stories strip on scroll-down, restore on scroll-up
  const [storiesCollapsed, setStoriesCollapsed] = useState(false);
  // Pre-warm lazy chat chunks so first open is instant (no visible loading delay).
  // requestIdleCallback is unsupported in Safari — must guard via window.
  useEffect(() => {
    const ric = window.requestIdleCallback;
    const cic = window.cancelIdleCallback;
    const prefetch = () => {
      void import("@/components/chat/PersonalChat");
      void import("@/components/chat/GroupChat");
      void import("@/components/grocery/StoreLiveChat");
    };
    const id = ric ? ric(prefetch) : setTimeout(prefetch, 1500);
    return () => {
      if (ric && cic) cic(id as number);
      else clearTimeout(id as ReturnType<typeof setTimeout>);
    };
  }, []);

  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const last = lastScrollYRef.current;
      const delta = y - last;
      if (y <= 4) {
        setStoriesCollapsed(false);
      } else if (delta > 6 && y > 20) {
        setStoriesCollapsed(true);
      } else if (delta < -4) {
        setStoriesCollapsed(false);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [showArchived, setShowArchived] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; category: ChatCategory } | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [openShopChat, setOpenShopChat] = useState<{ storeId: string; name: string; logo?: string | null } | null>(null);
  const [openPersonalChat, setOpenPersonalChat] = useState<{ id: string; name: string; avatar?: string | null; isVerified?: boolean; prefillInput?: string } | null>(null);
  const [openGroupChat, setOpenGroupChat] = useState<{ id: string; name: string; avatar?: string | null } | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Share mode state
  const [sharePayload, setSharePayload] = useState<{ shareUrl: string; shareText: string } | null>(null);

  // Handle post-payment unlock redirect: /chat?unlocked=MESSAGE_ID
  useEffect(() => {
    const unlockedMsgId = searchParams.get("unlocked");
    if (!unlockedMsgId || !user) return;
    // Remove param from URL immediately
    searchParams.delete("unlocked");
    setSearchParams(searchParams, { replace: true });
    // Auto-verify the unlock with Stripe
    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-media-unlock", {
          body: { message_id: unlockedMsgId },
        });
        if (error) throw error;
        if (data?.unlocked) {
          toast.success("Media unlocked! 🔓");
        } else {
          toast.info("Payment is still processing. The media will unlock shortly.");
        }
      } catch {
        toast.error("Failed to verify unlock");
      }
    };
    verify();
  }, [searchParams, user]);

  // Handle ?with=<userId> deep-link from push notification tap
  useEffect(() => {
    let withId = searchParams.get("with");

    // Fallback: sessionStorage covers cold-start where the URL was set before auth rehydrated
    if (!withId) {
      try {
        const pending = sessionStorage.getItem("pendingChatWith");
        if (pending) {
          sessionStorage.removeItem("pendingChatWith");
          withId = pending;
        }
      } catch {}
    }

    if (!withId || !user) return;
    searchParams.delete("with");
    setSearchParams(searchParams, { replace: true });
    setActive("personal");
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, is_verified")
        .eq("user_id", withId)
        .maybeSingle();
      setOpenPersonalChat({
        id: withId,
        name: data?.full_name || "Chat",
        avatar: data?.avatar_url || null,
        isVerified: (data as any)?.is_verified === true,
      });
    })();
  }, [searchParams, user, setSearchParams]);

  // Handle deep-link from profile page chat button OR share-to-chat OR start call
  const [pendingCall, setPendingCall] = useState<"voice" | "video" | null>(null);
  const hasRestoredLastChatRef = useRef(false);
  useEffect(() => {
    const state = location.state as {
      openChat?: { recipientId: string; recipientName: string; recipientAvatar?: string | null; prefillInput?: string };
      startCall?: "voice" | "video";
      shareUrl?: string;
      shareText?: string;
    } | null;
    if (state?.openChat) {
      setOpenPersonalChat({
        id: state.openChat.recipientId,
        name: state.openChat.recipientName,
        avatar: state.openChat.recipientAvatar,
        prefillInput: state.openChat.prefillInput,
      });
      if (state.startCall) {
        setPendingCall(state.startCall);
      }
      window.history.replaceState({}, document.title);
    }
    if (state?.shareUrl) {
      setSharePayload({ shareUrl: state.shareUrl, shareText: state.shareText || "" });
      setActive("personal");
      window.history.replaceState({}, document.title);
    }
    // Deep-link: /chat/saved opens the self-chat (Saved Messages)
    if (location.pathname === "/chat/saved" && user?.id) {
      setActive("personal");
      setOpenPersonalChat({ id: user.id, name: "Saved Messages", avatar: null, isVerified: false });
    }
  }, [location.state, location.pathname, user?.id]);

  useEffect(() => {
    if (hasRestoredLastChatRef.current || !user?.id) return;
    hasRestoredLastChatRef.current = true;

    const routeState = location.state as {
      openChat?: { recipientId: string; recipientName: string; recipientAvatar?: string | null };
      startCall?: "voice" | "video";
      shareUrl?: string;
      shareText?: string;
    } | null;

    if (searchParams.get("with") || searchParams.get("unlocked") || routeState?.openChat || routeState?.shareUrl) return;

    try {
      const raw = localStorage.getItem(`${LAST_OPEN_CHAT_KEY}:${user.id}`);
      if (!raw) return;
      const persisted = JSON.parse(raw) as PersistedOpenChat;
      if (persisted.kind === "personal") {
        setActive("personal");
        setOpenPersonalChat({ id: persisted.id, name: persisted.name, avatar: persisted.avatar || null, isVerified: persisted.isVerified === true });
      } else if (persisted.kind === "group") {
        setActive("personal");
        setOpenGroupChat({ id: persisted.id, name: persisted.name, avatar: persisted.avatar || null });
      } else if (persisted.kind === "shop") {
        setActive("shop");
        setOpenShopChat({ storeId: persisted.storeId, name: persisted.name, logo: persisted.logo || null });
      }
    } catch {}
  }, [location.state, searchParams, user?.id]);

  useEffect(() => {
    if (!user?.id || !hasRestoredLastChatRef.current) return;
    const storageKey = `${LAST_OPEN_CHAT_KEY}:${user.id}`;
    try {
      if (openPersonalChat) {
        const payload: PersistedOpenChat = {
          kind: "personal",
          id: openPersonalChat.id,
          name: openPersonalChat.name,
          avatar: openPersonalChat.avatar || null,
          isVerified: openPersonalChat.isVerified === true,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        return;
      }
      if (openGroupChat) {
        const payload: PersistedOpenChat = {
          kind: "group",
          id: openGroupChat.id,
          name: openGroupChat.name,
          avatar: openGroupChat.avatar || null,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        return;
      }
      if (openShopChat) {
        const payload: PersistedOpenChat = {
          kind: "shop",
          storeId: openShopChat.storeId,
          name: openShopChat.name,
          logo: openShopChat.logo || null,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        return;
      }
      localStorage.removeItem(storageKey);
    } catch {}
  }, [openGroupChat, openPersonalChat, openShopChat, user?.id]);

  useEffect(() => {
    if (!user?.id || !openPersonalChat?.id) return;

    const recipientId = openPersonalChat.id;

    queryClient.setQueryData<any[]>(["chat-hub-personal", user.id], (previous = []) =>
      previous.map((chat: any) =>
        chat.id === recipientId
          ? { ...chat, unread: 0, isRead: true }
          : chat
      )
    );

    void (async () => {
      const { error } = await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", recipientId)
        .eq("is_read", false);

      if (error) {
        console.error("[ChatHub] Failed to mark conversation as read:", error);
      }

      await queryClient.invalidateQueries({ queryKey: ["chat-hub-personal", user.id] });
    })();
  }, [openPersonalChat?.id, queryClient, user?.id]);

  // Send shared content as a DM to selected contact
  const handleShareToContact = async (contactId: string, contactName: string, contactAvatar?: string | null) => {
    if (!sharePayload || !user) return;
    try {
      const safeShareUrl = validateExternalUrl(sharePayload.shareUrl);
      if (!safeShareUrl) {
        toast.error("Blocked unsafe share link");
        return;
      }

      const shareText = sanitizeOutgoingMessage(sharePayload.shareText || "");
      const shareMessage = shareText
        ? `${shareText}\n${safeShareUrl}`
        : safeShareUrl;

      const risk = assessChatMessageRisk(shareMessage);
      if (risk.blocked) {
        toast.error("Blocked unsafe message content");
        return;
      }

      await supabase.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: contactId,
        message: shareMessage,
      });
      toast.success(`Shared to ${contactName}`);
      setSharePayload(null);
      queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] });
      setOpenPersonalChat({ id: contactId, name: contactName, avatar: contactAvatar });
    } catch (error: any) {
      toast.error(error?.message || "Failed to share");
    }
  };

  // Fetch store chats for "shop" tab
  const { data: shopChats = [] } = useQuery({
    queryKey: ["chat-hub-shop", user?.id],
    enabled: !!user && active === "shop",
    queryFn: async () => {
      const { data } = await supabase
        .from("store_chats")
        .select("id, store_id, created_at, store_profiles!store_chats_store_id_fkey(name, logo_url, slug)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!data) return [];

      const enriched = await Promise.all(
        data.map(async (chat: any) => {
          const { data: lastMsg } = await supabase
            .from("store_chat_messages")
            .select("content, created_at, is_read, sender_type")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from("store_chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .eq("sender_type", "store")
            .eq("is_read", false);

          return {
            id: chat.id,
            storeId: chat.store_id,
            storeSlug: chat.store_profiles?.slug,
            name: chat.store_profiles?.name || "Store",
            avatar: chat.store_profiles?.logo_url,
            lastMessage: lastMsg?.content || "No messages yet",
            lastTime: lastMsg?.created_at || chat.created_at,
            unread: count || 0,
          };
        })
      );
      return enriched;
    },
  });

  // Fetch ride chats via chat_messages with trip_id
  const { data: rideChats = [] } = useQuery({
    queryKey: ["chat-hub-ride", user?.id],
    enabled: !!user && active === "ride",
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, chat_id, order_id, trip_id, sender_id, sender_type, message, created_at, is_read")
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!data || data.length === 0) return [];

      const grouped = new Map<string, any>();
      for (const msg of data as any[]) {
        const key = msg.chat_id || msg.order_id || msg.id;
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            name: `Ride #${key.slice(0, 6).toUpperCase()}`,
            lastMessage: msg.message || "",
            lastTime: msg.created_at,
            unread: (!msg.is_read && msg.sender_id !== user!.id) ? 1 : 0,
          });
        }
      }
      return Array.from(grouped.values());
    },
  });

  // Support chats from ai_conversations
  const { data: supportChats = [] } = useQuery({
    queryKey: ["chat-hub-support", user?.id],
    enabled: !!user && active === "support",
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_conversations")
        .select("id, question, answer, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data) return [];
      return data.map((c: any) => ({
        id: c.id,
        name: "ZIVO Support",
        lastMessage: c.answer || c.question || "Conversation",
        lastTime: c.created_at,
        unread: 0,
      }));
    },
  });

  // Fetch personal chats from direct_messages
  const { data: personalChats = [] } = useQuery({
    queryKey: ["chat-hub-personal", user?.id],
    enabled: !!user && active === "personal",
    queryFn: async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!data || data.length === 0) return [];

      const grouped = new Map<string, { lastMsg: any; unread: number }>();
      for (const msg of data as any[]) {
        const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
        if (!grouped.has(otherId)) {
          grouped.set(otherId, { lastMsg: msg, unread: 0 });
        }
        if (msg.receiver_id === user!.id && !msg.is_read) {
          grouped.get(otherId)!.unread += 1;
        }
      }

      const otherIds = Array.from(grouped.keys());
      if (otherIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, last_seen, is_verified")
        .in("user_id", otherIds);

      const profileMap = new Map<string, any>();
      for (const p of (profiles || []) as any[]) {
        profileMap.set(p.user_id, p);
      }

      return otherIds.map((otherId) => {
        const entry = grouped.get(otherId)!;
        const profile = profileMap.get(otherId);
        const lastSeen = profile?.last_seen ? new Date(profile.last_seen) : null;
        const isOnline = lastSeen ? (Date.now() - lastSeen.getTime()) < 2 * 60 * 1000 : false;
        const isSentByMe = entry.lastMsg.sender_id === user!.id;
        return {
          id: otherId,
          name: profile?.full_name || "User",
          avatar: profile?.avatar_url || null,
          isVerified: profile?.is_verified === true,
          lastMessage: entry.lastMsg.message_type === "voice"
            ? "🎤 Voice message"
            : entry.lastMsg.message_type === "file"
            ? "📎 File"
            : entry.lastMsg.message || (entry.lastMsg.image_url ? "📷 Image" : entry.lastMsg.video_url ? "🎥 Video" : ""),
          lastTime: entry.lastMsg.created_at,
          unread: entry.unread,
          isOnline,
          isSentByMe,
          isRead: entry.lastMsg.is_read,
          deliveredAt: entry.lastMsg.delivered_at,
        };
      });
    },
  });

  // Fetch group chats
  const { data: groupChats = [] } = useQuery({
    queryKey: ["chat-hub-groups", user?.id],
    enabled: !!user && active === "personal",
    queryFn: async () => {
      const { data: memberships } = await (supabase as any)
        .from("chat_group_members")
        .select("group_id")
        .eq("user_id", user!.id);

      if (!memberships?.length) return [];

      const groupIds = memberships.map((m: any) => m.group_id);
      const { data: groups } = await (supabase as any)
        .from("chat_groups")
        .select("id, name, avatar_url, created_at")
        .in("id", groupIds);

      if (!groups) return [];

      const enriched = await Promise.all(
        groups.map(async (g: any) => {
          const { data: lastMsg } = await (supabase as any)
            .from("group_messages")
            .select("message, created_at, sender_id")
            .eq("group_id", g.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          let lastSenderName: string | null = null;
          if (lastMsg?.sender_id && lastMsg.sender_id !== user!.id) {
            const { data: senderProf } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", lastMsg.sender_id)
              .maybeSingle();
            lastSenderName = (senderProf as any)?.full_name?.split(" ")[0] || null;
          } else if (lastMsg?.sender_id === user!.id) {
            lastSenderName = "You";
          }

          return {
            id: g.id,
            name: g.name,
            avatar: g.avatar_url,
            lastMessage: lastMsg?.message_type === "voice"
            ? "🎤 Voice message"
            : lastMsg?.message || "Group created",
            lastTime: lastMsg?.created_at || g.created_at,
            unread: 0,
            isGroup: true,
            lastSenderName,
          };
        })
      );
      return enriched;
    },
  });

  // User-defined folder tabs and conversation membership
  const { data: customFolders = [] } = useQuery({
    queryKey: ["chat-folders", user?.id],
    enabled: !!user?.id && active === "personal",
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_folders")
        .select("id, name, icon, sort_order")
        .eq("user_id", user!.id)
        .order("sort_order", { ascending: true });
      return (data || []) as { id: string; name: string; icon: string | null; sort_order: number | null }[];
    },
  });

  const customFolderIds = useMemo(() => customFolders.map((f) => f.id), [customFolders]);

  const { data: customFolderMembers = [] } = useQuery({
    queryKey: ["chat-folder-members", user?.id, customFolderIds.join(",")],
    enabled: !!user?.id && customFolderIds.length > 0 && active === "personal",
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_folder_members")
        .select("folder_id, conversation_id")
        .in("folder_id", customFolderIds);
      return (data || []) as { folder_id: string; conversation_id: string }[];
    },
  });

  const customFolderMemberMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const row of customFolderMembers) {
      if (!map.has(row.folder_id)) map.set(row.folder_id, new Set());
      map.get(row.folder_id)!.add(row.conversation_id);
    }
    return map;
  }, [customFolderMembers]);

  const folderTabs = useMemo<FolderTab[]>(() => {
    const customTabs = customFolders.map((f) => ({
      id: `custom:${f.id}`,
      label: `${f.icon || "📁"} ${f.name}`,
      category: "personal" as ChatCategory,
    }));
    return [...builtInFolders, ...customTabs];
  }, [customFolders]);

  // Row actions sheet state — declared before actionsFolderMembership useMemo
  const [actionsTarget, setActionsTarget] = useState<ChatRowActionsTarget | null>(null);

  const actionsFolderMembership = useMemo(() => {
    if (!actionsTarget) return new Set<string>();
    const set = new Set<string>();
    for (const folderDef of customFolders) {
      const members = customFolderMemberMap.get(folderDef.id);
      if (members?.has(actionsTarget.id)) set.add(folderDef.id);
    }
    return set;
  }, [actionsTarget, customFolders, customFolderMemberMap]);

  const currentCategory = categories.find((c) => c.id === active)!;
  const { prefs, isPinned, isMuted, isArchived, isMarkedUnread, togglePin, toggleMute, toggleArchive, toggleMarkUnread, setMarkedUnread, setPrefs } = useChatPrefs(user?.id);

  // Live presence dots for visible personal partners
  const personalPartnerIds = useMemo(
    () => (personalChats as any[]).filter((c) => !c.isGroup).map((c) => c.id),
    [personalChats]
  );
  const onlineIds = useBulkPresence(user?.id, personalPartnerIds);

  // Live "typing…" preview from other users
  const typingFrom = useTypingBus(user?.id);

  const [showAddContact, setShowAddContact] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [bulkFolderAction, setBulkFolderAction] = useState<"add" | "remove" | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Saved Messages — Telegram's self-chat
  const { data: savedMessagesPreview } = useQuery({
    queryKey: ["chat-hub-saved", user?.id],
    enabled: !!user && active === "personal",
    queryFn: async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select("message, created_at")
        .eq("sender_id", user!.id)
        .eq("receiver_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as { message: string; created_at: string } | null;
    },
  });

  // Draft indicators — batch load all chat drafts so we can show "Draft: …" in previews
  const { data: chatDraftsRaw = [] } = useQuery({
    queryKey: ["chat-drafts-all", user?.id],
    enabled: !!user && active === "personal",
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_drafts")
        .select("chat_partner_id, draft_text")
        .eq("user_id", user!.id)
        .neq("draft_text", "");
      return (data || []) as { chat_partner_id: string; draft_text: string }[];
    },
  });
  const draftsMap = useMemo(() => {
    const map: Record<string, string> = {};
    chatDraftsRaw.forEach((d) => { if (d.draft_text?.trim()) map[d.chat_partner_id] = d.draft_text.trim(); });
    return map;
  }, [chatDraftsRaw]);

  // Incoming contact requests — shown as a notification row at the top
  const { incoming: allIncomingRequests } = useContactRequests();
  const pendingRequests = useMemo(() => allIncomingRequests.filter((r) => r.status === "pending"), [allIncomingRequests]);

  // Compute unread counts per tab
  const personalUnread = personalChats.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
  const shopUnread = shopChats.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
  const rideUnread = rideChats.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
  const supportUnread = supportChats.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
  const unreadMap: Record<ChatCategory, number> = {
    personal: personalUnread,
    shop: shopUnread,
    ride: rideUnread,
    support: supportUnread,
  };

  const mergedPersonalList = active === "personal"
    ? [...personalChats, ...groupChats].sort((a: any, b: any) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
    : [];

  const rawChatList =
    active === "shop" ? shopChats :
    active === "ride" ? rideChats :
    active === "support" ? supportChats :
    mergedPersonalList;

  // Apply folder-level filtering on top of category data
  const folderFiltered = (rawChatList as any[]).filter((c) => {
    if (folder.startsWith("custom:")) {
      const customFolderId = folder.slice("custom:".length);
      const members = customFolderMemberMap.get(customFolderId);
      return members?.has(c.id) === true;
    }
    if (folder === "unread") return (c.unread || 0) > 0 || isMarkedUnread(c.id);
    if (folder === "mentions") {
      // Only flag chats where the most-recent message was *received* and contains
      // an @handle. Self-sent messages don't count as a mention of *you*.
      return !(c as any).isSentByMe && lastMessageHasMention((c as any).lastMessage);
    }
    if (folder === "personal") return !(c as any).isGroup;
    if (folder === "groups") return !!(c as any).isGroup;
    return true;
  });

  // Split archived vs visible
  const archivedList = folderFiltered.filter((c: any) => isArchived(c.id));
  const visibleList = folderFiltered.filter((c: any) => !isArchived(c.id));

  // Per-folder unread badges (for the pill bar)
  const mentionsUnread = (rawChatList as any[]).reduce(
    (s: number, c: any) =>
      s + (!c.isSentByMe && lastMessageHasMention(c.lastMessage) ? (c.unread || 0) : 0),
    0
  );
  const builtInFolderUnreadMap: Record<BuiltInChatFolder, number> = {
    all: personalUnread,
    unread: personalUnread,
    mentions: mentionsUnread,
    personal: personalChats.filter((c: any) => !c.isGroup).reduce((s: number, c: any) => s + (c.unread || 0), 0),
    groups: groupChats.reduce((s: number, c: any) => s + (c.unread || 0), 0),
    shop: shopUnread,
    support: supportUnread,
    ride: rideUnread,
  };

  const customFolderUnreadMap = useMemo(() => {
    const map: Record<string, number> = {};
    const personalPool = [...personalChats, ...groupChats] as any[];
    for (const folderDef of customFolders) {
      const members = customFolderMemberMap.get(folderDef.id);
      if (!members) {
        map[`custom:${folderDef.id}`] = 0;
        continue;
      }
      map[`custom:${folderDef.id}`] = personalPool
        .filter((chat) => members.has(chat.id))
        .reduce((sum, chat) => sum + (chat.unread || 0), 0);
    }
    return map;
  }, [customFolders, customFolderMemberMap, groupChats, personalChats]);

  const folderUnreadMap: Record<string, number> = {
    ...builtInFolderUnreadMap,
    ...customFolderUnreadMap,
  };

  // Pinned-first sort
  const sortByPin = (list: any[]) =>
    [...list].sort((a, b) => {
      const pa = isPinned(a.id) ? 1 : 0;
      const pb = isPinned(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
    });

  const sortedVisible = sortByPin(visibleList);
  const archivedUnread = archivedList.reduce((s: number, c: any) => s + (c.unread || 0), 0);

  // Defer the local list filter so typing in the search box stays responsive —
  // the input updates synchronously, but the (possibly heavy) filter pass runs
  // at a lower priority and can be interrupted.
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filtered = normalizedSearch
    ? sortedVisible.filter((c: any) => {
        const preview = parseRichMessagePreview(c.lastMessage || "");
        const searchable = `${String(c.name || "")} ${String(preview || "")}`.toLowerCase();
        if (!searchable.includes(normalizedSearch)) return false;

        const type = detectPreviewType(preview);
        if (searchFilter === "media") return type.hasMedia;
        if (searchFilter === "links") return type.hasLink;
        if (searchFilter === "files") return type.hasFile;
        return true;
      })
    : sortedVisible;

  const [profileResults, setProfileResults] = useState<any[]>([]);
  const [searchingProfiles, setSearchingProfiles] = useState(false);

  useEffect(() => {
    if (active !== "personal" || search.trim().length < 2) {
      setProfileResults([]);
      return;
    }
    let alive = true;
    const timeout = setTimeout(async () => {
      setSearchingProfiles(true);
      try {
        const term = `%${search.trim()}%`;
        const { data } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, email, is_verified")
          .or(`full_name.ilike.${term},email.ilike.${term}`)
          .neq("user_id", user!.id)
          .limit(15);
        if (alive && data) {
          setProfileResults(
            data.map((p: any) => ({
              id: p.user_id,
              name: p.full_name || p.email || "User",
              avatar: p.avatar_url,
              isVerified: p.is_verified === true,
              lastMessage: "Tap to chat",
              lastTime: new Date().toISOString(),
              unread: 0,
            }))
          );
        }
      } catch { /* ignore */ }
      finally { if (alive) setSearchingProfiles(false); }
    }, 350);
    return () => { alive = false; clearTimeout(timeout); };
  }, [search, active, user]);

  const displayList = active === "personal" && searchFilter === "chats" && search.trim().length >= 2
    ? profileResults
    : filtered;

  const bulkSelectableList = useMemo<BulkSelectableChat[]>(
    () => displayList as BulkSelectableChat[],
    [displayList],
  );

  const selectedSummary = useMemo(() => {
    const selected = bulkSelectableList.filter((chat) => selectedChatIds.has(chat.id));
    const unread = selected.reduce((sum, chat) => sum + (chat.unread || 0), 0);
    return { count: selected.length, unread };
  }, [bulkSelectableList, selectedChatIds]);

  const hasOverlayChatOpen = Boolean(openShopChat || openPersonalChat || openGroupChat);
  const showListShell = !embedded || !hasOverlayChatOpen;

  const canDelete = active === "personal";

  const handlePersonalHubMenuAction = useCallback((action: (typeof personalHubMenu)[number]["action"]) => {
    switch (action) {
      case "contacts":
        navigate("/chat/contacts");
        break;
      case "find-contacts":
        navigate("/chat/find-contacts");
        break;
      case "contact-requests":
        navigate("/chat/contacts/requests");
        break;
      case "nearby":
        navigate("/chat/nearby");
        break;
      case "broadcasts":
        navigate("/chat/broadcasts");
        break;
      case "folders":
        navigate("/chat/folders");
        break;
      case "privacy":
        navigate("/chat/settings/privacy-hub");
        break;
      case "sessions":
        navigate("/chat/settings/sessions");
        break;
      case "storage":
        navigate("/chat/settings/storage");
        break;
    }
  }, [navigate]);

  const handleDeleteChat = async (chatId: string, category: ChatCategory) => {
    try {
      if (category === "shop") {
        await supabase.from("store_chat_messages").delete().eq("chat_id", chatId);
        await supabase.from("store_chats").delete().eq("id", chatId).eq("user_id", user!.id);
        queryClient.invalidateQueries({ queryKey: ["chat-hub-shop"] });
      } else if (category === "support") {
        await supabase.from("ai_conversations").delete().eq("id", chatId).eq("user_id", user!.id);
        queryClient.invalidateQueries({ queryKey: ["chat-hub-support"] });
      } else if (category === "ride") {
        await supabase.from("chat_messages").delete().eq("chat_id", chatId).eq("sender_id", user!.id);
        queryClient.invalidateQueries({ queryKey: ["chat-hub-ride"] });
      }
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
    setDeleteConfirm(null);
    setSwipedId(null);
  };

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] }),
      queryClient.invalidateQueries({ queryKey: ["chat-hub-shop"] }),
      queryClient.invalidateQueries({ queryKey: ["chat-hub-ride"] }),
      queryClient.invalidateQueries({ queryKey: ["chat-hub-support"] }),
    ]);
  }, [queryClient]);

  const toggleSelectedChat = useCallback((chatId: string) => {
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  }, []);

  const clearSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedChatIds(new Set());
    setBulkFolderAction(null);
    setShowBulkDeleteConfirm(false);
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedChatIds(new Set(bulkSelectableList.map((chat) => chat.id)));
  }, [bulkSelectableList]);

  const selectUnreadVisible = useCallback(() => {
    setSelectedChatIds(new Set(bulkSelectableList.filter((chat) => (chat.unread || 0) > 0).map((chat) => chat.id)));
  }, [bulkSelectableList]);

  const handleBulkMarkRead = useCallback(async () => {
    if (!user?.id || selectedChatIds.size === 0) return;
    const senderIds = Array.from(selectedChatIds);
    const { error } = await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .in("sender_id", senderIds);
    if (error) {
      toast.error("Failed to mark selected chats as read");
      return;
    }
    toast.success("Selected chats marked as read");
    await queryClient.invalidateQueries({ queryKey: ["chat-hub-personal", user.id] });
    clearSelectionMode();
  }, [clearSelectionMode, queryClient, selectedChatIds, user?.id]);

  const handleBulkAddToFolder = useCallback(async (folderId: string) => {
    if (!user?.id || selectedChatIds.size === 0) return;
    const selected = Array.from(selectedChatIds);
    const { data: existingRows } = await (supabase as any)
      .from("chat_folder_members")
      .select("conversation_id")
      .eq("folder_id", folderId)
      .in("conversation_id", selected);

    const existingIds = new Set<string>((existingRows || []).map((r: { conversation_id: string }) => r.conversation_id));
    const payload = selected
      .filter((id) => !existingIds.has(id))
      .map((conversation_id) => ({ folder_id: folderId, conversation_id }));

    if (payload.length === 0) {
      toast.info("All selected chats are already in this folder");
      return;
    }

    const { error } = await (supabase as any)
      .from("chat_folder_members")
      .insert(payload);
    if (error) {
      toast.error("Failed to add selected chats to folder");
      return;
    }
    toast.success(`Added ${payload.length} chat${payload.length === 1 ? "" : "s"} to folder`);
    await queryClient.invalidateQueries({ queryKey: ["chat-folder-members", user?.id] });
    clearSelectionMode();
  }, [clearSelectionMode, queryClient, selectedChatIds, user?.id]);

  const handleBulkRemoveFromFolder = useCallback(async (folderId: string) => {
    if (!user?.id || selectedChatIds.size === 0) return;
    const selected = Array.from(selectedChatIds);
    const { error } = await (supabase as any)
      .from("chat_folder_members")
      .delete()
      .eq("folder_id", folderId)
      .in("conversation_id", selected);
    if (error) {
      toast.error("Failed to remove selected chats from folder");
      return;
    }
    toast.success("Removed selected chats from folder");
    await queryClient.invalidateQueries({ queryKey: ["chat-folder-members", user?.id] });
    clearSelectionMode();
  }, [clearSelectionMode, queryClient, selectedChatIds, user?.id]);

  const handleBulkSetArchive = useCallback((archived: boolean) => {
    if (selectedChatIds.size === 0) return;
    const previousPrefs = prefs;
    const nextArchived = { ...(prefs.archived || {}) };
    for (const id of selectedChatIds) {
      if (archived) nextArchived[id] = true;
      else delete nextArchived[id];
    }
    setPrefs({ ...prefs, archived: nextArchived });
    toast.success(archived ? "Selected chats archived" : "Selected chats unarchived", {
      action: {
        label: "Undo",
        onClick: () => setPrefs(previousPrefs),
      },
    });
  }, [prefs, selectedChatIds, setPrefs]);

  const handleBulkSetMuted = useCallback((muted: boolean) => {
    if (selectedChatIds.size === 0) return;
    const previousPrefs = prefs;
    const nextMuted = { ...(prefs.muted || {}) };
    for (const id of selectedChatIds) {
      if (muted) nextMuted[id] = true;
      else delete nextMuted[id];
    }
    setPrefs({ ...prefs, muted: nextMuted });
    toast.success(muted ? "Selected chats muted" : "Selected chats unmuted", {
      action: {
        label: "Undo",
        onClick: () => setPrefs(previousPrefs),
      },
    });
  }, [prefs, selectedChatIds, setPrefs]);

  const handleBulkSetPinned = useCallback((pinned: boolean) => {
    if (selectedChatIds.size === 0) return;
    const previousPrefs = prefs;
    const nextPinned = { ...(prefs.pinned || {}) };
    for (const id of selectedChatIds) {
      if (pinned) nextPinned[id] = true;
      else delete nextPinned[id];
    }
    setPrefs({ ...prefs, pinned: nextPinned });
    toast.success(pinned ? "Selected chats pinned" : "Selected chats unpinned", {
      action: {
        label: "Undo",
        onClick: () => setPrefs(previousPrefs),
      },
    });
  }, [prefs, selectedChatIds, setPrefs]);

  const handleBulkDeleteSelected = useCallback(async () => {
    if (!user?.id || selectedChatIds.size === 0) return;
    const selectedMeta = bulkSelectableList.filter((chat) => selectedChatIds.has(chat.id));
    const personalIds = selectedMeta.filter((chat) => !chat.isGroup).map((chat) => chat.id);
    const groupIds = selectedMeta.filter((chat) => !!chat.isGroup).map((chat) => chat.id);

    try {
      await Promise.all(
        [
          ...personalIds.map((chatId: string) =>
            supabase
              .from("direct_messages")
              .delete()
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
          ),
          ...(groupIds.length
            ? [
                (supabase as any)
                  .from("chat_group_members")
                  .delete()
                  .eq("user_id", user.id)
                  .in("group_id", groupIds),
              ]
            : []),
          (supabase as any)
            .from("chat_folder_members")
            .delete()
            .in("conversation_id", Array.from(selectedChatIds)),
        ]
      );

      // Remove deleted/left conversations from local pin/mute/archive maps.
      const nextPinned = { ...(prefs.pinned || {}) };
      const nextMuted = { ...(prefs.muted || {}) };
      const nextArchived = { ...(prefs.archived || {}) };
      for (const id of selectedChatIds) {
        delete nextPinned[id];
        delete nextMuted[id];
        delete nextArchived[id];
      }
      setPrefs({ ...prefs, pinned: nextPinned, muted: nextMuted, archived: nextArchived });

      const personalCount = personalIds.length;
      const leftGroups = groupIds.length;
      const parts = [];
      if (personalCount > 0) parts.push(`Deleted ${personalCount} personal chat${personalCount === 1 ? "" : "s"}`);
      if (leftGroups > 0) parts.push(`left ${leftGroups} group chat${leftGroups === 1 ? "" : "s"}`);
      toast.success(parts.length ? `${parts.join(" and ")}.` : "Selected chats removed.");

      await queryClient.invalidateQueries({ queryKey: ["chat-hub-personal", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["chat-hub-groups", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["chat-folder-members", user.id] });
      clearSelectionMode();
    } catch {
      toast.error("Failed to delete selected chats");
    }
  }, [bulkSelectableList, clearSelectionMode, prefs, queryClient, selectedChatIds, setPrefs, user?.id]);

  const handleAddChatToFolder = useCallback(async (folderId: string, conversationId: string) => {
    const { error } = await (supabase as any)
      .from("chat_folder_members")
      .insert({ folder_id: folderId, conversation_id: conversationId });
    if (error) {
      toast.error("Failed to add chat to folder");
      return;
    }
    toast.success("Added to folder");
    await queryClient.invalidateQueries({ queryKey: ["chat-folder-members", user?.id] });
  }, [queryClient, user?.id]);

  const handleRemoveChatFromFolder = useCallback(async (folderId: string, conversationId: string) => {
    const { error } = await (supabase as any)
      .from("chat_folder_members")
      .delete()
      .eq("folder_id", folderId)
      .eq("conversation_id", conversationId);
    if (error) {
      toast.error("Failed to remove chat from folder");
      return;
    }
    toast.success("Removed from folder");
    await queryClient.invalidateQueries({ queryKey: ["chat-folder-members", user?.id] });
  }, [queryClient, user?.id]);

  const handleMarkAllPersonalRead = useCallback(async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    if (error) {
      toast.error("Failed to mark all as read");
      return;
    }
    toast.success("All chats marked as read");
    await queryClient.invalidateQueries({ queryKey: ["chat-hub-personal", user.id] });
  }, [queryClient, user?.id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <MessageCircleIcon className="w-9 h-9 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground mb-2">Sign in to chat</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">Connect with friends, shops, and support — all in one place</p>
        <button onClick={() => navigate(withRedirectParam("/login", "/chat"))} className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform">
          Sign In
        </button>
      </div>
    );
  }

  const shell = (
    <div className={cn(
      "flex flex-col mx-auto w-full",
      embedded ? "h-full min-h-0" : "min-h-screen",
      // Cap width on tablet+/desktop so the chat list reads as a clean panel,
      // not a sprawl. Mobile keeps full width.
      !embedded && "md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
    )}>
      {showListShell && (
        <>
          <div
            className={cn(
              "shrink-0",
              embedded
                ? "border-b border-border/15 bg-background/95 backdrop-blur-2xl"
                : "sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20 pt-safe"
            )}
            style={!embedded ? { paddingTop: "var(--zivo-safe-top-sticky)" } : undefined}
          >
            {!embedded ? (
              <div className="px-5 pt-2 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectionMode ? (
                    <button
                      onClick={clearSelectionMode}
                      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Exit selection"
                      title="Exit selection"
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/')}
                      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Back"
                      title="Back"
                    >
                      <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {selectionMode ? `${selectedChatIds.size} selected` : "Chat"}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {active === "personal" && !selectionMode && !search && (
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="New message"
                      title="New message"
                    >
                      <SquarePen className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                  {active === "personal" && !selectionMode && !search && (
                    <button
                      onClick={() => setSelectionMode(true)}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Select chats"
                      title="Select chats"
                    >
                      <CheckSquare className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                  {active === "personal" && (
                    <button
                      onClick={() => void handleMarkAllPersonalRead()}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Mark all as read"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                  {active === "personal" && (
                    <button
                      onClick={() => navigate('/chat/contacts')}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Contacts"
                    >
                      <UserPlus className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                  {active === "personal" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                          aria-label="Chat tools"
                          title="Chat tools"
                        >
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {personalHubMenu.slice(0, 3).map((item) => (
                          <DropdownMenuItem key={item.action} onClick={() => handlePersonalHubMenuAction(item.action)} className="gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {personalHubMenu.slice(3, 6).map((item) => (
                          <DropdownMenuItem key={item.action} onClick={() => handlePersonalHubMenuAction(item.action)} className="gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {personalHubMenu.slice(6).map((item) => (
                          <DropdownMenuItem key={item.action} onClick={() => handlePersonalHubMenuAction(item.action)} className="gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {active === "personal" && (
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="New group"
                    >
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <Plus className="w-2.5 h-2.5 text-primary absolute bottom-1 right-1" />
                    </button>
                  )}
                  <ChatBellPopover />
                </div>
              </div>
            ) : null}

            {!embedded && (
              <motion.div
                animate={{ height: storiesCollapsed ? 0 : "auto", opacity: storiesCollapsed ? 0 : 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
              >
                <Suspense fallback={null}><ChatStories /></Suspense>
              </motion.div>
            )}

            <div className={cn("px-5 pb-3", embedded && "px-3 pb-2")}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onFocus={(e) => {
                    // Open Telegram-style global search overlay (chats / contacts / channels / messages)
                    if (!search) {
                      e.currentTarget.blur();
                      setGlobalSearchOpen(true);
                    }
                  }}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-10 bg-muted/60 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground transition-all",
                    embedded ? "py-2 text-xs" : "py-2.5"
                  )}
                />
                {search ? (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear search" title="Clear search">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ) : (
                  <span
                    className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px] font-mono text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    title="Press / to focus search"
                  >
                    /
                  </span>
                )}
              </div>
              {search.trim().length > 0 && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide">
                  {(["chats", "media", "links", "files"] as const).map((f) => {
                    const isActiveFilter = searchFilter === f;
                    const enabled = true;
                    return (
                      <button
                        key={f}
                        onClick={() => enabled && setSearchFilter(f)}
                        disabled={!enabled}
                        className={cn(
                          "px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap capitalize transition-all",
                          isActiveFilter
                            ? "bg-primary/15 text-primary"
                            : enabled
                              ? "bg-muted/60 text-muted-foreground hover:bg-muted"
                              : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                        )}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Now strip — online contacts */}
            {!embedded && !search && active === "personal" && onlineIds.size > 0 && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Active Now</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-0.5">
                  {(mergedPersonalList as any[]).filter((c) => !c.isGroup && onlineIds.has(c.id)).slice(0, 12).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setOpenPersonalChat({ id: c.id, name: c.name, avatar: c.avatar, isVerified: c.isVerified === true })}
                      className="flex flex-col items-center gap-1 w-[54px] shrink-0 active:scale-95 transition-transform"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden ring-2 ring-emerald-500/40">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-sm font-bold text-primary">
                                {(c.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                      </div>
                      <span className="text-[9px] font-medium text-foreground truncate w-full text-center leading-tight">
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={cn("flex px-5 gap-2 pb-3 overflow-x-auto scrollbar-hide", embedded && "px-3 gap-1.5 pb-2")}>
              <button
                onClick={() => navigate('/chat/folders')}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-muted/40 text-muted-foreground hover:bg-muted whitespace-nowrap active:scale-95 transition-all",
                  embedded && "px-2.5 py-1.5 text-[11px]"
                )}
                aria-label="Edit folders"
              >
                <Settings className="w-3 h-3" />
                Edit
              </button>
              {folderTabs.map((f) => {
                const isActiveFolder = folder === f.id;
                const unread = folderUnreadMap[f.id] || 0;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFolder(f.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap active:scale-95",
                      isActiveFolder
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted",
                      embedded && "px-3 py-1.5 text-[11px]"
                    )}
                  >
                    <span>{f.label}</span>
                    {unread > 0 && (
                      <span className={cn(
                        "min-w-[16px] h-[16px] px-1 text-[9px] font-bold rounded-full flex items-center justify-center",
                        isActiveFolder ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                      )}>
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {sharePayload && (
            <div className={cn("px-5 pt-3", embedded && "px-4 pt-3")}>
              <div className="p-3.5 rounded-2xl bg-primary/8 border border-primary/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <MessageCircleIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-primary">Share to chat</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sharePayload.shareText || sharePayload.shareUrl}</p>
                </div>
                <button
                  onClick={() => setSharePayload(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                  aria-label="Cancel share"
                  title="Cancel share"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          

          <div className={cn("flex-1 min-h-0", embedded ? "overflow-y-auto" : "") }>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className={cn("px-4 pt-2", embedded && "px-2 pt-2 pb-2")}
              >
                {searchingProfiles && active === "personal" ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Searching users...</p>
                  </div>
                ) : displayList.length === 0 ? (
                  <div className={cn(
                    "flex flex-col items-center text-center",
                    embedded ? "py-8" : "py-10"
                  )}>
                    <div className="text-5xl mb-3">{currentCategory.emptyIcon}</div>
                    <p className="text-base font-bold text-foreground mb-1">
                      {active === "personal" && search.trim().length >= 2 ? "No users found" : currentCategory.emptyTitle}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed mb-5">
                      {active === "personal" && search.trim().length >= 2
                        ? `No results for "${search}"`
                        : currentCategory.emptyDesc}
                    </p>
                    {active === "support" && (
                      <button
                        onClick={() => navigate("/support")}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold active:scale-95 transition-transform"
                      >
                        Contact Support
                      </button>
                    )}
                    {active === "personal" && search.trim().length < 2 && (
                      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[360px] mt-1">
                        <button
                          onClick={async () => {
                            const url = `${window.location.origin}/`;
                            const text = "Join me on ZIVO";
                            try {
                              if (navigator.share) await navigator.share({ title: "ZIVO", text, url });
                              else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
                            } catch {}
                          }}
                          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/40 shadow-sm active:scale-95 transition-transform"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Share2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-[11px] font-semibold text-foreground leading-tight">Invite friends</span>
                        </button>
                        <button
                          onClick={() => navigate("/chat/nearby")}
                          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/40 shadow-sm active:scale-95 transition-transform"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPinned className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-[11px] font-semibold text-foreground leading-tight">People nearby</span>
                        </button>
                        <button
                          onClick={() => setShowCreateGroup(true)}
                          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/40 shadow-sm active:scale-95 transition-transform"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-[11px] font-semibold text-foreground leading-tight">New group</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={cn("divide-y divide-border/20", embedded && "px-1")}>
                    {/* Contact Requests notification row */}
                    {!search && active === "personal" && pendingRequests.length > 0 && (
                      <button
                        onClick={() => navigate("/chat/contacts/requests")}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/60 active:scale-[0.99] transition-all"
                      >
                        <div className="w-[52px] h-[52px] rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm relative">
                          <UserPlus className="w-5 h-5 text-white" />
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                            {pendingRequests.length > 9 ? "9+" : pendingRequests.length}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[15px] font-semibold text-foreground">Contact Requests</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-[13px] text-muted-foreground truncate leading-snug">
                            {pendingRequests.length === 1
                              ? `${pendingRequests[0].profile?.full_name || "Someone"} wants to connect`
                              : `${pendingRequests.length} people want to connect`}
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Archived chats row */}
                    {!search && archivedList.length > 0 && active === "personal" && (
                      <button
                        onClick={() => setShowArchived((v) => !v)}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors"
                      >
                        <div className="w-[52px] h-[52px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Archive className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-foreground">Archived chats</p>
                          <p className="text-[11px] text-muted-foreground">{archivedList.length} conversation{archivedList.length === 1 ? "" : "s"}</p>
                        </div>
                        {archivedUnread > 0 && (
                          <span className="min-w-[22px] h-[22px] px-1.5 bg-muted-foreground/30 text-foreground text-[11px] font-bold rounded-full flex items-center justify-center">
                            {archivedUnread > 99 ? "99+" : archivedUnread}
                          </span>
                        )}
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showArchived && "rotate-90")} />
                      </button>
                    )}

                    {/* Channels strip — subscribed channels with quick access */}
                    {!search && active === "personal" && (folder === "all" || folder === "personal") && (
                      <MyChannelsStrip />
                    )}

                    {/* Saved Messages — Telegram-style self chat */}
                    {!search && active === "personal" && user && (
                      <button
                        onClick={() => setOpenPersonalChat({ id: user.id, name: "Saved Messages", avatar: null, isVerified: false })}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors"
                      >
                        <div className="w-[52px] h-[52px] rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Bookmark className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[15px] font-semibold text-foreground truncate">Saved Messages</span>
                            {savedMessagesPreview?.created_at && (
                              <span className="text-[11px] text-muted-foreground tabular-nums ml-2">{formatChatTime(savedMessagesPreview.created_at)}</span>
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground truncate leading-snug">
                            {savedMessagesPreview?.message
                              ? parseRichMessagePreview(savedMessagesPreview.message)
                              : "Notes, links and reminders for yourself"}
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Pinned section header */}
                    {!search && displayList.some((c: any) => isPinned(c.id)) && (
                      <div className="flex items-center gap-1.5 px-2 pt-1 pb-0.5">
                        <Pin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pinned</span>
                      </div>
                    )}

                    {displayList.map((chat: any, idx: number) => {
                      const pinned = isPinned(chat.id);
                      const muted = isMuted(chat.id);
                      const isPersonalChat = active === "personal";
                      const liveOnline = isPersonalChat && !chat.isGroup && onlineIds.has(chat.id);
                      const isTyping = isPersonalChat && !chat.isGroup && typingFrom.has(chat.id);

                      // Show separator before first non-pinned item
                      const prev = displayList[idx - 1];
                      const showChatsHeader = !search && pinned === false && prev && isPinned(prev.id);

                      return (
                        <div key={chat.id}>
                          {showChatsHeader && (
                            <div className="flex items-center gap-1.5 px-2 pt-2 pb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">All chats</span>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx, 8) * 0.02, type: "spring", stiffness: 300, damping: 28 }}
                          >
                            <SwipeableRow
                              disabled={!isPersonalChat || selectionMode}
                              leftActions={isPersonalChat ? [
                                {
                                  key: "pin",
                                  label: pinned ? "Unpin" : "Pin",
                                  icon: <Pin className="w-4 h-4" />,
                                  onPress: () => { togglePin(chat.id); toast.success(pinned ? "Unpinned" : "Pinned to top"); },
                                  className: "bg-amber-500 text-white",
                                },
                                {
                                  key: "mute",
                                  label: muted ? "Unmute" : "Mute",
                                  icon: <BellOff className="w-4 h-4" />,
                                  onPress: () => { toggleMute(chat.id); toast.success(muted ? "Unmuted" : "Muted"); },
                                  className: "bg-slate-500 text-white",
                                },
                              ] : []}
                              rightActions={isPersonalChat ? [
                                {
                                  key: "archive",
                                  label: isArchived(chat.id) ? "Unarchive" : "Archive",
                                  icon: isArchived(chat.id) ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />,
                                  onPress: () => { toggleArchive(chat.id); toast.success(isArchived(chat.id) ? "Unarchived" : "Archived"); },
                                  className: "bg-amber-600 text-white",
                                },
                                {
                                  key: "delete",
                                  label: "Delete",
                                  icon: <Trash2 className="w-4 h-4" />,
                                  onPress: () => setDeleteConfirm({ id: chat.id, name: chat.name, category: active }),
                                  className: "bg-destructive text-destructive-foreground",
                                },
                              ] : []}
                            >
                              <button
                                className={cn(
                                  "w-full flex items-center gap-3 text-left transition-all",
                                  embedded ? "px-3 py-2.5" : "px-4 py-3",
                                  "active:bg-muted/60 active:scale-[0.99]",
                                  chat.unread > 0 && !muted && "bg-primary/[0.02]"
                                )}
                                onClick={() => {
                                  if (selectionMode && active === "personal") {
                                    toggleSelectedChat(chat.id);
                                    return;
                                  }
                                  if (sharePayload && active === "personal" && !(chat as any).isGroup) {
                                    handleShareToContact(chat.id, chat.name, chat.avatar);
                                    return;
                                  }
                                  // Opening a chat clears any "marked unread" flag (Telegram parity)
                                  if (isMarkedUnread(chat.id)) setMarkedUnread(chat.id, false);
                                  if (active === "shop") {
                                    setOpenShopChat({ storeId: chat.storeId, name: chat.name, logo: chat.avatar });
                                  } else if (active === "personal") {
                                    if ((chat as any).isGroup) {
                                      setOpenGroupChat({ id: chat.id, name: chat.name, avatar: chat.avatar });
                                    } else {
                                      setOpenPersonalChat({ id: chat.id, name: chat.name, avatar: chat.avatar, isVerified: (chat as any).isVerified === true });
                                    }
                                  } else if (active === "support") {
                                    navigate(`/support`);
                                  }
                                }}
                              >
                                <div className="relative flex-shrink-0">
                                  {selectionMode && isPersonalChat && (
                                    <span className="absolute -left-7 top-1/2 -translate-y-1/2">
                                      {selectedChatIds.has(chat.id) ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Square className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </span>
                                  )}
                                  <div className={cn(
                                    "flex items-center justify-center overflow-hidden rounded-full",
                                    embedded ? "h-[44px] w-[44px]" : "w-[52px] h-[52px]",
                                    (chat as any).isGroup ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    {chat.avatar ? (
                                      <img src={chat.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (chat as any).isGroup ? (
                                      <Users className="w-5 h-5 text-primary" />
                                    ) : active === "personal" ? (
                                      <span className="text-base font-bold text-muted-foreground">
                                        {(chat.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                      </span>
                                    ) : active === "shop" ? (
                                      <StoreIcon className="w-5 h-5 text-muted-foreground" />
                                    ) : active === "support" ? (
                                      <Headphones className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <Car className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  {liveOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-background" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                      embedded ? "text-sm" : "text-[15px]",
                                      "truncate leading-tight inline-flex items-center gap-1 min-w-0",
                                      chat.unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"
                                    )}>
                                      <span className="truncate">{chat.name}</span>
                                      {isBlueVerified((chat as any).isVerified) && (
                                        <VerifiedBadge size={13} interactive={false} />
                                      )}
                                      {muted && <BellOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                                    </span>
                                    <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                                      {pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                                      <span className={cn(
                                        "text-[11px] tabular-nums",
                                        chat.unread > 0 && !muted ? "text-primary font-semibold" : "text-muted-foreground"
                                      )}>
                                        {formatChatTime(chat.lastTime)}
                                      </span>
                                      {isPersonalChat && !chat.isGroup && !selectionMode && (
                                        <>
                                          <span
                                            role="button"
                                            aria-label="Voice call"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setPendingCall("voice");
                                              setOpenPersonalChat({ id: chat.id, name: chat.name, avatar: chat.avatar, isVerified: (chat as any).isVerified === true });
                                            }}
                                            className="ml-0.5 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer"
                                          >
                                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                          </span>
                                          <span
                                            role="button"
                                            aria-label="Chat options"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setActionsTarget({
                                                id: chat.id,
                                                name: chat.name,
                                                isPinned: pinned,
                                                isMuted: muted,
                                                isArchived: isArchived(chat.id),
                                                hasUnread: (chat.unread || 0) > 0,
                                                isMarkedUnread: isMarkedUnread(chat.id),
                                              });
                                            }}
                                            className="ml-0.5 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer"
                                          >
                                            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1 min-w-0 pr-2">
                                      {active === "personal" && (chat as any).isSentByMe && !(chat as any).isGroup && (
                                        <span className="mr-1 flex-shrink-0">
                                          {(chat as any).isRead ? (
                                            <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                          ) : (chat as any).deliveredAt ? (
                                            <CheckCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
                                          ) : (
                                            <Check className="w-3.5 h-3.5 text-muted-foreground/60" />
                                          )}
                                        </span>
                                      )}
                                      {(() => {
                                        // Draft indicator — show saved draft instead of last message
                                        const draft = draftsMap[chat.id];
                                        if (draft && !isTyping) {
                                          return (
                                            <span className={cn(
                                              embedded ? "text-[12px]" : "text-[13px]",
                                              "truncate leading-snug"
                                            )}>
                                              <span className="text-red-500 font-medium">Draft: </span>
                                              <span className="text-muted-foreground">{draft}</span>
                                            </span>
                                          );
                                        }
                                        if (isTyping) {
                                          return (
                                            <span className={cn(
                                              embedded ? "text-[12px]" : "text-[13px]",
                                              "inline-flex items-center gap-[3px] leading-snug text-primary font-medium"
                                            )}>
                                              typing
                                              {[0,1,2].map(i => (
                                                <span key={i} className="inline-block w-[3px] h-[3px] rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s`, animationDuration: "0.8s" }} />
                                              ))}
                                            </span>
                                          );
                                        }
                                        const stickerPreview = parseStickerPreview(chat.lastMessage || "");
                                        if (stickerPreview) {
                                          return (
                                            <span className="flex items-center gap-1.5">
                                              {stickerPreview.src && (
                                                <img src={stickerPreview.src} alt={stickerPreview.alt} className="w-5 h-5 object-contain" />
                                              )}
                                              <span className={cn(
                                                embedded ? "text-[12px]" : "text-[13px]",
                                                "leading-snug text-muted-foreground"
                                              )}>Sticker</span>
                                            </span>
                                          );
                                        }
                                        const preview = parseRichMessagePreview(chat.lastMessage || "");
                                        const isGroupChat = !!(chat as any).isGroup;
                                        const senderPrefix = active === "personal" && isGroupChat && (chat as any).lastSenderName
                                          ? `${(chat as any).lastSenderName}: `
                                          : active === "personal" && (chat as any).isSentByMe && !isGroupChat
                                          ? null // shown via check icons already
                                          : null;
                                        const youPrefix = active === "personal" && (chat as any).isSentByMe && !isGroupChat;
                                        return (
                                          <>
                                            {getMessagePreviewIcon(preview)}
                                            <span className={cn(
                                              embedded ? "text-[12px]" : "text-[13px]",
                                              "truncate leading-snug",
                                              chat.unread > 0 && !muted ? "text-foreground font-medium" : "text-muted-foreground"
                                            )}>
                                              {youPrefix && <span className="text-muted-foreground">You: </span>}
                                              {senderPrefix && <span className="text-foreground/70 font-medium">{senderPrefix}</span>}
                                              {preview}
                                            </span>
                                          </>
                                        );
                                      })()}
                                    </div>
                                    {chat.unread > 0 ? (
                                      <span className={cn(
                                        "min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                        muted ? "bg-muted-foreground/30 text-foreground" : "bg-primary text-primary-foreground"
                                      )}>
                                        {chat.unread > 99 ? "99+" : chat.unread}
                                      </span>
                                    ) : isMarkedUnread(chat.id) ? (
                                      // Manually marked unread — small dot, no count (Telegram parity)
                                      <span
                                        className={cn(
                                          "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                          muted ? "bg-muted-foreground/40" : "bg-primary"
                                        )}
                                        aria-label="Marked as unread"
                                      />
                                    ) : null}
                                  </div>
                                </div>
                              </button>
                            </SwipeableRow>
                          </motion.div>
                        </div>
                      );
                    })}

                    {/* Expanded archived chats list */}
                    {showArchived && archivedList.length > 0 && active === "personal" && (
                      <div className="space-y-2 px-1 pt-2 border-t border-border/30 mt-2">
                        <div className="flex items-center gap-1.5 px-2 pt-1">
                          <Archive className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Archived</span>
                        </div>
                        {archivedList.map((chat: any) => (
                          <button
                            key={`archived-${chat.id}`}
                            onClick={() => {
                              if ((chat as any).isGroup) {
                                setOpenGroupChat({ id: chat.id, name: chat.name, avatar: chat.avatar });
                              } else {
                                setOpenPersonalChat({ id: chat.id, name: chat.name, avatar: chat.avatar, isVerified: (chat as any).isVerified === true });
                              }
                            }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-card/60 border border-border/30 active:scale-[0.98] transition-all"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border/20"
                            )}>
                              {chat.avatar ? (
                                <img src={chat.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-muted-foreground">
                                  {(chat.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{parseRichMessagePreview(chat.lastMessage || "")}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleArchive(chat.id); toast.success("Unarchived"); }}
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90"
                              aria-label="Unarchive"
                              title="Unarchive"
                            >
                              <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* People you may know — Suggested Contacts */}
                    {!search && active === "personal" && !selectionMode && (
                      <div className="pt-2">
                        <SuggestedContactsRow />
                      </div>
                    )}

                    {selectionMode && active === "personal" && (
                      <div className="sticky bottom-[calc(var(--zivo-safe-bottom,0px)+5.3rem)] z-30 px-1 pt-2">
                        <div className="rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-lg p-2">
                          <div className="mb-2 px-1 text-[11px] text-muted-foreground">
                            {selectedSummary.count} selected{selectedSummary.unread > 0 ? ` · ${selectedSummary.unread} unread` : ""}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={() => void selectAllVisible()}
                              className="flex-1 h-8 rounded-lg bg-muted text-foreground text-[11px] font-semibold"
                            >
                              Select All Visible
                            </button>
                            <button
                              onClick={() => void selectUnreadVisible()}
                              className="flex-1 h-8 rounded-lg bg-muted text-foreground text-[11px] font-semibold"
                            >
                              Select Unread
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setBulkFolderAction((prev) => prev === "add" ? null : "add")}
                              disabled={selectedChatIds.size === 0 || customFolders.length === 0}
                              className="flex-1 h-10 rounded-xl bg-primary/10 text-primary text-xs font-semibold disabled:opacity-40"
                            >
                              Move To Folder
                            </button>
                            <button
                              onClick={() => setBulkFolderAction((prev) => prev === "remove" ? null : "remove")}
                              disabled={selectedChatIds.size === 0 || customFolders.length === 0}
                              className="flex-1 h-10 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Remove Folder
                            </button>
                            <button
                              onClick={() => void handleBulkMarkRead()}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-muted text-foreground text-xs font-semibold disabled:opacity-40"
                            >
                              Mark Read
                            </button>
                            <button
                              onClick={() => handleBulkSetPinned(true)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-violet-500/10 text-violet-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Pin
                            </button>
                            <button
                              onClick={() => handleBulkSetPinned(false)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-violet-500/10 text-violet-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Unpin
                            </button>
                            <button
                              onClick={() => handleBulkSetMuted(true)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Mute
                            </button>
                            <button
                              onClick={() => handleBulkSetMuted(false)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Unmute
                            </button>
                            <button
                              onClick={() => handleBulkSetArchive(true)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => handleBulkSetArchive(false)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-sky-500/10 text-sky-600 text-xs font-semibold disabled:opacity-40"
                            >
                              Unarchive
                            </button>
                            <button
                              onClick={() => setShowBulkDeleteConfirm(true)}
                              disabled={selectedChatIds.size === 0}
                              className="flex-1 h-10 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={clearSelectionMode}
                              className="w-full h-10 px-3 rounded-xl bg-muted text-muted-foreground text-xs font-semibold"
                            >
                              Done
                            </button>
                          </div>
                          {bulkFolderAction && customFolders.length > 0 && (
                            <div className="mt-2 grid grid-cols-1 gap-1 max-h-44 overflow-y-auto">
                              {customFolders.map((folderDef) => (
                                <button
                                  key={folderDef.id}
                                  onClick={() => {
                                    if (bulkFolderAction === "add") {
                                      void handleBulkAddToFolder(folderDef.id);
                                    } else {
                                      void handleBulkRemoveFromFolder(folderDef.id);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted/60 active:scale-[0.99] transition-all text-sm"
                                >
                                  {folderDef.icon || "📁"} {folderDef.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {active === "personal" && !sharePayload && !embedded && (
        <NewChatFab
          onNewChat={() => {
            const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search conversations..."]');
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNewGroup={() => setShowCreateGroup(true)}
          onNewContact={() => setShowAddContact(true)}
          onBroadcast={() => navigate("/chat/broadcasts")}
          onNearby={() => navigate("/chat/nearby")}
        />
      )}

      <AddContactSheet open={showAddContact} onOpenChange={setShowAddContact} />

      <ChatRowActionsSheet
        target={actionsTarget}
        customFolders={customFolders}
        folderMembership={actionsFolderMembership}
        onClose={() => setActionsTarget(null)}
        onTogglePin={() => actionsTarget && (togglePin(actionsTarget.id), toast.success(actionsTarget.isPinned ? "Unpinned" : "Pinned to top"))}
        onToggleMute={() => actionsTarget && (toggleMute(actionsTarget.id), toast.success(actionsTarget.isMuted ? "Unmuted" : "Muted"))}
        onMarkRead={async () => {
          if (!actionsTarget || !user) return;
          // Clear the manual flag too so toggling read drops the unread dot
          if (isMarkedUnread(actionsTarget.id)) setMarkedUnread(actionsTarget.id, false);
          await supabase.from("direct_messages").update({ is_read: true })
            .eq("receiver_id", user.id).eq("sender_id", actionsTarget.id).eq("is_read", false);
          queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] });
          toast.success("Marked as read");
        }}
        onMarkUnread={() => {
          if (!actionsTarget) return;
          toggleMarkUnread(actionsTarget.id);
          toast.success("Marked as unread");
        }}
        onToggleArchive={() => actionsTarget && (toggleArchive(actionsTarget.id), toast.success(actionsTarget.isArchived ? "Unarchived" : "Archived"))}
        onClearHistory={async () => {
          if (!actionsTarget || !user) return;
          await supabase.from("direct_messages").delete()
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${actionsTarget.id}),and(sender_id.eq.${actionsTarget.id},receiver_id.eq.${user.id})`);
          queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] });
          toast.success("History cleared");
        }}
        onDelete={() => actionsTarget && setDeleteConfirm({ id: actionsTarget.id, name: actionsTarget.name, category: "personal" })}
        onAddToFolder={(folderId) => { if (actionsTarget) void handleAddChatToFolder(folderId, actionsTarget.id); }}
        onRemoveFromFolder={(folderId) => { if (actionsTarget) void handleRemoveChatFromFolder(folderId, actionsTarget.id); }}
      />

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center px-6"
            onClick={() => setShowBulkDeleteConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Remove selected chats</h3>
                  <p className="text-xs text-muted-foreground">Personal chats are deleted, groups are left</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Remove <strong className="text-foreground">{selectedChatIds.size}</strong> selected conversation{selectedChatIds.size === 1 ? "" : "s"}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl bg-muted text-sm font-semibold text-foreground active:scale-[0.97] transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowBulkDeleteConfirm(false); void handleBulkDeleteSelected(); }}
                  className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
            onClick={() => { setDeleteConfirm(null); setSwipedId(null); }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Delete Chat</h3>
                  <p className="text-xs text-muted-foreground">This action can't be undone</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Delete your conversation with <strong className="text-foreground">{deleteConfirm.name}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteConfirm(null); setSwipedId(null); }}
                  className="flex-1 h-11 rounded-xl bg-muted text-sm font-semibold text-foreground active:scale-[0.97] transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteChat(deleteConfirm.id, deleteConfirm.category)}
                  className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Shop Chat */}
      {openShopChat && (
        <Suspense fallback={null}>
          <StoreLiveChat
            storeId={openShopChat.storeId}
            storeName={openShopChat.name}
            storeLogo={openShopChat.logo}
            open={true}
            onClose={() => setOpenShopChat(null)}
          />
        </Suspense>
      )}
      {/* Inline Personal Chat */}
      <AnimatePresence>
        {openPersonalChat && (
          <Suspense fallback={
            <div className="fixed inset-0 z-[1300] bg-background flex flex-col" style={{ transform: "translateX(0)" }}>
              <div
                className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/10 px-2 py-2.5 flex items-center gap-3"
                style={{ paddingTop: "calc(var(--zivo-safe-top-sticky, env(safe-area-inset-top, 0px)) + 0.625rem)" }}
              >
                <button onClick={() => setOpenPersonalChat(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted/50 active:scale-90 transition-transform">
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-muted rounded-full animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-muted/60 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex-1 px-4 py-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0 mt-1" />
                    <div className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            </div>
          }>
            <PersonalChat
              recipientId={openPersonalChat.id}
              recipientName={openPersonalChat.name}
              recipientAvatar={openPersonalChat.avatar}
              recipientIsVerified={openPersonalChat.isVerified === true}
              prefillInput={openPersonalChat.prefillInput}
              onClose={() => { setOpenPersonalChat(null); setPendingCall(null); queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] }); }}
              autoStartCall={pendingCall}
              onCallStarted={() => setPendingCall(null)}
              inline={embedded}
            />
          </Suspense>
        )}
      </AnimatePresence>
      {/* Inline Group Chat */}
      <AnimatePresence>
        {openGroupChat && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 bg-background flex flex-col">
              <div
                className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 px-2 py-2.5 flex items-center gap-3"
                style={{ paddingTop: "calc(var(--zivo-safe-top-sticky, env(safe-area-inset-top, 0px)) + 0.625rem)" }}
              >
                <button onClick={() => setOpenGroupChat(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted/50 active:scale-90 transition-transform">
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-muted rounded-full animate-pulse mb-1" />
                  <div className="h-3 w-20 bg-muted/60 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex-1 px-4 py-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0 mt-1" />
                    <div className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            </div>
          }>
            <GroupChat
              groupId={openGroupChat.id}
              groupName={openGroupChat.name}
              groupAvatar={openGroupChat.avatar}
              onClose={() => setOpenGroupChat(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
      {/* Create Group Modal */}
      <Suspense fallback={null}>
        <CreateGroupModal
          open={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreated={(group) => {
            setOpenGroupChat({ id: group.id, name: group.name, avatar: group.avatar });
            queryClient.invalidateQueries({ queryKey: ["chat-hub-groups"] });
          }}
        />
      </Suspense>

      <GlobalChatSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
    </div>
  );

  if (embedded) {
    return <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">{shell}</div>;
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh} enabled={!hasOverlayChatOpen} className="min-h-screen bg-background pb-24 overscroll-none">
      <SEOHead
        title="Messages – ZIVO | Chat with Friends & Businesses"
        description="Send messages, share photos, video call, and chat with friends and businesses on ZIVO."
        canonical="/chat"
        noIndex
      />
      {shell}
    </PullToRefresh>
  );
}
