/**
 * Lodging — Amenities & Policies.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "lucide-react";
import { toast } from "sonner";
import { useLodgeAmenities } from "@/hooks/lodging/useLodgeAmenities";

const AMENITIES = ["wifi", "pool", "gym", "spa", "restaurant", "bar", "parking", "airport_shuttle", "pet_friendly", "family_rooms", "ac", "breakfast", "laundry", "concierge", "room_service", "elevator"];
const AMENITY_LABEL: Record<string, string> = {
  wifi: "Wi-Fi", pool: "Pool", gym: "Gym", spa: "Spa", restaurant: "Restaurant", bar: "Bar",
  parking: "Parking", airport_shuttle: "Airport Shuttle", pet_friendly: "Pet-friendly",
  family_rooms: "Family Rooms", ac: "Air Conditioning", breakfast: "Breakfast",
  laundry: "Laundry", concierge: "Concierge", room_service: "Room Service", elevator: "Elevator",
};
const POLICY_FIELDS: { key: string; label: string; placeholder?: string; multiline?: boolean }[] = [
  { key: "check_in", label: "Check-in time", placeholder: "14:00" },
  { key: "check_out", label: "Check-out time", placeholder: "12:00" },
  { key: "cancellation", label: "Cancellation policy", multiline: true },
  { key: "children", label: "Children policy", multiline: true },
  { key: "pets", label: "Pet policy", multiline: true },
  { key: "smoking", label: "Smoking policy" },
  { key: "extra_bed", label: "Extra bed fee" },
];

export default function LodgingAmenitiesSection({ storeId }: { storeId: string }) {
  const { data, save } = useLodgeAmenities(storeId);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});
  const [policies, setPolicies] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) { setAmenities(data.amenities || {}); setPolicies(data.policies || {}); }
  }, [data]);

  const handleSave = async () => {
    try { await save.mutateAsync({ amenities, policies }); toast.success("Saved"); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Hotel className="h-5 w-5" /> Amenities & Policies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="font-semibold text-sm mb-3">Amenities</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-2 p-2 rounded-lg border bg-card cursor-pointer hover:bg-muted/40">
                <Switch checked={!!amenities[a]} onCheckedChange={v => setAmenities({ ...amenities, [a]: v })} />
                <span className="text-xs">{AMENITY_LABEL[a]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-sm mb-3">Policies</p>
          <div className="space-y-3">
            {POLICY_FIELDS.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {f.multiline
                  ? <Textarea value={policies[f.key] || ""} onChange={e => setPolicies({ ...policies, [f.key]: e.target.value })} rows={2} placeholder={f.placeholder} />
                  : <Input value={policies[f.key] || ""} onChange={e => setPolicies({ ...policies, [f.key]: e.target.value })} placeholder={f.placeholder} />}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={save.isPending} className="w-full">
          {save.isPending ? "Saving…" : "Save Amenities & Policies"}
        </Button>
      </CardContent>
    </Card>
  );
}
