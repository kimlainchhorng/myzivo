/**
 * Lodging — Rooms & Rates section.
 * CRUD for room types: name, type, beds, max guests, rates (USD), amenities, units,
 * photos, description, cancellation policy, check-in/out times, add-ons.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BedDouble, Plus, Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLodgeRooms, type LodgeRoom, type LodgeAddon } from "@/hooks/lodging/useLodgeRooms";
import { LodgingRoomPhotoUploader } from "@/components/lodging/LodgingRoomPhotoUploader";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Villa", "Family", "Bungalow", "Cottage", "Dormitory", "Apartment", "Studio", "Penthouse"];
const AMENITY_OPTIONS = [
  // Comfort
  "AC", "Heating", "Wi-Fi", "TV", "Smart TV", "Netflix",
  // Bath
  "Bathtub", "Hot shower", "Hairdryer", "Toiletries", "Bathrobe", "Slippers",
  // Kitchen / dining
  "Mini-bar", "Mini-fridge", "Coffee maker", "Kettle", "Kitchenette", "Microwave",
  // Workspace / family
  "Workspace", "Iron", "Crib available", "Family-friendly",
  // Outdoor / view
  "Balcony", "Terrace", "Garden view", "Pool view", "Sea view", "Mountain view", "City view",
  // Premium
  "Safe", "Jacuzzi", "Private pool", "Beach access", "Fireplace",
  // Services
  "Daily housekeeping", "Room service", "24h reception",
  // Accessibility & policy
  "Wheelchair accessible", "Pet-friendly", "Smoking allowed", "Non-smoking", "EV charger", "Free parking"
];

// Curated quick-add presets — one tap to add common hotel/resort extras
const ADDON_PRESETS: { name: string; price_cents: number; per: "stay" | "night" | "guest" | "person_night"; category: string; icon: string }[] = [
  // Food & drink
  { name: "Breakfast", price_cents: 800, per: "person_night", category: "Food & drink", icon: "🥐" },
  { name: "Half board (breakfast + dinner)", price_cents: 2500, per: "person_night", category: "Food & drink", icon: "🍽️" },
  { name: "Full board (3 meals)", price_cents: 4000, per: "person_night", category: "Food & drink", icon: "🍴" },
  { name: "Welcome drink", price_cents: 500, per: "guest", category: "Food & drink", icon: "🍹" },
  { name: "Bottle of wine", price_cents: 2500, per: "stay", category: "Food & drink", icon: "🍷" },
  { name: "Mini-bar package", price_cents: 1500, per: "stay", category: "Food & drink", icon: "🥤" },
  // Transport
  { name: "Airport pickup", price_cents: 2500, per: "stay", category: "Transport", icon: "🚐" },
  { name: "Airport drop-off", price_cents: 2500, per: "stay", category: "Transport", icon: "🚖" },
  { name: "Round-trip airport transfer", price_cents: 4500, per: "stay", category: "Transport", icon: "🚗" },
  { name: "Scooter rental", price_cents: 1000, per: "night", category: "Transport", icon: "🛵" },
  { name: "Car rental", price_cents: 4500, per: "night", category: "Transport", icon: "🚙" },
  { name: "Bicycle rental", price_cents: 500, per: "night", category: "Transport", icon: "🚲" },
  // Stay flexibility
  { name: "Early check-in", price_cents: 1500, per: "stay", category: "Stay", icon: "⏰" },
  { name: "Late check-out", price_cents: 1500, per: "stay", category: "Stay", icon: "🕒" },
  { name: "Extra bed", price_cents: 1500, per: "night", category: "Stay", icon: "🛏️" },
  { name: "Baby crib", price_cents: 0, per: "stay", category: "Stay", icon: "👶" },
  { name: "Extra guest", price_cents: 1500, per: "person_night", category: "Stay", icon: "👤" },
  { name: "Pet fee", price_cents: 1000, per: "night", category: "Stay", icon: "🐾" },
  // Wellness & experiences
  { name: "Spa massage (60 min)", price_cents: 4500, per: "guest", category: "Wellness", icon: "💆" },
  { name: "Couples massage", price_cents: 8000, per: "stay", category: "Wellness", icon: "💑" },
  { name: "Yoga session", price_cents: 1500, per: "guest", category: "Wellness", icon: "🧘" },
  { name: "Snorkeling tour", price_cents: 3500, per: "guest", category: "Experiences", icon: "🤿" },
  { name: "Island hopping tour", price_cents: 5000, per: "guest", category: "Experiences", icon: "🏝️" },
  { name: "Sunset cruise", price_cents: 6500, per: "guest", category: "Experiences", icon: "⛵" },
  { name: "Private chef dinner", price_cents: 7500, per: "stay", category: "Experiences", icon: "👨‍🍳" },
  // Romance & celebration
  { name: "Honeymoon package", price_cents: 5000, per: "stay", category: "Celebration", icon: "💐" },
  { name: "Birthday cake", price_cents: 1500, per: "stay", category: "Celebration", icon: "🎂" },
  { name: "Flower bouquet", price_cents: 2000, per: "stay", category: "Celebration", icon: "🌹" },
  { name: "Champagne on arrival", price_cents: 3500, per: "stay", category: "Celebration", icon: "🍾" },
  // Practical services
  { name: "Daily housekeeping", price_cents: 800, per: "night", category: "Services", icon: "🧹" },
  { name: "Laundry service", price_cents: 1200, per: "stay", category: "Services", icon: "🧺" },
  { name: "Parking", price_cents: 500, per: "night", category: "Services", icon: "🅿️" },
  { name: "Beach towel rental", price_cents: 200, per: "guest", category: "Services", icon: "🏖️" },
];
const CANCEL_POLICIES: { value: string; label: string }[] = [
  { value: "flexible", label: "Flexible — full refund up to 24h before" },
  { value: "moderate", label: "Moderate — full refund up to 5 days before" },
  { value: "strict", label: "Strict — 50% refund up to 7 days before" },
  { value: "non_refundable", label: "Non-refundable" },
];

export default function LodgingRoomsSection({ storeId }: { storeId: string }) {
  const { data: rooms = [], isLoading, upsert, remove } = useLodgeRooms(storeId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LodgeRoom> | null>(null);

  const blank = (): Partial<LodgeRoom> => ({
    store_id: storeId, name: "", room_type: "Standard", beds: "1 Queen", max_guests: 2,
    units_total: 1, base_rate_cents: 5000, weekend_rate_cents: 6000,
    weekly_discount_pct: 0, monthly_discount_pct: 0,
    breakfast_included: false, amenities: [], photos: [], sort_order: 0, is_active: true,
    description: "", cancellation_policy: "flexible", addons: [], cover_photo_index: 0,
  });

  const openNew = () => { setEditing(blank()); setOpen(true); };
  const openEdit = (r: LodgeRoom) => { setEditing({ ...r, addons: r.addons || [], photos: r.photos || [] }); setOpen(true); };

  const save = async () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    try {
      await upsert.mutateAsync(editing as any);
      toast.success("Room saved");
      setOpen(false);
    } catch (e: any) { toast.error(e.message || "Save failed"); }
  };

  const toggleAmenity = (a: string) => {
    const cur = editing?.amenities || [];
    setEditing({ ...editing, amenities: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] });
  };

  const updateAddon = (idx: number, patch: Partial<LodgeAddon>) => {
    const next = [...(editing?.addons || [])];
    next[idx] = { ...next[idx], ...patch };
    setEditing({ ...editing, addons: next });
  };
  const addAddon = () => setEditing({ ...editing, addons: [...(editing?.addons || []), { name: "", price_cents: 500, per: "stay" }] });
  const removeAddon = (idx: number) => setEditing({ ...editing, addons: (editing?.addons || []).filter((_, i) => i !== idx) });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2"><BedDouble className="h-5 w-5" /> Rooms & Rates</CardTitle>
        <Button onClick={openNew} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Room</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <BedDouble className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No rooms yet</p>
            <Button onClick={openNew} variant="outline" size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add First Room</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((r) => {
              const photos = (r.photos || []) as string[];
              const ci = r.cover_photo_index ?? 0;
              const cover = photos[ci] ?? photos[0];
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {cover
                      ? <img src={cover} alt={r.name} className="h-full w-full object-cover" />
                      : <BedDouble className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{r.name}</p>
                      {r.room_type && <Badge variant="secondary" className="text-[10px]">{r.room_type}</Badge>}
                      {!r.is_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                      {(r.photos?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-[10px] gap-1"><ImageIcon className="h-2.5 w-2.5" />{r.photos.length}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.beds || "—"} · Sleeps {r.max_guests} · {r.units_total} unit{r.units_total > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">${(r.base_rate_cents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">per night</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete room?")) remove.mutate(r.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Room" : "Add Room"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              {/* Cover hero — primary upload entry point */}
              <div>
                <LodgingRoomPhotoUploader
                  heroOnly
                  storeId={storeId}
                  photos={(editing.photos as string[]) || []}
                  onChange={(next) => {
                    const cur = editing.cover_photo_index ?? 0;
                    const safe = Math.min(Math.max(cur, 0), Math.max(0, next.length - 1));
                    setEditing({ ...editing, photos: next, cover_photo_index: safe });
                  }}
                  coverIndex={editing.cover_photo_index ?? 0}
                  onCoverChange={(idx) => setEditing({ ...editing, cover_photo_index: idx })}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Cover photo · shown on room cards & booking pages
                </p>
              </div>

              {/* All photos thumbnail manager */}
              {((editing.photos as string[]) || []).length > 0 && (
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">All photos</Label>
                  <LodgingRoomPhotoUploader
                    gridOnly
                    storeId={storeId}
                    photos={(editing.photos as string[]) || []}
                    onChange={(next) => {
                      const cur = editing.cover_photo_index ?? 0;
                      const safe = Math.min(Math.max(cur, 0), Math.max(0, next.length - 1));
                      setEditing({ ...editing, photos: next, cover_photo_index: safe });
                    }}
                    coverIndex={editing.cover_photo_index ?? 0}
                    onCoverChange={(idx) => setEditing({ ...editing, cover_photo_index: idx })}
                  />
                </div>
              )}

              <div><Label>Name</Label><Input value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Deluxe Sea View" /></div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description || ""}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="A spacious room with ocean views, king bed, and private balcony…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <select value={editing.room_type || ""} onChange={e => setEditing({ ...editing, room_type: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>Beds</Label><Input value={editing.beds || ""} onChange={e => setEditing({ ...editing, beds: e.target.value })} placeholder="1 King" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Max guests</Label><Input type="number" inputMode="numeric" value={editing.max_guests ?? ""} onChange={e => setEditing({ ...editing, max_guests: e.target.value === "" ? null : parseInt(e.target.value) })} /></div>
                <div><Label>Size m²</Label><Input type="number" inputMode="decimal" value={editing.size_sqm ?? ""} onChange={e => setEditing({ ...editing, size_sqm: e.target.value === "" ? null : parseFloat(e.target.value) })} /></div>
                <div><Label>Units</Label><Input type="number" inputMode="numeric" value={editing.units_total ?? ""} onChange={e => setEditing({ ...editing, units_total: e.target.value === "" ? null : parseInt(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Base rate (USD)</Label><Input type="number" step="0.01" inputMode="decimal" value={editing.base_rate_cents == null ? "" : editing.base_rate_cents / 100} onChange={e => setEditing({ ...editing, base_rate_cents: e.target.value === "" ? null : Math.round(parseFloat(e.target.value) * 100) })} /></div>
                <div><Label>Weekend rate (USD)</Label><Input type="number" step="0.01" inputMode="decimal" value={editing.weekend_rate_cents == null ? "" : editing.weekend_rate_cents / 100} onChange={e => setEditing({ ...editing, weekend_rate_cents: e.target.value === "" ? null : Math.round(parseFloat(e.target.value) * 100) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Weekly discount %</Label><Input type="number" inputMode="decimal" value={editing.weekly_discount_pct ?? ""} onChange={e => setEditing({ ...editing, weekly_discount_pct: e.target.value === "" ? null : parseFloat(e.target.value) })} /></div>
                <div><Label>Monthly discount %</Label><Input type="number" inputMode="decimal" value={editing.monthly_discount_pct ?? ""} onChange={e => setEditing({ ...editing, monthly_discount_pct: e.target.value === "" ? null : parseFloat(e.target.value) })} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Check-in time</Label><Input type="time" value={editing.check_in_time || ""} onChange={e => setEditing({ ...editing, check_in_time: e.target.value || null })} /></div>
                <div><Label>Check-out time</Label><Input type="time" value={editing.check_out_time || ""} onChange={e => setEditing({ ...editing, check_out_time: e.target.value || null })} /></div>
              </div>

              <div>
                <Label>Cancellation policy</Label>
                <select
                  value={editing.cancellation_policy || "flexible"}
                  onChange={e => setEditing({ ...editing, cancellation_policy: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CANCEL_POLICIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={!!editing.breakfast_included} onCheckedChange={v => setEditing({ ...editing, breakfast_included: v })} />
                <Label>Breakfast included</Label>
              </div>
              <div>
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {AMENITY_OPTIONS.map(a => {
                    const on = (editing.amenities || []).includes(a);
                    return (
                      <button key={a} type="button" onClick={() => toggleAmenity(a)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/40"}`}>{a}</button>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Add-ons (optional extras)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addAddon} className="h-7 gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {(editing.addons || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">e.g. Breakfast +$8/night, Airport pickup +$25/stay</p>
                ) : (
                  <div className="space-y-2">
                    {(editing.addons || []).map((a, i) => (
                      <div key={i} className="grid grid-cols-12 gap-1.5 items-center p-2 rounded-lg border border-border bg-muted/20">
                        <Input
                          className="col-span-5 h-8 text-xs"
                          placeholder="Breakfast"
                          value={a.name}
                          onChange={e => updateAddon(i, { name: e.target.value })}
                        />
                        <Input
                          className="col-span-3 h-8 text-xs"
                          type="number" step="0.01" inputMode="decimal"
                          placeholder="8.00"
                          value={a.price_cents == null ? "" : a.price_cents / 100}
                          onChange={e => updateAddon(i, { price_cents: e.target.value === "" ? 0 : Math.round(parseFloat(e.target.value) * 100) })}
                        />
                        <select
                          className="col-span-3 h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={a.per}
                          onChange={e => updateAddon(i, { per: e.target.value as LodgeAddon["per"] })}
                        >
                          <option value="stay">/ stay</option>
                          <option value="night">/ night</option>
                          <option value="guest">/ guest</option>
                        </select>
                        <Button type="button" size="icon" variant="ghost" className="col-span-1 h-8 w-8" onClick={() => removeAddon(i)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={editing.is_active !== false} onCheckedChange={v => setEditing({ ...editing, is_active: v })} />
                <Label>Active (visible on profile)</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
