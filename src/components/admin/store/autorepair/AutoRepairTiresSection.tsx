/**
 * Auto Repair — Tire Inventory
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleDot, Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AutoRepairTiresSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", size: "", load_index: "", speed_rating: "", season: "all-season", dot: "", qty: 0, cost_cents: 0, retail_cents: 0, reorder_point: 4 });

  const { data: tires = [] } = useQuery({
    queryKey: ["ar-tires", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_tires" as any).select("*").eq("store_id", storeId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_tires" as any).insert({ store_id: storeId, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tire added");
      qc.invalidateQueries({ queryKey: ["ar-tires", storeId] });
      setOpen(false);
      setForm({ brand: "", model: "", size: "", load_index: "", speed_rating: "", season: "all-season", dot: "", qty: 0, cost_cents: 0, retail_cents: 0, reorder_point: 4 });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_tires" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-tires", storeId] }),
  });

  const filtered = tires.filter((t: any) =>
    !q || `${t.brand} ${t.model} ${t.size} ${t.dot}`.toLowerCase().includes(q.toLowerCase())
  );
  const lowStock = tires.filter((t: any) => t.qty <= t.reorder_point).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CircleDot className="w-4 h-4" /> Tire Inventory
            {lowStock > 0 && <Badge variant="destructive" className="ml-2 gap-1"><AlertTriangle className="w-3 h-3" /> {lowStock} low</Badge>}
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> Add Tire</Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by brand, size, DOT" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No tires in stock.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{t.brand} {t.model} <span className="font-mono text-sm text-muted-foreground">{t.size}</span></p>
                  <p className="text-xs text-muted-foreground">{t.season} · DOT {t.dot || "—"} · ${(t.retail_cents / 100).toFixed(2)} retail</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.qty <= t.reorder_point ? "destructive" : "outline"}>{t.qty} in stock</Badge>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Tire</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <Input placeholder="Size (e.g. 225/65R17)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Load index" value={form.load_index} onChange={(e) => setForm({ ...form, load_index: e.target.value })} />
              <Input placeholder="Speed rating" value={form.speed_rating} onChange={(e) => setForm({ ...form, speed_rating: e.target.value })} />
            </div>
            <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-season">All-season</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="DOT code" value={form.dot} onChange={(e) => setForm({ ...form, dot: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Qty" value={form.qty || ""} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) || 0 })} />
              <Input type="number" placeholder="Cost $" value={(form.cost_cents / 100) || ""} onChange={(e) => setForm({ ...form, cost_cents: Math.round((Number(e.target.value) || 0) * 100) })} />
              <Input type="number" placeholder="Retail $" value={(form.retail_cents / 100) || ""} onChange={(e) => setForm({ ...form, retail_cents: Math.round((Number(e.target.value) || 0) * 100) })} />
            </div>
            <Input type="number" placeholder="Reorder point" value={form.reorder_point} onChange={(e) => setForm({ ...form, reorder_point: Number(e.target.value) || 0 })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.size} onClick={() => create.mutate()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
