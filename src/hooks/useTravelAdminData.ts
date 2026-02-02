/**
 * Travel Admin Data Hooks
 * Hooks for admin panel to manage travel partners, handoff settings, and logs
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export type TravelPartnerType = 'flights' | 'hotels' | 'cars';
export type CheckoutMode = 'redirect' | 'iframe';
export type PartnerBookingStatus = 'pending' | 'returned' | 'failed' | 'timeout';

export interface TravelPartner {
  id: string;
  name: string;
  type: TravelPartnerType;
  base_url: string;
  checkout_mode: CheckoutMode;
  tracking_params: Record<string, string>;
  is_active: boolean;
  priority: number;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerRedirectLog {
  id: string;
  partner_id: string | null;
  partner_name: string;
  search_type: TravelPartnerType;
  offer_id: string | null;
  redirect_url: string;
  checkout_mode: CheckoutMode;
  status: PartnerBookingStatus;
  booking_ref: string | null;
  itinerary_id: string | null;
  user_id: string | null;
  session_id: string | null;
  search_params: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  returned_at: string | null;
  created_at: string;
}

export interface HandoffSettings {
  id: string;
  default_checkout_mode: CheckoutMode;
  show_disclosure_modal: boolean;
  require_consent_checkbox: boolean;
  booking_timeout_seconds: number;
  updated_by: string | null;
  updated_at: string;
}

// ==================== Travel Partners ====================

export const useTravelPartners = () => {
  return useQuery({
    queryKey: ['travel-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_partners')
        .select('*')
        .order('type')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as unknown as TravelPartner[];
    },
  });
};

export const useTravelPartnersByType = (type: TravelPartnerType) => {
  return useQuery({
    queryKey: ['travel-partners', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_partners')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as unknown as TravelPartner[];
    },
  });
};

export const useCreateTravelPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: Partial<TravelPartner>) => {
      const { data, error } = await supabase
        .from('travel_partners')
        .insert([partner] as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TravelPartner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-partners'] });
      toast.success('Partner created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create partner');
      console.error(error);
    },
  });
};

export const useUpdateTravelPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TravelPartner> }) => {
      const { data, error } = await supabase
        .from('travel_partners')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TravelPartner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-partners'] });
      toast.success('Partner updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update partner');
      console.error(error);
    },
  });
};

export const useDeleteTravelPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('travel_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-partners'] });
      toast.success('Partner deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete partner');
      console.error(error);
    },
  });
};

// ==================== Handoff Settings ====================

export const useHandoffSettings = () => {
  return useQuery({
    queryKey: ['handoff-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_handoff_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as unknown as HandoffSettings;
    },
  });
};

export const useUpdateHandoffSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<HandoffSettings, 'id' | 'updated_at' | 'updated_by'>>) => {
      // First get the settings row
      const { data: existing, error: fetchError } = await supabase
        .from('travel_handoff_settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('travel_handoff_settings')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        } as unknown as Record<string, unknown>)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HandoffSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handoff-settings'] });
      toast.success('Handoff settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error(error);
    },
  });
};

// ==================== Redirect Logs ====================

export interface RedirectLogsFilters {
  searchType?: TravelPartnerType;
  status?: PartnerBookingStatus;
  partnerId?: string;
  startDate?: string;
  endDate?: string;
}

export const usePartnerRedirectLogs = (filters?: RedirectLogsFilters, limit = 100) => {
  return useQuery({
    queryKey: ['partner-redirect-logs', filters, limit],
    queryFn: async () => {
      let query = supabase
        .from('partner_redirect_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters?.searchType) {
        query = query.eq('search_type', filters.searchType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.partnerId) {
        query = query.eq('partner_id', filters.partnerId);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as PartnerRedirectLog[];
    },
  });
};

export const useUpdateRedirectLogStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      bookingRef, 
      itineraryId 
    }: { 
      id: string; 
      status: PartnerBookingStatus; 
      bookingRef?: string;
      itineraryId?: string;
    }) => {
      const updates: Record<string, unknown> = {
        status,
        returned_at: status === 'returned' ? new Date().toISOString() : null,
      };
      
      if (bookingRef) updates.booking_ref = bookingRef;
      if (itineraryId) updates.itinerary_id = itineraryId;

      const { data, error } = await supabase
        .from('partner_redirect_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PartnerRedirectLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-redirect-logs'] });
      toast.success('Log updated');
    },
    onError: (error) => {
      toast.error('Failed to update log');
      console.error(error);
    },
  });
};

// ==================== Analytics ====================

export const useTravelAdminStats = (days = 30) => {
  return useQuery({
    queryKey: ['travel-admin-stats', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('partner_redirect_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const typedLogs = logs as unknown as PartnerRedirectLog[];

      const totalRedirects = typedLogs.length;
      const successfulReturns = typedLogs.filter(l => l.status === 'returned').length;
      const failedBookings = typedLogs.filter(l => l.status === 'failed').length;
      const pendingBookings = typedLogs.filter(l => l.status === 'pending').length;

      // Group by search type
      const byType = {
        flights: typedLogs.filter(l => l.search_type === 'flights').length,
        hotels: typedLogs.filter(l => l.search_type === 'hotels').length,
        cars: typedLogs.filter(l => l.search_type === 'cars').length,
      };

      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7Days = typedLogs.filter(l => new Date(l.created_at) >= sevenDaysAgo).length;

      return {
        totalRedirects,
        successfulReturns,
        failedBookings,
        pendingBookings,
        byType,
        last7Days,
        conversionRate: totalRedirects > 0 
          ? ((successfulReturns / totalRedirects) * 100).toFixed(1) 
          : '0',
      };
    },
  });
};
