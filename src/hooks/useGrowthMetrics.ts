import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GrowthMetrics {
  referrals: {
    total: number;
    thisMonth: number;
    pending: number;
    qualified: number;
    credited: number;
    conversionRate: number;
  };
  credits: {
    totalIssued: number;
    totalUsed: number;
    outstanding: number;
    expiredUnused: number;
    byType: Record<string, number>;
  };
  firstBooking: {
    totalClaimed: number;
    budgetUsed: number;
    byService: Record<string, { claimed: number; budget: number }>;
  };
  acquisition: {
    organicSignups: number;
    referralSignups: number;
    referralRate: number;
    avgCreditCost: number;
  };
  partnerReferrals: {
    total: number;
    qualified: number;
    paid: number;
    totalPaid: number;
  };
}

export const useGrowthMetrics = () => {
  // Get referral stats
  const { data: referralStats } = useQuery({
    queryKey: ['admin-referral-stats'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('zivo_referrals')
        .select('*');
      
      if (error) throw error;
      
      const total = data.length;
      const thisMonth = data.filter(r => new Date(r.created_at) >= startOfMonth).length;
      const pending = data.filter(r => r.status === 'pending').length;
      const qualified = data.filter(r => r.status === 'qualified').length;
      const credited = data.filter(r => r.status === 'credited').length;
      
      return {
        total,
        thisMonth,
        pending,
        qualified,
        credited,
        conversionRate: total > 0 ? (credited / total) * 100 : 0,
      };
    },
  });

  // Get credit stats
  const { data: creditStats } = useQuery({
    queryKey: ['admin-credit-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_credits')
        .select('*');
      
      if (error) throw error;
      
      const totalIssued = data.reduce((sum, c) => sum + (c.amount || 0), 0);
      const totalUsed = data.reduce((sum, c) => sum + (c.used_amount || 0), 0);
      const outstanding = data
        .filter(c => !c.is_expired && (c.expires_at ? new Date(c.expires_at) > new Date() : true))
        .reduce((sum, c) => sum + ((c.amount || 0) - (c.used_amount || 0)), 0);
      const expiredUnused = data
        .filter(c => c.is_expired || (c.expires_at && new Date(c.expires_at) < new Date()))
        .reduce((sum, c) => sum + ((c.amount || 0) - (c.used_amount || 0)), 0);
      
      const byType: Record<string, number> = {};
      for (const credit of data) {
        const type = credit.credit_type || 'unknown';
        byType[type] = (byType[type] || 0) + (credit.amount || 0);
      }
      
      return { totalIssued, totalUsed, outstanding, expiredUnused, byType };
    },
  });

  // Get first booking incentive stats
  const { data: firstBookingStats } = useQuery({
    queryKey: ['admin-first-booking-stats'],
    queryFn: async () => {
      const { data: incentives, error } = await supabase
        .from('zivo_first_booking_incentives')
        .select('*');
      
      if (error) throw error;
      
      const { data: credits } = await supabase
        .from('zivo_credits')
        .select('*')
        .eq('credit_type', 'first_booking');
      
      const totalClaimed = credits?.length || 0;
      const budgetUsed = incentives?.reduce((sum, i) => sum + (i.budget_used || 0), 0) || 0;
      
      const byService: Record<string, { claimed: number; budget: number }> = {};
      for (const incentive of incentives || []) {
        const serviceClaims = credits?.filter(c => c.source_service === incentive.service).length || 0;
        byService[incentive.service] = {
          claimed: serviceClaims,
          budget: incentive.budget_cap || 0,
        };
      }
      
      return { totalClaimed, budgetUsed, byService };
    },
  });

  // Get partner referral stats
  const { data: partnerReferralStats } = useQuery({
    queryKey: ['admin-partner-referral-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_partner_referrals')
        .select('*');
      
      if (error) throw error;
      
      const total = data.length;
      const qualified = data.filter(r => r.status === 'qualified').length;
      const paid = data.filter(r => r.status === 'paid').length;
      const totalPaid = data
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.bonus_amount || 0), 0);
      
      return { total, qualified, paid, totalPaid };
    },
  });

  // Calculate acquisition metrics
  const { data: acquisitionStats } = useQuery({
    queryKey: ['admin-acquisition-stats'],
    queryFn: async () => {
      // Get all referral codes to count organic vs referral
      const { data: referrals } = await supabase
        .from('zivo_referrals')
        .select('referee_id');
      
      const referralUserIds = new Set(referrals?.map(r => r.referee_id) || []);
      
      // This is a simplified calculation - in production you'd join with auth.users
      const referralSignups = referralUserIds.size;
      
      // Get credited credits for cost calculation
      const { data: credits } = await supabase
        .from('zivo_credits')
        .select('amount, credit_type');
      
      const referralCredits = credits?.filter(c => 
        c.credit_type === 'referral_earned' || c.credit_type === 'referral_bonus'
      ) || [];
      
      const totalReferralCost = referralCredits.reduce((sum, c) => sum + (c.amount || 0), 0);
      const avgCreditCost = referralSignups > 0 ? totalReferralCost / referralSignups : 0;
      
      return {
        organicSignups: 0, // Would need auth.users count
        referralSignups,
        referralRate: 0, // Would calculate from total signups
        avgCreditCost,
      };
    },
  });

  // Combined metrics
  const metrics: GrowthMetrics = {
    referrals: referralStats || {
      total: 0,
      thisMonth: 0,
      pending: 0,
      qualified: 0,
      credited: 0,
      conversionRate: 0,
    },
    credits: creditStats || {
      totalIssued: 0,
      totalUsed: 0,
      outstanding: 0,
      expiredUnused: 0,
      byType: {},
    },
    firstBooking: firstBookingStats || {
      totalClaimed: 0,
      budgetUsed: 0,
      byService: {},
    },
    acquisition: acquisitionStats || {
      organicSignups: 0,
      referralSignups: 0,
      referralRate: 0,
      avgCreditCost: 0,
    },
    partnerReferrals: partnerReferralStats || {
      total: 0,
      qualified: 0,
      paid: 0,
      totalPaid: 0,
    },
  };

  return {
    metrics,
    isLoading: !referralStats || !creditStats,
  };
};
