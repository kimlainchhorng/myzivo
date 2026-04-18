/**
 * StripeConnectPayoutCard — Instant payout to debit card via Stripe Connect Express.
 */
import { useState, useEffect } from "react";
import { Zap, CheckCircle2, AlertCircle, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectStatus, useConnectOnboard, useInstantPayout } from "@/hooks/useStripeConnect";
import StripeEmbeddedOnboarding from "./StripeEmbeddedOnboarding";

interface Props {
  balanceDollars: number;
}

export default function StripeConnectPayoutCard({ balanceDollars }: Props) {
  const { data: status, isLoading } = useConnectStatus();
  const onboard = useConnectOnboard();
  const payout = useInstantPayout();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"instant" | "standard">("instant");
  const [embedOpen, setEmbedOpen] = useState(false);

  // When Stripe redirects user back with ?connect=done, refresh status & clean URL
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

  const amountNum = Number(amount) || 0;
  const canPayout =
    !!status?.payouts_enabled &&
    amountNum >= 1 &&
    amountNum <= balanceDollars &&
    !payout.isPending;

  if (isLoading) {
    return <div className="h-32 bg-muted/30 rounded-2xl animate-pulse" />;
  }

  const handleComplete = () => {
    setEmbedOpen(false);
    queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
  };

  // Not connected yet
  if (!status?.connected || !status?.details_submitted) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-[#635bff] to-[#4b44d9] text-white p-5 shadow-lg shadow-[#635bff]/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Powered by Stripe</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Get paid instantly</h3>
          <p className="text-sm text-white/80 mb-4 leading-relaxed">
            Connect your debit card and cash out in minutes — 24/7, including weekends.
          </p>
          <Button
            onClick={() => setEmbedOpen(true)}
            className="w-full h-11 rounded-xl bg-white text-[#635bff] hover:bg-white/90 font-bold gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {status?.connected ? "Continue setup" : "Set up instant payouts"}
          </Button>
          {!!status?.requirements?.length && (
            <p className="text-[11px] text-white/70 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {status.requirements.length} item(s) need to be completed
            </p>
          )}
        </motion.div>
        <StripeEmbeddedOnboarding
          open={embedOpen}
          onClose={() => setEmbedOpen(false)}
          onComplete={handleComplete}
        />
      </>
    );
  }

  // Connected — show payout form
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#635bff] to-[#4b44d9] text-white p-4 shadow-lg shadow-[#635bff]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Stripe Connected</p>
                <p className="text-sm font-semibold">
                  {status.instant_eligible ? "Instant payouts ready ⚡" : "Standard payouts ready"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmbedOpen(true)}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Method toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMethod("instant")}
            disabled={!status.instant_eligible}
            className={`flex-1 p-3 rounded-2xl border-2 transition-all text-left ${
              method === "instant"
                ? "border-[#635bff] bg-[#635bff]/5"
                : "border-border/40 bg-card opacity-70"
            } ${!status.instant_eligible ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-[#635bff]" />
              <span className="text-[12px] font-bold">Instant</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Minutes · 1.5% fee</p>
          </button>
          <button
            onClick={() => setMethod("standard")}
            className={`flex-1 p-3 rounded-2xl border-2 transition-all text-left ${
              method === "standard" ? "border-[#635bff] bg-[#635bff]/5" : "border-border/40 bg-card opacity-70"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] font-bold">Standard</span>
            </div>
            <p className="text-[10px] text-muted-foreground">2 business days · Free</p>
          </button>
        </div>

        {/* Amount */}
        <div>
          <div className="flex gap-2 flex-wrap mb-2">
            {[5, 25, 50, 100].filter((a) => a <= balanceDollars).map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(String(amt))}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${
                  amount === String(amt) ? "bg-[#635bff] text-white" : "bg-muted/50 border border-border/40"
                }`}
              >
                ${amt}
              </button>
            ))}
            {balanceDollars >= 1 && (
              <button
                onClick={() => setAmount(balanceDollars.toFixed(2))}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${
                  amount === balanceDollars.toFixed(2) ? "bg-[#635bff] text-white" : "bg-muted/50 border border-border/40"
                }`}
              >
                All
              </button>
            )}
          </div>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl h-11"
            min="1"
            max={balanceDollars}
          />
        </div>

        <Button
          onClick={() => payout.mutate({ amount_cents: Math.round(amountNum * 100), method })}
          disabled={!canPayout}
          className="w-full h-12 rounded-2xl font-bold gap-2 bg-[#635bff] hover:bg-[#4b44d9] text-white"
        >
          {payout.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : method === "instant" ? (
            <Zap className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {payout.isPending
            ? "Processing…"
            : `${method === "instant" ? "Instant payout" : "Cash out"} $${amountNum.toFixed(2)}`}
        </Button>

        <p className="text-[10px] text-muted-foreground/70 text-center">
          {method === "instant"
            ? "Funds typically arrive within minutes to eligible debit cards."
            : "Funds arrive in 1–2 business days via ACH."}
        </p>
      </motion.div>
      <StripeEmbeddedOnboarding
        open={embedOpen}
        onClose={() => setEmbedOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
