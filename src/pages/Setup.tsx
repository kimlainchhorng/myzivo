/**
 * Setup Page — Collects first name, last name, and phone after signup.
 * Requires phone verification via Twilio Verify before completing.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { User, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
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

export default function Setup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [pendingData, setPendingData] = useState<SetupValues | null>(null);
  const [checking, setChecking] = useState(true);

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
          .select("full_name, phone, setup_complete")
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

        const current = form.getValues();
        if (!current.first_name && firstName) form.setValue("first_name", firstName);
        if (!current.last_name && lastName) form.setValue("last_name", lastName);
        if (!current.phone && phone) form.setValue("phone", phone);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setChecking(false);
      }
    };

    loadProfile();
  }, [user, form, navigate]);

  const onSubmit = async (data: SetupValues) => {
    if (!user) return;
    // Store form data and open phone verification dialog
    setPendingData(data);
    setShowVerifyDialog(true);
  };

  const handlePhoneVerified = async () => {
    if (!user || !pendingData) return;
    setSaving(true);

    try {
      const normalizedPhone = normalizePhoneE164(pendingData.phone);
      const fullName = [pendingData.first_name, pendingData.last_name].filter(Boolean).join(" ");
      const profileUpdate = {
        full_name: fullName,
        phone: normalizedPhone,
        phone_e164: normalizedPhone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        setup_complete: true,
      };

      const { data: updatedRows, error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .select("id")
        .limit(1);

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            user_id: user.id,
            email: user.email ?? null,
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d2137] px-4">
      <div className="w-full max-w-md">
        <div className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-3xl p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-4 transition-colors"
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
