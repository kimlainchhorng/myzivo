/**
 * Auto Repair Finance — Expenses & Bills
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

const CATEGORIES = ["parts", "rent", "utilities", "supplies", "tools", "marketing", "insurance", "payroll", "other"] as const;
const fmt = (cents: number) => `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceExpensesSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [form, setForm] = useState({
    category: "parts",
    vendor: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    notes: "",
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["ar-fin-expenses", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_expenses" as any).select("*").eq("store_id", storeId)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const cents = Math.round((parseFloat(form.amount) || 0) * 100);
      if (cents <= 0) throw new Error("Amount must be greater than zero");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("ar_expenses" as any).insert({
        store_id: storeId,
        category: form.category,
        vendor: form.vendor || null,
        description: form.description || null,
        amount_cents: cents,
        expense_date: form.expense_date,
        payment_method: form.payment_method,
        notes: form.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expense saved");
      setOpen(false);
      setForm({ ...form, vendor: "", description: "", amount: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["ar-fin-expenses", storeId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to save expense"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_expenses" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["ar-fin-expenses", storeId] });
    },
  });

  const filtered = useMemo(
    () => filterCat === "all" ? expenses : expenses.filter((e: any) => e.category === filterCat),
    [expenses, filterCat]
  );
  const monthTotal = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return expenses
      .filter((e: any) => new Date(e.expense_date) >= monthAgo)
      .reduce((s, e: any) => s + (e.amount_cents ?? 0), 0);
  }, [expenses]);
  const total = filtered.reduce((s, e: any) => s + (e.amount_cents ?? 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> Expenses & Bills
          </CardTitle>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add expense</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Last 30 days</div>
              <div className="text-xl font-semibold">{fmt(monthTotal)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">All time</div>
              <div className="text-xl font-semibold">{fmt(expenses.reduce((s, e: any) => s + (e.amount_cents ?? 0), 0))}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Filtered total</div>
              <div className="text-xl font-semibold">{fmt(total)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Filter</Label>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No expenses yet.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((e: any) => (
                <li key={e.id} className="py-2 flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{e.vendor || e.description || "(No vendor)"}</div>
                    <div className="text-xs text-muted-foreground">{e.category} · {e.expense_date} · {e.payment_method || "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{fmt(e.amount_cents)}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove.mutate(e.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Vendor</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. NAPA Auto Parts" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <Label className="text-xs">Amount (USD)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <Label className="text-xs">Payment method</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="aba">ABA</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>Save expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
