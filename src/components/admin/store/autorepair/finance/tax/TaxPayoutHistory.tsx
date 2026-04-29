/**
 * Upgraded payout history with inline edit, source filter, search, and add/edit dialog.
 */
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Search, ExternalLink, Receipt } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney, PAYOUT_SOURCES, type TaxPayoutRow } from "@/lib/admin/taxCalculations";

interface Props {
  storeId: string;
  payouts: TaxPayoutRow[];
}

interface FormState {
  id?: string;
  payout_date: string;
  amount: string;
  source: string;
  reference: string;
  receipt_url: string;
}

const blankForm = (): FormState => ({
  payout_date: new Date().toISOString().slice(0, 10),
  amount: "",
  source: "Bank Deposit",
  reference: "",
  receipt_url: "",
});

export default function TaxPayoutHistory({ storeId, payouts }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm());
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payouts.filter((p) => {
      if (sourceFilter !== "all" && (p.source ?? "") !== sourceFilter) return false;
      if (!q) return true;
      return (
        (p.reference ?? "").toLowerCase().includes(q) ||
        (p.source ?? "").toLowerCase().includes(q)
      );
    });
  }, [payouts, search, sourceFilter]);

  const total = filtered.reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  const upsert = useMutation({
    mutationFn: async () => {
      const cents = Math.round((parseFloat(form.amount) || 0) * 100);
      if (cents <= 0) throw new Error("Amount must be greater than zero");
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        store_id: storeId,
        payout_date: form.payout_date,
        amount_cents: cents,
        source: form.source || null,
        reference: form.reference || null,
        receipt_url: form.receipt_url || null,
      };
      if (form.id) {
        const { error } = await supabase.from("ar_payouts" as any).update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ar_payouts" as any).insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(form.id ? "Payout updated" : "Payout recorded");
      setOpen(false);
      setForm(blankForm());
      qc.invalidateQueries({ queryKey: ["ar-tax-payouts", storeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_payouts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payout deleted");
      qc.invalidateQueries({ queryKey: ["ar-tax-payouts", storeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const startEdit = (p: TaxPayoutRow) => {
    setForm({
      id: p.id,
      payout_date: p.payout_date,
      amount: ((p.amount_cents ?? 0) / 100).toString(),
      source: p.source || "Bank Deposit",
      reference: p.reference || "",
      receipt_url: p.receipt_url || "",
    });
    setOpen(true);
  };

  const startCreate = () => { setForm(blankForm()); setOpen(true); };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Payout history
            <span className="text-[11px] font-normal text-muted-foreground">· Total {fmtMoney(total)}</span>
          </CardTitle>
          <Button size="sm" className="h-8 text-xs" onClick={startCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Record payout
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reference or source"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All sources</SelectItem>
              {PAYOUT_SOURCES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">No payouts match.</p>
        ) : (
          <ul className="divide-y">
            {filtered.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.source || "Payout"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {p.payout_date}{p.reference ? ` · ${p.reference}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {p.receipt_url && (
                    <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="font-semibold tabular-nums">{fmtMoney(p.amount_cents)}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove.mutate(p.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Payout" : "Record Payout"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.payout_date} onChange={(e) => setForm({ ...form, payout_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Amount (USD)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYOUT_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Reference</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Confirmation #, check #, etc." />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Receipt URL (optional)</Label>
              <Input value={form.receipt_url} onChange={(e) => setForm({ ...form, receipt_url: e.target.value })} placeholder="https://…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>{form.id ? "Save" : "Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
