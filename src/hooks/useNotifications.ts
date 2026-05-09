/**
 * Hook for managing user notifications
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string | null;
  order_id: string | null;
  channel: 'email' | 'in_app' | 'sms';
  category: 'transactional' | 'account' | 'operational' | 'marketing';
  template: string;
  title: string;
  body: string;
  action_url: string | null;
  status: 'queued' | 'sent' | 'failed' | 'read';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useNotifications(limit = 50): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Fetch notifications
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('channel', 'in_app')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const typedData = (data || []) as unknown as Notification[];
      setNotifications(typedData);

      // Count unread
      const unread = typedData.filter(n => !n.is_read).length;
      setUnreadCount(unread);

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    // Optimistic update first — no spinner flash
    const nowIso = new Date().toISOString();
    let prevSnapshot: Notification[] = [];
    setNotifications(prev => {
      prevSnapshot = prev;
      return prev.map(n =>
        notificationIds.includes(n.id) ? { ...n, is_read: true, read_at: nowIso } : n
      );
    });
    const unreadDelta = prevSnapshot.filter(n => notificationIds.includes(n.id) && !n.is_read).length;
    setUnreadCount(prev => Math.max(0, prev - unreadDelta));

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: nowIso })
        .in('id', notificationIds);

      if (updateError) throw updateError;
    } catch (err: any) {
      // Rollback on failure
      setNotifications(prevSnapshot);
      setUnreadCount(prev => prev + unreadDelta);
      console.error('Error marking notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', session.session.user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      toast({
        title: 'All caught up!',
        description: 'All notifications marked as read'
      });

    } catch (err: any) {
      console.error('Error marking all as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const deleteNotifications = useCallback(async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return;
    const prevSnapshot = notifications;
    const removed = prevSnapshot.filter(n => notificationIds.includes(n.id));
    const removedUnread = removed.filter(n => !n.is_read).length;
    setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
    setUnreadCount(prev => Math.max(0, prev - removedUnread));

    try {
      const { error: delError } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);
      if (delError) throw delError;
    } catch (err: any) {
      setNotifications(prevSnapshot);
      setUnreadCount(prev => prev + removedUnread);
      console.error('Error deleting notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  const clearAll = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const prevSnapshot = notifications;
      setNotifications([]);
      setUnreadCount(0);

      const { error: delError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('channel', 'in_app');

      if (delError) {
        setNotifications(prevSnapshot);
        setUnreadCount(prevSnapshot.filter(n => !n.is_read).length);
        throw delError;
      }

      toast({
        title: 'Cleared',
        description: 'All notifications removed',
      });
    } catch (err: any) {
      console.error('Error clearing notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    let cancelled = false;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (cancelled || !session?.session?.user) return;

      const userId = session.session.user.id;
      const channel = supabase.channel(
        `notifications-realtime-${userId}-${crypto.randomUUID()}`,
      );
      activeChannel = channel;

      // INSERT: prepend new notification, bump unread, show toast
      channel.on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: unknown }) => {
          const newNotification = payload.new as Notification;
          if (newNotification.channel !== 'in_app') return;
          setNotifications((prev) => {
            // De-dupe — if dispatcher fired twice with same id, don't double-insert.
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev].slice(0, limit);
          });
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
          toast({
            title: newNotification.title,
            description: newNotification.body.substring(0, 100),
          });
        },
      );

      // UPDATE: keep cross-device read-state in sync. If another device
      // marks an item read, this device should reflect it without manual refresh.
      channel.on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: unknown; old?: unknown }) => {
          const updated = payload.new as Notification;
          const previous = payload.old as Notification | undefined;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
          );
          // Adjust unread count delta based on read-state transition.
          const wasRead = previous?.is_read ?? false;
          const isRead = updated.is_read;
          if (wasRead && !isRead) setUnreadCount((c) => c + 1);
          else if (!wasRead && isRead) setUnreadCount((c) => Math.max(0, c - 1));
        },
      );

      // DELETE: drop the row from local state. Decrement unread if the
      // removed row was unread.
      channel.on(
        'postgres_changes' as never,
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { old: unknown }) => {
          const removed = payload.old as Notification;
          let wasUnread = false;
          setNotifications((prev) => {
            const target = prev.find((n) => n.id === removed.id);
            wasUnread = !!target && !target.is_read;
            return prev.filter((n) => n.id !== removed.id);
          });
          if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
        },
      );

      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [limit, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    clearAll,
  };
}
