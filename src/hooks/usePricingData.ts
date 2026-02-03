/**
 * Pricing Engine Data Hook
 * Manages pricing rules, promotions, experiments, and analytics
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// Types matching the actual database schema
export interface PricingRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: 'markup_percent' | 'markup_flat' | 'service_fee_percent' | 'service_fee_flat';
  value: number;
  applies_to: 'flight' | 'hotel' | 'activity' | 'transfer' | 'car_rental' | 'all';
  min_order_value: number | null;
  max_order_value: number | null;
  priority: number;
  is_active: boolean;
  version: number;
  created_at: string;
  created_by: string | null;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number | null;
  per_user_limit: number | null;
  applicable_services: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string | null;
  hypothesis: string | null;
  metric_primary: string;
  metric_secondary: string[] | null;
  variants: Json;
  targeting_rules: Json | null;
  auto_stop_rules: Json | null;
  start_at: string | null;
  end_at: string | null;
  status: 'draft' | 'running' | 'paused' | 'completed';
  winner_variant: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ExperimentStats {
  experiment_id: string;
  variant: string;
  impressions: number;
  conversions: number;
  revenue: number;
  conversion_rate: number;
}

// Fetch pricing rules
export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PricingRule[];
    }
  });
}

// Fetch promotions
export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Promotion[];
    }
  });
}

// Fetch experiments
export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Experiment[];
    }
  });
}

// Fetch experiment statistics
export function useExperimentStats(experimentId: string | null) {
  return useQuery({
    queryKey: ['experiment-stats', experimentId],
    queryFn: async () => {
      if (!experimentId) return [];
      
      const { data, error } = await supabase
        .from('experiment_events')
        .select('variant, event_type, event_value')
        .eq('experiment_id', experimentId);
      
      if (error) throw error;
      
      // Aggregate stats by variant
      const variantStats: Record<string, ExperimentStats> = {};
      
      (data || []).forEach((event) => {
        if (!variantStats[event.variant]) {
          variantStats[event.variant] = {
            experiment_id: experimentId,
            variant: event.variant,
            impressions: 0,
            conversions: 0,
            revenue: 0,
            conversion_rate: 0
          };
        }
        
        if (event.event_type === 'impression') {
          variantStats[event.variant].impressions++;
        } else if (event.event_type === 'conversion') {
          variantStats[event.variant].conversions++;
          variantStats[event.variant].revenue += event.event_value || 0;
        }
      });
      
      // Calculate conversion rates
      Object.values(variantStats).forEach(stats => {
        stats.conversion_rate = stats.impressions > 0 
          ? (stats.conversions / stats.impressions) * 100 
          : 0;
      });
      
      return Object.values(variantStats);
    },
    enabled: !!experimentId
  });
}

// Fetch promo redemption stats
export function usePromoStats() {
  return useQuery({
    queryKey: ['promo-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_redemptions')
        .select('promo_id, discount_amount, status, created_at');
      
      if (error) throw error;
      
      const totalRedemptions = data?.length || 0;
      const totalDiscounts = data?.reduce((sum, r) => sum + (r.discount_amount || 0), 0) || 0;
      
      return {
        total_redemptions: totalRedemptions,
        total_discount_given: totalDiscounts,
        avg_discount: totalRedemptions > 0 ? totalDiscounts / totalRedemptions : 0
      };
    }
  });
}

// Fetch price calculation history
export function usePriceCalculations(limit = 100) {
  return useQuery({
    queryKey: ['price-calculations', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_calculations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    }
  });
}

// Mutations
export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: {
      name: string;
      description?: string;
      rule_type: 'markup_percent' | 'markup_flat' | 'service_fee_percent' | 'service_fee_flat';
      value: number;
      applies_to: 'flight' | 'hotel' | 'activity' | 'transfer' | 'car_rental' | 'all';
      min_order_value?: number;
      max_order_value?: number;
      priority?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert({
          name: rule.name,
          description: rule.description || null,
          rule_type: rule.rule_type,
          value: rule.value,
          applies_to: rule.applies_to,
          min_order_value: rule.min_order_value || null,
          max_order_value: rule.max_order_value || null,
          priority: rule.priority || 0,
          is_active: rule.is_active ?? true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success('Pricing rule created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create rule: ${error.message}`);
    }
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      description: string | null;
      value: number;
      priority: number;
      is_active: boolean;
    }>) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success('Pricing rule updated');
    }
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promo: {
      code: string;
      name: string;
      description?: string;
      discount_type: string;
      discount_value: number;
      min_order_amount?: number;
      max_discount?: number;
      usage_limit?: number;
      per_user_limit?: number;
      starts_at?: string;
      ends_at?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          code: promo.code,
          name: promo.name,
          description: promo.description || null,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          min_order_amount: promo.min_order_amount || null,
          max_discount: promo.max_discount || null,
          usage_limit: promo.usage_limit || null,
          per_user_limit: promo.per_user_limit || 1,
          starts_at: promo.starts_at || null,
          ends_at: promo.ends_at || null,
          is_active: promo.is_active ?? true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create promotion: ${error.message}`);
    }
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      description: string | null;
      is_active: boolean;
    }>) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion updated');
    }
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (experiment: {
      name: string;
      description?: string;
      hypothesis?: string;
      metric_primary?: string;
      variants?: { name: string; weight: number }[];
      status?: 'draft' | 'running' | 'paused' | 'completed';
    }) => {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          name: experiment.name,
          description: experiment.description || null,
          hypothesis: experiment.hypothesis || null,
          metric_primary: experiment.metric_primary || 'conversion_rate',
          variants: experiment.variants || [{ name: 'control', weight: 50 }, { name: 'variant_a', weight: 50 }],
          status: experiment.status || 'draft'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast.success('Experiment created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create experiment: ${error.message}`);
    }
  });
}

export function useUpdateExperiment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      description: string | null;
      status: 'draft' | 'running' | 'paused' | 'completed';
      start_at: string | null;
      end_at: string | null;
      winner_variant: string | null;
    }>) => {
      const { data, error } = await supabase
        .from('experiments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast.success('Experiment updated');
    }
  });
}

// Calculate price via edge function
export async function calculatePrice(params: {
  product_type: string;
  supplier_price: number;
  tax_amount?: number;
  promo_code?: string;
  user_id?: string;
  session_id?: string;
}) {
  const { data, error } = await supabase.functions.invoke('calculate-price', {
    body: params
  });
  
  if (error) throw error;
  return data;
}
