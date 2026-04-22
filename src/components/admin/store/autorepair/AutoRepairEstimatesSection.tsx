/**
 * Auto Repair — Estimates & Quotes
 * List, create, send estimates with line items; convert to Work Order.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Plus, Send, ArrowRightCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

type LineItem = { kind: "part" | "labor"; name: string; qty: number; unit_cents: number };

const STATUSES = ["draft", "sent", "approved", "declined", "expired"] as const;
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline", sent: "secondary", approved: "default", declined: "destructive", expired: "outline",
};

export default function AutoRepairEstimatesSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [notes, setNotes] = useState("");
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
  const tax = Math.round(subtotal * 0.0);
  const total = subtotal + tax;

  const createEstimate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_estimates" as any).insert({
        store_id: storeId,
        number: number || `EST-${Date.now().toString().slice(-6)}`,
        status: "draft",
        line_items: items as any,
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: total,
        notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estimate created");
      qc.invalidateQueries({ queryKey: ["ar-estimates", storeId] });
      setOpen(false);
      setNumber(""); setNotes("");
      setItems([{ kind: "labor", name: "", qty: 1, unit_cents: 0 }]);
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

  const convertToWO = useMutation({
    mutationFn: async (est: any) => {
      const { data, error } = await supabase.from("ar_work_orders" as any).insert({
        store_id: storeId,
        estimate_id: est.id,
        number: `WO-${Date.now().toString().slice(-6)}`,
        status: "awaiting",
        parts_used: (est.line_items || []).filter((i: any) => i.kind === "part"),
        total_cents: est.total_cents,
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

  const filtered = estimates.filter((e: any) =>
    !q || `${e.number} ${e.notes ?? ""}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSignature className="w-4 h-4" /> Estimates & Quotes
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New Estimate
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by number or notes" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground px-1">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No estimates yet. Create one to get started.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{e.number}</p>
                    <Badge variant={STATUS_VARIANT[e.status]} className="capitalize">{e.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(e.line_items?.length ?? 0)} items · ${(e.total_cents / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {e.status === "draft" && (
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => setStatus.mutate({ id: e.id, status: "sent" })}>
                      <Send className="w-3 h-3" /> Send
                    </Button>
                  )}
                  {e.status !== "approved" && !e.converted_workorder_id && (
                    <Button size="sm" className="gap-1.5" onClick={() => convertToWO.mutate(e)}>
                      <ArrowRightCircle className="w-3 h-3" /> Convert
                    </Button>
                  )}
                  <Select value={e.status} onValueChange={(v) => setStatus.mutate({ id: e.id, status: v })}>
                    <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Estimate</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Estimate number (auto if blank)" value={number} onChange={(e) => setNumber(e.target.value)} />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Line items</p>
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Select value={it.kind} onValueChange={(v: any) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, kind: v } : x))}>
                    <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part">Part</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="col-span-5 h-9" placeholder="Description" value={it.name}
                    onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                  <Input className="col-span-2 h-9" type="number" placeholder="Qty" value={it.qty}
                    onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value) || 0 } : x))} />
                  <Input className="col-span-2 h-9" type="number" placeholder="$" value={(it.unit_cents / 100) || ""}
                    onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, unit_cents: Math.round((Number(e.target.value) || 0) * 100) } : x))} />
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setItems((a) => [...a, { kind: "labor", name: "", qty: 1, unit_cents: 0 }])}>
                  <Plus className="w-3 h-3 mr-1" /> Add line
                </Button>
                {items.length > 1 && (
                  <Button size="sm" variant="ghost" onClick={() => setItems((a) => a.slice(0, -1))}>
                    <Trash2 className="w-3 h-3 mr-1" /> Remove last
                  </Button>
                )}
              </div>
            </div>
            <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${(total / 100).toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createEstimate.mutate()} disabled={createEstimate.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
