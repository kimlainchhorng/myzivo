/**
 * Auto Repair — Warranty & Comebacks
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AutoRepairWarrantySection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ workorder_id: "", service_name: "", period_days: 90, mileage_limit: 6000, notes: "" });

  const { data: warranties = [] } = useQuery({
    queryKey: ["ar-warranties", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_warranties" as any).select("*").eq("store_id", storeId).order("starts_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["ar-work-orders", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_work_orders" as any).select("id,number,is_comeback,status").eq("store_id", storeId);
      if (error) throw error;
      return data as any[];
    },
  });

  const stats = useMemo(() => {
    const total = orders.length;
    const comebacks = orders.filter((o: any) => o.is_comeback).length;
    const rate = total > 0 ? (comebacks / total) * 100 : 0;
    return { total, comebacks, rate };
  }, [orders]);

  const create = useMutation({
    mutationFn: async () => {
      const expires_at = form.period_days
        ? new Date(Date.now() + form.period_days * 86400000).toISOString().slice(0, 10)
        : null;
      const { error } = await supabase.from("ar_warranties" as any).insert({
        store_id: storeId, ...form, expires_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Warranty added");
      qc.invalidateQueries({ queryKey: ["ar-warranties", storeId] });
      setOpen(false);
      setForm({ workorder_id: "", service_name: "", period_days: 90, mileage_limit: 6000, notes: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const toggleComeback = useMutation({
    mutationFn: async ({ id, is_comeback }: { id: string; is_comeback: boolean }) => {
      const { error } = await supabase.from("ar_work_orders" as any).update({ is_comeback }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Warranty & Comebacks</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] uppercase text-muted-foreground">Total ROs</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] uppercase text-muted-foreground">Comebacks</p>
            <p className="text-2xl font-bold">{stats.comebacks}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] uppercase text-muted-foreground">Comeback rate</p>
            <p className="text-2xl font-bold">{stats.rate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> Add Warranty</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Active Warranties</CardTitle></CardHeader>
        <CardContent>
          {warranties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No warranties on file.</p>
          ) : (
            <div className="space-y-2">
              {warranties.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-sm">{w.service_name}</p>
                    <p className="text-xs text-muted-foreground">{w.period_days}d · {w.mileage_limit?.toLocaleString()} mi</p>
                  </div>
                  <Badge variant="outline">{w.expires_at ?? "—"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Flag Comeback</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No work orders yet.</p>
          ) : (
            <div className="space-y-1.5">
              {orders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span>{o.number} · <span className="text-muted-foreground capitalize">{o.status}</span></span>
                  <Button size="sm" variant={o.is_comeback ? "destructive" : "outline"}
                    onClick={() => toggleComeback.mutate({ id: o.id, is_comeback: !o.is_comeback })}>
                    {o.is_comeback ? "Comeback" : "Mark comeback"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Warranty</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Select value={form.workorder_id} onValueChange={(v) => setForm({ ...form, workorder_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select work order" /></SelectTrigger>
              <SelectContent>{orders.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.number}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Service name (e.g. Brake pads)" value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Days" value={form.period_days} onChange={(e) => setForm({ ...form, period_days: Number(e.target.value) || 0 })} />
              <Input type="number" placeholder="Mileage limit" value={form.mileage_limit} onChange={(e) => setForm({ ...form, mileage_limit: Number(e.target.value) || 0 })} />
            </div>
            <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.workorder_id || !form.service_name} onClick={() => create.mutate()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
