/**
 * AdminMetaAdsPage — Create Meta (Facebook/Instagram) ad campaigns.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMetaAdsPage() {
  const [name, setName] = useState("ZIVO MVP Launch");
  const [dailyBudget, setDailyBudget] = useState("20");
  const [headline, setHeadline] = useState("ZIVO — Rides, Eats, Travel");
  const [body, setBody] = useState("Book rides, order food, and explore deals on ZIVO.");
  const [link, setLink] = useState("https://hizivo.com");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: campaigns, refetch } = useQuery({
    queryKey: ["ad_campaigns", "meta"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("platform", "meta")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createCampaign = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-ads-create-campaign", {
        body: {
          name,
          daily_budget_cents: Math.round(parseFloat(dailyBudget) * 100),
          headline,
          body,
          link,
          image_url: imageUrl || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Campaign created (paused). Enable it in Meta Ads Manager.");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Meta Ads</h1>
        <p className="text-sm text-muted-foreground">Launch Facebook + Instagram campaigns.</p>
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
            <Label>Headline</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Landing URL</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Image URL (optional)</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </div>
          <Button onClick={createCampaign} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create campaign
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
