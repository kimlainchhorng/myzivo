/**
 * VerificationRequestPage — Apply for verified badge
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Upload, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function VerificationRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("personal");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existingRequest } = useQuery({
    queryKey: ["verification-request", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase as any)
        .from("verification_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const submit = async () => {
    if (!user || !fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("verification_requests").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      category,
      additional_info: additionalInfo.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit request");
    } else {
      toast.success("Verification request submitted!");
      navigate(-1);
    }
  };

  const categories = [
    { value: "personal", label: "Personal", desc: "Public figure, athlete, influencer" },
    { value: "business", label: "Business", desc: "Brand, company, organization" },
    { value: "creator", label: "Creator", desc: "Artist, musician, content creator" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Request Verification</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Existing request status */}
        {existingRequest && (
          <div className={cn(
            "p-4 rounded-2xl border",
            existingRequest.status === "pending" && "bg-amber-500/5 border-amber-500/20",
            existingRequest.status === "approved" && "bg-emerald-500/5 border-emerald-500/20",
            existingRequest.status === "rejected" && "bg-destructive/5 border-destructive/20"
          )}>
            <div className="flex items-center gap-2 mb-1">
              {existingRequest.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
              {existingRequest.status === "approved" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {existingRequest.status === "rejected" && <XCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm font-medium capitalize">{existingRequest.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {existingRequest.status === "pending" && "Your request is being reviewed"}
              {existingRequest.status === "approved" && "Congratulations! You're verified"}
              {existingRequest.status === "rejected" && (existingRequest.rejection_reason || "Request was not approved")}
            </p>
          </div>
        )}

        {/* Badge preview */}
        <div className="text-center py-6">
          <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Verified Badge</h2>
          <p className="text-sm text-muted-foreground mt-1">Verify your identity to get a blue badge on your profile</p>
        </div>

        {/* Category */}
        <section>
          <h3 className="text-sm font-medium text-foreground mb-2">Category</h3>
          <div className="space-y-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                  category === c.value ? "bg-primary/10 border-primary/30" : "bg-card border-border/40"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Full name */}
        <section>
          <label className="text-sm font-medium text-foreground">Full Legal Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full mt-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </section>

        {/* Additional info */}
        <section>
          <label className="text-sm font-medium text-foreground">Why should you be verified?</label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Tell us about yourself, links to press coverage, etc."
            rows={3}
            className="w-full mt-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </section>

        <Button onClick={submit} disabled={submitting || existingRequest?.status === "pending"} className="w-full rounded-xl">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}
