import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Heart, MessageCircle, UserPlus, ShoppingBag, Bell, Check, Trash2,
  Briefcase, Tv, Activity, Rocket, Plane, AlertTriangle, Tag, DollarSign, AtSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type NotifType =
  | "like" | "comment" | "follow" | "mention"
  | "order" | "payment" | "deal"
  | "job" | "live" | "wellness" | "creator" | "travel"
  | "alert" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  action_url?: string | null;
}

const ICON_MAP: Record<NotifType, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  order: ShoppingBag,
  payment: DollarSign,
  deal: Tag,
  job: Briefcase,
  live: Tv,
  wellness: Activity,
  creator: Rocket,
  travel: Plane,
  alert: AlertTriangle,
  system: Bell,
};

const COLOR_MAP: Record<NotifType, string> = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-primary bg-primary/10",
  mention: "text-purple-500 bg-purple-500/10",
  order: "text-green-500 bg-green-500/10",
  payment: "text-emerald-500 bg-emerald-500/10",
  deal: "text-orange-500 bg-orange-500/10",
  job: "text-sky-500 bg-sky-500/10",
  live: "text-rose-500 bg-rose-500/10",
  wellness: "text-teal-500 bg-teal-500/10",
  creator: "text-violet-500 bg-violet-500/10",
  travel: "text-indigo-500 bg-indigo-500/10",
  alert: "text-amber-500 bg-amber-500/10",
  system: "text-muted-foreground bg-muted",
};

function categoryToType(category: string): NotifType {
  const c = category.toLowerCase();
  if (c.includes("like") || c.includes("heart") || c.includes("reaction")) return "like";
  if (c.includes("comment") || c.includes("reply")) return "comment";
  if (c.includes("follow") || c.includes("friend") || c.includes("connection")) return "follow";
  if (c.includes("mention") || c.includes("tag")) return "mention";
  if (c.includes("payment") || c.includes("payout") || c.includes("invoice") || c.includes("refund")) return "payment";
  if (c.includes("order") || c.includes("purchase") || c.includes("delivery") || c.includes("shipping")) return "order";
  if (c.includes("deal") || c.includes("promo") || c.includes("discount") || c.includes("coupon")) return "deal";
  if (c.includes("job") || c.includes("application") || c.includes("hiring") || c.includes("interview") || c.includes("career")) return "job";
  if (c.includes("live") || c.includes("stream") || c.includes("broadcast") || c.includes("space")) return "live";
  if (c.includes("wellness") || c.includes("workout") || c.includes("fitness") || c.includes("med") || c.includes("vital") || c.includes("health")) return "wellness";
  if (c.includes("creator") || c.includes("monetization") || c.includes("earning") || c.includes("brand")) return "creator";
  if (c.includes("trip") || c.includes("flight") || c.includes("hotel") || c.includes("ride") || c.includes("travel") || c.includes("booking")) return "travel";
  if (c.includes("alert") || c.includes("warning") || c.includes("error") || c.includes("security")) return "alert";
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

  const TAB_TYPES: Record<string, NotifType[]> = {
    all: [],
    unread: [],
    social: ["like", "comment", "follow", "mention"],
    orders: ["order", "payment", "deal"],
    travel: ["travel"],
    jobs: ["job"],
    live: ["live"],
    creator: ["creator"],
    wellness: ["wellness"],
    alerts: ["alert"],
    system: ["system"],
  };

  const TABS: { key: string; label: string; icon?: any }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "social", label: "Social", icon: Heart },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "travel", label: "Travel", icon: Plane },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "live", label: "Live", icon: Tv },
    { key: "creator", label: "Creator", icon: Rocket },
    { key: "wellness", label: "Wellness", icon: Activity },
    { key: "alerts", label: "Alerts", icon: AlertTriangle },
    { key: "system", label: "System", icon: Bell },
  ];

  const filtered =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => TAB_TYPES[activeTab]?.includes(n.type));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button aria-label="Back" variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={markAllRead}>
              <Check className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabUnread =
              tab.key === "all" || tab.key === "unread"
                ? 0
                : notifications.filter((n) => !n.isRead && TAB_TYPES[tab.key]?.includes(n.type)).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all touch-manipulation ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/70"
                }`}
              >
                {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
                <span>{tab.label}</span>
                {tab.key === "unread" && unreadCount > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 ${isActive ? "bg-primary-foreground/20" : "bg-primary text-primary-foreground"}`}>
                    {unreadCount}
                  </span>
                )}
                {tabUnread > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 ${isActive ? "bg-primary-foreground/20" : "bg-primary/15 text-primary"}`}>
                    {tabUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
