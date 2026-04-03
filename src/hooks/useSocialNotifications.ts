/**
 * Hook for social notifications (likes, comments, shares, follows, mentions)
 * Uses the user_notifications table
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SocialNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: "like" | "comment" | "reply" | "share" | "follow" | "mention" | "story_reaction";
  entity_id: string | null;
  entity_type: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  // Joined
  actor_name?: string;
  actor_avatar?: string | null;
}

export function useSocialNotifications(limit = 30) {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) { setNotifications([]); setUnreadCount(0); setLoading(false); return; }

    const { data } = await (supabase as any)
      .from("user_notifications")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!data) { setNotifications([]); setUnreadCount(0); setLoading(false); return; }

    // Fetch actor profiles
    const actorIds = [...new Set((data as any[]).map((n: any) => n.actor_id).filter(Boolean))] as string[];
    const { data: profiles } = actorIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", actorIds)
      : { data: [] };
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const mapped: SocialNotification[] = (data as any[]).map((n: any) => {
      const actor = profileMap.get(n.actor_id);
      return {
        ...n,
        actor_name: (actor as any)?.full_name || "Someone",
        actor_avatar: (actor as any)?.avatar_url || null,
      };
    });

    setNotifications(mapped);
    setUnreadCount(mapped.filter((n) => !n.is_read).length);
    setLoading(false);
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    const setup = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      const channel = supabase
        .channel("social-notifs")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${session.session.user.id}`,
        }, () => { fetch(); })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    };
    setup();
  }, [fetch]);

  const markAsRead = async (ids: string[]) => {
    await (supabase as any).from("user_notifications").update({ is_read: true }).in("id", ids);
    setNotifications((prev) => prev.map((n) => ids.includes(n.id) ? { ...n, is_read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
  };

  const markAllAsRead = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;
    await (supabase as any).from("user_notifications").update({ is_read: true }).eq("user_id", session.session.user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetch };
}

/** Helper to create a social notification */
export async function createSocialNotification(params: {
  userId: string;
  actorId: string;
  type: SocialNotification["type"];
  entityId?: string;
  entityType?: string;
  message: string;
}) {
  // Don't notify yourself
  if (params.userId === params.actorId) return;
  await (supabase as any).from("user_notifications").insert({
    user_id: params.userId,
    actor_id: params.actorId,
    type: params.type,
    entity_id: params.entityId || null,
    entity_type: params.entityType || null,
    message: params.message,
  });
}
