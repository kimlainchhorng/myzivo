/**
 * Beta Launch Checklist Hooks
 * React Query hooks for managing the beta launch checklist and status
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BetaLaunchStatus, BetaChecklist, BetaLaunchState, CHECKLIST_DAYS } from "@/types/betaLaunch";

/**
 * Fetch current beta launch status
 */
export function useBetaLaunchStatus() {
  return useQuery({
    queryKey: ["betaLaunchStatus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beta_launch_status")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as unknown as BetaLaunchStatus;
    },
  });
}

/**
 * Fetch beta launch checklist
 */
export function useBetaChecklist() {
  return useQuery({
    queryKey: ["betaChecklist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beta_launch_checklist")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as unknown as BetaChecklist;
    },
  });
}

/**
 * Update a single checklist item
 */
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value,
      checklistId 
    }: { 
      key: string; 
      value: boolean;
      checklistId: string;
    }) => {
      const updateData: Record<string, unknown> = {
        [key]: value,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("beta_launch_checklist")
        .update(updateData)
        .eq("id", checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["betaChecklist"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update checklist");
    },
  });
}

/**
 * Mark a day as complete
 */
export function useMarkDayComplete() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      day,
      checklistId 
    }: { 
      day: number;
      checklistId: string;
    }) => {
      const dayConfig = CHECKLIST_DAYS.find(d => d.day === day);
      if (!dayConfig) throw new Error("Invalid day");

      const updateData: Record<string, unknown> = {
        [dayConfig.completedAtKey]: new Date().toISOString(),
        [dayConfig.completedByKey]: user?.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("beta_launch_checklist")
        .update(updateData)
        .eq("id", checklistId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["betaChecklist"] });
      toast.success(`Day ${variables.day} marked as complete`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark day complete");
    },
  });
}

/**
 * Update beta launch status
 */
export function useUpdateBetaStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      status,
      notes,
      statusId 
    }: { 
      status: BetaLaunchState;
      notes?: string;
      statusId: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      // Set appropriate timestamps based on status change
      if (status === 'beta_live') {
        updateData.activated_at = new Date().toISOString();
        updateData.activated_by = user?.id;
        updateData.paused_at = null;
        updateData.paused_by = null;
      } else if (status === 'paused') {
        updateData.paused_at = new Date().toISOString();
        updateData.paused_by = user?.id;
      }

      const { error } = await supabase
        .from("beta_launch_status")
        .update(updateData)
        .eq("id", statusId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["betaLaunchStatus"] });
      
      const statusMessages: Record<BetaLaunchState, string> = {
        not_ready: "Beta status reset to Not Ready",
        ready_for_beta: "Beta is now Ready for Launch",
        beta_live: "🚀 Beta is now LIVE!",
        paused: "⚠️ Beta has been PAUSED",
      };
      
      toast.success(statusMessages[variables.status]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update beta status");
    },
  });
}

/**
 * Calculate progress for a specific day
 */
export function getDayProgress(checklist: BetaChecklist | undefined, day: number) {
  if (!checklist) return { completed: 0, total: 0, isComplete: false };
  
  const dayConfig = CHECKLIST_DAYS.find(d => d.day === day);
  if (!dayConfig) return { completed: 0, total: 0, isComplete: false };

  const total = dayConfig.items.length;
  const completed = dayConfig.items.filter(
    item => checklist[item.key as keyof BetaChecklist] === true
  ).length;

  return {
    completed,
    total,
    isComplete: completed === total,
    completedAt: checklist[dayConfig.completedAtKey as keyof BetaChecklist] as string | null,
    completedBy: checklist[dayConfig.completedByKey as keyof BetaChecklist] as string | null,
  };
}

/**
 * Calculate overall progress
 */
export function getOverallProgress(checklist: BetaChecklist | undefined) {
  if (!checklist) return { completed: 0, total: 0, percentage: 0, allDaysComplete: false };

  let totalItems = 0;
  let completedItems = 0;
  let daysComplete = 0;

  CHECKLIST_DAYS.forEach(dayConfig => {
    const dayProgress = getDayProgress(checklist, dayConfig.day);
    totalItems += dayProgress.total;
    completedItems += dayProgress.completed;
    if (dayProgress.isComplete) daysComplete++;
  });

  return {
    completed: completedItems,
    total: totalItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    allDaysComplete: daysComplete === CHECKLIST_DAYS.length,
    daysComplete,
    totalDays: CHECKLIST_DAYS.length,
  };
}
