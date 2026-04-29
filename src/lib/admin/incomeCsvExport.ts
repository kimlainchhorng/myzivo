/**
 * Income & Revenue CSV export.
 */
import {
  fmtMoney,
  type IncomeKpis,
  type IncomeInvoiceRow,
  type IncomeSeriesPoint,
  type ServiceTotal,
  type MethodTotal,
  type CustomerTotal,
} from "./incomeCalculations";

const escape = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const buildCsv = (rows: (string | number)[][]): string =>
  rows.map((r) => r.map(escape).join(",")).join("\n");

export interface IncomeExportPayload {
  storeName?: string;
  from: string;
  to: string;
  kpis: IncomeKpis;
  prev?: IncomeKpis | null;
  series: IncomeSeriesPoint[];
  services: ServiceTotal[];
  methods: MethodTotal[];
  customers: CustomerTotal[];
  invoices: IncomeInvoiceRow[];
}

export function exportIncomeCsv(p: IncomeExportPayload): string {
  const rows: (string | number)[][] = [];
  rows.push(["ZIVO Auto Repair — Income & Revenue"]);
  rows.push(["Store", p.storeName ?? ""]);
  rows.push(["Period", `${p.from} to ${p.to}`]);
  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Metric", "Current", ...(p.prev ? ["Previous"] : [])]);
  const k = p.kpis; const pk = p.prev;
  const row = (label: string, cur: number, prev?: number) =>
    rows.push([label, fmtMoney(cur), ...(pk ? [fmtMoney(prev ?? 0)] : [])]);
  row("Revenue (paid)", k.revenue, pk?.revenue);
  row("Billed", k.billed, pk?.billed);
  row("Outstanding", k.outstanding, pk?.outstanding);
  row("Avg ticket", k.avgTicket, pk?.avgTicket);
  rows.push(["Invoice count", k.invoiceCount, ...(pk ? [pk.invoiceCount] : [])]);
  rows.push(["Collection rate %", `${k.collectionRate.toFixed(1)}%`, ...(pk ? [`${pk.collectionRate.toFixed(1)}%`] : [])]);
  rows.push([]);
  rows.push(["Series"]);
  rows.push(["Date", "Revenue", "Cumulative"]);
  p.series.forEach((s) => rows.push([s.date, fmtMoney(s.revenue), fmtMoney(s.cumulative)]));
  rows.push([]);
  rows.push(["Top services"]);
  rows.push(["Service", "Revenue", "Invoices"]);
  p.services.slice(0, 25).forEach((s) => rows.push([s.name, fmtMoney(s.revenue), s.invoiceIds.length]));
  rows.push([]);
  rows.push(["Revenue by payment method"]);
  rows.push(["Method", "Amount"]);
  p.methods.forEach((m) => rows.push([m.method, fmtMoney(m.amount)]));
  rows.push([]);
  rows.push(["Top customers"]);
  rows.push(["Customer", "Revenue", "Invoices", "Last visit"]);
  p.customers.slice(0, 25).forEach((c) =>
    rows.push([c.customer, fmtMoney(c.revenue), c.invoiceCount, c.lastVisit ?? ""])
  );
  rows.push([]);
  rows.push(["Invoices in period"]);
  rows.push(["Number", "Date", "Customer", "Vehicle", "Status", "Total", "Paid", "Outstanding"]);
  p.invoices.forEach((i) =>
    rows.push([
      i.number ?? "",
      (i.created_at || "").slice(0, 10),
      i.customer_name ?? "",
      i.vehicle_label ?? "",
      i.status,
      fmtMoney(i.total_cents),
      fmtMoney(i.amount_paid_cents),
      fmtMoney(Math.max(0, i.total_cents - i.amount_paid_cents)),
    ])
  );
  return buildCsv(rows);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
