/**
 * AdminGoogleAdsPage — Create Google Ads campaigns and verify conversion firing.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackGoogleAdsConversion } from "@/lib/googleAdsConversion";

export default function AdminGoogleAdsPage() {
  const [name, setName] = useState("ZIVO MVP Launch — Search");
  const [dailyBudget, setDailyBudget] = useState("20");
  const [keywords, setKeywords] = useState("ride app, food delivery, rides cambodia, tuk tuk app");
  const [creating, setCreating] = useState(false);
  const [convActionId, setConvActionId] = useState("");
  const [testing, setTesting] = useState(false);

  const { data: campaigns, refetch } = useQuery({
    queryKey: ["ad_campaigns", "google"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("platform", "google")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createCampaign = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ads-create-campaign", {
        body: {
          name,
          daily_budget_cents: Math.round(parseFloat(dailyBudget) * 100),
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          final_url: "https://hizivo.com",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Campaign created (paused). Enable it in Google Ads.");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const fireTestConversion = async () => {
    if (!convActionId) {
      toast.error("Enter a Conversion Action ID first");
      return;
    }
    setTesting(true);
    try {
      const result = await trackGoogleAdsConversion({
        conversion_action_id: convActionId,
        event_name: "TestConversion",
        value_cents: 100,
        order_id: `test_${Date.now()}`,
      });
      if ((result as any)?.ok) toast.success("Conversion sent. Check Google Ads → Diagnostics.");
      else toast.error("Conversion failed — see Edge Function logs.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Google Ads</h1>
        <p className="text-sm text-muted-foreground">Create campaigns and verify conversion tracking.</p>
      </header>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">New campaign</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Daily budget (USD)</Label>
            <Input type="number" min="1" step="0.01" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Keywords (comma separated)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <Button onClick={createCampaign} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create campaign
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Verify conversion</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Conversion Action ID</Label>
            <Input placeholder="e.g. 1234567890" value={convActionId} onChange={(e) => setConvActionId(e.target.value)} />
            <p className="text-xs text-muted-foreground">From Google Ads → Tools → Conversions → your action → ID column.</p>
          </div>
          <Button onClick={fireTestConversion} disabled={testing} variant="secondary">
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Fire test conversion ($1.00)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent campaigns</CardTitle></CardHeader>
        <CardContent>
          {campaigns?.length ? (
            <ul className="divide-y">
              {campaigns.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">${(c.daily_budget_cents / 100).toFixed(2)}/day · {c.external_id}</div>
                  </div>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
