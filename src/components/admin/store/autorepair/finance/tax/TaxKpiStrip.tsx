/**
 * Tax & Payouts KPI strip — 6 cards.
 */
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Receipt, Send, AlertTriangle, DollarSign, Calculator, CircleCheck } from "lucide-react";
import { fmtMoney, type SalesTaxStats, estimateIncomeTax, loadTaxRate, saveTaxRate } from "@/lib/admin/taxCalculations";

interface Props {
  storeId: string;
  stats: SalesTaxStats;
  loading?: boolean;
}

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "bad" | "warn";
  Icon: any;
  children?: React.ReactNode;
}

function KpiCard({ label, value, sub, tone = "default", Icon, children }: KpiProps) {
  const toneCls =
    tone === "good" ? "text-emerald-600" :
    tone === "bad"  ? "text-rose-600"    :
    tone === "warn" ? "text-amber-600"   : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-3 flex flex-col gap-1.5 min-w-0">
      <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-xl font-bold tabular-nums truncate ${toneCls}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate">{sub}</div>}
      {children}
    </div>
  );
}

export default function TaxKpiStrip({ storeId, stats, loading }: Props) {
  const [rate, setRate] = useState<number>(() => loadTaxRate(storeId));

  useEffect(() => { setRate(loadTaxRate(storeId)); }, [storeId]);

  const handleRateChange = (v: string) => {
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(60, Math.max(0, n));
    setRate(clamped);
    saveTaxRate(storeId, clamped);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-3 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const estTax = estimateIncomeTax(stats.paidRevenue, rate);
  const netAfter = stats.paidRevenue - estTax;
  const owedTone = stats.owed > 0 ? "warn" : "good";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
      <KpiCard label="Sales tax collected" value={fmtMoney(stats.collected)} sub={`${stats.invoiceCount} paid invoices`} tone="default" Icon={Receipt} />
      <KpiCard label="Sales tax remitted" value={fmtMoney(stats.remitted)} sub="Tax payouts in period" tone="good" Icon={Send} />
      <KpiCard label="Sales tax owed" value={fmtMoney(stats.owed)} sub={stats.owed > 0 ? "Remit to your state" : "All clear"} tone={owedTone} Icon={stats.owed > 0 ? AlertTriangle : CircleCheck} />
      <KpiCard label="Quarterly revenue" value={fmtMoney(stats.paidRevenue)} sub="Paid in period" tone="default" Icon={DollarSign} />
      <KpiCard label="Est. income tax" value={fmtMoney(estTax)} tone="bad" Icon={Calculator}>
        <div className="flex items-center gap-1">
          <Input
            type="number" step="0.5" min={0} max={60}
            value={rate}
            onChange={(e) => handleRateChange(e.target.value)}
            className="h-6 w-14 text-[11px] px-1 tabular-nums"
          />
          <span className="text-[10px] text-muted-foreground">% rate</span>
        </div>
      </KpiCard>
      <KpiCard label="Net after tax" value={fmtMoney(netAfter)} sub="Revenue − est. tax" tone={netAfter >= 0 ? "good" : "bad"} Icon={DollarSign} />
    </div>
  );
}
