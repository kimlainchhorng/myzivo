/**
 * Tax & Payouts CSV exports.
 */
import {
  fmtMoney,
  type SalesTaxStats,
  type RateBucket,
  type TaxPayoutRow,
  type VendorTotal,
} from "./taxCalculations";

const escape = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const buildCsv = (rows: (string | number)[][]): string =>
  rows.map((r) => r.map(escape).join(",")).join("\n");

export interface TaxExportPayload {
  storeName?: string;
  from: string;
  to: string;
  stats: SalesTaxStats;
  estIncomeTax: number;
  ratePct: number;
  rateBuckets: RateBucket[];
  payouts: TaxPayoutRow[];
}

export function exportTaxCsv(p: TaxExportPayload): string {
  const rows: (string | number)[][] = [];
  rows.push(["ZIVO Auto Repair — Tax & Payouts"]);
  rows.push(["Store", p.storeName ?? ""]);
  rows.push(["Period", `${p.from} to ${p.to}`]);
  rows.push([]);
  rows.push(["Sales tax summary"]);
  rows.push(["Sales tax collected", fmtMoney(p.stats.collected)]);
  rows.push(["Sales tax remitted", fmtMoney(p.stats.remitted)]);
  rows.push(["Sales tax owed", fmtMoney(p.stats.owed)]);
  rows.push(["Paid revenue", fmtMoney(p.stats.paidRevenue)]);
  rows.push(["Paid invoices", p.stats.invoiceCount]);
  rows.push(["Estimated income tax", fmtMoney(p.estIncomeTax)]);
  rows.push(["Income tax rate %", `${p.ratePct}%`]);
  rows.push([]);
  rows.push(["Sales tax by rate"]);
  rows.push(["Rate", "Subtotal", "Tax", "Invoices"]);
  p.rateBuckets.forEach((b) => rows.push([b.rateLabel, fmtMoney(b.subtotal), fmtMoney(b.tax), b.count]));
  rows.push([]);
  rows.push(["Payouts in period"]);
  rows.push(["Date", "Source", "Reference", "Amount"]);
  p.payouts.forEach((p2) => rows.push([p2.payout_date, p2.source ?? "", p2.reference ?? "", fmtMoney(p2.amount_cents)]));
  return buildCsv(rows);
}

export function export1099Csv(year: number, vendors: VendorTotal[]): string {
  const rows: (string | number)[][] = [];
  rows.push([`1099-NEC Prep — ${year}`]);
  rows.push(["Vendors paid > $600 in calendar year may require a 1099-NEC."]);
  rows.push([]);
  rows.push(["Vendor", "Total Paid", "Expense Count", "1099 Eligible"]);
  vendors.forEach((v) => rows.push([v.vendor, fmtMoney(v.total), v.count, v.eligible1099 ? "YES" : ""]));
  return buildCsv(rows);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
