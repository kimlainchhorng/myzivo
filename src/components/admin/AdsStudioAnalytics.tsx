/**
 * AdsStudioAnalytics — performance dashboard across all creatives for a store.
 * Pulls from ads_studio_creative_stats view (impressions, clicks, conversions, revenue, AI spend).
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, MousePointerClick, Eye, Target, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

interface CreativeStat {
  creative_id: string;
  goal: string;
  status: string;
  created_at: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_cents: number;
  spend_cents: number;
}

export default function AdsStudioAnalytics({ storeId }: Props) {
  const [stats, setStats] = useState<CreativeStat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ads_studio_creative_stats" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setStats((data as any) || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load analytics");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const totals = stats.reduce(
    (acc, s) => ({
      impressions: acc.impressions + (s.impressions || 0),
      clicks: acc.clicks + (s.clicks || 0),
      conversions: acc.conversions + (s.conversions || 0),
      revenue_cents: acc.revenue_cents + (s.revenue_cents || 0),
      spend_cents: acc.spend_cents + (s.spend_cents || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue_cents: 0, spend_cents: 0 },
  );

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const roas = totals.spend_cents > 0 ? totals.revenue_cents / totals.spend_cents : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Performance</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} loading={loading} />
        <StatCard icon={MousePointerClick} label="Clicks" value={totals.clicks.toLocaleString()} sub={`${ctr.toFixed(2)}% CTR`} loading={loading} />
        <StatCard icon={Target} label="Conversions" value={totals.conversions.toLocaleString()} sub={`${cvr.toFixed(2)}% CVR`} loading={loading} />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(totals.revenue_cents / 100).toFixed(2)}`} sub={`${roas.toFixed(2)}x ROAS`} loading={loading} />
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold">Per-creative breakdown</p>
            <Badge variant="secondary" className="ml-auto text-[10px]">AI spend: ${(totals.spend_cents / 100).toFixed(2)}</Badge>
          </div>
          {loading ? (
            <div className="space-y-1.5">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : stats.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No campaigns yet. Generate one in the AI Studio tab.</p>
          ) : (
            <div className="space-y-1">
              {stats.map((s) => (
                <div key={s.creative_id} className="grid grid-cols-12 gap-2 items-center text-[11px] py-1.5 border-b border-border/40 last:border-0">
                  <div className="col-span-3 truncate">
                    <Badge variant="outline" className="text-[10px] mr-1">{s.goal}</Badge>
                    <span className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2 text-right">{s.impressions.toLocaleString()}</div>
                  <div className="col-span-2 text-right">{s.clicks.toLocaleString()}</div>
                  <div className="col-span-2 text-right">{s.conversions.toLocaleString()}</div>
                  <div className="col-span-2 text-right text-primary font-medium">${(s.revenue_cents / 100).toFixed(2)}</div>
                  <div className="col-span-1 text-right text-muted-foreground">${(s.spend_cents / 100).toFixed(2)}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-2 items-center text-[10px] text-muted-foreground pt-1">
                <div className="col-span-3">Goal · Date</div>
                <div className="col-span-2 text-right">Impr</div>
                <div className="col-span-2 text-right">Clicks</div>
                <div className="col-span-2 text-right">Conv</div>
                <div className="col-span-2 text-right">Revenue</div>
                <div className="col-span-1 text-right">Spend</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, loading }: any) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
          <Icon className="h-3 w-3" />
          <span className="text-[10px] uppercase tracking-wide">{label}</span>
        </div>
        {loading ? <Skeleton className="h-5 w-16" /> : (
          <>
            <p className="text-base font-bold">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
