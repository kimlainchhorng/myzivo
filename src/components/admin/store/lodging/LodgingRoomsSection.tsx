/**
 * Lodging — Rooms & Rates section.
 * CRUD for room types: name, type, beds, max guests, rates (USD), amenities, units.
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
import { BedDouble, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useLodgeRooms, type LodgeRoom } from "@/hooks/lodging/useLodgeRooms";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Villa", "Family", "Dormitory"];
const AMENITY_OPTIONS = ["AC", "Wi-Fi", "TV", "Mini-bar", "Safe", "Balcony", "Bathtub", "Pool view", "Sea view", "City view"];

export default function LodgingRoomsSection({ storeId }: { storeId: string }) {
  const { data: rooms = [], isLoading, upsert, remove } = useLodgeRooms(storeId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LodgeRoom> | null>(null);

  const blank = (): Partial<LodgeRoom> => ({
    store_id: storeId, name: "", room_type: "Standard", beds: "1 Queen", max_guests: 2,
    units_total: 1, base_rate_cents: 5000, weekend_rate_cents: 6000,
    weekly_discount_pct: 0, monthly_discount_pct: 0,
    breakfast_included: false, amenities: [], photos: [], sort_order: 0, is_active: true,
  });

  const openNew = () => { setEditing(blank()); setOpen(true); };
  const openEdit = (r: LodgeRoom) => { setEditing(r); setOpen(true); };

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
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BedDouble className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{r.name}</p>
                    {r.room_type && <Badge variant="secondary" className="text-[10px]">{r.room_type}</Badge>}
                    {!r.is_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
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
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Room" : "Add Room"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Deluxe Sea View" /></div>
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
                <div><Label>Max guests</Label><Input type="number" value={editing.max_guests || 2} onChange={e => setEditing({ ...editing, max_guests: parseInt(e.target.value) || 1 })} /></div>
                <div><Label>Size m²</Label><Input type="number" value={editing.size_sqm || ""} onChange={e => setEditing({ ...editing, size_sqm: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Units</Label><Input type="number" value={editing.units_total || 1} onChange={e => setEditing({ ...editing, units_total: parseInt(e.target.value) || 1 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Base rate (USD)</Label><Input type="number" step="0.01" value={(editing.base_rate_cents || 0) / 100} onChange={e => setEditing({ ...editing, base_rate_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} /></div>
                <div><Label>Weekend rate (USD)</Label><Input type="number" step="0.01" value={(editing.weekend_rate_cents || 0) / 100} onChange={e => setEditing({ ...editing, weekend_rate_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Weekly discount %</Label><Input type="number" value={editing.weekly_discount_pct || 0} onChange={e => setEditing({ ...editing, weekly_discount_pct: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Monthly discount %</Label><Input type="number" value={editing.monthly_discount_pct || 0} onChange={e => setEditing({ ...editing, monthly_discount_pct: parseFloat(e.target.value) || 0 })} /></div>
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
