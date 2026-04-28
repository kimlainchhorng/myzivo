/**
 * Auto Repair Finance — Profit & Loss
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, FileDown } from "lucide-react";

interface Props { storeId: string }
const fmt = (cents: number) => `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceProfitLossSection({ storeId }: Props) {
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: payments = [] } = useQuery({
    queryKey: ["ar-pnl-payments", storeId, from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_invoice_payments" as any).select("amount_cents,paid_at,method")
        .eq("store_id", storeId)
        .gte("paid_at", from).lte("paid_at", `${to}T23:59:59`);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["ar-pnl-expenses", storeId, from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_expenses" as any).select("amount_cents,category,expense_date")
        .eq("store_id", storeId)
        .gte("expense_date", from).lte("expense_date", to);
      if (error) throw error;
      return data as any[];
    },
  });

  const stats = useMemo(() => {
    const income = payments.reduce((s: number, p: any) => s + (p.amount_cents ?? 0), 0);
    const expenseTotal = expenses.reduce((s: number, e: any) => s + (e.amount_cents ?? 0), 0);
    const byCat: Record<string, number> = {};
    expenses.forEach((e: any) => { byCat[e.category] = (byCat[e.category] || 0) + (e.amount_cents ?? 0); });
    return { income, expenseTotal, net: income - expenseTotal, byCat };
  }, [payments, expenses]);

  const exportCsv = () => {
    const rows = [
      ["Period", `${from} to ${to}`],
      ["Income (payments received)", fmt(stats.income)],
      ["Expenses (total)", fmt(stats.expenseTotal)],
      ["Net Profit", fmt(stats.net)],
      [],
      ["Expense breakdown by category", ""],
      ...Object.entries(stats.byCat).map(([k, v]) => [k, fmt(v as number)]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pnl-${from}-to-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Profit & Loss
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-36" />
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-36" />
            <Button size="sm" variant="outline" onClick={exportCsv}><FileDown className="w-4 h-4 mr-1" />CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-4">
              <div className="text-xs text-muted-foreground">Income (paid)</div>
              <div className="text-2xl font-semibold text-emerald-600">{fmt(stats.income)}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs text-muted-foreground">Expenses</div>
              <div className="text-2xl font-semibold text-rose-600">{fmt(stats.expenseTotal)}</div>
            </div>
            <div className="rounded-md border p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground">Net Profit</div>
              <div className={`text-2xl font-bold ${stats.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{fmt(stats.net)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Expense breakdown</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(stats.byCat).length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses in this period.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(stats.byCat).sort(([, a], [, b]) => (b as number) - (a as number)).map(([cat, amt]) => {
                const pct = stats.expenseTotal ? Math.round(((amt as number) / stats.expenseTotal) * 100) : 0;
                return (
                  <li key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{cat}</span>
                      <span className="tabular-nums">{fmt(amt as number)} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
