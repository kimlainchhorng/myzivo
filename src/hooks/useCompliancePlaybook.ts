/**
 * ZIVO Compliance & Regulatory Readiness Hook
 * Manages compliance requirements, SoT registrations, and quarterly reviews
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface ComplianceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priority: number;
  created_at: string;
}

export interface ComplianceRequirement {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  requirement_type: 'required' | 'recommended' | 'optional';
  compliance_status: 'pending' | 'in_progress' | 'compliant' | 'non_compliant' | 'not_applicable';
  evidence_url: string | null;
  evidence_notes: string | null;
  due_date: string | null;
  last_reviewed_at: string | null;
  reviewed_by: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SellerOfTravelRegistration {
  id: string;
  state_code: string;
  state_name: string;
  registration_required: boolean;
  registration_number: string | null;
  registration_status: 'not_required' | 'pending' | 'active' | 'expired' | 'exempt';
  application_date: string | null;
  approval_date: string | null;
  expiry_date: string | null;
  renewal_reminder_sent: boolean;
  legal_opinion_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReview {
  id: string;
  review_period: string;
  review_type: 'quarterly' | 'annual' | 'ad_hoc';
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  reviewed_by: string | null;
  summary: string | null;
  findings: any[];
  action_items: any[];
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataRetentionPolicy {
  id: string;
  data_type: string;
  description: string | null;
  retention_period_days: number;
  legal_basis: string | null;
  is_active: boolean;
  last_purge_at: string | null;
  created_at: string;
}

// Fetch categories with requirements
export function useComplianceCategories() {
  return useQuery({
    queryKey: ['compliance-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as ComplianceCategory[];
    },
  });
}

// Fetch all requirements
export function useComplianceRequirements(categoryId?: string) {
  return useQuery({
    queryKey: ['compliance-requirements', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('compliance_requirements')
        .select('*')
        .order('priority', { ascending: true });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ComplianceRequirement[];
    },
  });
}

// Update requirement status
export function useUpdateRequirementStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      evidenceNotes,
      evidenceUrl,
    }: {
      id: string;
      status: ComplianceRequirement['compliance_status'];
      evidenceNotes?: string;
      evidenceUrl?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current status for audit log
      const { data: current } = await supabase
        .from('compliance_requirements')
        .select('compliance_status')
        .eq('id', id)
        .single();

      // Update requirement
      const { error } = await supabase
        .from('compliance_requirements')
        .update({
          compliance_status: status,
          evidence_notes: evidenceNotes,
          evidence_url: evidenceUrl,
          last_reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Log audit entry
      await supabase.from('compliance_audit_logs').insert({
        requirement_id: id,
        action: 'status_update',
        old_status: current?.compliance_status,
        new_status: status,
        performed_by: user?.id,
        notes: evidenceNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-requirements'] });
      toast({ title: 'Compliance status updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    },
  });
}

// Seller of Travel registrations
export function useSellerOfTravelRegistrations() {
  return useQuery({
    queryKey: ['seller-of-travel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_of_travel_registrations')
        .select('*')
        .order('state_name', { ascending: true });
      
      if (error) throw error;
      return data as SellerOfTravelRegistration[];
    },
  });
}

// Update SoT registration
export function useUpdateSoTRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<SellerOfTravelRegistration> & { id: string }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from('seller_of_travel_registrations')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-of-travel'] });
      toast({ title: 'Registration updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    },
  });
}

// Compliance reviews
export function useComplianceReviews() {
  return useQuery({
    queryKey: ['compliance-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ComplianceReview[];
    },
  });
}

// Create quarterly review
export function useCreateComplianceReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewPeriod: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('compliance_reviews').insert({
        review_period: reviewPeriod,
        review_type: 'quarterly',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        reviewed_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reviews'] });
      toast({ title: 'Compliance review started' });
    },
  });
}

// Complete review
export function useCompleteComplianceReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      summary,
      findings,
      actionItems,
      nextReviewDate,
    }: {
      id: string;
      summary: string;
      findings: any[];
      actionItems: any[];
      nextReviewDate: string;
    }) => {
      const { error } = await supabase
        .from('compliance_reviews')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          summary,
          findings,
          action_items: actionItems,
          next_review_date: nextReviewDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reviews'] });
      toast({ title: 'Review completed' });
    },
  });
}

// Data retention policies
export function useDataRetentionPolicies() {
  return useQuery({
    queryKey: ['data-retention-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .order('data_type', { ascending: true });
      
      if (error) throw error;
      return data as DataRetentionPolicy[];
    },
  });
}

// Compliance metrics
export function useComplianceMetrics() {
  const { data: requirements } = useComplianceRequirements();
  const { data: sotRegistrations } = useSellerOfTravelRegistrations();

  const metrics = {
    totalRequirements: requirements?.length || 0,
    compliant: requirements?.filter(r => r.compliance_status === 'compliant').length || 0,
    pending: requirements?.filter(r => r.compliance_status === 'pending').length || 0,
    inProgress: requirements?.filter(r => r.compliance_status === 'in_progress').length || 0,
    nonCompliant: requirements?.filter(r => r.compliance_status === 'non_compliant').length || 0,
    complianceRate: requirements?.length 
      ? Math.round((requirements.filter(r => r.compliance_status === 'compliant').length / requirements.length) * 100)
      : 0,
    sotActive: sotRegistrations?.filter(r => r.registration_status === 'active').length || 0,
    sotPending: sotRegistrations?.filter(r => r.registration_status === 'pending').length || 0,
    sotExpiring: sotRegistrations?.filter(r => {
      if (!r.expiry_date) return false;
      const expiry = new Date(r.expiry_date);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return expiry <= thirtyDays && r.registration_status === 'active';
    }).length || 0,
  };

  return metrics;
}
