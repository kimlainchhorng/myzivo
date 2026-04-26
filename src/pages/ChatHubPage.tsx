/**
 * ChatHubPage — Unified messaging hub with category tabs:
 * Personal, Shop, Support, Ride + Group chats
 * 2026-style design with premium UI
 */
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
import Users from "lucide-react/dist/esm/icons/users";
import Plus from "lucide-react/dist/esm/icons/plus";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Settings from "lucide-react/dist/esm/icons/settings";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Check from "lucide-react/dist/esm/icons/check";
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
import SwipeableRow from "@/components/chat/SwipeableRow";
import ChatRowActionsSheet, { type ChatRowActionsTarget } from "@/components/chat/ChatRowActionsSheet";
import NewChatFab from "@/components/chat/NewChatFab";
import AddContactSheet from "@/components/chat/AddContactSheet";
import { useChatPrefs } from "@/hooks/useChatPrefs";
import { useBulkPresence } from "@/hooks/useBulkPresence";
import { useTypingBus } from "@/hooks/useTypingBus";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { withRedirectParam } from "@/lib/authRedirect";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import PullToRefresh from "@/components/shared/PullToRefresh";
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
type ChatFolder = "all" | "unread" | "personal" | "groups" | "shop" | "support" | "ride";

interface CategoryTab {
  id: ChatCategory;
  label: string;
  icon: typeof MessageCircleIcon;
  emptyTitle: string;
  emptyDesc: string;
  emptyIcon: string;
}

interface FolderTab {
  id: ChatFolder;
  label: string;
  category: ChatCategory; // which underlying data source to fetch
}

const categories: CategoryTab[] = [
  { id: "personal", label: "Personal", icon: MessageCircleIcon, emptyTitle: "No conversations yet", emptyDesc: "Start chatting with friends and family", emptyIcon: "💬" },
  { id: "shop", label: "Shop", icon: StoreIcon, emptyTitle: "No shop chats", emptyDesc: "Your conversations with stores will appear here", emptyIcon: "🛍️" },
  { id: "support", label: "Support", icon: Headphones, emptyTitle: "Need help?", emptyDesc: "Contact our support team anytime", emptyIcon: "🎧" },
  { id: "ride", label: "Ride", icon: Car, emptyTitle: "No ride chats", emptyDesc: "Messages from your drivers will show here", emptyIcon: "🚗" },
];

const folders: FolderTab[] = [
  { id: "all", label: "All", category: "personal" },
  { id: "unread", label: "Unread", category: "personal" },
  { id: "personal", label: "Personal", category: "personal" },
  { id: "groups", label: "Groups", category: "personal" },
  { id: "shop", label: "Shop", category: "shop" },
  { id: "support", label: "Support", category: "support" },
  { id: "ride", label: "Ride", category: "ride" },
];

const FOLDER_STORAGE_KEY = "zivo:chat-folder";

function formatChatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

const STICKER_LOOKUP = getIllustratedPacks()
  .flatMap((p) => p.stickers)
  .reduce<Record<string, { src: string; alt: string }>>((acc, s) => {
    acc[s.id.toLowerCase()] = { src: s.src, alt: s.alt };
    return acc;
  }, {});

function parseStickerPreview(message: string): { src: string; alt: string } | null {
  const m = message.trim().match(/^\[sticker:([^\]:]+)(?::(.+))?\]$/i);
  if (!m) return null;
  const id = m[1].trim().toLowerCase();
  const entry = STICKER_LOOKUP[id];
  if (entry) return entry;
  const explicitSrc = m[2]?.trim();
  if (explicitSrc) return { src: explicitSrc, alt: id };
  return { src: "", alt: id };
}

function parseRichMessagePreview(message: string): string {
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
        default: return label || `📎 ${type || "Attachment"}`;
      }
    }
  } catch {}

  return message;
}

function getMessagePreviewIcon(message: string) {
  if (message === "📷 Image" || message.includes("[image]")) return <ImageIcon className="w-3.5 h-3.5 text-muted-foreground inline mr-1" />;
  if (message.includes("[voice]") || message.includes("🎤")) return <Mic className="w-3.5 h-3.5 text-muted-foreground inline mr-1" />;
  if (message.includes("[location]") || message.includes("📍")) return <MapPin className="w-3.5 h-3.5 text-muted-foreground inline mr-1" />;
  if (message.includes("[video]")) return <Video className="w-3.5 h-3.5 text-muted-foreground inline mr-1" />;
  return null;
}

