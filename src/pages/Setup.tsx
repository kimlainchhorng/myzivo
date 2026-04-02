/**
 * Setup Page — Profile picture & cover photo upload after signup.
 * Name and phone are already collected during registration.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, ArrowRight, ArrowLeft, Loader2, Camera, ImagePlus } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Setup() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  // Image state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (authLoading) return;

      if (!user) {
        if (isActive) setChecking(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("setup_complete, avatar_url, cover_url")
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle();

        if (!isActive) return;

        if (profile?.setup_complete) {
          navigate("/", { replace: true });
          return;
        }

        if (profile?.avatar_url) setAvatarPreview(profile.avatar_url);
        if (profile?.cover_url) setCoverPreview(profile.cover_url);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (isActive) setChecking(false);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [authLoading, user, navigate]);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
      return;
    }

    setCoverFile(file);
    setCoverPreview(previewUrl);
  };

  const uploadImage = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${folder}/${bucket}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  };

  const persistSetup = async ({
    includeUploads,
    redirectTo,
  }: {
    includeUploads: boolean;
    redirectTo: string;
  }) => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      let avatarUrl: string | undefined;
      let coverUrl: string | undefined;

      if (includeUploads && avatarFile) {
        avatarUrl = await uploadImage(avatarFile, "avatars", user.id);
      }

      if (includeUploads && coverFile) {
        coverUrl = await uploadImage(coverFile, "covers", user.id);
      }

      const metadata = user.user_metadata ?? {};
      const fullName = typeof metadata.full_name === "string" ? metadata.full_name : null;
      const phone = typeof metadata.phone === "string" ? metadata.phone : null;

      const profileUpdate: Record<string, unknown> = {
        setup_complete: true,
        user_id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        phone,
      };

      if (avatarUrl) profileUpdate.avatar_url = avatarUrl;
      if (coverUrl) profileUpdate.cover_url = coverUrl;

      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("profiles")
        .select("id")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (existingProfileError) throw existingProfileError;

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", existingProfile.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            ...profileUpdate,
          });

        if (insertError) throw insertError;
      }

      toast.success("Account setup complete!");
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      console.error("Setup error:", err);
      toast.error(err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    await persistSetup({ includeUploads: true, redirectTo: "/" });
  };

  const handleSkip = async () => {
    await persistSetup({ includeUploads: false, redirectTo: "/profile" });
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2137]">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2137] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-3xl overflow-hidden">
          <div className="relative h-32 sm:h-36 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent overflow-hidden group">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <ImagePlus className="w-6 h-6 text-white/30 mx-auto mb-1" />
                  <span className="text-white/30 text-xs">Add cover photo</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors cursor-pointer"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageSelect(e, "cover")}
            />
          </div>

          <div className="relative flex justify-center -mt-12 z-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-[#0d2137] bg-white/10 overflow-hidden shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <User className="w-10 h-10 text-white/30" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1.5">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>

              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-lg border-2 border-[#0d2137]">
                <Camera className="w-3 h-3 text-primary-foreground" />
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleImageSelect(e, "avatar")}
              />
            </div>
          </div>

          <div className="px-6 pb-6 pt-3 sm:px-8 sm:pb-8">
            <div className="mb-5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Add Your Photos</h1>
                <p className="text-white/50 text-sm mt-1">Personalize your profile with a photo and cover</p>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={saving}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm mt-2 touch-manipulation active:scale-[0.98] transition-all"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="w-full text-center text-white/40 hover:text-white/60 text-sm mt-3 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
