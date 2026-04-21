/**
 * AdsStudioWalletGuard — Ads Studio wallet with Stripe top-up + auto-recharge + ledger.
 * Drives `ads_studio_wallet` and `ads_wallet_ledger` (separate from food/restaurant wallet).
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Zap, Loader2, Plus, History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props { storeId: string }

interface LedgerRow {
  id: string;
  entry_type: string;
  amount_cents: number;
  balance_after_cents: number;
  description: string | null;
  created_at: string;
}

const TOPUP_PRESETS = [25, 50, 100, 250];

export default function AdsStudioWalletGuard({ storeId }: Props) {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState(0);
  const [hasCard, setHasCard] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [amount, setAmount] = useState(50);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(50);
  const [topupBusy, setTopupBusy] = useState(false);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [showLedger, setShowLedger] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ads_studio_wallet" as any)
      .select("balance_cents, auto_recharge_enabled, threshold_cents, recharge_amount_cents, stripe_payment_method_id")
      .eq("store_id", storeId)
      .maybeSingle();
    if (data) {
      const w = data as any;
      setBalance(w.balance_cents ?? 0);
      setEnabled(!!w.auto_recharge_enabled);
      setThreshold((w.threshold_cents ?? 1000) / 100);
      setAmount((w.recharge_amount_cents ?? 5000) / 100);
      setHasCard(!!w.stripe_payment_method_id);
    }
    const { data: lg } = await supabase
      .from("ads_wallet_ledger" as any)
      .select("id, entry_type, amount_cents, balance_after_cents, description, created_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(20);
    setLedger((lg as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  // Verify Stripe Checkout session on return
  useEffect(() => {
    const sessionId = params.get("session_id");
    const topup = params.get("topup");
    if (topup === "success" && sessionId) {
      (async () => {
        const { data, error } = await supabase.functions.invoke("verify-ads-wallet-topup", {
          body: { session_id: sessionId },
        });
        if (error) toast.error(error.message);
        else if ((data as any)?.status === "credited") toast.success("Wallet topped up!");
        else if ((data as any)?.status === "already_credited") { /* silent */ }
        else toast.message("Top-up still processing…");
        params.delete("topup"); params.delete("session_id");
        setParams(params, { replace: true });
        load();
      })();
    } else if (topup === "cancelled") {
      toast.info("Top-up cancelled");
      params.delete("topup");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("ads_studio_wallet" as any)
      .upsert({
        store_id: storeId,
        auto_recharge_enabled: enabled,
        threshold_cents: Math.round(threshold * 100),
        recharge_amount_cents: Math.round(amount * 100),
      }, { onConflict: "store_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Auto-recharge settings saved");
  };

  const startTopup = async () => {
    if (topupAmount < 5) { toast.error("Minimum $5"); return; }
    setTopupBusy(true);
    const { data, error } = await supabase.functions.invoke("create-ads-wallet-topup", {
      body: {
        store_id: storeId,
        amount_cents: Math.round(topupAmount * 100),
        save_card: enabled,
        return_url: window.location.pathname,
      },
    });
    setTopupBusy(false);
    if (error) { toast.error(error.message); return; }
    if ((data as any)?.url) window.location.href = (data as any).url;
  };

  const isLow = balance < threshold * 100;
  const balanceColor = isLow ? "text-destructive" : "text-emerald-600";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Ads wallet</h3>
              <p className="text-[10px] text-muted-foreground">Powered by Stripe</p>
            </div>
          </div>
          {!loading && (
            <div className="text-right">
              <p className={`text-xl font-bold tracking-tight ${balanceColor}`}>${(balance / 100).toFixed(2)}</p>
              {isLow && <Badge variant="destructive" className="text-[9px] h-4">Low</Badge>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="h-8 text-xs gap-1" onClick={() => { setTopupAmount(50); setTopupOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Top up
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setShowLedger((s) => !s)}>
            <History className="h-3.5 w-3.5" /> History
          </Button>
        </div>

        <div className="rounded-lg border border-border p-2.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <Label className="text-xs cursor-pointer">Auto-recharge when low</Label>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          {enabled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Below ($)</Label>
                  <Input type="number" min={1} step={1} value={threshold}
                    onChange={(e) => setThreshold(+e.target.value || 1)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Add ($)</Label>
                  <Input type="number" min={5} step={5} value={amount}
                    onChange={(e) => setAmount(+e.target.value || 50)} className="h-8 text-sm" />
                </div>
              </div>
              {!hasCard && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  Top up once to save a card for future auto-recharges.
                </p>
              )}
              <Button size="sm" variant="secondary" className="w-full h-7 text-xs" onClick={save} disabled={saving || loading}>
                {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null} Save settings
              </Button>
            </>
          )}
        </div>

        {showLedger && (
          <div className="rounded-lg border border-border max-h-56 overflow-y-auto divide-y divide-border">
            {ledger.length === 0 ? (
              <p className="text-[11px] text-muted-foreground p-3 text-center">No transactions yet</p>
            ) : ledger.map((row) => {
              const credit = row.entry_type === "topup" || row.entry_type === "refund";
              return (
                <div key={row.id} className="flex items-center gap-2 p-2 text-[11px]">
                  {credit ? (
                    <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowUpCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{row.description || row.entry_type}</p>
                    <p className="text-[9px] text-muted-foreground">{format(new Date(row.created_at), "MMM d, h:mm a")}</p>
                  </div>
                  <span className={`font-semibold ${credit ? "text-emerald-600" : "text-foreground"}`}>
                    {credit ? "+" : "−"}${(row.amount_cents / 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Top up Ads wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {TOPUP_PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => setTopupAmount(v)}
                  className={`h-10 rounded-lg border text-sm font-semibold transition ${
                    topupAmount === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Custom amount ($)</Label>
              <Input type="number" min={5} step={5} value={topupAmount}
                onChange={(e) => setTopupAmount(+e.target.value || 0)} className="h-9" />
            </div>
            {enabled && !hasCard && (
              <p className="text-[11px] text-muted-foreground">
                Your card will be securely saved with Stripe so we can auto-recharge later.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopupOpen(false)}>Cancel</Button>
            <Button onClick={startTopup} disabled={topupBusy || topupAmount < 5}>
              {topupBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Pay ${topupAmount.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
