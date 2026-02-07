import { supabase } from "@/integrations/supabase/client";
import { upsertDriverProfileWithRetry } from "./supabaseDriverOperations";

// Check if Supabase is properly configured and accessible
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("drivers").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Upsert driver profile from auth user - now with retry
export const upsertDriverProfile = async (userId: string, email: string): Promise<string | null> => {
  const result = await upsertDriverProfileWithRetry(userId, email);
  
  if (result.error) {
    console.error("Failed to upsert driver profile:", result.error.message);
    return null;
  }
  
  return result.data?.id ?? null;
};

// Update driver location with fallback handling (legacy - use updateLocationWithRetry directly)
export const updateDriverLocation = async (
  driverId: string,
  lat: number,
  lng: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("drivers")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    return !error;
  } catch {
    return false;
  }
};

// Update driver profile fields
export const updateDriverProfile = async (
  driverId: string,
  updates: {
    full_name?: string;
    phone?: string;
    vehicle_model?: string;
    vehicle_plate?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("drivers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    return !error;
  } catch {
    return false;
  }
};