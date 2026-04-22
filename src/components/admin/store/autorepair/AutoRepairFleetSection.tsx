/**
 * Auto Repair — Fleet Accounts
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
import { Truck, Plus, FileDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AutoRepairFleetSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contact_name: "", contact_email: "", contact_phone: "", billing_terms: "net_30", credit_limit_cents: 0, po_required: false });

  const { data: accounts = [] } = useQuery({
    queryKey: ["ar-fleet", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_fleet_accounts" as any).select("*").eq("store_id", storeId).order("created_at", { ascending: false });
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
      setForm({ name: "", contact_name: "", contact_email: "", contact_phone: "", billing_terms: "net_30", credit_limit_cents: 0, po_required: false });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_fleet_accounts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-fleet", storeId] }),
  });

  const exportStatement = (acc: any) => {
    const csv = `Fleet Account,${acc.name}\nContact,${acc.contact_name ?? ""}\nEmail,${acc.contact_email ?? ""}\nTerms,${acc.billing_terms}\nCredit Limit,$${(acc.credit_limit_cents / 100).toFixed(2)}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${acc.name}-statement.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" /> Fleet Accounts</CardTitle>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> Add Fleet</Button>
        </CardHeader>
      </Card>

      {accounts.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No fleet accounts yet.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {accounts.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.contact_name || "—"} · {a.contact_email || a.contact_phone || "—"}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase">{a.billing_terms.replace("_", " ")}</Badge>
                    {a.po_required && <Badge variant="secondary" className="text-[10px]">PO required</Badge>}
                    <Badge variant="outline" className="text-[10px]">${(a.credit_limit_cents / 100).toFixed(0)} limit</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportStatement(a)}>
                    <FileDown className="w-3.5 h-3.5" /> Statement
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(a.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Fleet Account</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input placeholder="Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <Select value={form.billing_terms} onValueChange={(v) => setForm({ ...form, billing_terms: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="net_15">Net 15</SelectItem>
                <SelectItem value="net_30">Net 30</SelectItem>
                <SelectItem value="net_60">Net 60</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Credit limit (USD)" value={(form.credit_limit_cents / 100) || ""}
              onChange={(e) => setForm({ ...form, credit_limit_cents: Math.round((Number(e.target.value) || 0) * 100) })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.po_required} onChange={(e) => setForm({ ...form, po_required: e.target.checked })} />
              PO number required
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name} onClick={() => create.mutate()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
