/**
 * ChatHubPage — Unified messaging hub with category tabs:
 * Personal, Shop, Support, Ride + Group chats
 * 2026-style design with premium UI
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Store, Headphones, Car, Search, ChevronRight, ArrowLeft, Trash2, X, Bell, Users, Plus, Edit3, Check, CheckCheck, Image as ImageIcon, Mic, MapPin, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import GroupChat from "@/components/chat/GroupChat";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import { withRedirectParam } from "@/lib/authRedirect";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import ChatStories from "@/components/chat/ChatStories";
import { toast } from "sonner";
import StoreLiveChat from "@/components/grocery/StoreLiveChat";
import PersonalChat from "@/components/chat/PersonalChat";
import PullToRefresh from "@/components/shared/PullToRefresh";
import { useCallback } from "react";

type ChatCategory = "personal" | "shop" | "support" | "ride";

interface CategoryTab {
  id: ChatCategory;
  label: string;
  icon: typeof MessageCircle;
  emptyTitle: string;
  emptyDesc: string;
  emptyIcon: string;
}

const categories: CategoryTab[] = [
  { id: "personal", label: "Personal", icon: MessageCircle, emptyTitle: "No conversations yet", emptyDesc: "Start chatting with friends and family", emptyIcon: "💬" },
  { id: "shop", label: "Shop", icon: Store, emptyTitle: "No shop chats", emptyDesc: "Your conversations with stores will appear here", emptyIcon: "🛍️" },
  { id: "support", label: "Support", icon: Headphones, emptyTitle: "Need help?", emptyDesc: "Contact our support team anytime", emptyIcon: "🎧" },
  { id: "ride", label: "Ride", icon: Car, emptyTitle: "No ride chats", emptyDesc: "Messages from your drivers will show here", emptyIcon: "🚗" },
];

function formatChatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function parseRichMessagePreview(message: string): string {
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
  const [active, setActive] = useState<ChatCategory>("personal");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; category: ChatCategory } | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [openShopChat, setOpenShopChat] = useState<{ storeId: string; name: string; logo?: string | null } | null>(null);
  const [openPersonalChat, setOpenPersonalChat] = useState<{ id: string; name: string; avatar?: string | null } | null>(null);
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
      const shareMessage = sharePayload.shareText
        ? `${sharePayload.shareText}\n${sharePayload.shareUrl}`
        : sharePayload.shareUrl;
      await supabase.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: contactId,
        message: shareMessage,
      });
      toast.success(`Shared to ${contactName}`);
      setSharePayload(null);
      queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] });
      setOpenPersonalChat({ id: contactId, name: contactName, avatar: contactAvatar });
    } catch {
      toast.error("Failed to share");
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
        .select("user_id, full_name, avatar_url, last_seen")
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

  const chatList =
    active === "shop" ? shopChats :
    active === "ride" ? rideChats :
    active === "support" ? supportChats :
    mergedPersonalList;

  const filtered = search
    ? chatList.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
    : chatList;

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
          .select("user_id, full_name, avatar_url, email")
          .or(`full_name.ilike.${term},email.ilike.${term}`)
          .neq("user_id", user!.id)
          .limit(15);
        if (alive && data) {
          setProfileResults(
            data.map((p: any) => ({
              id: p.user_id,
              name: p.full_name || p.email || "User",
              avatar: p.avatar_url,
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
          <MessageCircle className="w-9 h-9 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground mb-2">Sign in to chat</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">Connect with friends, shops, and support — all in one place</p>
        <button onClick={() => navigate(withRedirectParam("/login", "/chat"))} className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh} enabled={!hasOverlayChatOpen} className={cn(
      "overscroll-none",
      embedded ? "h-full overflow-y-auto relative" : "min-h-screen bg-background pb-24"
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 safe-area-top z-40 bg-background/95 backdrop-blur-xl border-b border-border/20",
        embedded && "bg-transparent backdrop-blur-none border-none"
      )}>
        {!embedded && (
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
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
        )}

        {/* Search */}
        <div className={cn("px-5 pb-3", embedded && "px-3 pt-2 pb-2")}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 bg-muted/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground transition-all",
                embedded ? "py-2 text-xs" : "py-2.5"
              )}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs — pill style with unread badges */}
        <div className={cn("flex px-5 gap-2 pb-3 overflow-x-auto scrollbar-hide", embedded && "px-3 gap-1.5 pb-2")}>
          {categories.map((cat) => {
            const isActive = active === cat.id;
            const unread = unreadMap[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap active:scale-95",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  embedded && "px-3 py-1.5 text-[11px]"
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {unread > 0 && (
                  <span className={cn(
                    "min-w-[16px] h-[16px] px-1 text-[9px] font-bold rounded-full flex items-center justify-center",
                    isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  )}>
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Share Mode Banner */}
      {sharePayload && (
        <div className="mx-5 mt-3 p-3.5 rounded-2xl bg-primary/8 border border-primary/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
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
      )}

      {!embedded && <ChatStories />}

      {/* Chat List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className={cn("px-4 pt-2", embedded && "px-2 pt-1")}
        >
          {searchingProfiles && active === "personal" ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Searching users...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">{currentCategory.emptyIcon}</div>
              <p className="text-base font-bold text-foreground mb-1.5">
                {active === "personal" && search.trim().length >= 2 ? "No users found" : currentCategory.emptyTitle}
              </p>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                {active === "personal" && search.trim().length >= 2
                  ? `No results for "${search}"`
                  : currentCategory.emptyDesc}
              </p>
              {active === "support" && (
                <button
                  onClick={() => navigate("/support")}
                  className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold active:scale-95 transition-transform"
                >
                  Contact Support
                </button>
              )}
            </div>
          ) : (
            <div className={cn("space-y-2 px-1", embedded && "space-y-1.5 px-0.5")}>
              {displayList.map((chat: any, idx: number) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.025, type: "spring", stiffness: 300, damping: 28 }}
                  className="relative overflow-hidden"
                >
                  {/* Delete button behind */}
                  {canDelete && swipedId === chat.id && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-0">
                      <button
                        onClick={() => setDeleteConfirm({ id: chat.id, name: chat.name, category: active })}
                        className="w-14 h-14 rounded-xl bg-destructive flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Trash2 className="w-5 h-5 text-destructive-foreground" />
                      </button>
                    </div>
                  )}
                  <motion.button
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left relative z-10",
                      "bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border/60",
                      "active:scale-[0.98] active:shadow-none",
                      canDelete && swipedId === chat.id && "-translate-x-16",
                      chat.unread > 0 && "border-primary/20 bg-primary/[0.02] shadow-primary/5",
                      embedded && "p-2.5 gap-2.5 rounded-xl"
                    )}
                    onClick={() => {
                      if (swipedId === chat.id) {
                        setSwipedId(null);
                        return;
                      }
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
                          setOpenPersonalChat({ id: chat.id, name: chat.name, avatar: chat.avatar });
                        }
                      } else if (active === "support") {
                        navigate(`/support`);
                      }
                    }}
                    onContextMenu={(e) => {
                      if (!canDelete) return;
                      e.preventDefault();
                      setSwipedId(swipedId === chat.id ? null : chat.id);
                    }}
                    drag={canDelete ? "x" : false}
                    dragConstraints={{ left: -70, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -40) setSwipedId(chat.id);
                      else setSwipedId(null);
                    }}
                    style={{ x: 0 }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "w-[50px] h-[50px] rounded-2xl flex items-center justify-center overflow-hidden ring-2 ring-border/30",
                        (chat as any).isGroup ? "bg-primary/10" : "bg-muted",
                        embedded && "w-[44px] h-[44px] rounded-xl"
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
                          <Store className="w-5 h-5 text-muted-foreground" />
                        ) : active === "support" ? (
                          <Headphones className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Car className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      {/* Online indicator */}
                      {active === "personal" && !(chat as any).isGroup && (chat as any).isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-card" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-[15px] truncate leading-tight",
                          chat.unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"
                        )}>
                          {chat.name}
                        </span>
                        <span className={cn(
                          "text-[11px] flex-shrink-0 ml-2 tabular-nums",
                          chat.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                        )}>
                          {formatChatTime(chat.lastTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0 pr-2">
                          {/* Delivery status for sent messages */}
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
                          {getMessagePreviewIcon(parseRichMessagePreview(chat.lastMessage))}
                          <span className={cn(
                            "text-[13px] truncate leading-snug",
                            chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                          )}>
                            {parseRichMessagePreview(chat.lastMessage)}
                          </span>
                        </div>
                        {chat.unread > 0 && (
                          <span className="min-w-[22px] h-[22px] px-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            {chat.unread > 99 ? "99+" : chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAB — New Chat */}
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
          className="fixed bottom-24 right-5 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Edit3 className="w-5 h-5" />
        </motion.button>
      )}

      {/* Delete Confirmation Modal */}
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
        <StoreLiveChat
          storeId={openShopChat.storeId}
          storeName={openShopChat.name}
          storeLogo={openShopChat.logo}
          open={true}
          onClose={() => setOpenShopChat(null)}
        />
      )}
      {/* Inline Personal Chat */}
      <AnimatePresence>
        {openPersonalChat && (
          <PersonalChat
            recipientId={openPersonalChat.id}
            recipientName={openPersonalChat.name}
            recipientAvatar={openPersonalChat.avatar}
            onClose={() => { setOpenPersonalChat(null); setPendingCall(null); queryClient.invalidateQueries({ queryKey: ["chat-hub-personal"] }); }}
            autoStartCall={pendingCall}
            onCallStarted={() => setPendingCall(null)}
            inline={embedded}
          />
        )}
      </AnimatePresence>
      {/* Inline Group Chat */}
      <AnimatePresence>
        {openGroupChat && (
          <GroupChat
            groupId={openGroupChat.id}
            groupName={openGroupChat.name}
            groupAvatar={openGroupChat.avatar}
            onClose={() => setOpenGroupChat(null)}
          />
        )}
      </AnimatePresence>
      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={(group) => {
          setOpenGroupChat({ id: group.id, name: group.name, avatar: group.avatar });
          queryClient.invalidateQueries({ queryKey: ["chat-hub-groups"] });
        }}
      />
    </PullToRefresh>
  );
}
