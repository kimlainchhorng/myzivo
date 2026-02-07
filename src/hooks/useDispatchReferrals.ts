/**
 * Dispatch Referrals Management Hook
 * View and manage customer/driver referrals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CustomerReferral {
  id: string;
  created_at: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: 'pending' | 'qualified' | 'credited' | 'expired';
  referrer_credit_amount: number;
  referee_credit_amount: number;
  first_booking_service: string | null;
  first_booking_at: string | null;
  credited_at: string | null;
  // Joined data
  referrer_email?: string;
  referee_email?: string;
}

export interface DriverReferral {
  id: string;
  created_at: string;
  referrer_id: string;
  referred_driver_id: string | null;
  referrer_driver_id: string | null;
  referee_name: string | null;
  referee_email: string | null;
  status: string;
  trips_completed: number;
  completed_orders: number;
  required_orders: number;
  bonus_earned: number;
  reward_amount: number;
  signed_up_at: string | null;
  completed_at: string | null;
  credited_at: string | null;
}

export function useDispatchReferrals() {
  const queryClient = useQueryClient();

  // Fetch customer referrals
  const { data: customerReferrals, isLoading: loadingCustomer } = useQuery({
    queryKey: ['dispatch-referrals-customer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zivo_referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomerReferral[];
    },
  });

  // Fetch driver referrals
  const { data: driverReferrals, isLoading: loadingDriver } = useQuery({
    queryKey: ['dispatch-referrals-driver'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DriverReferral[];
    },
  });

  // Manually credit a referral - update via direct table update
  const creditReferral = useMutation({
    mutationFn: async (referralId: string) => {
      // Update referral status directly
      const { error } = await supabase
        .from('zivo_referrals')
        .update({ status: 'credited', credited_at: new Date().toISOString() })
        .eq('id', referralId);

      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Referral credited successfully');
      queryClient.invalidateQueries({ queryKey: ['dispatch-referrals-customer'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-referrals-driver'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to credit referral');
    },
  });

  // Stats
  const customerStats = {
    total: customerReferrals?.length || 0,
    pending: customerReferrals?.filter(r => r.status === 'pending').length || 0,
    credited: customerReferrals?.filter(r => r.status === 'credited').length || 0,
    totalCredits: customerReferrals?.reduce((sum, r) => 
      r.status === 'credited' ? sum + (r.referrer_credit_amount || 0) + (r.referee_credit_amount || 0) : sum, 0) || 0,
  };

  const driverStats = {
    total: driverReferrals?.length || 0,
    pending: driverReferrals?.filter(r => r.status === 'pending').length || 0,
    credited: driverReferrals?.filter(r => r.status === 'credited').length || 0,
    totalBonuses: driverReferrals?.reduce((sum, r) => 
      r.status === 'credited' ? sum + (r.reward_amount || r.bonus_earned || 0) : sum, 0) || 0,
  };

  return {
    customerReferrals,
    driverReferrals,
    isLoading: loadingCustomer || loadingDriver,
    customerStats,
    driverStats,
    creditReferral,
  };
}