export default function ChatHubPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [folder, setFolderState] = useState<ChatFolder>(() => {
    try {
      const saved = localStorage.getItem(FOLDER_STORAGE_KEY) as ChatFolder | null;
      if (saved && folders.some((f) => f.id === saved)) return saved;
    } catch {}
    return "all";
  });
  const setFolder = (f: ChatFolder) => {
    setFolderState(f);
    try { localStorage.setItem(FOLDER_STORAGE_KEY, f); } catch {}
  };
  const active: ChatCategory = folders.find((f) => f.id === folder)!.category;
  const setActive = (c: ChatCategory) => setFolder(c as ChatFolder);
  const [search, setSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState<"chats" | "media" | "links" | "files">("chats");
  const [showArchived, setShowArchived] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; category: ChatCategory } | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [openShopChat, setOpenShopChat] = useState<{ storeId: string; name: string; logo?: string | null } | null>(null);
  const [openPersonalChat, setOpenPersonalChat] = useState<{ id: string; name: string; avatar?: string | null; isVerified?: boolean } | null>(null);
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
  useEffect(() => {
    const state = location.state as {
      openChat?: { recipientId: string; recipientName: string; recipientAvatar?: string | null };
      startCall?: "voice" | "video";
      shareUrl?: string;
      shareText?: string;
    } | null;
    if (state?.openChat) {
      setOpenPersonalChat({ id: state.openChat.recipientId, name: state.openChat.recipientName, avatar: state.openChat.recipientAvatar });
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
  }, [location.state]);

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
            lastMessage: msg.message,
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
          lastMessage: entry.lastMsg.message || "📷 Image",
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

          return {
            id: g.id,
            name: g.name,
            avatar: g.avatar_url,
            lastMessage: lastMsg?.message || "Group created",
            lastTime: lastMsg?.created_at || g.created_at,
            unread: 0,
            isGroup: true,
          };
        })
      );
      return enriched;
    },
  });

  const currentCategory = categories.find((c) => c.id === active)!;
  const { isPinned, isMuted, isArchived, togglePin, toggleMute, toggleArchive } = useChatPrefs(user?.id);

  // Live presence dots for visible personal partners
  const personalPartnerIds = useMemo(
    () => (personalChats as any[]).filter((c) => !c.isGroup).map((c) => c.id),
    [personalChats]
  );
  const onlineIds = useBulkPresence(user?.id, personalPartnerIds);

  // Live "typing…" preview from other users
  const typingFrom = useTypingBus(user?.id);

  // Row actions sheet state
  const [actionsTarget, setActionsTarget] = useState<ChatRowActionsTarget | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

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
    if (folder === "unread") return (c.unread || 0) > 0;
    if (folder === "personal") return !(c as any).isGroup;
    if (folder === "groups") return !!(c as any).isGroup;
    return true;
  });

  // Split archived vs visible
  const archivedList = folderFiltered.filter((c: any) => isArchived(c.id));
  const visibleList = folderFiltered.filter((c: any) => !isArchived(c.id));

  // Per-folder unread badges (for the pill bar)
  const folderUnreadMap: Record<ChatFolder, number> = {
    all: personalUnread,
    unread: personalUnread,
    personal: personalChats.filter((c: any) => !c.isGroup).reduce((s: number, c: any) => s + (c.unread || 0), 0),
    groups: groupChats.reduce((s: number, c: any) => s + (c.unread || 0), 0),
    shop: shopUnread,
    support: supportUnread,
    ride: rideUnread,
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

  const filtered = search
    ? sortedVisible.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
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

  const displayList = active === "personal" && search.trim().length >= 2
    ? profileResults
    : filtered;

  const hasOverlayChatOpen = Boolean(openShopChat || openPersonalChat || openGroupChat);
  const showListShell = !embedded || !hasOverlayChatOpen;

  const canDelete = active === "personal";

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
    <div className={cn("flex flex-col", embedded ? "h-full min-h-0" : "min-h-screen")}>
      {showListShell && (
        <>
          <div
            className={cn(
              "shrink-0",
              embedded
                ? "border-b border-border/15 bg-background/95 backdrop-blur-2xl"
                : "sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20"
            )}
            style={!embedded ? { paddingTop: "var(--zivo-safe-top-sticky)" } : undefined}
          >
            {!embedded ? (
              <div className="px-5 pt-2 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Chat</h1>
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
                    <button
                      onClick={() => navigate('/chat/settings/privacy')}
                      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                      aria-label="Privacy & Security"
                    >
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
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
                  <button
                    onClick={() => navigate('/notifications')}
                    className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ) : null}

            <div className={cn("px-5 pb-3", embedded && "px-3 pb-2")}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-4 bg-muted/60 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground transition-all",
                    embedded ? "py-2 text-xs" : "py-2.5"
                  )}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              {search.trim().length > 0 && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide">
                  {(["chats", "media", "links", "files"] as const).map((f) => {
                    const isActiveFilter = searchFilter === f;
                    const enabled = f === "chats";
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
                        {f}{!enabled && " · soon"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={cn("flex px-5 gap-2 pb-3 overflow-x-auto scrollbar-hide", embedded && "px-3 gap-1.5 pb-2")}>
              {folders.map((f) => {
                const isActiveFolder = folder === f.id;
                const unread = folderUnreadMap[f.id];
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
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {!embedded && <Suspense fallback={null}><ChatStories /></Suspense>}

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
                        ? `No results for \"${search}\"`
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
                          onClick={() => navigate("/nearby")}
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
                  <div className={cn("space-y-2 px-1", embedded && "space-y-1.5 px-1") }>
                    {/* Archived chats row */}
                    {!search && archivedList.length > 0 && active === "personal" && (
                      <button
                        onClick={() => setShowArchived((v) => !v)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-sm active:scale-[0.98] transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
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

                    {/* Saved Messages — Telegram-style self chat */}
                    {!search && active === "personal" && user && (
                      <button
                        onClick={() => setOpenPersonalChat({ id: user.id, name: "Saved Messages", avatar: null, isVerified: false })}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60 active:scale-[0.98] transition-all"
                      >
                        <div className="w-[50px] h-[50px] rounded-2xl bg-primary/10 flex items-center justify-center ring-2 ring-border/30">
                          <Bookmark className="w-5 h-5 text-primary" />
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
                              disabled={!isPersonalChat}
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
                                  embedded
                                    ? "p-2.5 rounded-2xl bg-card border border-border/30 hover:border-border/50 hover:bg-card/90 gap-2.5"
                                    : "p-3 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60",
                                  "active:scale-[0.98] active:shadow-none",
                                  chat.unread > 0 && !muted && "border-primary/20 bg-primary/[0.02] shadow-primary/5"
                                )}
                                onClick={() => {
                                  if (sharePayload && active === "personal" && !(chat as any).isGroup) {
                                    handleShareToContact(chat.id, chat.name, chat.avatar);
                                    return;
                                  }
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
                                  <div className={cn(
                                    "flex items-center justify-center overflow-hidden ring-2 ring-border/30",
                                    embedded ? "h-[44px] w-[44px] rounded-xl" : "w-[50px] h-[50px] rounded-2xl",
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
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-card" />
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
                                        const preview = parseRichMessagePreview(chat.lastMessage);
                                        const youPrefix = active === "personal" && (chat as any).isSentByMe && !(chat as any).isGroup;
                                        return (
                                          <>
                                            {getMessagePreviewIcon(preview)}
                                            <span className={cn(
                                              embedded ? "text-[12px]" : "text-[13px]",
                                              "truncate leading-snug",
                                              chat.unread > 0 && !muted ? "text-foreground font-medium" : "text-muted-foreground"
                                            )}>
                                              {youPrefix && <span className="text-muted-foreground">You: </span>}
                                              {preview}
                                            </span>
                                          </>
                                        );
                                      })()}
                                    </div>
                                    {chat.unread > 0 && (
                                      <span className={cn(
                                        "min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                        muted ? "bg-muted-foreground/30 text-foreground" : "bg-primary text-primary-foreground"
                                      )}>
                                        {chat.unread > 99 ? "99+" : chat.unread}
                                      </span>
                                    )}
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
                            >
                              <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </button>
                        ))}
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
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          onClick={() => {
            // Focus search to find users
            const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search conversations..."]');
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="fixed right-5 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
          style={{ bottom: "calc(var(--zivo-safe-bottom, 0px) + 7rem)" }}
          aria-label="Start new chat"
        >
          <Edit3 className="w-5 h-5" />
        </motion.button>
      )}

      <AnimatePresence>
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
          <Suspense fallback={null}>
            <PersonalChat
              recipientId={openPersonalChat.id}
              recipientName={openPersonalChat.name}
              recipientAvatar={openPersonalChat.avatar}
              recipientIsVerified={openPersonalChat.isVerified === true}
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
          <Suspense fallback={null}>
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
    </div>
  );

  if (embedded) {
    return <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">{shell}</div>;
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh} enabled={!hasOverlayChatOpen} className="min-h-screen bg-background pb-24 overscroll-none">
      {shell}
    </PullToRefresh>
  );
}
