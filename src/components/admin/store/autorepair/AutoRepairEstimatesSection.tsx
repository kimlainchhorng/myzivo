/**
 * Auto Repair — Estimates & Quotes
 * Polished list (matches Invoices section visuals): customer + vehicle line,
 * status badge, totals, action cluster (Send / Convert / status).
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileSignature, Plus, Send, ArrowRightCircle, Search, Trash2,
  ClipboardList, Receipt, Eye, Printer,
} from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

type LineItem = { kind: "part" | "labor"; name: string; qty: number; unit_cents: number };

const STATUSES = ["draft", "sent", "approved", "declined", "expired"] as const;
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline", sent: "secondary", approved: "default", declined: "destructive", expired: "outline",
};

const fmt = (cents: number) =>
  `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AutoRepairEstimatesSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    number: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    vehicle_label: "",
    notes: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ kind: "labor", name: "", qty: 1, unit_cents: 0 }]);

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["ar-estimates", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_estimates" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_cents, 0);
  const tax = 0;
  const total = subtotal + tax;

  const resetForm = () => {
    setForm({ number: "", customer_name: "", customer_phone: "", customer_email: "", vehicle_label: "", notes: "" });
    setItems([{ kind: "labor", name: "", qty: 1, unit_cents: 0 }]);
  };

  const createEstimate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_estimates" as any).insert({
        store_id: storeId,
        number: form.number || `EST-${Date.now().toString().slice(-6)}`,
        status: "draft",
        line_items: items as any,
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: total,
        notes: form.notes,
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        vehicle_label: form.vehicle_label || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estimate created");
      qc.invalidateQueries({ queryKey: ["ar-estimates", storeId] });
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ar_estimates" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-estimates", storeId] }),
  });

  const removeEstimate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_estimates" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estimate deleted");
      qc.invalidateQueries({ queryKey: ["ar-estimates", storeId] });
    },
  });

  const convertToWO = useMutation({
    mutationFn: async (est: any) => {
      const { data, error } = await supabase.from("ar_work_orders" as any).insert({
        store_id: storeId,
        estimate_id: est.id,
        number: `WO-${Date.now().toString().slice(-6)}`,
        status: "awaiting",
        parts_used: (est.line_items || []).filter((i: any) => i.kind === "part"),
        total_cents: est.total_cents,
        customer_name: est.customer_name,
        customer_phone: est.customer_phone,
        customer_email: est.customer_email,
        vehicle_label: est.vehicle_label,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("ar_estimates" as any).update({
        status: "approved",
        converted_workorder_id: (data as any).id,
      }).eq("id", est.id);
    },
    onSuccess: () => {
      toast.success("Converted to Work Order");
      qc.invalidateQueries({ queryKey: ["ar-estimates", storeId] });
      qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const filtered = useMemo(() => estimates.filter((e: any) =>
    !q || `${e.number} ${e.customer_name ?? ""} ${e.vehicle_label ?? ""} ${e.notes ?? ""}`
      .toLowerCase().includes(q.toLowerCase())
  ), [estimates, q]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileSignature className="w-4 h-4" /> Estimates & Quotes
        </CardTitle>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Estimate
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by number, customer, vehicle, or notes" className="pl-9"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground px-1 py-6 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No estimates yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((e: any) => (
              <div key={e.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm">{e.number}</span>
                    <Badge variant={STATUS_VARIANT[e.status]} className="text-[10px] capitalize">{e.status}</Badge>
                    {e.converted_workorder_id && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ArrowRightCircle className="w-3 h-3" /> WO created
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.customer_name || "No customer"}
                    {e.vehicle_label ? ` · ${e.vehicle_label}` : ""}
                    {` · ${e.line_items?.length ?? 0} items`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm tabular-nums">{fmt(e.total_cents)}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    {e.status === "draft" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7"
                        title="Send" onClick={() => setStatus.mutate({ id: e.id, status: "sent" })}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {!e.converted_workorder_id && e.status !== "declined" && e.status !== "expired" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7"
                        title="Convert to Work Order" onClick={() => convertToWO.mutate(e)}>
                        <ArrowRightCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Select value={e.status} onValueChange={(v) => setStatus.mutate({ id: e.id, status: v })}>
                      <SelectTrigger className="h-7 w-[100px] text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Delete" onClick={() => removeEstimate.mutate(e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-4 h-4" /> New Estimate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Estimate number (auto if blank)" value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Customer</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Customer name" value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                <Input placeholder="Vehicle (e.g. 2020 Toyota Camry)" value={form.vehicle_label}
                  onChange={(e) => setForm({ ...form, vehicle_label: e.target.value })} />
                <Input type="tel" placeholder="Phone" value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                <Input type="email" placeholder="Email" value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Line items</p>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <Select value={it.kind} onValueChange={(v: any) =>
                      setItems((arr) => arr.map((x, i) => i === idx ? { ...x, kind: v } : x))}>
                      <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="part">Part</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="col-span-5 h-9" placeholder="Description" value={it.name}
                      onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                    <Input className="col-span-2 h-9" type="number" placeholder="Qty" value={it.qty || ""}
                      onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value) || 0 } : x))} />
                    <Input className="col-span-2 h-9" type="number" placeholder="$" value={(it.unit_cents / 100) || ""}
                      onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, unit_cents: Math.round((Number(e.target.value) || 0) * 100) } : x))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline"
                  onClick={() => setItems((a) => [...a, { kind: "labor", name: "", qty: 1, unit_cents: 0 }])}>
                  <Plus className="w-3 h-3 mr-1" /> Add line
                </Button>
                {items.length > 1 && (
                  <Button size="sm" variant="ghost" onClick={() => setItems((a) => a.slice(0, -1))}>
                    <Trash2 className="w-3 h-3 mr-1" /> Remove last
                  </Button>
                )}
              </div>
            </div>

            <Textarea placeholder="Notes" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold tabular-nums">{fmt(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createEstimate.mutate()} disabled={createEstimate.isPending}>
              Create Estimate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
