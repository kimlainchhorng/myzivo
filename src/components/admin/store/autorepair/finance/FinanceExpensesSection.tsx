/**
 * Auto Repair Finance — Expenses & Bills
 * Supports manual entry + AI scan of receipt/invoice (Lovable AI Gateway).
 * Structured fields: vendor, invoice #, date, time (AM/PM), payment method,
 * line items (part #, name, qty, unit price, line total), subtotal/tax/total.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Wallet, Plus, Trash2, ScanLine, Paperclip, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

const CATEGORIES = ["parts", "rent", "utilities", "supplies", "tools", "marketing", "insurance", "payroll", "other"] as const;
const fmt = (cents: number) => `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Item = { part_number: string; name: string; quantity: string; unit_price: string };
const emptyItem = (): Item => ({ part_number: "", name: "", quantity: "1", unit_price: "" });

const blankForm = () => ({
  category: "parts",
  vendor: "",
  description: "",
  invoice_number: "",
  expense_date: new Date().toISOString().slice(0, 10),
  hour: "12",
  minute: "00",
  ampm: "PM" as "AM" | "PM",
  payment_method: "card",
  tax: "",
  notes: "",
  receipt_url: "" as string | null,
  items: [emptyItem()] as Item[],
});

// Convert 12h hh:mm AM/PM -> 24h "HH:MM:SS"
function to24h(h: string, m: string, ap: "AM" | "PM"): string | null {
  const hh = parseInt(h, 10), mm = parseInt(m, 10);
  if (isNaN(hh) || isNaN(mm)) return null;
  let H = hh % 12;
  if (ap === "PM") H += 12;
  return `${String(H).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
}
function from24h(t: string | null): { h: string; m: string; ap: "AM" | "PM" } {
  if (!t) return { h: "12", m: "00", ap: "PM" };
  const [H, M] = t.split(":").map((n) => parseInt(n, 10));
  const ap: "AM" | "PM" = H >= 12 ? "PM" : "AM";
  const h = ((H + 11) % 12) + 1;
  return { h: String(h), m: String(M).padStart(2, "0"), ap };
}
function fmtTime12(t: string | null): string {
  if (!t) return "";
  const { h, m, ap } = from24h(t);
  return `${h}:${m} ${ap}`;
}

export default function FinanceExpensesSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [form, setForm] = useState(blankForm());
  const [detailId, setDetailId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  // Compute derived totals from items + tax
  const subtotalCents = useMemo(
    () => form.items.reduce((s, it) => {
      const q = parseFloat(it.quantity) || 0;
      const u = Math.round((parseFloat(it.unit_price) || 0) * 100);
      return s + Math.round(q * u);
    }, 0),
    [form.items]
  );
  const taxCents = Math.round((parseFloat(form.tax) || 0) * 100);
  const totalCents = subtotalCents + taxCents;

  const create = useMutation({
    mutationFn: async () => {
      if (totalCents <= 0) throw new Error("Add at least one line item with a price");
      const { data: { user } } = await supabase.auth.getUser();
      const { data: inserted, error } = await supabase.from("ar_expenses" as any).insert({
        store_id: storeId,
        category: form.category,
        vendor: form.vendor || null,
        description: form.description || null,
        amount_cents: totalCents,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        expense_date: form.expense_date,
        invoice_time: to24h(form.hour, form.minute, form.ampm),
        invoice_number: form.invoice_number || null,
        payment_method: form.payment_method,
        notes: form.notes || null,
        receipt_url: form.receipt_url || null,
        created_by: user?.id,
      }).select("id").single();
      if (error) throw error;

      const items = form.items
        .filter((it) => it.name.trim())
        .map((it, i) => {
          const q = parseFloat(it.quantity) || 0;
          const u = Math.round((parseFloat(it.unit_price) || 0) * 100);
          return {
            expense_id: (inserted as any).id,
            position: i,
            part_number: it.part_number || null,
            name: it.name,
            quantity: q,
            unit_price_cents: u,
            line_total_cents: Math.round(q * u),
          };
        });
      if (items.length) {
        const { error: e2 } = await supabase.from("ar_expense_items" as any).insert(items);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success("Expense saved");
      setOpen(false);
      setForm(blankForm());
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

  // -------- Scan invoice flow --------
  const handleScanClick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    setScanning(true);
    try {
      // Upload to storage
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${storeId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ar-receipts").upload(path, file, {
        contentType: file.type || "image/jpeg",
      });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("ar-receipts").createSignedUrl(path, 60 * 60);
      const signedUrl = signed?.signedUrl;
      if (!signedUrl) throw new Error("Could not get image URL");

      toast.info("Scanning invoice…");
      const { data, error } = await supabase.functions.invoke("scan-invoice", {
        body: { image_url: signedUrl },
      });
      if (error) throw error;
      const inv = (data as any)?.invoice;
      if (!inv) throw new Error("Could not parse invoice");

      // Pre-fill form
      const t = inv.time ? from24h(inv.time + (inv.time.length === 5 ? ":00" : "")) : { h: "12", m: "00", ap: "PM" as const };
      setForm({
        ...blankForm(),
        category: "parts",
        vendor: inv.vendor || "",
        invoice_number: inv.invoice_number || "",
        description: "",
        expense_date: inv.date || new Date().toISOString().slice(0, 10),
        hour: t.h, minute: t.m, ampm: t.ap,
        payment_method: inv.payment_method || "card",
        tax: inv.tax_cents != null ? (inv.tax_cents / 100).toFixed(2) : "",
        receipt_url: path, // we'll convert to a re-signed URL on detail view; store path
        items: Array.isArray(inv.items) && inv.items.length
          ? inv.items.map((it: any) => ({
              part_number: it.part_number || "",
              name: it.name || "",
              quantity: String(it.quantity ?? 1),
              unit_price: it.unit_price_cents != null ? (it.unit_price_cents / 100).toFixed(2) : "",
            }))
          : [emptyItem()],
        notes: "",
      });
      setOpen(true);
      toast.success("Invoice scanned — review and save");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // -------- List filters & totals --------
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

  // -------- Item editor helpers --------
  const updateItem = (i: number, patch: Partial<Item>) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, idx) => idx !== i) : f.items }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> Expenses & Bills
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleScanClick} disabled={scanning}>
              {scanning ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ScanLine className="w-4 h-4 mr-1" />}
              {scanning ? "Scanning…" : "Scan invoice"}
            </Button>
            <Button size="sm" onClick={() => { setForm(blankForm()); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add expense
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFile}
            />
          </div>
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
                  <button
                    type="button"
                    className="min-w-0 text-left flex-1 hover:opacity-80"
                    onClick={() => setDetailId(e.id)}
                  >
                    <div className="font-medium text-sm flex items-center gap-1.5">
                      {e.vendor || e.description || "(No vendor)"}
                      {e.receipt_url && <Paperclip className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.invoice_number ? `#${e.invoice_number} · ` : ""}{e.category} · {e.expense_date}
                      {e.invoice_time ? ` · ${fmtTime12(e.invoice_time)}` : ""}
                      {e.payment_method ? ` · ${e.payment_method}` : ""}
                    </div>
                  </button>
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

      {/* Add / Review Expense Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Expense / Invoice</DialogTitle></DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Company / Vendor</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. AutoZone" />
            </div>
            <div>
              <Label className="text-xs">Invoice #</Label>
              <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="e.g. 1234567" />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Time</Label>
              <div className="flex gap-1">
                <Select value={form.hour} onValueChange={(v) => setForm({ ...form, hour: v })}>
                  <SelectTrigger className="h-9 w-[68px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.minute} onValueChange={(v) => setForm({ ...form, minute: v })}>
                  <SelectTrigger className="h-9 w-[68px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.ampm} onValueChange={(v) => setForm({ ...form, ampm: v as "AM" | "PM" })}>
                  <SelectTrigger className="h-9 w-[72px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
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
          </div>

          {/* Line items table */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs">Line items</Label>
              <Button type="button" size="sm" variant="ghost" onClick={addItem}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add line
              </Button>
            </div>
            <div className="border rounded-md divide-y overflow-hidden">
              {/* Header (md+) */}
              <div className="hidden md:grid grid-cols-[1.2fr_2fr_0.7fr_1.2fr_1.2fr_auto] gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground bg-muted/40">
                <div>Part #</div>
                <div>Name</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Unit price</div>
                <div className="text-right">Total</div>
                <div className="w-7" />
              </div>
              {form.items.map((it, i) => {
                const q = parseFloat(it.quantity) || 0;
                const u = Math.round((parseFloat(it.unit_price) || 0) * 100);
                const lineTotal = Math.round(q * u);
                return (
                  <div key={i} className="px-3 py-2 md:grid md:grid-cols-[1.2fr_2fr_0.7fr_1.2fr_1.2fr_auto] md:gap-2 md:items-center">
                    {/* Mobile stacked */}
                    <div className="grid grid-cols-2 gap-2 md:contents">
                      <div className="md:col-auto">
                        <Label className="md:hidden text-[10px] text-muted-foreground">Part #</Label>
                        <Input className="h-9 text-sm" value={it.part_number} onChange={(e) => updateItem(i, { part_number: e.target.value })} placeholder="SKU" />
                      </div>
                      <div className="md:col-auto">
                        <Label className="md:hidden text-[10px] text-muted-foreground">Name</Label>
                        <Input className="h-9 text-sm" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Item name" />
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_1.4fr_1.4fr_auto] gap-2 mt-2 md:mt-0 md:contents items-center">
                      <div className="md:col-auto">
                        <Label className="md:hidden text-[10px] text-muted-foreground">Qty</Label>
                        <Input className="h-9 text-sm text-right" type="number" step="0.01" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
                      </div>
                      <div className="md:col-auto">
                        <Label className="md:hidden text-[10px] text-muted-foreground">Unit price</Label>
                        <Input className="h-9 text-sm text-right" type="number" step="0.01" value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: e.target.value })} placeholder="0.00" />
                      </div>
                      <div className="text-sm text-right tabular-nums font-medium self-center">{fmt(lineTotal)}</div>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 self-center" onClick={() => removeItem(i)}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-xs">Tax (USD)</Label>
                <Input type="number" step="0.01" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} placeholder="0.00" />
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotalCents)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span className="tabular-nums">{fmt(taxCents)}</span></div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span className="tabular-nums">{fmt(totalCents)}</span></div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          {form.receipt_url && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="w-3 h-3" /> Receipt image attached
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail drawer */}
      <ExpenseDetailSheet
        expenseId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

