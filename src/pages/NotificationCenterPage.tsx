import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, MessageCircle, UserPlus, ShoppingBag, Bell, Check, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "order" | "mention" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  action_url?: string | null;
}

const ICON_MAP = {
  like: Heart, comment: MessageCircle, follow: UserPlus,
  order: ShoppingBag, mention: MessageCircle, system: Bell,
};

const COLOR_MAP = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-primary bg-primary/10",
  order: "text-green-500 bg-green-500/10",
  mention: "text-purple-500 bg-purple-500/10",
  system: "text-muted-foreground bg-muted",
};

function categoryToType(category: string): Notification["type"] {
  if (category.includes("like") || category.includes("heart")) return "like";
  if (category.includes("comment") || category.includes("reply")) return "comment";
  if (category.includes("follow") || category.includes("friend")) return "follow";
  if (category.includes("order") || category.includes("purchase") || category.includes("payment")) return "order";
  if (category.includes("mention") || category.includes("tag")) return "mention";
  return "system";
}

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, category, is_read, created_at, action_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);

    if (data) {
      setNotifications(data.map(n => ({
        id: n.id,
        type: categoryToType(n.category ?? ""),
        title: n.title,
        message: n.body,
        time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
        isRead: n.is_read ?? false,
        action_url: n.action_url,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const TAB_TYPES: Record<string, string[]> = {
    all: [],
    social: ["like", "comment", "follow", "mention"],
    orders: ["order"],
    system: ["system"],
  };

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter(n => TAB_TYPES[activeTab]?.includes(n.type));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={markAllRead}>
              <Check className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="divide-y divide-border">
        {loading && (
          <div className="space-y-0">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}

        {!loading && filtered.map((notif, i) => {
          const Icon = ICON_MAP[notif.type];
          const colorClass = COLOR_MAP[notif.type];
          return (
            <motion.div key={notif.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => {
                markRead(notif.id);
                if (notif.action_url) navigate(notif.action_url);
              }}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 ${!notif.isRead ? "bg-primary/5" : ""}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                <button onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
