import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type JobType = "ride" | "food_delivery" | "package";
export type JobStatus = "requested" | "assigned" | "arrived" | "in_progress" | "completed" | "cancelled";

export interface Job {
  id: string;
  job_type: JobType;
  status: JobStatus;
  customer_id: string;
  pickup_address: string | null;
  dropoff_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  assigned_driver_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number | null;
  recorded_at: string;
}

export interface CreateJobData {
  job_type: JobType;
  pickup_address: string;
  dropoff_address: string;
  notes?: string;
}

export interface DispatchResult {
  success: boolean;
  message: string;
  driver_count?: number;
}

// Call the redispatch-loop edge function for a job
export const dispatchJob = async (jobId: string): Promise<DispatchResult> => {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(
    `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/redispatch-loop`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`,
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI",
      },
      body: JSON.stringify({
        job_id: jobId,
        max_attempts: 4,
        base_max_drivers: 3,
        offer_ttl_seconds: 25,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Dispatch failed" }));
    throw new Error(err.error || "Dispatch failed");
  }

  return res.json();
};

export const useCreateJob = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          job_type: data.job_type,
          customer_id: user.id,
          pickup_address: data.pickup_address,
          dropoff_address: data.dropoff_address,
          notes: data.notes || null,
          status: "requested",
        } as any)
        .select()
        .single();

      if (error) throw error;

      const created = job as unknown as Job;

      // Immediately call auto-dispatch
      try {
        await dispatchJob(created.id);
      } catch (e) {
        console.warn("[useCreateJob] Auto-dispatch call failed, will retry:", e);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => {
      toast.error("Failed to create job: " + err.message);
    },
  });
};

export const useJobRealtime = (jobId: string | null) => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setIsLoading(true);
    supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setJob(data as unknown as Job);
        setIsLoading(false);
      });
  }, [jobId]);

  // Realtime subscription
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as unknown as Job);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const clearJob = useCallback(() => {
    setJob(null);
  }, []);

  return { job, isLoading, clearJob };
};
