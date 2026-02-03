/**
 * Operations Playbook Hooks
 * Manages checklists, incidents, knowledge base, and role definitions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek } from "date-fns";

// Types
export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  completed?: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface OperationsChecklist {
  id: string;
  checklist_type: 'daily' | 'weekly' | 'monthly';
  checklist_date: string;
  completed_by: string | null;
  completed_at: string | null;
  items: ChecklistItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentLog {
  id: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigating' | 'resolved' | 'closed';
  title: string;
  description: string | null;
  affected_bookings: number;
  affected_users: number;
  root_cause: string | null;
  resolution: string | null;
  prevention_steps: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  tags: string[] | null;
  is_published: boolean;
  view_count: number;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamRoleDefinition {
  id: string;
  role_name: string;
  description: string | null;
  responsibilities: string[];
  escalation_path: string | null;
  sla_targets: Record<string, any>;
  is_active: boolean;
}

// Checklist Templates
export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data.map(t => ({
        id: t.id,
        checklist_type: t.checklist_type,
        items: (t.items as unknown as ChecklistItem[]) || [],
      })) as Array<{
        id: string;
        checklist_type: string;
        items: ChecklistItem[];
      }>;
    },
  });
}

// Get or create today's checklist
export function useTodayChecklist(type: 'daily' | 'weekly') {
  const { data: templates } = useChecklistTemplates();
  const queryClient = useQueryClient();

  const date = type === 'daily' 
    ? format(new Date(), 'yyyy-MM-dd')
    : format(startOfWeek(new Date()), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['operations-checklist', type, date],
    queryFn: async () => {
      // Try to get existing checklist
      const { data: existing, error: fetchError } = await supabase
        .from('operations_checklists')
        .select('*')
        .eq('checklist_type', type)
        .eq('checklist_date', date)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existing) {
        return {
          ...existing,
          items: (existing.items as unknown as ChecklistItem[]) || [],
        } as OperationsChecklist;
      }

      // Create new checklist from template
      const template = templates?.find(t => t.checklist_type === type);
      const items = template?.items || [];

      const { data: created, error: createError } = await supabase
        .from('operations_checklists')
        .insert({
          checklist_type: type,
          checklist_date: date,
          items: items.map(item => ({ ...item, completed: false })) as unknown as any,
        })
        .select()
        .single();

      if (createError) throw createError;
      return {
        ...created,
        items: (created.items as unknown as ChecklistItem[]) || [],
      } as OperationsChecklist;
    },
    enabled: !!templates,
  });
}

// Update checklist item
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      checklistId, 
      itemId, 
      completed, 
      notes 
    }: { 
      checklistId: string; 
      itemId: string; 
      completed: boolean; 
      notes?: string;
    }) => {
      // Get current checklist
      const { data: checklist, error: fetchError } = await supabase
        .from('operations_checklists')
        .select('items')
        .eq('id', checklistId)
        .single();

      if (fetchError) throw fetchError;

      // Update the specific item
      const currentItems = (checklist.items as unknown as ChecklistItem[]) || [];
      const items = currentItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            completedBy: completed ? user?.id : undefined,
            notes: notes || item.notes,
          };
        }
        return item;
      });

      // Check if all items completed
      const allCompleted = items.every(item => item.completed);

      const { error: updateError } = await supabase
        .from('operations_checklists')
        .update({
          items: items as unknown as any,
          completed_at: allCompleted ? new Date().toISOString() : null,
          completed_by: allCompleted ? user?.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-checklist'] });
    },
  });
}

// Incidents
export function useIncidents(filters?: { status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      let query = supabase
        .from('incident_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncidentLog[];
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<IncidentLog, 'id' | 'created_at' | 'updated_at' | 'reported_by'>) => {
      const { data: incident, error } = await supabase
        .from('incident_logs')
        .insert({
          ...data,
          reported_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident logged');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log incident');
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<IncidentLog> }) => {
      const { error } = await supabase
        .from('incident_logs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident updated');
    },
  });
}

// Knowledge Base
export function useKnowledgeBase(category?: string) {
  return useQuery({
    queryKey: ['knowledge-base', category],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('is_published', true)
        .order('title');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeBaseArticle[];
    },
  });
}

export function useKnowledgeBaseArticle(slug: string) {
  return useQuery({
    queryKey: ['kb-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('knowledge_base_articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as KnowledgeBaseArticle;
    },
    enabled: !!slug,
  });
}

export function useCreateKBArticle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'created_by'>) => {
      const { data: article, error } = await supabase
        .from('knowledge_base_articles')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Article created');
    },
  });
}

export function useUpdateKBArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<KnowledgeBaseArticle> }) => {
      const { error } = await supabase
        .from('knowledge_base_articles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Article updated');
    },
  });
}

// Team Roles
export function useTeamRoles() {
  return useQuery({
    queryKey: ['team-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_role_definitions')
        .select('*')
        .eq('is_active', true)
        .order('role_name');

      if (error) throw error;
      return data as TeamRoleDefinition[];
    },
  });
}

// Operations Metrics
export function useOperationsMetrics() {
  return useQuery({
    queryKey: ['operations-metrics'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get today's stats
      const [
        { count: todayBookings },
        { count: failedBookings },
        { count: openTickets },
        { count: urgentTickets },
        { count: openIncidents },
      ] = await Promise.all([
        supabase.from('travel_orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('travel_orders').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', today),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'pending', 'in_progress']),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'urgent').in('status', ['open', 'pending']),
        supabase.from('incident_logs').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating', 'mitigating']),
      ]);

      return {
        todayBookings: todayBookings || 0,
        failedBookings: failedBookings || 0,
        failedRate: todayBookings ? ((failedBookings || 0) / todayBookings * 100).toFixed(1) : '0',
        openTickets: openTickets || 0,
        urgentTickets: urgentTickets || 0,
        openIncidents: openIncidents || 0,
      };
    },
  });
}
