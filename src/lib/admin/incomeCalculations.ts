/**
 * Pure helpers for the Auto Repair Income & Revenue dashboard.
 */

export type GroupBy = "day" | "week" | "month";

export interface IncomeInvoiceRow {
  id: string;
  number: string | null;
  total_cents: number;
  amount_paid_cents: number;
  subtotal_cents: number;
  tax_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  customer_name: string | null;
  vehicle_label: string | null;
  items: any;
}

export interface IncomePaymentRow {
  amount_cents: number;
  paid_at: string;
  method: string | null;
  invoice_id?: string | null;
}

// ─── Money helpers ─────────────────────────────────────────
export const fmtMoney = (cents: number) =>
  `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtPct = (n: number, digits = 1) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`;

export const safeDiv = (n: number, d: number) => (d === 0 ? 0 : n / d);

// ─── KPIs ──────────────────────────────────────────────────
export interface IncomeKpis {
  revenue: number;       // paid revenue (cents) — from payments
  billed: number;        // sum invoice totals in range
  outstanding: number;   // billed - revenue
  avgTicket: number;     // revenue / paid invoice count
  invoiceCount: number;  // invoices in range
  collectionRate: number; // paid / billed * 100
}

export function computeIncomeKpis(payments: IncomePaymentRow[], invoices: IncomeInvoiceRow[]): IncomeKpis {
  const revenue = payments.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const billed = invoices.reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  return {
    revenue,
    billed,
    outstanding: Math.max(0, billed - revenue),
    avgTicket: paidCount ? Math.round(revenue / paidCount) : 0,
    invoiceCount: invoices.length,
    collectionRate: safeDiv(revenue, billed) * 100,
  };
}

export interface DeltaResult { pct: number; direction: "up" | "down" | "flat" }
export function compareDelta(current: number, previous: number): DeltaResult {
  if (previous === 0 && current === 0) return { pct: 0, direction: "flat" };
  if (previous === 0) return { pct: 100, direction: "up" };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return { pct, direction: pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat" };
}

// ─── Time series ───────────────────────────────────────────
function bucketKey(dateIso: string, group: GroupBy): string {
  const d = new Date(dateIso);
  if (group === "day") return d.toISOString().slice(0, 10);
  if (group === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum);
  return tmp.toISOString().slice(0, 10);
}

export interface IncomeSeriesPoint { date: string; revenue: number; cumulative: number }
export function groupIncomeSeries(payments: IncomePaymentRow[], group: GroupBy): IncomeSeriesPoint[] {
  const map: Record<string, number> = {};
  payments.forEach((p) => {
    const k = bucketKey(p.paid_at, group);
    map[k] = (map[k] || 0) + (p.amount_cents ?? 0);
  });
  let running = 0;
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => {
      running += revenue;
      return { date, revenue, cumulative: running };
    });
}

// ─── Breakdowns ────────────────────────────────────────────
export interface ServiceTotal { name: string; revenue: number; invoiceIds: string[] }

export function revenueByService(invoices: IncomeInvoiceRow[]): ServiceTotal[] {
  const map = new Map<string, ServiceTotal>();
  invoices.forEach((inv) => {
    const items = Array.isArray(inv.items) ? inv.items : [];
    items.forEach((it: any) => {
      const name = ((it?.description || it?.name || "Untitled") as string).trim() || "Untitled";
      const amt =
        it?.category === "labor" ? (Number(it?.hours) || 0) * (Number(it?.price) || 0) * 100 :
        it?.category === "part"  ? (Number(it?.qty)   || 0) * (Number(it?.price) || 0) * 100 :
        (Number(it?.price) || 0) * 100;
      const existing = map.get(name) ?? { name, revenue: 0, invoiceIds: [] };
      existing.revenue += Math.round(amt);
      if (!existing.invoiceIds.includes(inv.id)) existing.invoiceIds.push(inv.id);
      map.set(name, existing);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export interface MethodTotal { method: string; amount: number }
export function revenueByMethod(payments: IncomePaymentRow[]): MethodTotal[] {
  const map = new Map<string, number>();
  payments.forEach((p) => {
    const k = (p.method || "Unknown").trim() || "Unknown";
    map.set(k, (map.get(k) ?? 0) + (p.amount_cents ?? 0));
  });
  return Array.from(map.entries())
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface CustomerTotal { customer: string; revenue: number; invoiceCount: number; lastVisit: string | null }
export function topCustomers(invoices: IncomeInvoiceRow[]): CustomerTotal[] {
  const map = new Map<string, CustomerTotal>();
  invoices.forEach((inv) => {
    const c = (inv.customer_name || "Unknown").trim() || "Unknown";
    const existing = map.get(c) ?? { customer: c, revenue: 0, invoiceCount: 0, lastVisit: null };
    existing.revenue += inv.amount_paid_cents ?? 0;
    existing.invoiceCount += 1;
    const visit = inv.paid_at || inv.created_at;
    if (!existing.lastVisit || visit > existing.lastVisit) existing.lastVisit = visit;
    map.set(c, existing);
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

// ─── Date presets ──────────────────────────────────────────
export type IncomePreset = "today" | "week" | "month" | "quarter" | "this_month" | "last_month" | "ytd" | "custom";

export function incomePresetRange(preset: IncomePreset): { from: string; to: string } {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const to = iso(now);
  switch (preset) {
    case "today": return { from: to, to };
    case "week": { const d = new Date(now); d.setDate(d.getDate() - 6); return { from: iso(d), to }; }
    case "month": { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: iso(d), to }; }
    case "quarter": { const d = new Date(now); d.setDate(d.getDate() - 89); return { from: iso(d), to }; }
    case "this_month": return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to };
    case "last_month": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: iso(f), to: iso(t) };
    }
    case "ytd": return { from: iso(new Date(now.getFullYear(), 0, 1)), to };
    default: { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: iso(d), to }; }
  }
}

export function previousIncomeRange(from: string, to: string): { from: string; to: string } {
  const f = new Date(from); const t = new Date(to);
  const days = Math.max(1, Math.round((t.getTime() - f.getTime()) / 86400000) + 1);
  const t2 = new Date(f); t2.setDate(t2.getDate() - 1);
  const f2 = new Date(t2); f2.setDate(f2.getDate() - (days - 1));
  return { from: f2.toISOString().slice(0, 10), to: t2.toISOString().slice(0, 10) };
}
