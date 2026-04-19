/**
 * Auto Repair — Auto Check (VIN decoder + history)
 * Uses NHTSA free VIN decoder API for vehicle specs.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Car, Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface VinResult {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  bodyClass?: string;
  engine?: string;
  fuel?: string;
  manufacturer?: string;
  plant?: string;
  driveType?: string;
  transmission?: string;
}

interface Props { storeId: string }

export default function AutoRepairAutoCheckSection({ storeId: _storeId }: Props) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VinResult | null>(null);
  const [history, setHistory] = useState<VinResult[]>([]);

  const decode = async () => {
    const v = vin.trim().toUpperCase();
    if (v.length !== 17) { toast.error("VIN must be 17 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${v}?format=json`);
      const data = await res.json();
      const r = data?.Results?.[0] || {};
      const decoded: VinResult = {
        vin: v,
        make: r.Make, model: r.Model, year: r.ModelYear, bodyClass: r.BodyClass,
        engine: r.EngineModel || r.DisplacementL ? `${r.EngineModel || ""} ${r.DisplacementL ? r.DisplacementL + "L" : ""}`.trim() : undefined,
        fuel: r.FuelTypePrimary, manufacturer: r.Manufacturer, plant: r.PlantCity,
        driveType: r.DriveType, transmission: r.TransmissionStyle,
      };
      setResult(decoded);
      setHistory(h => [decoded, ...h.filter(x => x.vin !== v)].slice(0, 10));
      toast.success("VIN decoded");
    } catch (e) {
      toast.error("Failed to decode VIN");
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
            <Input placeholder="Enter 17-character VIN" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} maxLength={17} className="font-mono uppercase" />
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
              <Car className="w-4 h-4" /> {result.year} {result.make} {result.model}
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
          <CardHeader><CardTitle className="text-base">Recent Lookups</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {history.map(h => (
              <button key={h.vin} onClick={() => setResult(h)} className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <span className="font-mono text-xs">{h.vin}</span>
                <span className="text-xs text-muted-foreground">{h.year} {h.make} {h.model}</span>
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