function ExpenseDetailSheet({ expenseId, onClose }: { expenseId: string | null; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["ar-expense-detail", expenseId],
    enabled: !!expenseId,
    queryFn: async () => {
      const { data: exp, error } = await supabase
        .from("ar_expenses" as any).select("*").eq("id", expenseId!).maybeSingle();
      if (error) throw error;
      const { data: items } = await supabase
        .from("ar_expense_items" as any).select("*").eq("expense_id", expenseId!).order("position");
      return { exp: exp as any, items: (items || []) as any[] };
    },
  });

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    setImgUrl(null);
    const path = data?.exp?.receipt_url;
    if (!path) return;
    supabase.storage.from("ar-receipts").createSignedUrl(path, 60 * 60).then(({ data: s }) => {
      setImgUrl(s?.signedUrl || null);
    });
  }, [data?.exp?.receipt_url]);

  if (!expenseId) return null;
  const exp = data?.exp;

  return (
    <Sheet open={!!expenseId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{exp?.vendor || "Invoice"}</SheetTitle>
        </SheetHeader>
        {!exp ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Invoice #" value={exp.invoice_number || "—"} />
              <Field label="Date" value={`${exp.expense_date}${exp.invoice_time ? " · " + fmtTime12(exp.invoice_time) : ""}`} />
              <Field label="Category" value={exp.category} />
              <Field label="Payment" value={exp.payment_method || "—"} />
            </div>
            <div className="border rounded-md">
              <div className="grid grid-cols-[1.2fr_2fr_0.6fr_1.2fr] gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground bg-muted/40">
                <div>Part #</div>
                <div>Name</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
              </div>
              {data!.items.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground text-center">No line items</div>
              ) : data!.items.map((it: any) => (
                <div key={it.id} className="grid grid-cols-[1.2fr_2fr_0.6fr_1.2fr] gap-2 px-3 py-2 text-xs border-t items-center">
                  <div className="truncate">{it.part_number || "—"}</div>
                  <div className="truncate">{it.name}</div>
                  <div className="text-right tabular-nums">{it.quantity}</div>
                  <div className="text-right tabular-nums font-medium">{fmt(it.line_total_cents)}</div>
                </div>
              ))}
              <div className="border-t px-2 py-1.5 text-xs space-y-0.5">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{fmt(exp.subtotal_cents ?? 0)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span className="tabular-nums">{fmt(exp.tax_cents ?? 0)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span className="tabular-nums">{fmt(exp.amount_cents)}</span></div>
              </div>
            </div>
            {exp.notes && (
              <div>
                <div className="text-xs text-muted-foreground">Notes</div>
                <div className="text-sm whitespace-pre-wrap">{exp.notes}</div>
              </div>
            )}
            {imgUrl && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Receipt</div>
                <img src={imgUrl} alt="Receipt" className="rounded-md border max-h-[420px] object-contain" />
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
