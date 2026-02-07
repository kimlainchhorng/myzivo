import { supabase } from "@/integrations/supabase/client";

// Check if Supabase is properly configured and accessible
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("drivers").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Upsert driver profile from auth user
export const upsertDriverProfile = async (userId: string, email: string): Promise<string | null> => {
  try {
    // Check if driver already exists
    const { data: existing } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new driver profile with defaults
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        user_id: userId,
        full_name: email.split("@")[0],
        email: email,
        phone: "",
        license_number: "PENDING",
        vehicle_type: "sedan",
        vehicle_plate: "PENDING",
        rating: 4.8,
        is_online: false,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create driver profile:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (error) {
    console.error("Error upserting driver profile:", error);
    return null;
  }
};

// Update driver location with fallback handling
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
