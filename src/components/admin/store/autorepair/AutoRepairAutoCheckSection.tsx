/**
 * Auto Repair — Auto Check (VIN decoder + persisted history)
 * Uses NHTSA edge function; saves lookups to ar_vin_lookups so history survives reload.
 */
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Search from "lucide-react/dist/esm/icons/search";
import Car from "lucide-react/dist/esm/icons/car";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Shield from "lucide-react/dist/esm/icons/shield";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import History from "lucide-react/dist/esm/icons/history";
import { toast } from "sonner";

interface VinResult {
  vin: string;
  make?: string; model?: string; year?: string; bodyClass?: string;
  engine?: string; fuel?: string; manufacturer?: string; plant?: string;
  driveType?: string; transmission?: string;
}

interface Props { storeId: string }

export default function AutoRepairAutoCheckSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VinResult | null>(null);

  const { data: history = [] } = useQuery({
    queryKey: ["ar-vin-lookups", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_vin_lookups")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; vin: string; decoded: any; created_at: string }>;
    },
  });

  // Show most recent in result panel by default
  useEffect(() => {
    if (!result && history.length > 0) {
      setResult({ vin: history[0].vin, ...(history[0].decoded as object) });
    }
  }, [history, result]);

  const decode = async () => {
    const v = vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (v.length !== 17) { toast.error("VIN must be 17 characters (no I, O, Q)"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vin-decode", { body: { vin: v } });
      if (error) throw new Error(error.message || "Function call failed");
      if (!data?.ok) throw new Error(data?.error || "No vehicle data found");

      const decoded: VinResult = {
        vin: data.vin || v,
        make: data.make, model: data.model, year: data.year,
        bodyClass: data.bodyClass, engine: data.engine, fuel: data.fuel,
        manufacturer: data.manufacturer, plant: data.plant,
        driveType: data.driveType, transmission: data.transmission,
      };
      setResult(decoded);

      // Persist to history
      const { error: insertErr } = await supabase.from("ar_vin_lookups").insert({
        store_id: storeId,
        vin: v,
        decoded: { ...decoded, vin: undefined } as any,
      });
      if (insertErr) console.warn("Could not save VIN history:", insertErr.message);
      qc.invalidateQueries({ queryKey: ["ar-vin-lookups", storeId] });

      toast.success(data.partial ? "VIN decoded (partial)" : "VIN decoded");
    } catch (e: any) {
      toast.error(`Failed to decode VIN: ${e?.message || "network error"}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> VIN Auto Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Enter 17-character VIN" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} maxLength={17} className="font-mono uppercase" onKeyDown={e => e.key === "Enter" && decode()} />
            <Button onClick={decode} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Check
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Powered by NHTSA · Decodes Year, Make, Model, Engine, and more.</p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4" /> {[result.year, result.make, result.model].filter(Boolean).join(" ") || "Vehicle"}
              <Badge variant="secondary" className="ml-2"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Info label="VIN" value={result.vin} mono />
              <Info label="Body" value={result.bodyClass} />
              <Info label="Engine" value={result.engine} />
              <Info label="Fuel" value={result.fuel} />
              <Info label="Drive" value={result.driveType} />
              <Info label="Transmission" value={result.transmission} />
              <Info label="Manufacturer" value={result.manufacturer} />
              <Info label="Plant" value={result.plant} />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Title, accident, and recall history require a paid CARFAX/AutoCheck integration. Contact ZIVO Partner Support to enable.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Recent Lookups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {history.map(h => (
              <button key={h.id} onClick={() => setResult({ vin: h.vin, ...(h.decoded as object) })} className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <span className="font-mono text-xs">{h.vin}</span>
                <span className="text-xs text-muted-foreground">
                  {[h.decoded?.year, h.decoded?.make, h.decoded?.model].filter(Boolean).join(" ") || "—"}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : "font-medium"}`}>{value || "—"}</p>
    </div>
  );
}
