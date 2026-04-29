/**
 * Income KPI strip — 6 cards with sparklines + delta vs previous period.
 */
import { ArrowDown, ArrowUp, Minus, DollarSign, Receipt, AlertCircle, TrendingUp, FileText, Percent } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { fmtMoney, fmtPct, compareDelta, type IncomeKpis, type IncomeSeriesPoint } from "@/lib/admin/incomeCalculations";

interface Props {
  kpis: IncomeKpis;
  prev?: IncomeKpis | null;
  series: IncomeSeriesPoint[];
  loading?: boolean;
}

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  spark?: { v: number }[];
  delta?: { pct: number; direction: "up" | "down" | "flat" };
  tone?: "default" | "good" | "bad";
  Icon: any;
  invertDelta?: boolean;
}

function KpiCard({ label, value, sub, spark, delta, tone = "default", Icon, invertDelta }: KpiProps) {
  const toneCls = tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-rose-600" : "text-foreground";
  const sparkColor = tone === "bad" ? "hsl(var(--destructive))" : "hsl(var(--primary))";
  const deltaCls = !delta || delta.direction === "flat"
    ? "text-muted-foreground"
    : delta.direction === "up"
      ? (invertDelta ? "text-rose-600" : "text-emerald-600")
      : (invertDelta ? "text-emerald-600" : "text-rose-600");
  const DeltaIcon = !delta || delta.direction === "flat" ? Minus : delta.direction === "up" ? ArrowUp : ArrowDown;
  return (
    <div className="rounded-xl border bg-card p-3 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
          <Icon className="w-3 h-3" /> {label}
        </div>
        {delta && (
          <span className={`text-[10px] font-medium inline-flex items-center gap-0.5 ${deltaCls}`}>
            <DeltaIcon className="w-3 h-3" />{Math.abs(delta.pct).toFixed(1)}%
          </span>
        )}
      </div>
      <div className={`text-xl font-bold tabular-nums truncate ${toneCls}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate">{sub}</div>}
      {spark && spark.length > 1 && (
        <div className="h-7 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function IncomeKpiStrip({ kpis, prev, series, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-3 h-24 animate-pulse" />
        ))}
      </div>
    );
  }
  const spark = series.map((s) => ({ v: s.revenue }));
  const d = (cur: number, p?: number) => prev ? compareDelta(cur, p ?? 0) : undefined;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
      <KpiCard label="Revenue (paid)" value={fmtMoney(kpis.revenue)} spark={spark} delta={d(kpis.revenue, prev?.revenue)} tone="good" Icon={DollarSign} />
      <KpiCard label="Billed" value={fmtMoney(kpis.billed)} sub="Total invoiced" delta={d(kpis.billed, prev?.billed)} Icon={Receipt} />
      <KpiCard label="Outstanding" value={fmtMoney(kpis.outstanding)} sub="Awaiting payment" delta={d(kpis.outstanding, prev?.outstanding)} tone="bad" invertDelta Icon={AlertCircle} />
      <KpiCard label="Avg ticket" value={fmtMoney(kpis.avgTicket)} sub="Per paid invoice" delta={d(kpis.avgTicket, prev?.avgTicket)} tone="good" Icon={TrendingUp} />
      <KpiCard label="Invoices" value={String(kpis.invoiceCount)} sub="In range" delta={d(kpis.invoiceCount, prev?.invoiceCount)} Icon={FileText} />
      <KpiCard label="Collection rate" value={fmtPct(kpis.collectionRate)} sub="Paid ÷ billed" delta={d(kpis.collectionRate, prev?.collectionRate)} tone="good" Icon={Percent} />
    </div>
  );
}
