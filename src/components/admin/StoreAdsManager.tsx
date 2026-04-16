/**
 * StoreAdsManager — Paid-ads dashboard for stores.
 * Phase 1: full CRUD + per-platform "Connect" stubs (no real API calls yet).
 * Each platform needs its own approved API access before campaigns actually launch externally.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Facebook, Instagram, Search as Google, Music2 as TikTok, Twitter as X,
  Plus, Trash2, Edit, Pause, Play, ExternalLink, Loader2,
  TrendingUp, MousePointerClick, Eye, DollarSign, Megaphone, AlertCircle,
} from "lucide-react";

interface Props {
  storeId: string;
}

type Platform = "meta" | "instagram" | "google" | "tiktok" | "x";

const PLATFORMS: {
  id: Platform; label: string; icon: any; color: string; secretsHint: string;
}[] = [
  { id: "meta", label: "Facebook", icon: Facebook, color: "text-[#1877F2]", secretsHint: "Meta Business Manager + Marketing API access" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-[#E4405F]", secretsHint: "Same Meta credentials + IG Business account" },
  { id: "google", label: "Google Ads", icon: Google, color: "text-[#4285F4]", secretsHint: "MCC + approved Developer Token + OAuth" },
  { id: "tiktok", label: "TikTok Ads", icon: TikTok, color: "text-foreground", secretsHint: "TikTok for Business + Marketing API token" },
  { id: "x", label: "X (Twitter)", icon: X, color: "text-foreground", secretsHint: "X Ads API (paid tier) + OAuth tokens" },
];

interface AdAccount {
  id: string; platform: Platform; status: string;
  external_account_id: string | null; display_name: string | null;
  connected_at: string | null;
}

interface AdCampaign {
  id: string; name: string; objective: string; platforms: Platform[];
  status: string; daily_budget_cents: number; total_budget_cents: number;
  currency: string; start_date: string | null; end_date: string | null;
  headline: string | null; body: string | null; cta: string | null;
  destination_url: string | null; creative_url: string | null;
  spend_cents: number; impressions: number; clicks: number; conversions: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  paused: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ended: "bg-muted text-muted-foreground",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function StoreAdsManager({ storeId }: Props) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
  const [editing, setEditing] = useState<AdCampaign | null>(null);
  const [form, setForm] = useState({
    name: "", objective: "traffic", platforms: [] as Platform[],
    daily_budget: 10, total_budget: 100, currency: "USD",
    start_date: "", end_date: "",
    headline: "", body: "", cta: "Learn More", destination_url: "",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["store-ad-accounts", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_ad_accounts" as any)
        .select("*")
        .eq("store_id", storeId);
      if (error) throw error;
      return (data || []) as unknown as AdAccount[];
    },
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["store-ad-campaigns", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_ad_campaigns" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdCampaign[];
    },
  });

  const accountByPlatform = (p: Platform) =>
    accounts.find((a) => a.platform === p);

  const connectMutation = useMutation({
    mutationFn: async ({ platform, externalId, displayName }: { platform: Platform; externalId: string; displayName: string }) => {
      const existing = accountByPlatform(platform);
      const payload: any = {
        store_id: storeId,
        platform,
        status: "pending",
        external_account_id: externalId,
        display_name: displayName,
        connected_at: new Date().toISOString(),
        connected_by: (await supabase.auth.getUser()).data.user?.id,
      };
      if (existing) {
        const { error } = await supabase.from("store_ad_accounts" as any).update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("store_ad_accounts" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-ad-accounts", storeId] });
      toast.success("Account saved. Backend wiring pending — campaigns won't launch until API access is finalized.");
      setConnectPlatform(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_ad_accounts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-ad-accounts", storeId] });
      toast.success("Disconnected");
    },
  });

  const saveCampaign = useMutation({
    mutationFn: async () => {
      const payload: any = {
        store_id: storeId,
        name: form.name,
        objective: form.objective,
        platforms: form.platforms,
        daily_budget_cents: Math.round(form.daily_budget * 100),
        total_budget_cents: Math.round(form.total_budget * 100),
        currency: form.currency,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        headline: form.headline || null,
        body: form.body || null,
        cta: form.cta || null,
        destination_url: form.destination_url || null,
        status: "draft",
      };
      if (editing) {
        const { error } = await supabase.from("store_ad_campaigns" as any).update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        payload.created_by = (await supabase.auth.getUser()).data.user?.id;
        const { error } = await supabase.from("store_ad_campaigns" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-ad-campaigns", storeId] });
      toast.success(editing ? "Campaign updated" : "Campaign saved as draft");
      setCreateOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_ad_campaigns" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-ad-campaigns", storeId] });
      toast.success("Campaign deleted");
    },
  });

  const launchCampaign = useMutation({
    mutationFn: async (c: AdCampaign) => {
      // Verify each selected platform has a connected account
      const missing = c.platforms.filter((p) => !accountByPlatform(p) || accountByPlatform(p)?.status === "disconnected");
      if (missing.length) {
        throw new Error(`Connect these platforms first: ${missing.join(", ")}`);
      }
      // Mark as pending_review until real API integration runs
      const { error } = await supabase.from("store_ad_campaigns" as any)
        .update({ status: "pending_review" })
        .eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-ad-campaigns", storeId] });
      toast.success("Campaign queued. Real API launch will activate once platform integration is enabled.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("store_ad_campaigns" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-ad-campaigns", storeId] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", objective: "traffic", platforms: [],
      daily_budget: 10, total_budget: 100, currency: "USD",
      start_date: "", end_date: "",
      headline: "", body: "", cta: "Learn More", destination_url: "",
    });
    setCreateOpen(true);
  };

  const openEdit = (c: AdCampaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      objective: c.objective,
      platforms: c.platforms || [],
      daily_budget: c.daily_budget_cents / 100,
      total_budget: c.total_budget_cents / 100,
      currency: c.currency,
      start_date: c.start_date ? c.start_date.slice(0, 16) : "",
      end_date: c.end_date ? c.end_date.slice(0, 16) : "",
      headline: c.headline || "",
      body: c.body || "",
      cta: c.cta || "Learn More",
      destination_url: c.destination_url || "",
    });
    setCreateOpen(true);
  };

  const togglePlatform = (p: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  // Aggregate metrics
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend_cents,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  return (
    <div className="space-y-5">
      {/* Heads-up banner */}
      <Card className="border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Ad platform integration in progress</p>
            <p className="text-amber-800 dark:text-amber-300/80 leading-relaxed">
              You can build, save, and queue campaigns now. Real launches activate once each platform's API access is approved (Meta Marketing API, Google Ads Developer Token, TikTok Marketing API, X Ads API).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform connections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Ad Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PLATFORMS.map((p) => {
              const acc = accountByPlatform(p.id);
              const connected = acc && acc.status !== "disconnected";
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setConnectPlatform(p.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/30 transition text-left"
                >
                  <Icon className={`w-6 h-6 ${p.color}`} />
                  <div className="text-xs font-medium text-center">{p.label}</div>
                  <Badge variant={connected ? "default" : "outline"} className="text-[10px] h-5">
                    {connected ? acc?.status : "Connect"}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Spend", value: `$${(totals.spend / 100).toFixed(2)}`, icon: DollarSign },
          { label: "Impressions", value: totals.impressions.toLocaleString(), icon: Eye },
          { label: "Clicks", value: totals.clicks.toLocaleString(), icon: MousePointerClick },
          { label: "Conversions", value: totals.conversions.toLocaleString(), icon: TrendingUp },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <Icon className="w-4 h-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaigns list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Campaigns</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto my-6 text-muted-foreground" />
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No campaigns yet. Create your first ad to reach customers on Facebook, Instagram, Google, TikTok, and X.
            </div>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-accent/20 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm truncate">{c.name}</span>
                    <Badge className={`text-[10px] h-5 ${STATUS_COLORS[c.status] || ""}`}>{c.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {c.platforms?.map((p) => {
                      const def = PLATFORMS.find((x) => x.id === p);
                      const Icon = def?.icon || Megaphone;
                      return <Icon key={p} className={`w-3 h-3 ${def?.color}`} />;
                    })}
                    <span className="text-[11px] text-muted-foreground ml-1">
                      ${(c.daily_budget_cents / 100).toFixed(2)}/day · {c.impressions.toLocaleString()} impr · {c.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {c.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => launchCampaign.mutate(c)}>
                      <Play className="w-3.5 h-3.5 mr-1" /> Launch
                    </Button>
                  )}
                  {c.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => toggleStatus.mutate({ id: c.id, status: "paused" })}>
                      <Pause className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {c.status === "paused" && (
                    <Button size="sm" variant="outline" onClick={() => toggleStatus.mutate({ id: c.id, status: "active" })}>
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteCampaign.mutate(c.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Connect dialog */}
      <Dialog open={!!connectPlatform} onOpenChange={(o) => !o && setConnectPlatform(null)}>
        <DialogContent className="max-w-md">
          {connectPlatform && (() => {
            const p = PLATFORMS.find((x) => x.id === connectPlatform)!;
            const Icon = p.icon;
            const acc = accountByPlatform(connectPlatform);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${p.color}`} /> Connect {p.label}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted text-xs leading-relaxed">
                    <p className="font-semibold mb-1">Required:</p>
                    <p className="text-muted-foreground">{p.secretsHint}</p>
                  </div>
                  <ConnectForm
                    platform={p.id}
                    initialId={acc?.external_account_id || ""}
                    initialName={acc?.display_name || ""}
                    onSubmit={(id, name) => connectMutation.mutate({ platform: p.id, externalId: id, displayName: name })}
                    isPending={connectMutation.isPending}
                  />
                  {acc && (
                    <Button variant="outline" className="w-full text-red-500" onClick={() => disconnectMutation.mutate(acc.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Disconnect
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Campaign dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Campaign name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer promo - drive traffic" />
            </div>
            <div>
              <Label className="text-xs">Platforms</Label>
              <div className="grid grid-cols-5 gap-1.5 mt-1">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const selected = form.platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <Icon className={`w-4 h-4 ${p.color}`} />
                      <span className="text-[10px]">{p.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Daily budget ($)</Label>
                <Input type="number" min={1} value={form.daily_budget} onChange={(e) => setForm({ ...form, daily_budget: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Total budget ($)</Label>
                <Input type="number" min={0} value={form.total_budget} onChange={(e) => setForm({ ...form, total_budget: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start</Label>
                <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">End</Label>
                <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Headline</Label>
              <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={60} placeholder="Free delivery this weekend" />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={200} rows={2} placeholder="Order now and save 25% on your first order" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">CTA</Label>
                <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="Order Now" />
              </div>
              <div>
                <Label className="text-xs">Destination URL</Label>
                <Input value={form.destination_url} onChange={(e) => setForm({ ...form, destination_url: e.target.value })} placeholder="https://hizivo.com/store/..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCampaign.mutate()} disabled={!form.name || form.platforms.length === 0 || saveCampaign.isPending}>
              {saveCampaign.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              {editing ? "Save" : "Create draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConnectForm({
  platform, initialId, initialName, onSubmit, isPending,
}: { platform: Platform; initialId: string; initialName: string; onSubmit: (id: string, name: string) => void; isPending: boolean }) {
  const [id, setId] = useState(initialId);
  const [name, setName] = useState(initialName);
  return (
    <>
      <div>
        <Label className="text-xs">Ad account ID</Label>
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="act_1234567890" />
      </div>
      <div>
        <Label className="text-xs">Display name (optional)</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Business Ads" />
      </div>
      <Button className="w-full" onClick={() => onSubmit(id.trim(), name.trim())} disabled={!id.trim() || isPending}>
        {isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
        Save connection
      </Button>
    </>
  );
}
