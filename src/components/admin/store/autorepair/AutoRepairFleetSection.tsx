/**
 * Auto Repair — Fleet Accounts
 * Polished list (matches Invoices section visuals): contact line,
 * billing-terms badge, credit limit, action cluster.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Plus, FileDown, Trash2, Search, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

const TERMS_LABEL: Record<string, string> = {
  prepaid: "Prepaid", net_15: "Net 15", net_30: "Net 30", net_60: "Net 60",
};

const fmt = (cents: number) =>
  `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AutoRepairFleetSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", contact_name: "", contact_email: "", contact_phone: "",
    billing_terms: "net_30", credit_limit_cents: 0, po_required: false,
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["ar-fleet", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_fleet_accounts" as any)
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_fleet_accounts" as any).insert({ store_id: storeId, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fleet account added");
      qc.invalidateQueries({ queryKey: ["ar-fleet", storeId] });
      setOpen(false);
      setForm({ name: "", contact_name: "", contact_email: "", contact_phone: "",
        billing_terms: "net_30", credit_limit_cents: 0, po_required: false });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_fleet_accounts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fleet account removed");
      qc.invalidateQueries({ queryKey: ["ar-fleet", storeId] });
    },
  });

  const exportStatement = (acc: any) => {
    const csv =
      `Fleet Account,${acc.name}\n` +
      `Contact,${acc.contact_name ?? ""}\n` +
      `Email,${acc.contact_email ?? ""}\n` +
      `Phone,${acc.contact_phone ?? ""}\n` +
      `Terms,${TERMS_LABEL[acc.billing_terms] ?? acc.billing_terms}\n` +
      `Credit Limit,${fmt(acc.credit_limit_cents)}\n` +
      `PO Required,${acc.po_required ? "Yes" : "No"}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${acc.name}-statement.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => accounts.filter((a: any) =>
    !q || `${a.name} ${a.contact_name ?? ""} ${a.contact_email ?? ""} ${a.contact_phone ?? ""}`
      .toLowerCase().includes(q.toLowerCase())
  ), [accounts, q]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-4 h-4" /> Fleet Accounts
        </CardTitle>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Fleet
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, contact, email, or phone" className="pl-9"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No fleet accounts yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a: any) => (
              <div key={a.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm">{a.name}</span>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {TERMS_LABEL[a.billing_terms] ?? a.billing_terms}
                    </Badge>
                    {a.po_required && (
                      <Badge variant="outline" className="text-[10px]">PO required</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-2 flex-wrap">
                    <span>{a.contact_name || "No contact"}</span>
                    {a.contact_email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {a.contact_email}
                      </span>
                    )}
                    {a.contact_phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {a.contact_phone}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm tabular-nums">{fmt(a.credit_limit_cents)}</p>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">credit limit</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <Button size="icon" variant="ghost" className="h-7 w-7"
                      title="Download statement" onClick={() => exportStatement(a)}>
                      <FileDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Remove" onClick={() => del.mutate(a.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Add Fleet Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Company</p>
              <Input placeholder="Company name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Primary contact</p>
              <div className="space-y-2">
                <Input placeholder="Contact name" value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="email" placeholder="Email" value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                  <Input type="tel" placeholder="Phone" value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Billing</p>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.billing_terms} onValueChange={(v) => setForm({ ...form, billing_terms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="net_15">Net 15</SelectItem>
                    <SelectItem value="net_30">Net 30</SelectItem>
                    <SelectItem value="net_60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Credit limit (USD)"
                  value={(form.credit_limit_cents / 100) || ""}
                  onChange={(e) => setForm({ ...form, credit_limit_cents: Math.round((Number(e.target.value) || 0) * 100) })} />
              </div>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="checkbox" checked={form.po_required}
                  onChange={(e) => setForm({ ...form, po_required: e.target.checked })} />
                PO number required on invoices
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
              Add Fleet Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
