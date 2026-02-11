/**
 * ZivoOnboarding Setup Page
 * Premium onboarding flow with auto-skip for completed users
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Check, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Setup = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Auto-check: if profile is complete, skip to home
  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // FIXED: Use user_id column, not id
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, setup_complete")
          .eq("user_id", user.id)
          .maybeSingle();

        // If setup is already complete, redirect immediately
        if (profile?.setup_complete) {
          navigate("/", { replace: true });
          return;
        }

        // Prefill name from profile or user metadata
        if (profile?.full_name) {
          setFullName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [authLoading, user, navigate]);

  const handleComplete = async () => {
    if (!agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!user?.id) {
      toast.error("Not authenticated");
      return;
    }

    setSubmitting(true);

    try {
      // Capture affiliate code from sessionStorage if present
      const affiliateCode = sessionStorage.getItem("signup_affiliate_code");

      // Upsert profile in one call to avoid race conditions with the profile-creation trigger
      // (select→insert can fail if the trigger creates the row between calls).
      //
      // Note: the generated Supabase types for this project incorrectly require `id` for upsert.
      // We upsert by the UNIQUE `user_id` key, so we intentionally omit `id`.
      const payload = {
        user_id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone || null,
        setup_complete: true,
        updated_at: new Date().toISOString(),
        // Affiliate tracking - only set if code exists (don't overwrite existing attribution)
        ...(affiliateCode && {
          affiliate_code: affiliateCode,
          affiliate_captured_at: new Date().toISOString(),
        }),
      } as any;

      // Clear affiliate code from sessionStorage after use
      if (affiliateCode) {
        sessionStorage.removeItem("signup_affiliate_code");
      }

      const { error } = await supabase
        .from("profiles")
        .upsert([payload], {
          // profiles.user_id is expected to be UNIQUE in this project
          onConflict: "user_id",
        });

      if (error) throw error;

      // Invalidate queries so the app reflects the new state
      queryClient.invalidateQueries({ queryKey: ["setupStatus", user.id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });

      toast.success("You're all set!");

      // Route to home (no hard reload)
      navigate("/", { replace: true });
      return;
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to complete setup");
      setSubmitting(false);
    }
  };

  // Loading state: verifying profile
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-zinc-500 font-medium">Verifying profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">

        {/* Progress pill */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
            Step 1 of 1
          </span>
        </div>
        
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-black text-center text-zinc-900">
          Welcome to ZIVO{fullName ? `, ${fullName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-center text-zinc-500 -mt-4">One last step before you fly.</p>

        {/* Form */}
        <div className="space-y-5 pt-4">
          
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Full Name *</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-4 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Phone Number</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-4 font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-3 pt-2 cursor-pointer group w-full text-left select-none"
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              agreed 
                ? "bg-blue-500 border-blue-500" 
                : "border-zinc-300 group-hover:border-blue-400"
            }`}>
              {agreed && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm text-zinc-600">
              I agree to the{" "}
              <a href="/terms" target="_blank" className="text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                Terms of Service
              </a>
            </span>
          </button>

        </div>

        {/* Button */}
        <button
          onClick={handleComplete}
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Setup;
