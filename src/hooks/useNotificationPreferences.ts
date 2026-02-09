/**
 * useNotificationPreferences Hook
 * Manages user notification preferences for push, SMS, and email channels
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  marketingEnabled: boolean;
  operationalEnabled: boolean;
  phoneNumber: string | null;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawNotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  marketing_enabled: boolean;
  operational_enabled: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

function mapToPreferences(raw: RawNotificationPreferences): NotificationPreferences {
  return {
    id: raw.id,
    userId: raw.user_id,
    emailEnabled: raw.email_enabled,
    smsEnabled: raw.sms_enabled,
    inAppEnabled: raw.in_app_enabled,
    marketingEnabled: raw.marketing_enabled,
    operationalEnabled: raw.operational_enabled,
    phoneNumber: raw.phone_number,
    phoneVerified: raw.phone_verified,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function useNotificationPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async (): Promise<NotificationPreferences | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching notification preferences:", error);
        throw error;
      }

      if (!data) return null;
      return mapToPreferences(data as RawNotificationPreferences);
    },
    enabled: !!user?.id,
  });
}

export interface UpdatePreferencesInput {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  marketingEnabled?: boolean;
  operationalEnabled?: boolean;
  phoneNumber?: string | null;
}

export function useUpdateNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdatePreferencesInput): Promise<NotificationPreferences> => {
      if (!user?.id) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.emailEnabled !== undefined) updateData.email_enabled = updates.emailEnabled;
      if (updates.smsEnabled !== undefined) updateData.sms_enabled = updates.smsEnabled;
      if (updates.inAppEnabled !== undefined) updateData.in_app_enabled = updates.inAppEnabled;
      if (updates.marketingEnabled !== undefined) updateData.marketing_enabled = updates.marketingEnabled;
      if (updates.operationalEnabled !== undefined) updateData.operational_enabled = updates.operationalEnabled;
      if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;

      // Check if preferences exist
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let result;

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("notification_preferences")
          .update(updateData)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new with defaults
        const { data, error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            email_enabled: updates.emailEnabled ?? true,
            sms_enabled: updates.smsEnabled ?? false,
            in_app_enabled: updates.inAppEnabled ?? true,
            marketing_enabled: updates.marketingEnabled ?? false,
            operational_enabled: updates.operationalEnabled ?? true,
            phone_number: updates.phoneNumber ?? null,
            phone_verified: false,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Also sync sms_consent to profiles
      if (updates.smsEnabled !== undefined) {
        await supabase
          .from("profiles")
          .update({ sms_consent: updates.smsEnabled })
          .eq("user_id", user.id);
      }

      return mapToPreferences(result as RawNotificationPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
}

export function useSendPhoneOTP() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (phoneE164: string): Promise<{ success: boolean; message: string }> => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("send-otp-sms", {
        body: { phone_e164: phoneE164, user_id: user.id },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to send OTP");

      return { success: true, message: data.message || "OTP sent successfully" };
    },
    onSuccess: () => {
      toast.success("Verification code sent to your phone");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyPhoneOTP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phoneE164,
      code,
    }: {
      phoneE164: string;
      code: string;
    }): Promise<{ success: boolean }> => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("verify-otp-sms", {
        body: { phone_e164: phoneE164, code, user_id: user.id },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Invalid code");

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Phone number verified successfully! 🎉");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("phone, phone_e164, phone_verified, email")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
