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
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', notificationIds);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));

    } catch (err: any) {
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

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.session.user.id}`
          },
          (payload) => {
            const newNotification = payload.new as unknown as Notification;
            if (newNotification.channel === 'in_app') {
              setNotifications(prev => [newNotification, ...prev].slice(0, limit));
              setUnreadCount(prev => prev + 1);
              
              // Show toast for new notification
              toast({
                title: newNotification.title,
                description: newNotification.body.substring(0, 100),
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [limit, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
