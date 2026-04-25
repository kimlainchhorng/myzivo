/**
 * Business Page Wizard — friendly 5-step flow for already-signed-in Zivo users
 * to create a Business Page and land in the right partner dashboard.
 *
 * Steps:
 *   1) Business basics (name, phone, email)
 *   2) Business type   (drives which dashboard they end up in)
 *   3) Contact person  (first/last name, phone, email — prefilled)
 *   4) Profile photo   (optional, Skip allowed)
 *   5) Cover photo     (optional, Skip allowed)
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Briefcase, Building2, User, Image as ImageIcon,
  Camera, CheckCircle2, Loader2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isLodgingStoreCategory } from "@/hooks/useOwnerStoreProfile";
import { STORE_CATEGORY_OPTIONS, type StoreCategory } from "@/config/groceryStores";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEP_COUNT = 5;

const formatPhone = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `biz-${Date.now()}`;

const RESTAURANT_CATS = new Set<StoreCategory>(["restaurant", "cafe", "bakery", "drink"]);

type Step = 1 | 2 | 3 | 4 | 5;

export default function BusinessPageWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Step 1
  const [bizName, setBizName] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");

  // Step 2
  const [category, setCategory] = useState<StoreCategory | "">("");

  // Step 3
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Step 4 / 5
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // Auth gate + redirect already-completed owners
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("store_profiles")
        .select("id, category, setup_complete")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (data?.setup_complete) {
        const lodging = isLodgingStoreCategory(data.category);
        navigate(`/admin/stores/${data.id}${lodging ? "?tab=lodge-overview" : ""}`, { replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [user, navigate]);

  // Prefill contact step from profile
  useEffect(() => {
    if (!user) return;
    const full = profile?.full_name || (user.user_metadata?.full_name as string) || "";
    const [f, ...rest] = full.trim().split(/\s+/);
    if (!firstName && f) setFirstName(f);
    if (!lastName && rest.length) setLastName(rest.join(" "));
    if (!contactEmail) setContactEmail(profile?.email || user.email || "");
    if (!contactPhone && profile?.phone) setContactPhone(formatPhone(profile.phone));
    if (!bizEmail) setBizEmail(profile?.email || user.email || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user]);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, typeof STORE_CATEGORY_OPTIONS> = {};
    for (const opt of STORE_CATEGORY_OPTIONS) {
      const g = opt.group || "Other";
      (groups[g] ||= []).push(opt);
    }
    return groups;
  }, []);

  const uploadAsset = async (file: File, kind: "logo" | "banner") => {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    const setBusy = kind === "logo" ? setUploadingLogo : setUploadingBanner;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `setup/${user.id}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("store-assets")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
      if (kind === "logo") setLogoUrl(data.publicUrl);
      else setBannerUrl(data.publicUrl);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1:
        return bizName.trim().length >= 2 && bizPhone.replace(/\D/g, "").length >= 7 && /\S+@\S+\.\S+/.test(bizEmail);
      case 2:
        return !!category;
      case 3:
        return firstName.trim().length >= 1 && lastName.trim().length >= 1 && /\S+@\S+\.\S+/.test(contactEmail) && contactPhone.replace(/\D/g, "").length >= 7;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (step < STEP_COUNT) setStep((s) => (s + 1) as Step);
  };
  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleComplete = async () => {
    if (!user || !category) return;
    setSubmitting(true);
    try {
      // Update profile contact info
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          phone: contactPhone.replace(/\D/g, "") || null,
        })
        .eq("user_id", user.id);

      // Upsert store profile
      const slug = slugify(bizName);
      const payload: Record<string, any> = {
        owner_id: user.id,
        name: bizName.trim(),
        slug,
        category,
        phone: bizPhone.replace(/\D/g, "") || null,
        email: bizEmail.trim() || null,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        setup_complete: true,
      };

      const { data: existing } = await supabase
        .from("store_profiles")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      let storeId = existing?.id as string | undefined;
      if (storeId) {
        const { error } = await supabase.from("store_profiles").update(payload).eq("id", storeId);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("store_profiles")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        storeId = data.id;
      }

      // Restaurant branch — also seed restaurants row if none exists
      if (RESTAURANT_CATS.has(category)) {
        const { data: existingRest } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (!existingRest) {
          await supabase.from("restaurants").insert({
            owner_id: user.id,
            name: bizName.trim(),
            phone: bizPhone.replace(/\D/g, "") || null,
            email: bizEmail.trim() || null,
            logo_url: logoUrl,
            banner_url: bannerUrl,
          } as any);
        }
        toast.success("Business page created");
        navigate("/restaurant/dashboard", { replace: true });
        return;
      }

      toast.success("Business page created");
      const lodging = isLodgingStoreCategory(category);
      navigate(`/admin/stores/${storeId}${lodging ? "?tab=lodge-overview" : ""}`, { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Could not save your business page");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button
          onClick={() => (step === 1 ? navigate(-1) : goBack())}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">Step {step} of {STEP_COUNT}</p>
          <h1 className="text-base font-bold text-foreground">Business Page</h1>
        </div>
      </header>

      {/* Progress */}
      <div className="flex gap-1.5 px-4 pt-3">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {step === 1 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Business basics</h2>
                    <p className="text-sm text-muted-foreground">Tell us about your business.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bizName">Full business name</Label>
                    <Input
                      id="bizName"
                      placeholder="e.g. Sunrise Coffee Co."
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bizPhone">Business phone number</Label>
                    <Input
                      id="bizPhone"
                      inputMode="tel"
                      placeholder="(555) 123-4567"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(formatPhone(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bizEmail">Business email</Label>
                    <Input
                      id="bizEmail"
                      type="email"
                      placeholder="hello@yourbusiness.com"
                      value={bizEmail}
                      onChange={(e) => setBizEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Set type of business</h2>
                    <p className="text-sm text-muted-foreground">
                      We'll route you to the right dashboard.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  {Object.entries(groupedCategories).map(([group, opts]) => (
                    <div key={group}>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {group}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {opts.map((opt) => {
                          const active = category === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setCategory(opt.value)}
                              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95 ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-card text-foreground hover:border-primary/40"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Contact person</h2>
                    <p className="text-sm text-muted-foreground">Who should we reach out to?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      inputMode="tel"
                      placeholder="(555) 123-4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Profile photo</h2>
                    <p className="text-sm text-muted-foreground">Add a logo. You can skip and add it later.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : uploadingLogo ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl(null)}
                        className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInput.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoUrl ? "Change photo" : "Upload photo"}
                  </Button>
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAsset(f, "logo");
                    }}
                  />
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Cover photo</h2>
                    <p className="text-sm text-muted-foreground">Add a banner. You can skip and add it later.</p>
                  </div>
                </div>
                <div className="space-y-4 py-2">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {uploadingBanner ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    {bannerUrl && (
                      <button
                        onClick={() => setBannerUrl(null)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bannerInput.current?.click()}
                      disabled={uploadingBanner}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {bannerUrl ? "Change cover" : "Upload cover"}
                    </Button>
                  </div>
                  <input
                    ref={bannerInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAsset(f, "banner");
                    }}
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky action bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div className="mx-auto flex w-full max-w-xl items-center gap-3">
          {step > 1 && (
            <Button variant="outline" className="h-12 flex-1" onClick={goBack} disabled={submitting}>
              Back
            </Button>
          )}
          {(step === 4 || step === 5) && (
            <Button
              variant="ghost"
              className="h-12 flex-1"
              onClick={step === 5 ? handleComplete : goNext}
              disabled={submitting}
            >
              Skip
            </Button>
          )}
          {step < STEP_COUNT ? (
            <Button
              className="h-12 flex-1"
              onClick={goNext}
              disabled={!canContinue() || submitting}
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="h-12 flex-1"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Go to dashboard
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
