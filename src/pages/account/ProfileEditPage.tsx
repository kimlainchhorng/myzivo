import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Camera, ArrowLeft, Mail, Phone, Loader2, Save, Sparkles,
  AlertCircle, CheckCircle2, Lock, Unlock, Users, Eye, EyeOff, Car,
  Link2, Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";
import { CountryPhoneInput } from "@/components/auth/CountryPhoneInput";
import { PhoneVerificationDialog } from "@/components/account/PhoneVerificationDialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "Too long").optional().or(z.literal("")),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Too long").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone number too long").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneRequired = (location.state as any)?.phoneRequired === true;
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailChanging, setEmailChanging] = useState(false);

  // Phone verification state
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<ProfileFormData | null>(null);

  const parsedFirst = profile?.full_name?.split(" ").slice(0, 1).join(" ") || "";
  const parsedLast = profile?.full_name?.split(" ").slice(1).join(" ") || "";

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "", phone: "" },
    values: {
      first_name: parsedFirst,
      last_name: parsedLast,
      phone: profile?.phone || "",
    },
  });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      await uploadAvatar.mutateAsync(file);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarPreview(null);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const phoneChanged = (data.phone || "") !== (profile?.phone || "");
    const hasNewPhone = !!data.phone?.trim();
    if (phoneChanged && hasNewPhone) {
      setPendingProfileData(data);
      setShowPhoneVerify(true);
      return;
    }
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    await updateProfile.mutateAsync({ full_name: fullName, phone: data.phone || null });
  };

  const handlePhoneVerified = async () => {
    if (!pendingProfileData) return;
    const fullName = [pendingProfileData.first_name, pendingProfileData.last_name].filter(Boolean).join(" ") || null;
    await updateProfile.mutateAsync({ full_name: fullName, phone: pendingProfileData.phone || null });
    setPendingProfileData(null);
  };

  const handleEmailChangeRequest = async () => {
    if (!newEmail || newEmail === user?.email) return;
    setEmailChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailOtpSent(true);
      toast.success("Verification email sent to " + newEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification");
    } finally {
      setEmailChanging(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile Information</h1>
        </div>
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="p-4 max-w-lg mx-auto space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-3 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-xl opacity-15" />
              <Avatar className="relative h-24 w-24 ring-[3px] ring-primary/30 shadow-2xl">
                <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={uploadAvatar.isPending}
                className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-xl ring-2 ring-background disabled:opacity-50"
              >
                {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="flex items-center gap-1.5 font-semibold text-[13px]">
                      <User className="h-3.5 w-3.5 text-primary" />First Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="First name" className="h-12 rounded-2xl bg-muted/15 border-border/30 text-[15px] font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="flex items-center gap-1.5 font-semibold text-[13px]">
                      <User className="h-3.5 w-3.5 text-primary" />Last Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" className="h-12 rounded-2xl bg-muted/15 border-border/30 text-[15px] font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[13px] font-semibold">
                  <Mail className="h-3.5 w-3.5 text-primary" />{t("profile.email")}
                </label>
                {!emailEditMode ? (
                  <div className="relative">
                    <Input value={user?.email || ""} disabled className="h-12 rounded-2xl bg-muted/10 border-border/20 text-muted-foreground pr-24 text-[15px]" />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { setEmailEditMode(true); setNewEmail(user?.email || ""); }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold text-primary bg-primary/8 hover:bg-primary/15 border border-primary/15 transition-all duration-200"
                    >
                      Change
                    </motion.button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {!emailOtpSent ? (
                        <div className="space-y-2.5">
                          <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                            autoFocus
                            className="h-12 rounded-2xl bg-muted/15 border-border/30 text-[15px] font-medium"
                          />
                          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            A verification link will be sent to your new email
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleEmailChangeRequest}
                              disabled={emailChanging || !newEmail || newEmail === user?.email}
                              className="flex-1 h-11 rounded-2xl font-bold text-sm"
                            >
                              {emailChanging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                              Verify Email
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => { setEmailEditMode(false); setNewEmail(""); }}
                              className="h-11 rounded-2xl text-muted-foreground px-4"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 rounded-2xl bg-primary/[0.04] border border-primary/10 p-4">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">Verification sent!</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Check <span className="font-medium text-foreground">{newEmail}</span> and click the link to confirm.</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setEmailEditMode(false); setEmailOtpSent(false); setNewEmail(""); setEmailOtp(""); }}
                            className="w-full h-10 rounded-2xl border-border/30 text-sm font-semibold"
                          >
                            Done
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Phone Required Banner */}
              {phoneRequired && !form.watch("phone")?.trim() && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-destructive">{t("profile.phone_required_title")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.phone_required_desc")}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="flex items-center gap-2 font-semibold text-[13px]">
                    <Phone className="h-3.5 w-3.5 text-primary" />{t("profile.phone")}
                  </FormLabel>
                  <FormControl>
                    <CountryPhoneInput value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Save */}
              <Button
                type="submit"
                className="w-full h-13 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-xl shadow-primary/30"
                disabled={updateProfile.isPending || !form.formState.isDirty}
              >
                {updateProfile.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />{t("profile.saving")}</>
                ) : (
                  <><Save className="h-5 w-5 mr-2" />{t("profile.save")}</>
                )}
              </Button>
            </form>
          </Form>

          {/* Profile Privacy Controls */}
          <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Profile Visibility
            </h3>

            {/* Visibility Options */}
            <div className="space-y-2">
              {([
                { value: "public", label: "Public", desc: "Anyone can view your profile", icon: Unlock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
                { value: "friends_only", label: "Friends Only", desc: "Only friends can see your profile", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
                { value: "private", label: "Private", desc: "Nobody can see your profile", icon: Lock, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
              ] as const).map((opt) => {
                const current = (profile as any)?.profile_visibility || "public";
                const isActive = current === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={updateProfile.isPending}
                    onClick={async () => {
                      if (isActive) return;
                      try {
                        await updateProfile.mutateAsync({ profile_visibility: opt.value } as any);
                      } catch {}
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isActive
                        ? `${opt.bg} ${opt.border} border`
                        : "border-border/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-full ${opt.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {isActive && (
                      <div className={`h-5 w-5 rounded-full ${opt.bg} flex items-center justify-center`}>
                        <CheckCircle2 className={`h-4 w-4 ${opt.color}`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hide from Drivers/Shops */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted/20 flex items-center justify-center">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Hide from Drivers & Shops</p>
                  <p className="text-[11px] text-muted-foreground">Drivers and shops can't view your profile</p>
                </div>
              </div>
              <Switch
                checked={!!(profile as any)?.hide_from_drivers}
                onCheckedChange={async (checked) => {
                  try {
                    await updateProfile.mutateAsync({ hide_from_drivers: checked } as any);
                  } catch {}
                }}
                disabled={updateProfile.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Dialog */}
      {pendingProfileData?.phone && (
        <PhoneVerificationDialog
          open={showPhoneVerify}
          onOpenChange={setShowPhoneVerify}
          phoneNumber={pendingProfileData.phone}
          onVerified={handlePhoneVerified}
        />
      )}
    </div>
  );
}
