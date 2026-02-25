/**
 * NotificationsOutboxPage
 * Admin view for monitoring notification delivery
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationRecord {
  id: string;
  user_id: string;
  channel: string;
  title: string;
  body: string;
  status: string;
  error_message: string | null;
  provider_message_id: string | null;
  created_at: string;
  sent_at: string | null;
  profiles?: { email: string; phone_e164: string | null } | null;
}

interface OutboxStats {
  total: number;
  sent: number;
  failed: number;
  queued: number;
  byChannel: {
    push: number;
    sms: number;
    email: number;
  };
}

export default function NotificationsOutboxPage() {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("24h");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const getTimeFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case "1h":
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["admin-notifications-outbox", channelFilter, statusFilter, timeFilter],
    queryFn: async (): Promise<NotificationRecord[]> => {
      let query = supabase
        .from("notifications")
        .select("*, profiles!notifications_user_id_fkey(email, phone_e164)")
        .gte("created_at", getTimeFilter())
        .order("created_at", { ascending: false })
        .limit(100);

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter as "email" | "in_app" | "sms");
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "failed" | "queued" | "read" | "sent");
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as NotificationRecord[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Calculate stats
  const stats: OutboxStats = {
    total: notifications?.length || 0,
    sent: notifications?.filter((n) => n.status === "sent").length || 0,
    failed: notifications?.filter((n) => n.status === "failed").length || 0,
    queued: notifications?.filter((n) => n.status === "queued").length || 0,
    byChannel: {
      push: notifications?.filter((n) => n.channel === "push" || n.channel === "in_app").length || 0,
      sms: notifications?.filter((n) => n.channel === "sms").length || 0,
      email: notifications?.filter((n) => n.channel === "email").length || 0,
    },
  };

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // For now, just reset status to queued
      // A real implementation would re-trigger the send
      const { error } = await supabase
        .from("notifications")
        .update({ status: "queued", error_message: null })
        .eq("id", notificationId);
      
      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-outbox"] });
      toast.success("Notification queued for retry");
    },
    onError: (error: Error) => {
      toast.error(`Retry failed: ${error.message}`);
    },
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "push":
      case "in_app":
        return <Bell className="w-4 h-4" />;
      case "sms":
        return <Smartphone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Queued
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const failedNotifications = notifications?.filter((n) => n.status === "failed") || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Notification Outbox</h1>
            <p className="text-xs text-muted-foreground">Monitor delivery status</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Total Sent
                </div>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Failed
                </div>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Smartphone className="w-4 h-4" />
                  SMS Sent
                </div>
                <p className="text-2xl font-bold">{stats.byChannel.sms}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email Sent
                </div>
                <p className="text-2xl font-bold">{stats.byChannel.email}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1h</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Failed Notifications Section */}
        {failedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-destructive/50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Failed Notifications ({failedNotifications.length})
                </h3>
                <div className="space-y-2">
                  {failedNotifications.slice(0, 5).map((notif) => (
                    <Collapsible
                      key={notif.id}
                      open={expandedIds.has(notif.id)}
                      onOpenChange={() => toggleExpanded(notif.id)}
                    >
                      <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50">
                        <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedIds.has(notif.id) && "rotate-180"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            {getChannelIcon(notif.channel)}
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {notif.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </CollapsibleTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryMutation.mutate(notif.id)}
                          disabled={retryMutation.isPending}
                        >
                          {retryMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Retry
                            </>
                          )}
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="p-3 mt-1 rounded-xl bg-muted/30 text-sm space-y-2">
                          <div>
                            <span className="text-muted-foreground">Error:</span>
                            <p className="text-destructive">{notif.error_message || "Unknown error"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recipient:</span>
                            <p>{notif.profiles?.email || notif.profiles?.phone_e164 || "Unknown"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Body:</span>
                            <p className="line-clamp-2">{notif.body}</p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Notifications List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Recent Notifications</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No notifications found for the selected filters.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y">
                {notifications?.slice(0, 20).map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        {getChannelIcon(notif.channel)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notif.profiles?.email || notif.profiles?.phone_e164 || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(notif.status)}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
