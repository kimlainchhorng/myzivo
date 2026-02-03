import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FirstBookingIncentive {
  id: string;
  service: 'flights' | 'cars' | 'rides' | 'eats' | 'move';
  credit_amount: number;
  min_booking_value: number;
  budget_cap: number | null;
  budget_used: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface CrossSellIncentive {
  id: string;
  trigger_service: string;
  target_service: string;
  credit_amount: number;
  credit_expires_days: number;
  message_template: string | null;
  is_active: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: 'driver' | 'car_owner' | 'fleet' | 'restaurant' | 'customer';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria_type: string;
  criteria_threshold: number | null;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  partner_type: string | null;
  partner_id: string | null;
  earned_at: string;
  is_featured: boolean;
  badge?: Badge;
}

export interface LeaderboardEntry {
  id: string;
  category: string;
  period: string;
  partner_id: string;
  partner_name: string | null;
  partner_avatar: string | null;
  metric_type: string;
  metric_value: number;
  rank: number;
}

export const useGrowthIncentives = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get first booking incentives
  const { data: firstBookingIncentives } = useQuery({
    queryKey: ['first-booking-incentives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_first_booking_incentives')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as FirstBookingIncentive[];
    },
  });

  // Get cross-sell incentives
  const { data: crossSellIncentives } = useQuery({
    queryKey: ['cross-sell-incentives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_cross_sell_incentives')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as CrossSellIncentive[];
    },
  });

  // Get all badges
  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_badges')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Get user's earned badges
  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('zivo_user_badges')
        .select(`
          *,
          badge:zivo_badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!user?.id,
  });

  // Get leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_leaderboards')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  // Get incentive for a service
  const getIncentiveForService = (service: string): FirstBookingIncentive | undefined => {
    return firstBookingIncentives?.find(i => i.service === service);
  };

  // Get cross-sell suggestion based on completed booking
  const getCrossSellSuggestion = (completedService: string): CrossSellIncentive | undefined => {
    return crossSellIncentives?.find(i => i.trigger_service === completedService);
  };

  // Claim first booking incentive
  const claimFirstBookingIncentive = useMutation({
    mutationFn: async ({ 
      service, 
      bookingValue,
      bookingId 
    }: { 
      service: string; 
      bookingValue: number;
      bookingId: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const incentive = getIncentiveForService(service);
      if (!incentive) throw new Error('No incentive available');
      
      if (bookingValue < incentive.min_booking_value) {
        throw new Error(`Minimum booking value is $${incentive.min_booking_value}`);
      }

      // Check budget cap
      if (incentive.budget_cap && incentive.budget_used >= incentive.budget_cap) {
        throw new Error('Promotion budget exhausted');
      }

      // Create credit
      const { error } = await supabase
        .from('zivo_credits')
        .insert({
          user_id: user.id,
          amount: incentive.credit_amount,
          credit_type: 'first_booking',
          source_service: service,
          description: `First ${service} booking bonus`,
          reference_id: bookingId,
          reference_type: 'booking',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      // Update budget used
      await supabase
        .from('zivo_first_booking_incentives')
        .update({ budget_used: incentive.budget_used + incentive.credit_amount })
        .eq('id', incentive.id);

      return { credit: incentive.credit_amount };
    },
    onSuccess: (data) => {
      toast.success(`Congrats! You earned $${data.credit} in credits for your first booking!`);
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });

  // Grant cross-sell credit
  const grantCrossSellCredit = useMutation({
    mutationFn: async ({ 
      triggerService, 
      bookingId 
    }: { 
      triggerService: string; 
      bookingId: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const incentive = getCrossSellSuggestion(triggerService);
      if (!incentive) return null;

      const expiresAt = new Date(
        Date.now() + (incentive.credit_expires_days || 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await supabase
        .from('zivo_credits')
        .insert({
          user_id: user.id,
          amount: incentive.credit_amount,
          credit_type: 'cross_sell',
          source_service: triggerService,
          usable_on: [incentive.target_service],
          description: incentive.message_template || `Cross-sell bonus for ${incentive.target_service}`,
          reference_id: bookingId,
          reference_type: 'cross_sell',
          expires_at: expiresAt,
        });

      if (error) throw error;

      return { 
        credit: incentive.credit_amount, 
        targetService: incentive.target_service,
        message: incentive.message_template,
      };
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(data.message || `You earned $${data.credit} to use on ${data.targetService}!`);
        queryClient.invalidateQueries({ queryKey: ['credits'] });
      }
    },
  });

  // Get leaderboard by category
  const getLeaderboardByCategory = (category: string, period: string = 'monthly') => {
    return leaderboard?.filter(e => e.category === category && e.period === period) || [];
  };

  return {
    firstBookingIncentives,
    crossSellIncentives,
    badges,
    userBadges,
    leaderboard,
    badgesLoading,
    getIncentiveForService,
    getCrossSellSuggestion,
    claimFirstBookingIncentive,
    grantCrossSellCredit,
    getLeaderboardByCategory,
  };
};
