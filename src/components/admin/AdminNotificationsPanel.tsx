import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  AlertTriangle, 
  Info,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Car,
  DollarSign,
  MessageSquare,
  Settings,
  Check,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  category: "driver" | "user" | "payment" | "system" | "support";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const mockNotifications: AdminNotification[] = [
  { id: "1", type: "warning", category: "driver", title: "Document Expiring", message: "Driver John D.'s license expires in 7 days", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "2", type: "success", category: "payment", title: "Payout Completed", message: "Batch payout of $12,450 processed successfully", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "3", type: "alert", category: "system", title: "High Server Load", message: "API response time exceeding threshold", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: "4", type: "info", category: "user", title: "New User Spike", message: "50+ new signups in the last hour", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "5", type: "warning", category: "support", title: "Unresolved Tickets", message: "12 support tickets pending for 24+ hours", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "6", type: "success", category: "driver", title: "Driver Verified", message: "Maria S. completed verification process", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
];

const AdminNotificationsPanel = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "alert": return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" };
      case "warning": return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "success": return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" };
      case "info": return { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" };
      default: return { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "driver": return Car;
      case "user": return UserPlus;
      case "payment": return DollarSign;
      case "system": return Settings;
      case "support": return MessageSquare;
      default: return Bell;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    toast.success("Marked as read");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return n.category === activeTab;
  });

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="text-xs gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4 bg-muted/30">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs gap-1">
              Unread
              {unreadCount > 0 && (
                <Badge className="h-4 px-1 text-[10px] bg-red-500">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="driver" className="text-xs">Drivers</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[320px] pr-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification, index) => {
                    const typeConfig = getTypeConfig(notification.type);
                    const CategoryIcon = getCategoryIcon(notification.category);
                    const TypeIcon = typeConfig.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "group p-3 rounded-xl border transition-all",
                          notification.is_read 
                            ? "bg-muted/20 border-border/50" 
                            : "bg-primary/5 border-primary/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg shrink-0", typeConfig.bg)}>
                            <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                !notification.is_read && "text-foreground"
                              )}>
                                {notification.title}
                              </p>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                                {notification.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!notification.is_read && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminNotificationsPanel;
