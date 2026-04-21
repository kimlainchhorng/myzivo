/**
 * AdsStudioRecommendations — AI-generated budget shift / creative test suggestions.
 * Calls ads-studio-recommendations edge function and lets owners accept/dismiss.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Check, X, Loader2, Lightbulb } from "lucide-react";

interface Props { storeId: string }
interface Rec {
  id: string;
  recommendation_type: string;
  title: string;
  body: string;
  estimated_impact: string | null;
  status: string;
  created_at: string;
}

const TYPE_COLOR: Record<string, string> = {
  budget_shift: "bg-blue-500/15 text-blue-600",
  pause_platform: "bg-red-500/15 text-red-600",
  creative_test: "bg-emerald-500/15 text-emerald-600",
};

export default function AdsStudioRecommendations({ storeId }: Props) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads_studio_recommendations" as any)
      .select("id,recommendation_type,title,body,estimated_impact,status,created_at")
      .eq("store_id", storeId)
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) toast.error(error.message);
    setRecs((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ads-studio-recommendations", {
        body: { store_id: storeId },
      });
      if (error) throw error;
      toast.success(`Generated ${data?.created ?? 0} recommendation(s)`);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally { setGenerating(false); }
  };

  const respond = async (id: string, status: "accepted" | "dismissed") => {
    setBusy(id);
    const { error } = await supabase
      .from("ads_studio_recommendations" as any)
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(status === "accepted" ? "Marked as accepted" : "Dismissed"); load(); }
    setBusy(null);
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> AI recommendations
        </CardTitle>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={generate} disabled={generating}>
          {generating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-20 w-full" /> : recs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No active recommendations. Click "Generate" to analyze your last 14 days of ad data.
          </p>
        ) : (
          <div className="space-y-2">
            {recs.map((r) => (
              <div key={r.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/30 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Badge className={`text-[10px] shrink-0 ${TYPE_COLOR[r.recommendation_type] || ""}`}>
                    {r.recommendation_type.replace("_", " ")}
                  </Badge>
                  <span className="text-xs font-semibold flex-1">{r.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{r.body}</p>
                <div className="flex items-center justify-between">
                  {r.estimated_impact && (
                    <span className="text-[10px] text-emerald-600 font-medium">📈 {r.estimated_impact}</span>
                  )}
                  <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => respond(r.id, "dismissed")} disabled={busy === r.id}>
                      <X className="h-3 w-3 mr-0.5" /> Dismiss
                    </Button>
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => respond(r.id, "accepted")} disabled={busy === r.id}>
                      {busy === r.id ? <Loader2 className="h-3 w-3 mr-0.5 animate-spin" /> : <Check className="h-3 w-3 mr-0.5" />} Accept
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
