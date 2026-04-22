/**
 * Auto Repair — Work Orders
 * Two-mode UI: list view (matches Invoices look) + Kanban toggle.
 * Includes customer + vehicle on every row, status badge, tech assignment,
 * and labor / total summary like Invoices.
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer, Plus, Search, LayoutGrid, List, Trash2, AlertOctagon, User } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

const COLS = [
  { id: "awaiting", label: "Awaiting" },
  { id: "in_progress", label: "In Progress" },
  { id: "on_hold", label: "On Hold" },
  { id: "qc", label: "QC" },
  { id: "done", label: "Done" },
] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  awaiting: "outline", in_progress: "secondary", on_hold: "destructive", qc: "secondary", done: "default",
};

const fmt = (cents: number) =>
  `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AutoRepairWorkOrdersSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    number: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    vehicle_label: "",
    notes: "",
  });

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

  const techMap = useMemo(() => {
    const m: Record<string, string> = {};
    techs.forEach((t: any) => { m[t.id] = t.name; });
    return m;
  }, [techs]);

  const filtered = useMemo(() => orders.filter((o: any) =>
    !q || `${o.number} ${o.customer_name ?? ""} ${o.vehicle_label ?? ""} ${o.notes ?? ""}`
      .toLowerCase().includes(q.toLowerCase())
  ), [orders, q]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { awaiting: [], in_progress: [], on_hold: [], qc: [], done: [] };
    filtered.forEach((o: any) => g[o.status]?.push(o));
    return g;
  }, [filtered]);

  const resetForm = () =>
    setForm({ number: "", customer_name: "", customer_phone: "", customer_email: "", vehicle_label: "", notes: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_work_orders" as any).insert({
        store_id: storeId,
        number: form.number || `WO-${Date.now().toString().slice(-6)}`,
        status: "awaiting",
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        vehicle_label: form.vehicle_label || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Work order created");
      qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] });
      setOpen(false);
      resetForm();
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

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_work_orders" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Work order deleted");
      qc.invalidateQueries({ queryKey: ["ar-work-orders", storeId] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle className="text-base flex items-center gap-2">
          <Hammer className="w-4 h-4" /> Work Orders
        </CardTitle>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="h-7 px-2 text-xs gap-1"><List className="w-3.5 h-3.5" /> List</TabsTrigger>
              <TabsTrigger value="kanban" className="h-7 px-2 text-xs gap-1"><LayoutGrid className="w-3.5 h-3.5" /> Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New RO
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by RO number, customer, vehicle, or notes" className="pl-9"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Hammer className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No work orders yet. Create one to get started.</p>
          </div>
        ) : view === "list" ? (
          <div className="space-y-2">
            {filtered.map((o: any) => (
              <div key={o.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm">{o.number}</span>
                    <Badge variant={STATUS_VARIANT[o.status] ?? "outline"} className="text-[10px] capitalize">
                      {o.status?.replace("_", " ")}
                    </Badge>
                    {o.is_comeback && (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertOctagon className="w-3 h-3" /> Comeback
                      </Badge>
                    )}
                    {o.technician_id && techMap[o.technician_id] && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <User className="w-3 h-3" /> {techMap[o.technician_id]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {o.customer_name || "No customer"}
                    {o.vehicle_label ? ` · ${o.vehicle_label}` : ""}
                    {` · ${o.labor_hours ?? 0}h labor`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm tabular-nums">{fmt(o.total_cents)}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <Select value={o.status}
                      onValueChange={(v) => update.mutate({ id: o.id, patch: { status: v } })}>
                      <SelectTrigger className="h-7 w-[110px] text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COLS.map((c) => <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={o.technician_id ?? "_unassigned"}
                      onValueChange={(v) => update.mutate({ id: o.id, patch: { technician_id: v === "_unassigned" ? null : v } })}>
                      <SelectTrigger className="h-7 w-[110px] text-[11px]"><SelectValue placeholder="Tech" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_unassigned" className="text-xs">Unassigned</SelectItem>
                        {techs.map((t: any) => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Delete" onClick={() => remove.mutate(o.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                        {(o.customer_name || o.vehicle_label) && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {o.customer_name}
                            {o.vehicle_label ? ` · ${o.vehicle_label}` : ""}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {o.labor_hours ?? 0}h · {fmt(o.total_cents)}
                        </p>
                        <Select value={o.status}
                          onValueChange={(v) => update.mutate({ id: o.id, patch: { status: v } })}>
                          <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {COLS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={o.technician_id ?? "_unassigned"}
                          onValueChange={(v) => update.mutate({ id: o.id, patch: { technician_id: v === "_unassigned" ? null : v } })}>
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
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hammer className="w-4 h-4" /> New Work Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="RO number (auto if blank)" value={form.number}
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
            <Textarea placeholder="Notes" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>Create RO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
