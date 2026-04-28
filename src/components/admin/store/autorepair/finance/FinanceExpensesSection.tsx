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
import { Wallet, Plus, Trash2, ScanLine, Paperclip, Loader2, X, ChevronDown, ChevronRight, Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// ---------- Receipt-upload diagnostics ----------
const PRIMARY_BUCKET = "ar-receipts";
const FALLBACK_BUCKET = "ar-receipts-fallback";
const FALLBACK_PREFIX = "fallback:";

type AttemptLog = {
  n: number;
  started: string;
  durationMs: number;
  ok: boolean;
  status?: number | null;
  code?: string | null;
  message?: string | null;
  transient: boolean;
};

type DiagnosticsRecord = {
  at: string;
  user_id: string | null;
  store_id: string;
  bucket: string;
  path: string | null;
  url: string | null;
  method: "POST";
  headers: Record<string, string>;
  preflight: any;
  attempts: AttemptLog[];
  used_fallback: boolean;
  fallback_response: any;
  final_receipt_ref: string | null;
  scan_response_summary?: { items: number; vendor: string | null } | null;
};

function isTransientUploadError(err: any, status?: number | null): boolean {
  if (status && status >= 500 && status < 600) return true;
  const msg = String(err?.message || err || "");
  if (/08P01|database error|timeout|ECONNRESET|fetch failed|network|temporarily/i.test(msg)) return true;
  if (err?.name === "TypeError") return true; // browser network error
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
type ExpenseFormState = ReturnType<typeof blankForm>;

function computeExpenseTotals(source: ExpenseFormState) {
  const subtotalCents = source.items.reduce((s, it) => {
    const q = parseFloat(it.quantity) || 0;
    const u = Math.round((parseFloat(it.unit_price) || 0) * 100);
    return s + Math.round(q * u);
  }, 0);
  const taxCents = Math.round((parseFloat(source.tax) || 0) * 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

function toMoneyCents(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return String(value).includes(".") ? Math.round(parsed * 100) : Math.round(parsed);
}

function normalizePaymentMethod(value: unknown): string {
  const raw = String(value || "").trim().toLowerCase();
  if (raw.includes("cash")) return "cash";
  if (raw.includes("card") || raw.includes("visa") || raw.includes("master") || raw.includes("amex")) return "card";
  if (raw.includes("check") || raw.includes("cheque")) return "check";
  if (raw.includes("aba")) return "aba";
  return raw === "other" ? "other" : "card";
}

function parseScannedTime(value: unknown): { h: string; m: string; ap: "AM" | "PM" } {
  const raw = String(value || "").trim();
  const match = raw.match(/(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!match) return { h: "12", m: "00", ap: "PM" };
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const suffix = match[3]?.toUpperCase() as "AM" | "PM" | undefined;
  if (suffix) return { h: String(((hour + 11) % 12) + 1), m: minute, ap: suffix };
  const ap: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
  return { h: String(((hour + 11) % 12) + 1), m: minute, ap };
}

function buildScannedExpenseForm(inv: any, receiptRef: string | null): ExpenseFormState {
  const invoiceTotal = toMoneyCents(inv?.total_cents);
  const invoiceSubtotal = toMoneyCents(inv?.subtotal_cents);
  const invoiceTax = toMoneyCents(inv?.tax_cents) ?? Math.max(0, (invoiceTotal ?? 0) - (invoiceSubtotal ?? invoiceTotal ?? 0));
  const scannedItems = Array.isArray(inv?.items) ? inv.items : [];
  let items: Item[] = scannedItems
    .map((it: any) => {
      const quantity = Number(it?.quantity) > 0 ? Number(it.quantity) : 1;
      const lineTotal = toMoneyCents(it?.line_total_cents);
      const unitFromLine = lineTotal != null && quantity > 0 ? Math.round(lineTotal / quantity) : null;
      const unit = unitFromLine ?? toMoneyCents(it?.unit_price_cents) ?? 0;
      return {
        part_number: String(it?.part_number || it?.part || it?.sku || "").trim(),
        name: String(it?.name || it?.description || "Scanned line item").trim(),
        quantity: String(quantity),
        unit_price: unit > 0 ? (unit / 100).toFixed(2) : "",
      };
    })
    .filter((it) => it.name || it.unit_price);

  const expectedSubtotal = invoiceSubtotal ?? (invoiceTotal != null ? Math.max(0, invoiceTotal - invoiceTax) : null);
  const currentSubtotal = items.reduce((sum, it) => sum + Math.round((parseFloat(it.quantity) || 1) * Math.round((parseFloat(it.unit_price) || 0) * 100)), 0);
  if (items.length === 1 && expectedSubtotal && Math.abs(currentSubtotal - expectedSubtotal) > 2) {
    const q = parseFloat(items[0].quantity) || 1;
    items = [{ ...items[0], unit_price: (Math.round(expectedSubtotal / q) / 100).toFixed(2) }];
  }
  if (!items.length && expectedSubtotal && expectedSubtotal > 0) {
    items = [{ part_number: "", name: "Scanned invoice total", quantity: "1", unit_price: (expectedSubtotal / 100).toFixed(2) }];
  }

  const t = parseScannedTime(inv?.time);
  return {
    ...blankForm(),
    category: "parts",
    vendor: String(inv?.vendor || "").trim(),
    invoice_number: String(inv?.invoice_number || "").trim(),
    description: "",
    expense_date: /^\d{4}-\d{2}-\d{2}$/.test(String(inv?.date || "")) ? inv.date : new Date().toISOString().slice(0, 10),
    hour: t.h,
    minute: t.m,
    ampm: t.ap,
    payment_method: normalizePaymentMethod(inv?.payment_method),
    tax: invoiceTax > 0 ? (invoiceTax / 100).toFixed(2) : "0.00",
    receipt_url: receiptRef,
    items: items.length ? items : [emptyItem()],
    notes: "",
  };
}

function isAutoSaveReady(source: ExpenseFormState) {
  const { totalCents } = computeExpenseTotals(source);
  return totalCents > 0 && source.items.some((it) => it.name.trim() && (parseFloat(it.unit_price) || 0) > 0);
}

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
  const [diagnostics, setDiagnostics] = useState<DiagnosticsRecord | null>(null);
  const [diagOpen, setDiagOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const supaUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";

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
  const { subtotalCents, taxCents, totalCents } = useMemo(() => computeExpenseTotals(form), [form]);

  const create = useMutation({
    mutationFn: async (source?: ExpenseFormState) => {
      const expenseForm = source ?? form;
      const totals = computeExpenseTotals(expenseForm);
      if (totals.totalCents <= 0) throw new Error("Add at least one line item with a price");
      const { data: { user } } = await supabase.auth.getUser();
      const { data: inserted, error } = await supabase.from("ar_expenses" as any).insert({
        store_id: storeId,
        category: expenseForm.category,
        vendor: expenseForm.vendor || null,
        description: expenseForm.description || null,
        amount_cents: totals.totalCents,
        subtotal_cents: totals.subtotalCents,
        tax_cents: totals.taxCents,
        expense_date: expenseForm.expense_date,
        invoice_time: to24h(expenseForm.hour, expenseForm.minute, expenseForm.ampm),
        invoice_number: expenseForm.invoice_number || null,
        payment_method: expenseForm.payment_method,
        notes: expenseForm.notes || null,
        receipt_url: expenseForm.receipt_url || null,
        created_by: user?.id,
      }).select("id").single();
      if (error) { (error as any)._stage = "expense"; throw error; }

      const items = expenseForm.items
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
        if (e2) { (e2 as any)._stage = "items"; throw e2; }
      }
    },
    onSuccess: () => {
      toast.success("Expense saved");
      setOpen(false);
      setForm(blankForm());
      qc.invalidateQueries({ queryKey: ["ar-fin-expenses", storeId] });
    },
    onError: (e: any) => {
      const stage = e?._stage || "expense";
      const code = e?.code || "";
      const msg = e?.message || String(e);
      const isPerm = code === "42501" || /row-level security|permission denied|new row violates/i.test(msg);
      if (isPerm) {
        toast.error(stage === "items"
          ? "You don't have permission to save line items for this expense."
          : "You don't have permission to save expenses for this store.");
      } else {
        toast.error(`${stage === "items" ? "Saving line items failed" : "Saving expense failed"}: ${msg}`);
      }
    },
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

  // Call ar-receipts-helper with an explicit bearer token so auth context is reliable.
  const callHelper = async (body: Record<string, unknown>) => {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) throw new Error("Not signed in");
    const url = `${supaUrl}/functions/v1/ar-receipts-helper`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: (supabase as any)?.supabaseKey || "",
      },
      body: JSON.stringify(body),
    });
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    if (!res.ok) {
      const msg = data?.error || `HTTP ${res.status}`;
      const err = new Error(msg) as any;
      err.status = res.status;
      err.details = data?.details;
      err.body = data;
      throw err;
    }
    return data;
  };

  const saveScannedExpenseViaHelper = async (source: ExpenseFormState) => {
    const totals = computeExpenseTotals(source);
    const payloadItems = source.items
      .filter((it) => it.name.trim())
      .map((it, position) => {
        const quantity = parseFloat(it.quantity) || 1;
        const unit_price_cents = Math.round((parseFloat(it.unit_price) || 0) * 100);
        return {
          position,
          part_number: it.part_number || null,
          name: it.name.trim(),
          quantity,
          unit_price_cents,
          line_total_cents: Math.round(quantity * unit_price_cents),
        };
      });
    const data = await callHelper({
      action: "save_expense",
      store_id: storeId,
      expense: {
        category: source.category,
        vendor: source.vendor || null,
        description: source.description || null,
        amount_cents: totals.totalCents,
        subtotal_cents: totals.subtotalCents,
        tax_cents: totals.taxCents,
        expense_date: source.expense_date,
        invoice_time: to24h(source.hour, source.minute, source.ampm),
        invoice_number: source.invoice_number || null,
        payment_method: source.payment_method,
        notes: source.notes || null,
        receipt_url: source.receipt_url || null,
      },
      items: payloadItems,
    });
    if (!data?.ok) throw new Error(data?.error || "Could not save scanned invoice");
    return data;
  };

  // -------- Scan invoice flow --------
  const handleScanClick = () => fileRef.current?.click();

  // Read a File as base64 (no data URL prefix)
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error("Could not read file"));
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.readAsDataURL(file);
    });

  // Try the primary bucket up to MAX_ATTEMPTS times. Return signed-relative
  // path on success, or throw the last error.
  const uploadToPrimaryWithRetry = async (
    file: File,
    mime: string,
    diag: DiagnosticsRecord,
  ): Promise<string> => {
    const MAX_ATTEMPTS = 3;
    const backoff = [300, 700, 1500];
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${storeId}/${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${ext}`;
    diag.path = path;
    diag.bucket = PRIMARY_BUCKET;

    let lastErr: any = null;
    for (let n = 1; n <= MAX_ATTEMPTS; n++) {
      const started = new Date();
      const t0 = performance.now();
      try {
        const { error: upErr } = await supabase.storage
          .from(PRIMARY_BUCKET)
          .upload(path, file, { contentType: mime, upsert: false });
        const durationMs = Math.round(performance.now() - t0);
        if (!upErr) {
          diag.attempts.push({ n, started: started.toISOString(), durationMs, ok: true, transient: false });
          return path;
        }
        const status = (upErr as any)?.statusCode ?? (upErr as any)?.status ?? null;
        const code = (upErr as any)?.error || (upErr as any)?.code || null;
        const transient = isTransientUploadError(upErr, status);
        diag.attempts.push({
          n, started: started.toISOString(), durationMs, ok: false,
          status, code, message: (upErr as any)?.message || String(upErr), transient,
        });
        lastErr = upErr;
        if (!transient || n === MAX_ATTEMPTS) break;
        await sleep(backoff[n - 1] ?? 1500);
      } catch (netErr: any) {
        const durationMs = Math.round(performance.now() - t0);
        const transient = isTransientUploadError(netErr);
        diag.attempts.push({
          n, started: started.toISOString(), durationMs, ok: false,
          status: null, code: netErr?.name || null, message: netErr?.message || String(netErr), transient,
        });
        lastErr = netErr;
        if (!transient || n === MAX_ATTEMPTS) break;
        await sleep(backoff[n - 1] ?? 1500);
      }
    }
    throw lastErr || new Error("Primary upload failed");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    setScanning(true);

    const { data: { user } } = await supabase.auth.getUser();
    const diag: DiagnosticsRecord = {
      at: new Date().toISOString(),
      user_id: user?.id ?? null,
      store_id: storeId,
      bucket: PRIMARY_BUCKET,
      path: null,
      url: supaUrl ? `${supaUrl}/storage/v1/object/${PRIMARY_BUCKET}/<path>` : null,
      method: "POST",
      headers: {
        authorization: "Bearer <redacted>",
        apikey: "<redacted>",
        "x-upsert": "false",
        "content-type": file.type || "image/jpeg",
      },
      preflight: null,
      attempts: [],
      used_fallback: false,
      fallback_response: null,
      final_receipt_ref: null,
      scan_response_summary: null,
    };

    let stage: "read" | "scan" | "attach" | "save" = "read";
    let scannedForm: ExpenseFormState | null = null;
    try {
      // 1. Optional preflight (non-blocking) — only used for diagnostics.
      callHelper({ action: "preflight", store_id: storeId })
        .then((d) => { diag.preflight = d; })
        .catch((e: any) => { diag.preflight = { error: e?.message, details: e?.details }; });

      // 2. Read file as base64.
      stage = "read";
      const base64 = await fileToBase64(file);
      const mime = file.type || "image/jpeg";

      // 3. AI scan — this is the only step that MUST succeed.
      stage = "scan";
      toast.info("Scanning invoice…");
      const { data, error } = await supabase.functions.invoke("scan-invoice", {
        body: { image_base64: base64, mime_type: mime },
      });
      if (error) throw error;
      const inv = (data as any)?.invoice;
      if (!inv) throw new Error("Could not parse invoice");
      diag.scan_response_summary = {
        items: Array.isArray(inv.items) ? inv.items.length : 0,
        vendor: inv.vendor ?? null,
      };

      // 4. Best-effort upload (primary with retry → fallback edge fn).
      stage = "attach";
      let receiptRef: string | null = null;
      try {
        const path = await uploadToPrimaryWithRetry(file, mime, diag);
        receiptRef = path;
      } catch (primaryErr: any) {
        console.warn("Primary upload failed, attempting fallback:", primaryErr);
        try {
          const fb = await callHelper({
            action: "fallback_upload", store_id: storeId, image_base64: base64, mime_type: mime,
          });
          diag.fallback_response = fb;
          const fbPath = fb?.path;
          if (fbPath) { receiptRef = `${FALLBACK_PREFIX}${fbPath}`; diag.used_fallback = true; }
        } catch (fbErr: any) {
          diag.fallback_response = { error: fbErr?.message || String(fbErr), details: fbErr?.details };
        }
      }
      diag.final_receipt_ref = receiptRef;

      // 5. Normalize then try to auto-save. If save fails, prefill dialog.
      scannedForm = buildScannedExpenseForm(inv, receiptRef);
      setForm(scannedForm);
      if (isAutoSaveReady(scannedForm)) {
        stage = "save";
        try {
          await saveScannedExpenseViaHelper(scannedForm);
          setOpen(false);
          setForm(blankForm());
          qc.invalidateQueries({ queryKey: ["ar-fin-expenses", storeId] });
          toast.success(diag.used_fallback ? "Invoice scanned and saved (fallback)" : "Invoice scanned and saved");
          return;
        } catch (saveErr: any) {
          // Auto-save failed — keep extracted data and let user save manually.
          console.warn("auto-save failed, opening prefilled dialog:", saveErr);
          setOpen(true);
          toast.error(`Auto-save failed (${saveErr?.message || "error"}). Review and press Save expense.`);
          return;
        }
      }
      setOpen(true);
      toast.success("Invoice scanned — review and Save expense");
    } catch (err: any) {
      console.error("scan-invoice flow error", { stage, err, diag });
      const msg = err?.message || String(err);
      if (stage === "read") toast.error(`Could not read image: ${msg}`);
      else if (stage === "scan") toast.error(`Invoice scan failed: ${msg}`);
      else toast.error(`Scan flow failed: ${msg}`);
      // If we already parsed something, still show it.
      if (scannedForm) setOpen(true);
    } finally {
      setDiagnostics(diag);
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

          {/* Receipt-upload diagnostics panel */}
          <UploadDiagnosticsPanel
            diag={diagnostics}
            open={diagOpen}
            onToggle={() => setDiagOpen((o) => !o)}
            onClear={() => setDiagnostics(null)}
          />
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
            <Button onClick={() => create.mutate(form)} disabled={create.isPending}>
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
    const ref = data?.exp?.receipt_url as string | null | undefined;
    if (!ref) return;
    const isFallback = ref.startsWith(FALLBACK_PREFIX);
    const bucket = isFallback ? FALLBACK_BUCKET : PRIMARY_BUCKET;
    const path = isFallback ? ref.slice(FALLBACK_PREFIX.length) : ref;
    supabase.storage.from(bucket).createSignedUrl(path, 60 * 60).then(({ data: s }) => {
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

function UploadDiagnosticsPanel({
  diag,
  open,
  onToggle,
  onClear,
}: {
  diag: DiagnosticsRecord | null;
  open: boolean;
  onToggle: () => void;
  onClear: () => void;
}) {
  if (!diag) return null;
  const lastAttempt = diag.attempts[diag.attempts.length - 1];
  const succeeded = !!diag.final_receipt_ref;
  const retried = diag.attempts.length > 1;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
      toast.success("Diagnostics copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="rounded-md border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2 text-xs">
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-medium">Upload diagnostics</span>
          {succeeded ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              {diag.used_fallback ? "fallback" : "ok"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertCircle className="w-3 h-3" /> failed
            </span>
          )}
          {retried && (
            <span className="text-[10px] text-muted-foreground">
              · {diag.attempts.length} attempts
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date(diag.at).toLocaleTimeString()}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 text-[11px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DiagRow label="Bucket" value={diag.bucket} />
            <DiagRow label="Object path" value={diag.path || "—"} />
            <DiagRow label="URL" value={diag.url || "—"} />
            <DiagRow label="Method" value={diag.method} />
            <DiagRow label="User ID" value={diag.user_id || "—"} />
            <DiagRow label="Store ID" value={diag.store_id} />
            <DiagRow
              label="Used fallback"
              value={diag.used_fallback ? "yes" : "no"}
            />
            <DiagRow
              label="Final receipt ref"
              value={diag.final_receipt_ref || "—"}
            />
          </div>

          <div>
            <div className="text-muted-foreground mb-1">Headers (sensitive values redacted)</div>
            <pre className="rounded bg-background border p-2 overflow-x-auto text-[10px] leading-tight">
              {JSON.stringify(diag.headers, null, 2)}
            </pre>
          </div>

          <div>
            <div className="text-muted-foreground mb-1">Preflight response</div>
            <pre className="rounded bg-background border p-2 overflow-x-auto text-[10px] leading-tight">
              {JSON.stringify(diag.preflight, null, 2)}
            </pre>
          </div>

          <div>
            <div className="text-muted-foreground mb-1">
              Upload attempts ({diag.attempts.length})
            </div>
            <div className="space-y-1">
              {diag.attempts.map((a) => (
                <div
                  key={a.n}
                  className={`rounded border px-2 py-1 ${a.ok ? "bg-emerald-500/5 border-emerald-500/30" : "bg-destructive/5 border-destructive/30"}`}
                >
                  <div className="flex justify-between">
                    <span>
                      #{a.n} {a.ok ? "ok" : "error"}
                      {a.transient && !a.ok ? " · transient" : ""}
                    </span>
                    <span className="text-muted-foreground">{a.durationMs}ms</span>
                  </div>
                  {!a.ok && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      [{a.status ?? "—"}] {a.code ?? ""} {a.message ?? ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {diag.fallback_response && (
            <div>
              <div className="text-muted-foreground mb-1">Fallback response</div>
              <pre className="rounded bg-background border p-2 overflow-x-auto text-[10px] leading-tight">
                {JSON.stringify(diag.fallback_response, null, 2)}
              </pre>
            </div>
          )}

          {lastAttempt && !lastAttempt.ok && (
            <div className="text-[10px] text-muted-foreground">
              Last error: <span className="font-mono">{lastAttempt.message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={copy}>
              <Copy className="w-3 h-3 mr-1" /> Copy details
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</span>
      <span className="font-mono break-all">{value}</span>
    </div>
  );
}

