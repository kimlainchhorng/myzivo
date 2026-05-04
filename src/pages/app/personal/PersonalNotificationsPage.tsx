import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Notif = {
  id: string;
  title: string | null;
  body: string | null;
  category: string | null;
  is_read: boolean;
  created_at: string;
};

export default function PersonalNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifs, isLoading } = useQuery({
    queryKey: ["personal-notifications-list", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Notif[]> => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("notifications")
        .select("id, title, body, category, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return Array.isArray(data) ? data : [];
    },
  });

  const markRead = async (id: string) => {
    await (supabase as any).from("notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["personal-notifications-list"] });
    queryClient.invalidateQueries({ queryKey: ["personal-dashboard-recent-notifs"] });
    queryClient.invalidateQueries({ queryKey: ["personal-dashboard-stats"] });
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = (notifs ?? []).filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    await (supabase as any).from("notifications").update({ is_read: true }).in("id", unread);
    queryClient.invalidateQueries({ queryKey: ["personal-notifications-list"] });
    queryClient.invalidateQueries({ queryKey: ["personal-dashboard-recent-notifs"] });
    queryClient.invalidateQueries({ queryKey: ["personal-dashboard-stats"] });
    toast.success(`Marked ${unread.length} as read`);
  };

  const unreadCount = (notifs ?? []).filter((n) => !n.is_read).length;

  return (
    <AppLayout title="Notifications" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24">
        <div className="flex items-center gap-2.5 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px] flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12px] font-medium text-primary flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {isLoading && (
          <p className="text-center text-[13px] text-muted-foreground py-8">Loading…</p>
        )}

        {!isLoading && (!notifs || notifs.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-foreground" />
            </div>
            <h2 className="font-semibold text-[15px] mb-1">No notifications yet</h2>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">
              You're all caught up. New alerts and reminders will show up here.
            </p>
          </div>
        )}

        {notifs && notifs.length > 0 && (
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
            {notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-3.5 py-3 text-left transition-colors",
                  n.is_read ? "hover:bg-muted/20" : "bg-primary/5 hover:bg-primary/10"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    n.is_read ? "bg-muted-foreground/30" : "bg-rose-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[13px] truncate">{n.title || "Notification"}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {n.body && (
                    <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                      {n.body}
                    </p>
                  )}
                  {n.category && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wide">
                      {n.category}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
