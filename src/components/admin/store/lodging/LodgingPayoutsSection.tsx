import { useMemo } from "react";
import { Wallet, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingPanel, NextActions, SectionShell, StatCard, money, useLodgingOpsData } from "./LodgingOperationsShared";

/**
 * Read-only payouts dashboard for lodging — surfaces revenue, pending payout,
 * and links into the existing Payment & Payouts tab for bank/tax setup.
 */
export default function LodgingPayoutsSection({ storeId }: { storeId: string }) {
  const { reservations, isLoading } = useLodgingOpsData(storeId);

  const stats = useMemo(() => {
    const paid = reservations.filter((r) => r.payment_status === "paid" || r.status === "checked_out");
    const pending = reservations.filter((r) => r.payment_status === "pending" || r.payment_status === "deposit");
    const upcoming = reservations.filter((r) => ["confirmed", "checked_in"].includes(r.status));

    const totalRevenue = paid.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);
    const platformFee = Math.round(totalRevenue * 0.02); // 2% standard
    const netPayout = totalRevenue - platformFee;
    const pendingAmount = pending.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);

    // Group by month
    const byMonth: Record<string, number> = {};
    paid.forEach((r: any) => {
      const month = (r.check_in || r.created_at || "").slice(0, 7);
      if (!month) return;
      byMonth[month] = (byMonth[month] || 0) + (r.total_cents || 0);
    });
    const months = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);

    return { totalRevenue, platformFee, netPayout, pendingAmount, paidCount: paid.length, upcomingCount: upcoming.length, months };
  }, [reservations]);

  const exportCsv = () => {
    const csv = ["Month,Revenue (USD)", ...stats.months.map(([m, v]) => `${m},${(v / 100).toFixed(2)}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lodging-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SectionShell
      title="Payouts & Finance"
      subtitle="Revenue, platform fees, pending payouts, and downloadable monthly statements."
      icon={Wallet}
      actions={<Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>}
    >
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total revenue" value={money(stats.totalRevenue)} icon={DollarSign} />
          <StatCard label="Platform fee (2%)" value={money(stats.platformFee)} icon={TrendingUp} />
          <StatCard label="Net payout" value={money(stats.netPayout)} icon={Wallet} />
          <StatCard label="Pending" value={money(stats.pendingAmount)} icon={Calendar} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Monthly revenue</p>
            <Badge variant="outline">{stats.months.length} month{stats.months.length === 1 ? "" : "s"}</Badge>
          </div>
          {stats.months.length === 0 ? (
            <p className="text-sm text-muted-foreground">No paid reservations yet. Once guests check out, monthly totals will appear here.</p>
          ) : (
            <div className="space-y-2">
              {stats.months.map(([month, value]) => {
                const max = Math.max(...stats.months.map(([, v]) => v));
                const pct = (value / max) * 100;
                return (
                  <div key={month}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium">{new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}</span>
                      <span className="text-muted-foreground">{money(value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold">Bank account & tax info</p>
          <p className="mt-1 text-xs text-muted-foreground">Payout destination, tax ID, and W-9 / W-8 forms are configured in Payment & Payouts.</p>
          <Button size="sm" className="mt-3" onClick={() => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab: "payment-payouts" } }))}>
            Open Payment & Payouts
          </Button>
        </div>

        <NextActions actions={[
          { label: "Review reservations", tab: "lodge-reservations", hint: "Confirm bookings are tagged with correct payment status." },
          { label: "Tune rate plans", tab: "lodge-rate-plans", hint: "Optimize pricing to grow revenue." },
          { label: "Run promotions", tab: "lodge-promos", hint: "Drive occupancy with discounts and codes." },
        ]} />
      </>}
    </SectionShell>
  );
}
