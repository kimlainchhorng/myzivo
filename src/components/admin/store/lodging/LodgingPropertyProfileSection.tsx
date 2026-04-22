/**
 * LodgingPropertyProfileSection - resort-level profile (one per store).
 * Languages, facilities, meal plans, house rules, accessibility, sustainability,
 * hero badges, "what's included" strip, and nearby distances.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Hotel, Utensils, Globe, Accessibility, Leaf, Shield, MapPin, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useLodgePropertyProfile,
  type LodgePropertyProfile,
  type HouseRules,
  type NearbyDistance,
} from "@/hooks/lodging/useLodgePropertyProfile";

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Khmer", "Thai", "Vietnamese", "Chinese", "Japanese", "Korean", "Russian", "Arabic", "Hindi"];
const FACILITIES = [
  "Outdoor pool", "Indoor pool", "Restaurant", "Bar", "Gym", "Spa", "Sauna", "Hot tub",
  "Kids club", "Playground", "Business center", "Conference room", "Co-working space",
  "Laundry service", "Dry cleaning", "24h front desk", "Concierge",
  "Airport shuttle", "Free parking", "Valet parking", "EV charging", "Bicycle hire",
  "Beach access", "Beachfront", "Garden", "Library", "Lounge", "Terrace", "Rooftop bar",
  "Tour desk", "Currency exchange", "ATM on site", "Souvenir shop",
];
const MEAL_PLANS = ["Room only", "Bed & Breakfast", "Half board", "Full board", "All-inclusive"];
const ACCESSIBILITY = [
  "Step-free access", "Wheelchair accessible", "Accessible bathroom", "Roll-in shower",
  "Elevator", "Braille signage", "Hearing-loop", "Visual alarm", "Service animals welcome",
];
const SUSTAINABILITY = [
  "Single-use plastic free", "Solar power", "Towel & linen reuse", "EV-only fleet",
  "Locally sourced food", "Water-saving fixtures", "Recycling program", "Green building cert",
];
const HERO_BADGES = [
  "Beachfront", "Free cancellation", "Breakfast included", "Pet-friendly",
  "Adults only", "Family-friendly", "Eco-stay", "Spa retreat", "Business-ready", "Romantic", "Boutique",
];
const INCLUDED = [
  "Pool", "Wi-Fi", "Breakfast", "Airport pickup", "Parking", "Spa access",
  "Gym access", "Bicycle use", "Beach towels", "Welcome drink",
];

export default function LodgingPropertyProfileSection({ storeId }: { storeId: string }) {
  const { data, isLoading, upsert, defaults } = useLodgePropertyProfile(storeId);
  const [form, setForm] = useState<Partial<LodgePropertyProfile>>(() => ({ ...defaults, ...(data || {}) }));

  useEffect(() => { if (data) setForm({ ...defaults, ...data }); }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleIn = (key: keyof LodgePropertyProfile, val: string) => {
    const cur = ((form[key] as string[]) || []);
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
    setForm({ ...form, [key]: next });
  };

  const setRule = (patch: Partial<HouseRules>) =>
    setForm({ ...form, house_rules: { ...(form.house_rules || {}), ...patch } });

  const setNearby = (idx: number, patch: Partial<NearbyDistance>) => {
    const next = [...(form.nearby || [])];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, nearby: next });
  };
  const addNearby = () =>
    setForm({ ...form, nearby: [...(form.nearby || []), { label: "", minutes: undefined, mode: "walk" }] });
  const removeNearby = (idx: number) =>
    setForm({ ...form, nearby: (form.nearby || []).filter((_, i) => i !== idx) });

  const save = async () => {
    try {
      await upsert.mutateAsync(form);
      toast.success("Property profile saved");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  if (isLoading) {
    return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {/* Hero badges */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> Hero badges</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">Shown at the top of your storefront — pick what makes your property special.</p>
          <ChipGroup options={HERO_BADGES} selected={form.hero_badges || []} onToggle={v => toggleIn("hero_badges", v)} />
        </CardContent>
      </Card>

      {/* Included highlights */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Hotel className="h-4 w-4" /> What's included in your stay</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">Up to 6 quick icons shown above Rooms & Rates.</p>
          <ChipGroup options={INCLUDED} selected={form.included_highlights || []} onToggle={v => toggleIn("included_highlights", v)} max={6} />
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" /> Languages spoken at reception</CardTitle></CardHeader>
        <CardContent><ChipGroup options={LANGUAGES} selected={form.languages || []} onToggle={v => toggleIn("languages", v)} /></CardContent>
      </Card>

      {/* Facilities */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Hotel className="h-4 w-4" /> Property-wide facilities & services</CardTitle></CardHeader>
        <CardContent><ChipGroup options={FACILITIES} selected={form.facilities || []} onToggle={v => toggleIn("facilities", v)} /></CardContent>
      </Card>

      {/* Meal plans */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Utensils className="h-4 w-4" /> Meal plans offered</CardTitle></CardHeader>
        <CardContent><ChipGroup options={MEAL_PLANS} selected={form.meal_plans || []} onToggle={v => toggleIn("meal_plans", v)} /></CardContent>
      </Card>

      {/* House rules */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> House rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quiet hours</Label>
              <Input value={form.house_rules?.quiet_hours || ""} onChange={e => setRule({ quiet_hours: e.target.value })} placeholder="22:00 – 07:00" />
            </div>
            <div>
              <Label>Minimum guest age</Label>
              <Input type="number" inputMode="numeric" value={form.house_rules?.min_age ?? ""} onChange={e => setRule({ min_age: e.target.value === "" ? undefined : parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Smoking zones</Label>
            <Input value={form.house_rules?.smoking_zones || ""} onChange={e => setRule({ smoking_zones: e.target.value })} placeholder="Designated outdoor areas only" />
          </div>
          <div>
            <Label>Security deposit (USD)</Label>
            <Input type="number" step="0.01" inputMode="decimal" value={form.house_rules?.security_deposit_cents == null ? "" : (form.house_rules.security_deposit_cents / 100).toString()} onChange={e => setRule({ security_deposit_cents: e.target.value === "" ? undefined : Math.round(parseFloat(e.target.value) * 100) })} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={!!form.house_rules?.parties_allowed} onCheckedChange={v => setRule({ parties_allowed: v })} />
            <Label>Parties / events allowed</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={!!form.house_rules?.id_at_checkin} onCheckedChange={v => setRule({ id_at_checkin: v })} />
            <Label>ID required at check-in</Label>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Accessibility className="h-4 w-4" /> Accessibility</CardTitle></CardHeader>
        <CardContent><ChipGroup options={ACCESSIBILITY} selected={form.accessibility || []} onToggle={v => toggleIn("accessibility", v)} /></CardContent>
      </Card>

      {/* Sustainability */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Leaf className="h-4 w-4" /> Sustainability badges</CardTitle></CardHeader>
        <CardContent><ChipGroup options={SUSTAINABILITY} selected={form.sustainability || []} onToggle={v => toggleIn("sustainability", v)} /></CardContent>
      </Card>

      {/* Nearby */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" /> Nearby</CardTitle>
          <Button size="sm" variant="outline" onClick={addNearby} className="h-7 gap-1"><Plus className="h-3 w-3" /> Add</Button>
        </CardHeader>
        <CardContent>
          {(form.nearby || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">e.g. Beach · 5 min walk · Airport · 15 min drive.</p>
          ) : (
            <div className="space-y-2">
              {(form.nearby || []).map((n, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5 items-center p-2 rounded-lg border border-border bg-muted/20">
                  <Input className="col-span-5 h-8 text-xs" placeholder="Beach" value={n.label} onChange={e => setNearby(i, { label: e.target.value })} />
                  <Input className="col-span-3 h-8 text-xs" type="number" inputMode="numeric" placeholder="min" value={n.minutes ?? ""} onChange={e => setNearby(i, { minutes: e.target.value === "" ? undefined : parseInt(e.target.value) })} />
                  <select className="col-span-3 h-8 rounded-md border border-input bg-background px-2 text-xs" value={n.mode || "walk"} onChange={e => setNearby(i, { mode: e.target.value as NearbyDistance["mode"] })}>
                    <option value="walk">walk</option>
                    <option value="drive">drive</option>
                    <option value="boat">boat</option>
                  </select>
                  <Button type="button" size="icon" variant="ghost" className="col-span-1 h-8 w-8" onClick={() => removeNearby(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-6">
        <Button onClick={save} disabled={upsert.isPending} className="font-bold">
          {upsert.isPending ? "Saving…" : "Save property profile"}
        </Button>
      </div>
    </div>
  );
}

function ChipGroup({ options, selected, onToggle, max }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void; max?: number;
}) {
  const atMax = max != null && selected.length >= max;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const on = selected.includes(o);
        const disabled = !on && atMax;
        return (
          <button
            key={o}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(o)}
            className={`px-2.5 py-1 rounded-full text-xs border transition ${
              on
                ? "bg-primary text-primary-foreground border-primary"
                : disabled
                ? "bg-background border-border text-muted-foreground/40 cursor-not-allowed"
                : "bg-background border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
