/**
 * Dispatch Promotions Management Hook
 * CRUD operations for promotions in dispatch panel
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Promotion {
  id: string;
  created_at: string;
  code: string;
  name: string | null;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number | null;
  applicable_services: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  merchant_id: string | null;
  tenant_id: string | null;
}

export interface CreatePromotionInput {
  code: string;
  name?: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_delivery';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  applicable_services?: string[];
  starts_at?: string;
  ends_at?: string;
  merchant_id?: string;
}

export function useDispatchPromotions(tenantId?: string) {
  const queryClient = useQueryClient();

  // Fetch promotions
  const { data: promotions, isLoading, error } = useQuery({
    queryKey: ['dispatch-promotions', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantId) {
        query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Promotion[];
    },
  });

  // Create promotion
  const createPromotion = useMutation({
    mutationFn: async (input: CreatePromotionInput) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert([{
          code: input.code.toUpperCase(),
          name: input.name,
          description: input.description,
          discount_type: input.discount_type,
          discount_value: input.discount_value,
          min_order_amount: input.min_order_amount,
          max_discount: input.max_discount,
          usage_limit: input.usage_limit,
          per_user_limit: input.per_user_limit,
          applicable_services: input.applicable_services,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          merchant_id: input.merchant_id,
          tenant_id: tenantId || null,
          is_active: true,
          usage_count: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Promotion created successfully');
      queryClient.invalidateQueries({ queryKey: ['dispatch-promotions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create promotion');
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Promotion updated');
      queryClient.invalidateQueries({ queryKey: ['dispatch-promotions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update promotion');
    },
  });

  // Delete promotion
  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Promotion deleted');
      queryClient.invalidateQueries({ queryKey: ['dispatch-promotions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete promotion');
    },
  });

  // Get stats
  const stats = {
    total: promotions?.length || 0,
    active: promotions?.filter(p => p.is_active).length || 0,
    expired: promotions?.filter(p => p.ends_at && new Date(p.ends_at) < new Date()).length || 0,
    totalRedemptions: promotions?.reduce((sum, p) => sum + (p.usage_count || 0), 0) || 0,
  };

  return {
    promotions,
    isLoading,
    error,
    stats,
    createPromotion,
    toggleActive,
    deletePromotion,
  };
}
