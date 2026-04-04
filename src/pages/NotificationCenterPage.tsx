import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, MessageCircle, UserPlus, ShoppingBag, Bell, Check, Trash2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "order" | "mention" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "like", title: "New Like", message: "Alex Morgan liked your post", time: "2m ago", isRead: false },
  { id: "2", type: "comment", title: "New Comment", message: "Sarah Kim commented: 'Great shot! 📸'", time: "15m ago", isRead: false },
  { id: "3", type: "follow", title: "New Follower", message: "Mike Ross started following you", time: "1h ago", isRead: false },
  { id: "4", type: "order", title: "Order Update", message: "Your marketplace order has shipped!", time: "2h ago", isRead: true },
  { id: "5", type: "mention", title: "Mentioned You", message: "DJ Nova mentioned you in a Space", time: "3h ago", isRead: true },
  { id: "6", type: "system", title: "Welcome!", message: "Complete your profile to get discovered", time: "1d ago", isRead: true },
  { id: "7", type: "like", title: "New Like", message: "Priya S. liked your reel", time: "1d ago", isRead: true },
  { id: "8", type: "follow", title: "New Follower", message: "Tom L. started following you", time: "2d ago", isRead: true },
];

const ICON_MAP = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  order: ShoppingBag,
  mention: MessageCircle,
  system: Bell,
};

const COLOR_MAP = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-primary bg-primary/10",
  order: "text-green-500 bg-green-500/10",
  mention: "text-purple-500 bg-purple-500/10",
  system: "text-muted-foreground bg-muted",
};

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = activeTab === "all" ? notifications :
    activeTab === "unread" ? notifications.filter(n => !n.isRead) :
    notifications.filter(n => n.type === activeTab);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
                <Check className="h-3 w-3 mr-1" /> Read all
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/account/privacy")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-transparent border-b-0 overflow-x-auto no-scrollbar">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
            <TabsTrigger value="like" className="text-xs">Likes</TabsTrigger>
            <TabsTrigger value="comment" className="text-xs">Comments</TabsTrigger>
            <TabsTrigger value="follow" className="text-xs">Follows</TabsTrigger>
            <TabsTrigger value="order" className="text-xs">Orders</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          filtered.map((notif, i) => {
            const Icon = ICON_MAP[notif.type];
            const colorClass = COLOR_MAP[notif.type];
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50 ${!notif.isRead ? "bg-primary/5" : ""}`}
                onClick={() => markRead(notif.id)}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>{notif.title}</p>
                    {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
