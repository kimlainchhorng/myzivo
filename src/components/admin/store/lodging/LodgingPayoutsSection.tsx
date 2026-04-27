import { useEffect, useMemo } from "react";
import { Wallet, DollarSign, TrendingUp, Calendar, CalendarClock, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingPanel, NextActions, SectionShell, StatCard, money, useLodgingOpsData } from "./LodgingOperationsShared";
import { useConnectStatus, useConnectOnboard } from "@/hooks/useStripeConnect";

/**
 * Payouts & Finance — full end-to-end flow:
 *  - Live Stripe Connect Express onboarding/status (reuses driver/wallet flow)
 *  - Revenue, fees, net payout, upcoming, pending, paid count
 *  - Monthly revenue trend
 *  - Payout history (per-month, until a real `payouts` table is wired)
 *  - Reservation-level CSV export
 */
export default function LodgingPayoutsSection({ storeId }: { storeId: string }) {
  const { reservations, isLoading } = useLodgingOpsData(storeId);
  const { data: connect, isLoading: connectLoading } = useConnectStatus();
  const onboard = useConnectOnboard();
  const queryClient = useQueryClient();

  // Handle return from Stripe onboarding (?connect=done) — preserve tab=lodge-payouts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connect") === "done") {
      queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
      toast.success("Stripe setup updated — refreshing status…");
      params.delete("connect");
      const qs = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${qs ? "?" + qs : ""}`);
    }
  }, [queryClient]);

  const stats = useMemo(() => {
    const paid = reservations.filter((r) => r.payment_status === "paid" || r.status === "checked_out");
    const pending = reservations.filter((r) => r.payment_status === "pending" || r.payment_status === "deposit");
    const upcoming = reservations.filter((r) => ["confirmed", "checked_in"].includes(r.status));

    const totalRevenue = paid.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);
    const platformFee = Math.round(totalRevenue * 0.02); // 2% standard
    const netPayout = totalRevenue - platformFee;
    const pendingAmount = pending.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);
    const upcomingAmount = upcoming.reduce((s: number, r: any) => s + (r.total_cents || 0), 0);

    // Group paid by month (used for trend + payout history)
    const byMonth: Record<string, number> = {};
    paid.forEach((r: any) => {
      const month = (r.check_out || r.check_in || r.created_at || "").slice(0, 7);
      if (!month) return;
      byMonth[month] = (byMonth[month] || 0) + (r.total_cents || 0);
    });
    const months = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);

    return {
      totalRevenue, platformFee, netPayout, pendingAmount, upcomingAmount,
      paidCount: paid.length, upcomingCount: upcoming.length, months,
      paidReservations: paid,
    };
  }, [reservations]);

  const exportCsv = () => {
    const header = "Reservation ID,Guest,Check-in,Check-out,Status,Gross USD,Platform Fee USD,Net USD";
    const rows = stats.paidReservations.map((r: any) => {
      const gross = (r.total_cents || 0) / 100;
      const fee = Math.round((r.total_cents || 0) * 0.02) / 100;
      const net = gross - fee;
      const guest = (r.guest_name || r.guest_email || "—").replace(/,/g, " ");
      return `${r.id || ""},${guest},${r.check_in || ""},${r.check_out || ""},${r.status || ""},${gross.toFixed(2)},${fee.toFixed(2)},${net.toFixed(2)}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lodging-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOnboarding = () => onboard.mutate("US");
  const payoutsEnabled = !!connect?.payouts_enabled;
  const showPayoutBlockedBanner = !connectLoading && !payoutsEnabled && stats.pendingAmount > 0;

  return (
    <SectionShell
      title="Payouts & Finance"
      subtitle="Revenue, platform fees, pending payouts, and downloadable monthly statements."
      icon={Wallet}
      actions={<Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>}
    >
      {isLoading ? <LoadingPanel /> : <>
        {/* Payouts paused warning */}
        {showPayoutBlockedBanner && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Payouts are paused</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have {money(stats.pendingAmount)} pending. Complete Stripe onboarding to receive funds in your bank account.
              </p>
            </div>
            <Button size="sm" onClick={startOnboarding} disabled={onboard.isPending}>
              {onboard.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Finish setup"}
            </Button>
          </div>
        )}

        {/* Stat grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total revenue" value={money(stats.totalRevenue)} icon={DollarSign} />
          <StatCard label="Platform fee (2%)" value={money(stats.platformFee)} icon={TrendingUp} />
          <StatCard label="Net payout" value={money(stats.netPayout)} icon={Wallet} />
          <StatCard label="Upcoming revenue" value={money(stats.upcomingAmount)} icon={CalendarClock} />
          <StatCard label="Pending" value={money(stats.pendingAmount)} icon={Calendar} />
          <StatCard label="Paid bookings" value={String(stats.paidCount)} icon={CheckCircle2} />
        </div>

        {/* Payout account (Stripe Connect) */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Payout account</p>
            </div>
            {connectLoading ? (
              <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Checking…</Badge>
            ) : payoutsEnabled ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Payouts enabled</Badge>
            ) : connect?.connected ? (
              <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Action needed</Badge>
            ) : (
              <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />Not connected</Badge>
            )}
          </div>

          {connectLoading ? (
            <p className="text-xs text-muted-foreground">Loading Stripe status…</p>
          ) : !connect?.connected ? (
            <>
              <p className="text-xs text-muted-foreground">
                Connect a Stripe account to receive direct deposits. Stripe handles bank verification, tax forms (W-9 / W-8) and identity checks.
              </p>
              <Button size="sm" className="mt-3" onClick={startOnboarding} disabled={onboard.isPending}>
                {onboard.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <ArrowRight className="h-3.5 w-3.5 mr-2" />}
                Set up payouts
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant={connect.details_submitted ? "default" : "secondary"} className="gap-1">
                  {connect.details_submitted ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Details {connect.details_submitted ? "submitted" : "pending"}
                </Badge>
                <Badge variant={connect.payouts_enabled ? "default" : "secondary"} className="gap-1">
                  {connect.payouts_enabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Payouts {connect.payouts_enabled ? "enabled" : "disabled"}
                </Badge>
                <Badge variant={connect.charges_enabled ? "default" : "secondary"} className="gap-1">
                  {connect.charges_enabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Charges {connect.charges_enabled ? "enabled" : "disabled"}
                </Badge>
              </div>
              {!payoutsEnabled && (
                <Button size="sm" variant="outline" className="mt-3" onClick={startOnboarding} disabled={onboard.isPending}>
                  {onboard.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  Continue onboarding
                </Button>
              )}
              {connect.requirements && connect.requirements.length > 0 && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Outstanding: {connect.requirements.slice(0, 3).join(", ")}{connect.requirements.length > 3 ? "…" : ""}
                </p>
              )}
            </>
          )}
        </div>

        {/* Monthly revenue */}
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
                const pct = max > 0 ? (value / max) * 100 : 0;
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

        {/* Payout history */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Payout history</p>
            <Badge variant="outline">{stats.months.length}</Badge>
          </div>
          {stats.months.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payouts yet. Each month's net amount will appear here once reservations are paid.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Period</th>
                    <th className="py-2 font-medium text-right">Gross</th>
                    <th className="py-2 font-medium text-right">Fee (2%)</th>
                    <th className="py-2 font-medium text-right">Net</th>
                    <th className="py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.months.map(([month, gross]) => {
                    const fee = Math.round(gross * 0.02);
                    const net = gross - fee;
                    return (
                      <tr key={month} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium">
                          {new Date(month + "-01").toLocaleString("default", { month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2 text-right">{money(gross)}</td>
                        <td className="py-2 text-right text-muted-foreground">{money(fee)}</td>
                        <td className="py-2 text-right font-semibold">{money(net)}</td>
                        <td className="py-2 text-right">
                          {payoutsEnabled ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Paid</Badge>
                          ) : (
                            <Badge variant="secondary">Awaiting setup</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
