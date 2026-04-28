/**
 * Auto Repair — Customer Vehicles (garage / CRM)
 * Wired to ar_customer_vehicles. Owners can add, edit, delete.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Car from "lucide-react/dist/esm/icons/car";
import Plus from "lucide-react/dist/esm/icons/plus";
import Search from "lucide-react/dist/esm/icons/search";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Phone from "lucide-react/dist/esm/icons/phone";
import { toast } from "sonner";

interface Props { storeId: string }

type Vehicle = {
  id: string;
  store_id: string;
  owner_name: string;
  owner_phone?: string | null;
  owner_email?: string | null;
  year?: number | null;
  make: string;
  model: string;
  vin?: string | null;
  plate?: string | null;
  color?: string | null;
  mileage?: number | null;
  notes?: string | null;
  created_at: string;
};

const blankForm = {
  owner_name: "", owner_phone: "", owner_email: "",
  year: "", make: "", model: "", vin: "", plate: "", color: "",
  mileage: "", notes: "",
};

export default function AutoRepairVehiclesSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["ar-customer-vehicles", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_customer_vehicles")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vehicle[];
    },
  });

  const filtered = useMemo(() => {
    if (!q) return vehicles;
    const s = q.toLowerCase();
    return vehicles.filter(v =>
      `${v.year ?? ""} ${v.make} ${v.model} ${v.plate ?? ""} ${v.vin ?? ""} ${v.owner_name}`.toLowerCase().includes(s)
    );
  }, [vehicles, q]);

  const upsert = useMutation({
    mutationFn: async () => {
      if (!form.owner_name.trim() || !form.make.trim() || !form.model.trim()) {
        throw new Error("Owner name, make, and model are required");
      }
      const payload = {
        store_id: storeId,
        owner_name: form.owner_name.trim(),
        owner_phone: form.owner_phone.trim() || null,
        owner_email: form.owner_email.trim() || null,
        year: form.year ? parseInt(form.year, 10) : null,
        make: form.make.trim(),
        model: form.model.trim(),
        vin: form.vin.trim() || null,
        plate: form.plate.trim() || null,
        color: form.color.trim() || null,
        mileage: form.mileage ? parseInt(form.mileage, 10) : 0,
        notes: form.notes.trim() || null,
      };
      if (editId) {
        const { error } = await supabase.from("ar_customer_vehicles").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ar_customer_vehicles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Vehicle updated" : "Vehicle added");
      qc.invalidateQueries({ queryKey: ["ar-customer-vehicles", storeId] });
      setOpen(false); setEditId(null); setForm(blankForm);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_customer_vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle removed");
      qc.invalidateQueries({ queryKey: ["ar-customer-vehicles", storeId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const startEdit = (v: Vehicle) => {
    setEditId(v.id);
    setForm({
      owner_name: v.owner_name,
      owner_phone: v.owner_phone ?? "",
      owner_email: v.owner_email ?? "",
      year: v.year ? String(v.year) : "",
      make: v.make,
      model: v.model,
      vin: v.vin ?? "",
      plate: v.plate ?? "",
      color: v.color ?? "",
      mileage: v.mileage ? String(v.mileage) : "",
      notes: v.notes ?? "",
    });
    setOpen(true);
  };

  const startNew = () => { setEditId(null); setForm(blankForm); setOpen(true); };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4" /> Customer Vehicles
            <Badge variant="secondary" className="ml-1">{vehicles.length}</Badge>
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={startNew}>
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by owner, plate, VIN, or model" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-3">
          <Car className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{vehicles.length === 0 ? "No customer vehicles yet." : "No vehicles match your search."}</p>
          {vehicles.length === 0 && <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add the first vehicle</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(v => (
            <Card key={v.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.owner_name}{v.plate ? ` · ${v.plate}` : ""}</p>
                  </div>
                  {!!v.mileage && <Badge variant="secondary" className="text-[10px] font-mono shrink-0">{v.mileage.toLocaleString()} mi</Badge>}
                </div>
                {v.vin && <p className="text-[11px] text-muted-foreground font-mono truncate">VIN: {v.vin}</p>}
                {v.owner_phone && (
                  <a href={`tel:${v.owner_phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline">
                    <Phone className="w-3 h-3" /> {v.owner_phone}
                  </a>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-8 gap-1.5" onClick={() => startEdit(v)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => {
                    if (confirm(`Delete ${v.year ?? ""} ${v.make} ${v.model}?`)) remove.mutate(v.id);
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Vehicle" : "Add Customer Vehicle"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Input className="col-span-2" placeholder="Owner name *" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
            <Input placeholder="Phone" value={form.owner_phone} onChange={e => setForm({ ...form, owner_phone: e.target.value })} />
            <Input placeholder="Email" value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} />
            <Input placeholder="Year" inputMode="numeric" value={form.year} onChange={e => setForm({ ...form, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
            <Input placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            <Input placeholder="Make *" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <Input placeholder="Model *" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <Input className="col-span-2 font-mono" placeholder="VIN" maxLength={17} value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value.toUpperCase() })} />
            <Input placeholder="License plate" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
            <Input placeholder="Mileage" inputMode="numeric" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value.replace(/\D/g, "") })} />
            <Textarea className="col-span-2" placeholder="Notes (optional)" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving..." : editId ? "Save changes" : "Add vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
