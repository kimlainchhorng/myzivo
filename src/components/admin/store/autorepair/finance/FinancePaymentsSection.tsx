/**
 * Auto Repair Finance — Payments Received
 * Shows ar_invoice_payments rows + manual record-payment.
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Banknote, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }
const fmt = (cents: number) => `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinancePaymentsSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState("all");
  const [form, setForm] = useState({ invoice_id: "", amount: "", method: "cash", reference: "", notes: "" });

  const { data: payments = [] } = useQuery({
    queryKey: ["ar-fin-payments", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_invoice_payments" as any)
        .select("id,amount_cents,method,reference,notes,paid_at,invoice_id")
        .eq("store_id", storeId)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["ar-fin-payments-invoices", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_invoices" as any)
        .select("id,number,total_cents,amount_paid_cents,customer_name")
        .eq("store_id", storeId)
        .neq("status", "void")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const cents = Math.round((parseFloat(form.amount) || 0) * 100);
      if (!form.invoice_id) throw new Error("Pick an invoice");
      if (cents <= 0) throw new Error("Amount must be greater than zero");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("ar_invoice_payments" as any).insert({
        store_id: storeId,
        invoice_id: form.invoice_id,
        amount_cents: cents,
        method: form.method,
        reference: form.reference || null,
        notes: form.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setOpen(false);
      setForm({ invoice_id: "", amount: "", method: "cash", reference: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["ar-fin-payments", storeId] });
      qc.invalidateQueries({ queryKey: ["ar-fin-payments-invoices", storeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const filtered = useMemo(
    () => methodFilter === "all" ? payments : payments.filter((p: any) => p.method === methodFilter),
    [payments, methodFilter]
  );
  const total = filtered.reduce((s, p: any) => s + (p.amount_cents ?? 0), 0);
  const invoiceMap = useMemo(() => {
    const m = new Map<string, any>();
    invoices.forEach((i: any) => m.set(i.id, i));
    return m;
  }, [invoices]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" /> Payments Received
          </CardTitle>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Record payment</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Filtered total</div>
              <div className="text-xl font-semibold">{fmt(total)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Payment count</div>
              <div className="text-xl font-semibold">{filtered.length}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Avg payment</div>
              <div className="text-xl font-semibold">{fmt(filtered.length ? total / filtered.length : 0)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Method</Label>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="aba">ABA</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((p: any) => {
                const inv = invoiceMap.get(p.invoice_id);
                return (
                  <li key={p.id} className="py-2 flex justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{inv?.number ?? "(invoice removed)"} · {inv?.customer_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.method.toUpperCase()} · {new Date(p.paid_at).toLocaleString()} {p.reference && `· ${p.reference}`}
                      </div>
                    </div>
                    <div className="font-medium tabular-nums">{fmt(p.amount_cents)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Invoice</Label>
              <Select value={form.invoice_id} onValueChange={(v) => setForm({ ...form, invoice_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.map((i: any) => {
                    const balance = (i.total_cents ?? 0) - (i.amount_paid_cents ?? 0);
                    return (
                      <SelectItem key={i.id} value={i.id}>
                        {i.number} — {i.customer_name || "—"} ({fmt(balance)} due)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount (USD)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="aba">ABA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Reference (optional)</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Check #, txn ID, etc" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
