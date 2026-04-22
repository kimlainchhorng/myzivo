/**
 * Auto Repair — Work Orders kanban
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Hammer, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

const COLS: { id: string; label: string }[] = [
  { id: "awaiting", label: "Awaiting" },
  { id: "in_progress", label: "In Progress" },
  { id: "on_hold", label: "On Hold" },
  { id: "qc", label: "QC" },
  { id: "done", label: "Done" },
];

export default function AutoRepairWorkOrdersSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["ar-work-orders", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_work_orders" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: techs = [] } = useQuery({
    queryKey: ["ar-technicians", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_technicians" as any).select("id,name").eq("store_id", storeId).eq("active", true);
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = useMemo(() => orders.filter((o: any) =>
    !q || `${o.number} ${o.notes ?? ""}`.toLowerCase().includes(q.toLowerCase())
  ), [orders, q]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { awaiting: [], in_progress: [], on_hold: [], qc: [], done: [] };
    filtered.forEach((o: any) => g[o.status]?.push(o));
    return g;
  }, [filtered]);

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_work_orders" as any).insert({
        store_id: storeId,
        number: number || `WO-${Date.now().toString().slice(-6)}`,
        status: "awaiting",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Work order created");
      qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] });
      setOpen(false); setNumber("");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("ar_work_orders" as any).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Hammer className="w-4 h-4" /> Work Orders
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New RO
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search RO number or notes" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground px-1">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {COLS.map((col) => (
            <div key={col.id} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</p>
                <Badge variant="outline" className="text-[10px]">{grouped[col.id]?.length ?? 0}</Badge>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {(grouped[col.id] ?? []).map((o: any) => (
                  <Card key={o.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{o.number}</p>
                        {o.is_comeback && <Badge variant="destructive" className="text-[9px]">Comeback</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {o.labor_hours ?? 0}h · ${((o.total_cents ?? 0) / 100).toFixed(2)}
                      </p>
                      <Select value={o.status} onValueChange={(v) => update.mutate({ id: o.id, patch: { status: v } })}>
                        <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select
                        value={o.technician_id ?? "_unassigned"}
                        onValueChange={(v) => update.mutate({ id: o.id, patch: { technician_id: v === "_unassigned" ? null : v } })}
                      >
                        <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Assign tech" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_unassigned">Unassigned</SelectItem>
                          {techs.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Work Order</DialogTitle></DialogHeader>
          <Input placeholder="RO number (auto if blank)" value={number} onChange={(e) => setNumber(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
