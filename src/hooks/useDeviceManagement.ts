/**
 * useDeviceManagement Hook
 * 
 * Admin hook for managing device tokens across the platform.
 * Supports listing, revoking, and testing push notifications.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name: string | null;
  app_version: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: string | null;
  // Joined profile data
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useDeviceTokens = (tenantId?: string | null) => {
  return useQuery({
    queryKey: ['device-tokens', tenantId],
    queryFn: async (): Promise<DeviceToken[]> => {
      // First get device tokens
      let query = supabase
        .from('device_tokens')
        .select('*')
        .order('last_used_at', { ascending: false, nullsFirst: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: tokens, error } = await query;

      if (error) {
        console.error('[useDeviceTokens] Error:', error);
        throw error;
      }

      if (!tokens || tokens.length === 0) {
        return [];
      }

      // Get unique user IDs and fetch profiles
      const userIds = [...new Set(tokens.map(t => t.user_id).filter(Boolean))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, { full_name: p.full_name, email: p.email }])
      );

      // Map tokens with profile data
      return tokens.map(token => ({
        ...token,
        platform: token.platform as 'ios' | 'android' | 'web',
        profile: token.user_id ? profileMap.get(token.user_id) : undefined,
      })) as DeviceToken[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useRevokeToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('device_tokens')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenId);

      if (error) throw error;
      return tokenId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-tokens'] });
      toast.success('Token revoked successfully');
    },
    onError: (error: Error) => {
      console.error('[useRevokeToken] Error:', error);
      toast.error('Failed to revoke token');
    },
  });
};

export const useDeleteToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('device_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
      return tokenId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-tokens'] });
      toast.success('Token deleted successfully');
    },
    onError: (error: Error) => {
      console.error('[useDeleteToken] Error:', error);
      toast.error('Failed to delete token');
    },
  });
};

export const useSendTestPush = () => {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      title = 'Test Notification',
      body = 'This is a test push notification from ZIVO.',
    }: { 
      userId: string; 
      title?: string;
      body?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          title,
          body,
          data: { type: 'test' },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Test notification sent');
      } else {
        toast.warning('Notification queued', {
          description: data?.message || 'May not be delivered immediately',
        });
      }
    },
    onError: (error: Error) => {
      console.error('[useSendTestPush] Error:', error);
      toast.error('Failed to send test notification');
    },
  });
};

// Get device stats summary
export const useDeviceStats = (tenantId?: string | null) => {
  return useQuery({
    queryKey: ['device-stats', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('device_tokens')
        .select('platform, is_active');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useDeviceStats] Error:', error);
        throw error;
      }

      const tokens = data || [];
      
      return {
        total: tokens.length,
        active: tokens.filter(t => t.is_active).length,
        inactive: tokens.filter(t => !t.is_active).length,
        byPlatform: {
          ios: tokens.filter(t => t.platform === 'ios').length,
          android: tokens.filter(t => t.platform === 'android').length,
          web: tokens.filter(t => t.platform === 'web').length,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export default useDeviceTokens;
