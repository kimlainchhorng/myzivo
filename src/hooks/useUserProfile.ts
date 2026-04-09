import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  cover_url: string | null;
  cover_position: number | null;
  status: string | null;
  bio: string | null;
  // Social links
  social_facebook: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_snapchat: string | null;
  social_x: string | null;
  social_linkedin: string | null;
  social_telegram: string | null;
  social_links_visible: boolean | null;
  // Interaction controls
  comment_control: string | null;
  hide_like_counts: boolean | null;
  allow_mentions: boolean | null;
  allow_sharing: boolean | null;
  allow_friend_requests: boolean | null;
  hide_from_drivers: boolean | null;
  profile_visibility: string | null;
  created_at: string;
  updated_at: string;
};

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, "full_name" | "phone" | "avatar_url" | "cover_url" | "cover_position" | "comment_control" | "hide_like_counts" | "allow_mentions" | "allow_sharing" | "allow_friend_requests" | "hide_from_drivers" | "profile_visibility" | "social_facebook" | "social_instagram" | "social_tiktok" | "social_snapchat" | "social_x" | "social_linkedin" | "social_telegram" | "social_links_visible">>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: existing, error: existingError } = await supabase
        .from("profiles")
        .select("id, user_id")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...updates,
            user_id: user.id,
            email: user.email,
          })
          .eq("id", existing.id);

        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          user_id: user.id,
          email: user.email,
          ...updates,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Not authenticated");

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a JPG, PNG, or WebP image");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { data: existing, error: existingError } = await supabase
        .from("profiles")
        .select("id, user_id")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl,
            user_id: user.id,
            email: user.email,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            user_id: user.id,
            email: user.email,
            avatar_url: publicUrl,
          });

        if (error) throw error;
      }

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      toast.success("Avatar updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};