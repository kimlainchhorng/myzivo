/**
 * Setup Page — Collects profile picture, cover photo, first name, last name, and phone after signup.
 * Requires phone verification via Twilio Verify before completing.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { User, ArrowRight, ArrowLeft, Loader2, Camera, ImagePlus } from "lucide-react";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { PhoneVerificationDialog } from "@/components/account/PhoneVerificationDialog";
import { normalizePhoneDigits, normalizePhoneE164 } from "@/lib/phone";

const setupSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50),
  last_name: z.string().trim().min(1, "Last name is required").max(50),
  phone: z.string().trim().refine((value) => {
    const digits = normalizePhoneDigits(value);
    return digits.length >= 7 && digits.length <= 15;
  }, "Please enter a valid phone number"),
});

type SetupValues = z.infer<typeof setupSchema>;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Setup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [pendingData, setPendingData] = useState<SetupValues | null>(null);
  const [checking, setChecking] = useState(true);

  // Image state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
    },
  });

  // Fetch existing profile data — redirect if already set up, otherwise pre-fill
  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, setup_complete, avatar_url, cover_url")
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle();

        if (profile?.setup_complete) {
          toast.info("Your profile is already set up.");
          navigate("/", { replace: true });
          return;
        }

        // Pre-fill from profile or user metadata
        const meta = user.user_metadata || {};
        const fullName = profile?.full_name || meta.full_name || "";
        const firstName = fullName.split(" ")[0] || "";
        const lastName = fullName.split(" ").slice(1).join(" ") || "";
        const phone = profile?.phone || meta.phone || "";

        if (firstName) form.setValue("first_name", firstName, { shouldValidate: true });
        if (lastName) form.setValue("last_name", lastName, { shouldValidate: true });
        if (phone) form.setValue("phone", phone, { shouldValidate: true });

        if (profile?.avatar_url) setAvatarPreview(profile.avatar_url);
        if (profile?.cover_url) setCoverPreview(profile.cover_url);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setChecking(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

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
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  const uploadImage = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${folder}/${bucket}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const onSubmit = async (data: SetupValues) => {
    if (!user) return;
    setPendingData(data);
    setShowVerifyDialog(true);
  };

  const handlePhoneVerified = async () => {
    if (!user || !pendingData) return;
    setSaving(true);

    try {
      const normalizedPhone = normalizePhoneE164(pendingData.phone);
      const fullName = [pendingData.first_name, pendingData.last_name].filter(Boolean).join(" ");

      // Upload images if selected
      let avatarUrl: string | undefined;
      let coverUrl: string | undefined;

      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadImage(avatarFile, "avatars", user.id);
        setUploadingAvatar(false);
      }

      if (coverFile) {
        setUploadingCover(true);
        coverUrl = await uploadImage(coverFile, "covers", user.id);
        setUploadingCover(false);
      }

      const profileUpdate: Record<string, unknown> = {
        full_name: fullName,
        phone: normalizedPhone,
        phone_e164: normalizedPhone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        setup_complete: true,
        user_id: user.id,
        email: user.email ?? null,
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
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Setup error:", err);
      toast.error(err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  if (checking) {
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
          {/* Cover Photo */}
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
            {uploadingCover && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Avatar — overlapping the cover */}
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
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Form content */}
          <div className="px-6 pb-6 pt-3 sm:px-8 sm:pb-8">
            {/* Header */}
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
                <h1 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h1>
                <p className="text-white/50 text-sm mt-1">Just a few details to get started</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            {...field}
                            placeholder="First name"
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            {...field}
                            placeholder="Last name"
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Phone Number</FormLabel>
                      <FormControl>
                        <div>
                          <CountryPhoneInput
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
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
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Phone Verification Dialog */}
      {pendingData && (
        <PhoneVerificationDialog
          open={showVerifyDialog}
          onOpenChange={setShowVerifyDialog}
          phoneNumber={pendingData.phone}
          onVerified={handlePhoneVerified}
        />
      )}
    </div>
  );
}
