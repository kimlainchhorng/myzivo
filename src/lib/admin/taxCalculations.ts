/**
 * Pure helpers for the Auto Repair Tax & Payouts dashboard.
 * No React, no Supabase — easy to unit-test.
 */

export interface TaxInvoiceRow {
  id: string;
  total_cents: number;
  subtotal_cents: number;
  tax_cents: number;
  amount_paid_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  customer_name: string | null;
}

export interface TaxPayoutRow {
  id: string;
  amount_cents: number;
  payout_date: string;
  source: string | null;
  reference: string | null;
  receipt_url?: string | null;
}

export interface TaxExpenseRow {
  id: string;
  amount_cents: number;
  vendor: string | null;
  expense_date: string;
  category: string | null;
}

// ─── Money helpers ─────────────────────────────────────────
export const fmtMoney = (cents: number) =>
  `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const safeDiv = (n: number, d: number) => (d === 0 ? 0 : n / d);

// ─── Quarter helpers ───────────────────────────────────────
export type QuarterKey = "Q1" | "Q2" | "Q3" | "Q4";

export function quarterRange(year: number, q: QuarterKey): { from: string; to: string } {
  const startMonth = q === "Q1" ? 0 : q === "Q2" ? 3 : q === "Q3" ? 6 : 9;
  const from = new Date(year, startMonth, 1);
  const to = new Date(year, startMonth + 3, 0);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function currentQuarter(d = new Date()): { year: number; quarter: QuarterKey } {
  const m = d.getMonth();
  const q: QuarterKey = m < 3 ? "Q1" : m < 6 ? "Q2" : m < 9 ? "Q3" : "Q4";
  return { year: d.getFullYear(), quarter: q };
}

export function previousQuarter(year: number, q: QuarterKey): { year: number; quarter: QuarterKey } {
  if (q === "Q1") return { year: year - 1, quarter: "Q4" };
  return { year, quarter: (`Q${parseInt(q[1]) - 1}`) as QuarterKey };
}

// ─── IRS estimated tax due dates ───────────────────────────
// Q1 (Jan–Mar) due Apr 15
// Q2 (Apr–May) due Jun 15
// Q3 (Jun–Aug) due Sep 15
// Q4 (Sep–Dec) due Jan 15 of next year
export interface IrsDueDate {
  quarter: QuarterKey;
  label: string;
  dueDate: string; // ISO date
  coversFrom: string;
  coversTo: string;
}

export function irsDueDatesForYear(year: number): IrsDueDate[] {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return [
    { quarter: "Q1", label: "Q1 Estimated Tax", dueDate: iso(new Date(year, 3, 15)), coversFrom: iso(new Date(year, 0, 1)), coversTo: iso(new Date(year, 2, 31)) },
    { quarter: "Q2", label: "Q2 Estimated Tax", dueDate: iso(new Date(year, 5, 15)), coversFrom: iso(new Date(year, 3, 1)), coversTo: iso(new Date(year, 4, 31)) },
    { quarter: "Q3", label: "Q3 Estimated Tax", dueDate: iso(new Date(year, 8, 15)), coversFrom: iso(new Date(year, 5, 1)), coversTo: iso(new Date(year, 7, 31)) },
    { quarter: "Q4", label: "Q4 Estimated Tax", dueDate: iso(new Date(year + 1, 0, 15)), coversFrom: iso(new Date(year, 8, 1)), coversTo: iso(new Date(year, 11, 31)) },
  ];
}

export type FilingStatus = "paid" | "overdue" | "due_soon" | "upcoming";

export function filingStatus(due: IrsDueDate, payouts: TaxPayoutRow[]): FilingStatus {
  const matched = payouts.find(
    (p) => isTaxPayment(p.source) && p.payout_date >= due.coversFrom && p.payout_date <= addDays(due.dueDate, 30)
  );
  if (matched) return "paid";
  const today = new Date().toISOString().slice(0, 10);
  if (today > due.dueDate) return "overdue";
  const daysUntil = Math.floor((new Date(due.dueDate).getTime() - new Date(today).getTime()) / 86400000);
  if (daysUntil <= 30) return "due_soon";
  return "upcoming";
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
}

// ─── Sales tax math ────────────────────────────────────────
export interface SalesTaxStats {
  collected: number;   // sum tax_cents on paid invoices in period
  remitted: number;    // sum payouts tagged "Tax Payment" in period
  owed: number;        // collected - remitted
  paidRevenue: number; // sum total_cents on paid invoices in period
  invoiceCount: number;
}

export function isTaxPayment(source: string | null | undefined): boolean {
  if (!source) return false;
  const s = source.toLowerCase();
  return s.includes("tax");
}

export function computeSalesTax(invoices: TaxInvoiceRow[], payouts: TaxPayoutRow[], from: string, to: string): SalesTaxStats {
  const paid = invoices.filter((i) => i.paid_at && i.paid_at.slice(0, 10) >= from && i.paid_at.slice(0, 10) <= to);
  const collected = paid.reduce((s, i) => s + (i.tax_cents ?? 0), 0);
  const paidRevenue = paid.reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const remitted = payouts
    .filter((p) => isTaxPayment(p.source) && p.payout_date >= from && p.payout_date <= to)
    .reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  return {
    collected,
    remitted,
    owed: Math.max(0, collected - remitted),
    paidRevenue,
    invoiceCount: paid.length,
  };
}

// ─── Income tax estimate ───────────────────────────────────
export function estimateIncomeTax(netRevenue: number, ratePct: number): number {
  return Math.round(Math.max(0, netRevenue) * (ratePct / 100));
}

// ─── Sales tax breakdown by rate ───────────────────────────
export interface RateBucket {
  rateLabel: string;     // e.g. "8.25%"
  rateValue: number;     // 0.0825
  subtotal: number;
  tax: number;
  count: number;
}

export function breakdownByRate(invoices: TaxInvoiceRow[]): RateBucket[] {
  const map = new Map<string, RateBucket>();
  invoices
    .filter((i) => i.paid_at)
    .forEach((i) => {
      const sub = Math.max(0, i.subtotal_cents ?? Math.max(0, i.total_cents - i.tax_cents));
      const rate = sub > 0 ? i.tax_cents / sub : 0;
      const rounded = Math.round(rate * 10000) / 10000; // 4 dp
      const label = `${(rounded * 100).toFixed(2)}%`;
      const b = map.get(label) ?? { rateLabel: label, rateValue: rounded, subtotal: 0, tax: 0, count: 0 };
      b.subtotal += sub;
      b.tax += i.tax_cents ?? 0;
      b.count += 1;
      map.set(label, b);
    });
  return Array.from(map.values()).sort((a, b) => b.tax - a.tax);
}

// ─── 1099-NEC vendor aggregation ───────────────────────────
export interface VendorTotal {
  vendor: string;
  total: number;
  count: number;
  eligible1099: boolean; // > $600 in calendar year
}

export function aggregateVendorsForYear(expenses: TaxExpenseRow[], year: number): VendorTotal[] {
  const yStart = `${year}-01-01`;
  const yEnd = `${year}-12-31`;
  const map = new Map<string, VendorTotal>();
  expenses
    .filter((e) => e.expense_date >= yStart && e.expense_date <= yEnd)
    .forEach((e) => {
      const v = (e.vendor || "Unknown").trim() || "Unknown";
      const existing = map.get(v) ?? { vendor: v, total: 0, count: 0, eligible1099: false };
      existing.total += e.amount_cents ?? 0;
      existing.count += 1;
      map.set(v, existing);
    });
  return Array.from(map.values())
    .map((v) => ({ ...v, eligible1099: v.total > 60000 }))
    .sort((a, b) => b.total - a.total);
}

// ─── Tax rate persistence (localStorage) ───────────────────
const RATE_KEY = (storeId: string) => `zivo:ar:tax-rate:${storeId}`;

export function loadTaxRate(storeId: string, fallback = 27): number {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(RATE_KEY(storeId));
  const n = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= 60 ? n : fallback;
}

export function saveTaxRate(storeId: string, rate: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RATE_KEY(storeId), String(rate));
}

// ─── Payout sources ────────────────────────────────────────
export const PAYOUT_SOURCES = [
  "Bank Deposit",
  "Stripe",
  "Tax Payment",
  "Owner Draw",
  "Other",
] as const;
export type PayoutSource = (typeof PAYOUT_SOURCES)[number];
