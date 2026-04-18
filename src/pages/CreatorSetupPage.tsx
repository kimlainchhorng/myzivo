/**
 * CreatorSetupPage — End-to-end monetization onboarding flow
 * Walks the creator through 6 setup steps with inline forms and real DB writes.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, UserCircle2,
  ShieldCheck, CreditCard, Crown, Heart, Rocket, Sparkles, Loader2,
  DollarSign, Gift, Store, PenTool,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type StepKey = "profile" | "verify" | "payout" | "tier" | "tips" | "launch";

const ACCENT = {
  profile: "hsl(263 70% 58%)",
  verify: "hsl(142 71% 45%)",
  payout: "hsl(38 92% 50%)",
  tier: "hsl(340 75% 55%)",
  tips: "hsl(199 89% 48%)",
  launch: "hsl(172 66% 50%)",
} as const;

export default function CreatorSetupPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: creator, refetch: refetchCreator } = useQuery({
    queryKey: ["creator-profile-setup", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tiers = [], refetch: refetchTiers } = useQuery({
    queryKey: ["setup-tiers", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_tiers")
        .select("*")
        .eq("creator_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ["setup-enrollments", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_program_enrollments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const steps = useMemo(() => ([
    {
      key: "profile" as StepKey,
      label: "Profile",
      title: "Complete your creator profile",
      desc: "A display name and bio help fans find and trust you.",
      icon: UserCircle2,
      done: !!(creator?.display_name && creator?.bio),
    },
    {
      key: "verify" as StepKey,
      label: "Verify",
      title: "Verify your identity",
      desc: "Required before you can withdraw earnings.",
      icon: ShieldCheck,
      done: !!creator?.is_verified,
    },
    {
      key: "payout" as StepKey,
      label: "Payout",
      title: "Set up your payout method",
      desc: "Where should we send your money?",
      icon: CreditCard,
      done: !!creator?.payout_method,
    },
    {
      key: "tier" as StepKey,
      label: "Tier",
      title: "Create a subscription tier",
      desc: "Set a monthly price and a list of perks.",
      icon: Crown,
      done: tiers.length > 0,
    },
    {
      key: "tips" as StepKey,
      label: "Tips",
      title: "Enable fan tips",
      desc: "Let viewers send one-time support.",
      icon: Heart,
      done: !!creator?.tips_enabled,
    },
    {
      key: "launch" as StepKey,
      label: "Launch",
      title: "Launch your first program",
      desc: "Pick at least one revenue stream to start.",
      icon: Rocket,
      done: enrollments.length > 0,
    },
  ]), [creator, tiers, enrollments]);

  const initialStep = (() => {
    const requested = params.get("step") as StepKey | null;
    if (requested && steps.some((s) => s.key === requested)) return requested;
    const firstUndone = steps.find((s) => !s.done);
    return firstUndone?.key ?? steps[0].key;
  })();

  const [active, setActive] = useState<StepKey>(initialStep);
  useEffect(() => { setActive(initialStep); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);
  const activeIndex = steps.findIndex((s) => s.key === active);
  const goNext = () => {
    const next = steps[activeIndex + 1];
    if (next) {
      setActive(next.key);
      setParams({ step: next.key });
    } else {
      toast.success("Setup complete! 🎉");
      navigate("/creator-dashboard");
    }
  };
  const goPrev = () => {
    const prev = steps[activeIndex - 1];
    if (prev) {
      setActive(prev.key);
      setParams({ step: prev.key });
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-32">
      <SEOHead title="Creator Setup – ZIVO" description="Set up your monetization on ZIVO." noIndex />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/85 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/creator-dashboard")} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold leading-tight">Monetization Setup</h1>
            <p className="text-[11px] text-muted-foreground">{completed}/{steps.length} complete · {pct}%</p>
          </div>
          <span className="text-xs font-extrabold" style={{ color: "hsl(142 71% 45%)" }}>{pct}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full"
            style={{ background: "linear-gradient(90deg, hsl(142 71% 45%), hsl(172 66% 50%))" }}
          />
        </div>
      </div>

      {/* Step rail */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {steps.map((s, i) => {
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                onClick={() => { setActive(s.key); setParams({ step: s.key }); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors touch-manipulation ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : s.done
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-card text-muted-foreground border-border/40"
                }`}
              >
                {s.done ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 text-center">{i + 1}</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="zivo-card-organic p-5"
          >
            {/* Step header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${ACCENT[active]}15`, color: ACCENT[active] }}
              >
                {(() => {
                  const Icon = steps[activeIndex].icon;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Step {activeIndex + 1} of {steps.length}
                </p>
                <h2 className="font-extrabold text-base leading-tight">{steps[activeIndex].title}</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">{steps[activeIndex].desc}</p>
              </div>
              {steps[activeIndex].done && (
                <span className="zivo-badge bg-emerald-500/15 text-emerald-600">
                  <Sparkles className="w-2.5 h-2.5" /> Done
                </span>
              )}
            </div>

            {active === "profile" && (
              <ProfileStep creator={creator} userId={user?.id} onSaved={async () => { await refetchCreator(); qc.invalidateQueries({ queryKey: ["creator-profile"] }); }} />
            )}
            {active === "verify" && (
              <VerifyStep verified={!!creator?.is_verified} />
            )}
            {active === "payout" && (
              <PayoutStep creator={creator} userId={user?.id} onSaved={async () => { await refetchCreator(); qc.invalidateQueries({ queryKey: ["creator-profile"] }); }} />
            )}
            {active === "tier" && (
              <TierStep tiers={tiers} userId={user?.id} onSaved={async () => { await refetchTiers(); }} />
            )}
            {active === "tips" && (
              <TipsStep enabled={!!creator?.tips_enabled} userId={user?.id} onSaved={async () => { await refetchCreator(); qc.invalidateQueries({ queryKey: ["creator-profile"] }); }} />
            )}
            {active === "launch" && (
              <LaunchStep enrollments={enrollments} userId={user?.id} onSaved={async () => { await refetchEnrollments(); }} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-5">
          <Button variant="ghost" size="sm" onClick={goPrev} disabled={activeIndex === 0} className="text-xs">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={goNext} size="sm" className="text-xs font-bold">
            {activeIndex === steps.length - 1 ? "Finish" : steps[activeIndex].done ? "Next" : "Skip for now"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================  STEP COMPONENTS  ========================= */

async function ensureCreatorRow(userId: string) {
  const { data: existing } = await (supabase as any)
    .from("creator_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return;
  await (supabase as any).from("creator_profiles").insert({ user_id: userId });
}

function ProfileStep({ creator, userId, onSaved }: any) {
  const [displayName, setDisplayName] = useState(creator?.display_name ?? "");
  const [bio, setBio] = useState(creator?.bio ?? "");
  const [category, setCategory] = useState(creator?.category ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!userId) return;
    if (!displayName.trim()) return toast.error("Display name is required");
    setSaving(true);
    try {
      await ensureCreatorRow(userId);
      const { error } = await (supabase as any)
        .from("creator_profiles")
        .update({ display_name: displayName.trim(), bio: bio.trim() || null, category: category.trim() || null })
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("Profile saved");
      await onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-bold">Display name *</Label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Alex Creator" maxLength={50} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-bold">Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Lifestyle, Gaming, Travel…" maxLength={40} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-bold">Bio</Label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell fans what you create" maxLength={250} rows={3} className="mt-1 resize-none" />
        <p className="text-[10px] text-muted-foreground mt-1 text-right">{bio.length}/250</p>
      </div>
      <Button onClick={save} disabled={saving} className="w-full font-bold">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save profile
      </Button>
    </div>
  );
}

function VerifyStep({ verified }: { verified: boolean }) {
  const navigate = useNavigate();
  if (verified) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="font-extrabold text-sm">You're verified ✓</p>
        <p className="text-[11px] text-muted-foreground mt-1">You can withdraw earnings any time.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-[11px] text-muted-foreground">
        Verification protects your account and is required by law for payouts. We'll ask for a government ID and a quick selfie.
      </div>
      <Button onClick={() => navigate("/account/verification")} className="w-full font-bold">
        <ShieldCheck className="w-4 h-4" /> Start verification
      </Button>
    </div>
  );
}

function PayoutStep({ creator, userId, onSaved }: any) {
  const [method, setMethod] = useState<string>(creator?.payout_method ?? "");
  const details = (creator?.payout_details as any) || {};
  const [bankName, setBankName] = useState(details.bank_name ?? "");
  const [accountLast4, setAccountLast4] = useState(details.account_last4 ?? "");
  const [paypalEmail, setPaypalEmail] = useState(details.paypal_email ?? "");
  const [saving, setSaving] = useState(false);

  const options = [
    { id: "bank", label: "Bank transfer", desc: "ACH / SEPA · 1-3 business days", icon: CreditCard },
    { id: "paypal", label: "PayPal", desc: "Instant · 2.9% fee", icon: DollarSign },
    { id: "wallet", label: "ZIVO Wallet", desc: "Free · use for in-app purchases", icon: Sparkles },
  ];

  const save = async () => {
    if (!userId || !method) return toast.error("Pick a payout method");
    let payload: any = {};
    if (method === "bank") {
      if (!bankName.trim() || !/^\d{4}$/.test(accountLast4)) return toast.error("Bank name and 4-digit account end required");
      payload = { bank_name: bankName.trim(), account_last4: accountLast4 };
    } else if (method === "paypal") {
      if (!/^\S+@\S+\.\S+$/.test(paypalEmail)) return toast.error("Valid PayPal email required");
      payload = { paypal_email: paypalEmail.trim() };
    }
    setSaving(true);
    try {
      await ensureCreatorRow(userId);
      const { error } = await (supabase as any)
        .from("creator_profiles")
        .update({ payout_method: method, payout_details: payload })
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("Payout method saved");
      await onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => {
          const isActive = method === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setMethod(o.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left touch-manipulation active:scale-[0.98] transition-transform ${
                isActive ? "border-primary bg-primary/5" : "border-border/40 bg-card"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                <o.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{o.label}</p>
                <p className="text-[10px] text-muted-foreground">{o.desc}</p>
              </div>
              {isActive && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>

      {method === "bank" && (
        <div className="space-y-2 pt-1">
          <div>
            <Label className="text-xs font-bold">Bank name</Label>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase, Bank of America…" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-bold">Last 4 of account #</Label>
            <Input value={accountLast4} onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" className="mt-1" inputMode="numeric" />
          </div>
        </div>
      )}
      {method === "paypal" && (
        <div className="pt-1">
          <Label className="text-xs font-bold">PayPal email</Label>
          <Input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="you@example.com" type="email" className="mt-1" />
        </div>
      )}

      <Button onClick={save} disabled={saving || !method} className="w-full font-bold">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save payout method
      </Button>
    </div>
  );
}

function TierStep({ tiers, userId, onSaved }: any) {
  const [name, setName] = useState("Supporter");
  const [price, setPrice] = useState("4.99");
  const [perks, setPerks] = useState("Exclusive posts\nDirect messages\nSubscriber badge");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!userId) return;
    const cents = Math.round(parseFloat(price) * 100);
    if (!name.trim()) return toast.error("Tier name required");
    if (!Number.isFinite(cents) || cents < 99) return toast.error("Minimum price is $0.99");
    setSaving(true);
    try {
      const benefits = perks.split("\n").map((p) => p.trim()).filter(Boolean);
      const { error } = await (supabase as any).from("subscription_tiers").insert({
        creator_id: userId,
        name: name.trim(),
        price_cents: cents,
        currency: "USD",
        benefits,
        is_active: true,
        sort_order: tiers.length,
      });
      if (error) throw error;
      toast.success("Tier created");
      setName(""); setPrice(""); setPerks("");
      await onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to create tier");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      {tiers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Your tiers</p>
          {tiers.map((t: any) => (
            <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <Crown className="w-4 h-4 text-emerald-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">${(t.price_cents / 100).toFixed(2)}/mo</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{tiers.length > 0 ? "Add another tier" : "Create your first tier"}</p>
        <div>
          <Label className="text-xs font-bold">Tier name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Supporter, VIP…" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold">Monthly price (USD)</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="4.99" className="mt-1" inputMode="decimal" />
        </div>
        <div>
          <Label className="text-xs font-bold">Perks (one per line)</Label>
          <Textarea value={perks} onChange={(e) => setPerks(e.target.value)} rows={3} className="mt-1 resize-none text-xs" />
        </div>
        <Button onClick={create} disabled={saving} className="w-full font-bold">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create tier
        </Button>
      </div>
    </div>
  );
}

function TipsStep({ enabled, userId, onSaved }: any) {
  const [on, setOn] = useState(enabled);
  const [saving, setSaving] = useState(false);

  const toggle = async (val: boolean) => {
    if (!userId) return;
    setOn(val);
    setSaving(true);
    try {
      await ensureCreatorRow(userId);
      const { error } = await (supabase as any)
        .from("creator_profiles")
        .update({ tips_enabled: val })
        .eq("user_id", userId);
      if (error) throw error;
      toast.success(val ? "Tips enabled" : "Tips disabled");
      await onSaved();
    } catch (e: any) {
      setOn(!val);
      toast.error(e.message || "Failed to update");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
          <Heart className="w-5 h-5 text-pink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold">Accept tips</p>
          <p className="text-[11px] text-muted-foreground">Show a "Send a tip" button on your profile</p>
        </div>
        <Switch checked={on} onCheckedChange={toggle} disabled={saving} />
      </div>
      <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-[11px] text-muted-foreground">
        ZIVO keeps 5% of each tip. Funds appear in your wallet within 24 hours.
      </div>
    </div>
  );
}

function LaunchStep({ enrollments, userId, onSaved }: any) {
  const [busy, setBusy] = useState<string | null>(null);
  const programs = [
    { id: "tips", label: "Fan Tips", desc: "One-time support from viewers", icon: Heart, accent: "hsl(340 75% 55%)" },
    { id: "subscriptions", label: "Subscriptions", desc: "Recurring monthly revenue", icon: Crown, accent: "hsl(38 92% 50%)" },
    { id: "affiliate", label: "Affiliate", desc: "Earn from referrals", icon: Gift, accent: "hsl(172 66% 50%)" },
    { id: "shop", label: "ZIVO Shop", desc: "Sell physical products", icon: Store, accent: "hsl(142 71% 45%)" },
    { id: "digital", label: "Digital Products", desc: "Sell guides, presets, courses", icon: PenTool, accent: "hsl(300 70% 55%)" },
  ];

  const enroll = async (programId: string) => {
    if (!userId) return;
    setBusy(programId);
    try {
      const { error } = await (supabase as any).from("creator_program_enrollments").insert({
        user_id: userId,
        program_id: programId,
        status: "active",
      });
      if (error && !`${error.message}`.toLowerCase().includes("duplicate")) throw error;
      toast.success("Enrolled");
      await onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to enroll");
    } finally { setBusy(null); }
  };

  const isEnrolled = (id: string) => enrollments.some((e: any) => e.program_id === id);

  return (
    <div className="space-y-2">
      {programs.map((p) => {
        const enrolled = isEnrolled(p.id);
        return (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${p.accent}15`, color: p.accent }}>
              <p.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
            </div>
            {enrolled ? (
              <span className="zivo-badge bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="w-2.5 h-2.5" /> Active
              </span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => enroll(p.id)} disabled={busy === p.id} className="text-[11px] h-7 px-3">
                {busy === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enroll"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
