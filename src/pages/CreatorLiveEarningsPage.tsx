/**
 * CreatorLiveEarningsPage — Dedicated page for live-stream gift earnings.
 * Route: /creator/live-earnings
 *
 * Conversion: 1 coin = $0.01 (gross), creator receives 70%, platform 30%.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Gift, Coins, Users, TrendingUp, Wallet, Sparkles,
  Clock, Radio, Heart, Eye, ChevronRight, Banknote, Info,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { useLiveEarnings, useRequestLiveEarningsPayout } from "@/hooks/useLiveEarnings";

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function CreatorLiveEarningsPage() {
  const navigate = useNavigate();
  const { totals, streams, payouts, isLoading } = useLiveEarnings();
  const requestPayout = useRequestLiveEarningsPayout();

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const earningsCents = totals?.earnings_cents ?? 0;
  const totalCoins = totals?.total_coins_received ?? 0;
  const totalGifts = totals?.total_gifts_received ?? 0;
  const uniqueGifters = totals?.unique_gifters ?? 0;

  const pendingCents = useMemo(
    () =>
      payouts
        .filter((p: any) => p.status === "pending" || p.status === "processing")
        .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0),
    [payouts]
  );
  const paidCents = useMemo(
    () =>
      payouts
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0),
    [payouts]
  );
  const availableCents = Math.max(0, earningsCents - pendingCents - paidCents);

  const handleWithdraw = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 1000) return;
    if (cents > availableCents) return;
    await requestPayout.mutateAsync({ amount_cents: cents });
    setWithdrawOpen(false);
    setAmount("");
  };

  const stats = [
    {
      label: "Coins Received",
      value: totalCoins.toLocaleString(),
      icon: Coins,
      accent: "hsl(38 92% 50%)",
    },
    {
      label: "Gifts",
      value: totalGifts.toLocaleString(),
      icon: Gift,
      accent: "hsl(340 75% 55%)",
    },
    {
      label: "Unique Gifters",
      value: uniqueGifters.toLocaleString(),
      icon: Users,
      accent: "hsl(221 83% 53%)",
    },
    {
      label: "Lifetime Sessions",
      value: String(streams.length),
      icon: Radio,
      accent: "hsl(263 70% 58%)",
    },
  ];

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead
        title="Live Earnings – ZIVO Creator"
        description="Track your live-stream gift earnings and withdraw to your bank."
        noIndex
      />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/85 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-extrabold flex-1 tracking-tight">Live Earnings</h1>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] gap-1">
            <Sparkles className="w-2.5 h-2.5" /> 70% share
          </Badge>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Hero Earnings card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[22px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative z-10 p-6 text-white">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <p className="text-white/80 text-[11px] font-semibold uppercase tracking-wider">
                  Available to Withdraw
                </p>
              </div>
            </div>

            <p className="text-[44px] font-extrabold leading-none tracking-tight">
              ${(availableCents / 100).toFixed(2)}
            </p>
            <p className="text-white/70 text-[11px] mt-2 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {totalCoins.toLocaleString()} coins lifetime · ${(earningsCents / 100).toFixed(2)} earned
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Pending</p>
                <p className="font-bold text-sm mt-0.5">${(pendingCents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Paid Out</p>
                <p className="font-bold text-sm mt-0.5">${(paidCents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Min</p>
                <p className="font-bold text-sm mt-0.5">$10.00</p>
              </div>
            </div>

            <Button
              onClick={() => setWithdrawOpen(true)}
              disabled={availableCents < 1000}
              className="w-full mt-5 h-12 rounded-2xl bg-white text-orange-600 hover:bg-white/95 font-bold text-sm gap-2 disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              {availableCents < 1000 ? "Earn $10 to withdraw" : "Withdraw to bank"}
            </Button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="zivo-card-organic p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.accent}15` }}
                >
                  <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="rounded-2xl bg-muted/40 border border-border/30 p-3.5 flex gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">How it works:</strong> Viewers send Z Coins
            during your live streams (1 coin = $0.01). You keep <strong className="text-foreground">70%</strong>,
            ZIVO retains 30% for processing & moderation. Withdrawals process in 1-3 business days.
          </div>
        </div>

        {/* Per-stream earnings history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px] flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Stream History
            </h2>
            <span className="text-[10px] text-muted-foreground">{streams.length} sessions</span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : streams.length === 0 ? (
            <div className="zivo-card-organic p-8 text-center border-dashed">
              <Radio className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs font-bold mb-1">No live streams yet</p>
              <p className="text-[10px] text-muted-foreground mb-4">
                Go live to start receiving Z Coin gifts from viewers!
              </p>
              <Button
                onClick={() => navigate("/go-live")}
                className="h-10 rounded-xl text-xs font-bold gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" /> Go Live Now
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {streams.map((s, i) => (
                <motion.div
                  key={s.stream_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="zivo-card-organic p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-[13px] truncate">
                          {s.title || "Untitled stream"}
                        </p>
                        {s.status === "live" && (
                          <Badge className="bg-rose-500 text-white border-0 text-[8px] font-bold px-1.5 py-0 h-4 animate-pulse">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {s.started_at
                          ? formatDistanceToNow(new Date(s.started_at), { addSuffix: true })
                          : "Scheduled"}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {(s.viewer_count ?? 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {(s.like_count ?? 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gift className="w-3 h-3" /> {s.gifts_received.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[15px] text-emerald-600 tabular-nums">
                        ${(s.earnings_cents / 100).toFixed(2)}
                      </p>
                      <p className="text-[9px] text-muted-foreground tabular-nums">
                        {s.coins_received.toLocaleString()} coins
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal history */}
        {payouts.length > 0 && (
          <div>
            <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Withdrawals
            </h2>
            <div className="space-y-2">
              {payouts.map((p: any) => (
                <div
                  key={p.id}
                  className="zivo-card-organic p-3 flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      p.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : p.status === "pending" || p.status === "processing"
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs">${(p.amount_cents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {p.status} ·{" "}
                      {p.paid_at
                        ? format(new Date(p.paid_at), "MMM d, yyyy")
                        : formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" /> Withdraw Earnings
            </DialogTitle>
            <DialogDescription>
              Available: <strong>${(availableCents / 100).toFixed(2)}</strong> · Minimum: $10.00
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-bold rounded-xl"
              min={10}
              max={availableCents / 100}
            />
            <div className="flex gap-1.5 flex-wrap">
              {QUICK_AMOUNTS.filter((a) => a * 100 <= availableCents).map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="px-3 py-1.5 rounded-full bg-muted text-xs font-bold hover:bg-muted/70 active:scale-95 transition"
                >
                  ${a}
                </button>
              ))}
              {availableCents >= 1000 && (
                <button
                  onClick={() => setAmount(String((availableCents / 100).toFixed(2)))}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold hover:bg-emerald-500/20 active:scale-95 transition"
                >
                  Max
                </button>
              )}
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={
                requestPayout.isPending ||
                !amount ||
                parseFloat(amount) < 10 ||
                parseFloat(amount) * 100 > availableCents
              }
              className="w-full h-12 rounded-2xl font-bold"
            >
              {requestPayout.isPending ? "Processing..." : "Confirm withdrawal"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Processed via your default payout method in Wallet → Cash Out
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ZivoMobileNav />
    </div>
  );
}
