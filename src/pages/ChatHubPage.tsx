/**
 * ChatHubPage — Unified messaging hub with category tabs:
 * Personal, Shop, Support, Ride
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Store, Headphones, Car, Search, ChevronRight, ArrowLeft, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import ChatStories from "@/components/chat/ChatStories";
import { toast } from "sonner";

type ChatCategory = "personal" | "shop" | "support" | "ride";

interface CategoryTab {
  id: ChatCategory;
  label: string;
  icon: typeof MessageCircle;
  emptyTitle: string;
  emptyDesc: string;
}

const categories: CategoryTab[] = [
  { id: "personal", label: "Personal", icon: MessageCircle, emptyTitle: "No personal chats", emptyDesc: "Start a conversation with friends or contacts" },
  { id: "shop", label: "Shop", icon: Store, emptyTitle: "No shop chats", emptyDesc: "Chat with stores you've ordered from" },
  { id: "support", label: "Support", icon: Headphones, emptyTitle: "No support chats", emptyDesc: "Get help from ZIVO support team" },
  { id: "ride", label: "Ride", icon: Car, emptyTitle: "No ride chats", emptyDesc: "Messages from your ride drivers" },
];

function formatChatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export default function ChatHubPage() {
  const [active, setActive] = useState<ChatCategory>("personal");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; category: ChatCategory } | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

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

      // Group by chat_id, take latest message per chat
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

  const currentCategory = categories.find((c) => c.id === active)!;

  const chatList =
    active === "shop" ? shopChats :
    active === "ride" ? rideChats :
    active === "support" ? supportChats :
    []; // personal — future feature

  const filtered = search
    ? chatList.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
    : chatList;

  // Search profiles when on personal tab with a search term
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

  // Whether the active tab allows user deletion
  const canDelete = active === "personal";

  const handleDeleteChat = async (chatId: string, category: ChatCategory) => {
    try {
      if (category === "shop") {
        // Delete messages first, then the chat
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-semibold text-foreground mb-1">Sign in to chat</p>
        <p className="text-sm text-muted-foreground mb-4">Log in to see your conversations</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex px-5 gap-1">
          {categories.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="chat-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stories Row */}
      <ChatStories />

      {/* Chat List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="px-5 pt-3"
        >
          {searchingProfiles && active === "personal" ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Searching users...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <currentCategory.icon className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">
                {active === "personal" && search.trim().length >= 2 ? "No users found" : currentCategory.emptyTitle}
              </p>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                {active === "personal" && search.trim().length >= 2
                  ? `No results for "${search}"`
                  : currentCategory.emptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayList.map((chat: any) => (
                <div
                  key={chat.id}
                  className="relative overflow-hidden rounded-xl"
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
                      "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 active:scale-[0.98] transition-all text-left relative z-10 bg-background",
                      canDelete && swipedId === chat.id && "-translate-x-16"
                    )}
                    onClick={() => {
                      if (swipedId === chat.id) {
                        setSwipedId(null);
                        return;
                      }
                      if (active === "shop") {
                        navigate(`/store/${chat.storeId || chat.id}`);
                      } else if (active === "personal") {
                        navigate(`/chat/${chat.id}`);
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
                      if (info.offset.x < -40) {
                        setSwipedId(chat.id);
                      } else {
                        setSwipedId(null);
                      }
                    }}
                    style={{ x: 0 }}
                  >
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {chat.avatar ? (
                        <img src={chat.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <currentCategory.icon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground truncate">{chat.name}</span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                          {formatChatTime(chat.lastTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate pr-2">{chat.lastMessage}</span>
                        {chat.unread > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Delete Chat</h3>
                  <p className="text-xs text-muted-foreground">This can't be undone</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Are you sure you want to delete your conversation with <strong className="text-foreground">{deleteConfirm.name}</strong>?
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
                  className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
