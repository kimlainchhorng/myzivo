/**
 * Account Wallet Page
 * Shows credit balance and transaction history
 */
import { ArrowLeft, Wallet, Users, Tag, RotateCcw, ShoppingBag, Gift, TrendingUp, ExternalLink, Trophy, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCustomerWallet, type WalletTransaction } from "@/hooks/useCustomerWallet";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

export default function WalletPage() {
  const navigate = useNavigate();
  const { wallet, transactions, balanceDollars, lifetimeEarnedDollars, isLoading } = useCustomerWallet();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "referral":
        return <Users className="w-4 h-4" />;
      case "promo":
        return <Tag className="w-4 h-4" />;
      case "refund":
        return <RotateCcw className="w-4 h-4" />;
      case "order":
        return <ShoppingBag className="w-4 h-4" />;
      case "redemption":
        return <Gift className="w-4 h-4" />;
      case "gift_card":
        return <Gift className="w-4 h-4" />;
      case "reward":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string, amountCents: number) => {
    // Positive amounts (credits added)
    if (amountCents > 0) {
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        prefix: "+",
      };
    }
    // Negative amounts (credits spent)
    return {
      bg: "bg-red-500/20",
      text: "text-red-400",
      prefix: "",
    };
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "referral":
        return "Referral Bonus";
      case "promo":
        return "Promo Credit";
      case "refund":
        return "Refund";
      case "order":
        return "Order Payment";
      case "redemption":
        return "Redeemed";
      case "gift_card":
        return "Gift Card";
      case "reward":
        return "Reward Credit";
      default:
        return "Credit";
    }
  };

  // Calculate reward credits total
  const rewardCreditsCents = (transactions || [])
    .filter((tx) => tx.type === "reward" && tx.amount_cents > 0)
    .reduce((sum, tx) => sum + tx.amount_cents, 0);
  const rewardCreditsDollars = rewardCreditsCents / 100;

  const pendingCreditsDollars = (wallet?.pending_credits_cents || 0) / 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead title="Credit Wallet — ZIVO" description="Your ZIVO credits and earnings" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Credit Wallet</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/20 to-zinc-900 border border-emerald-500/30 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Available Credit</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-16 bg-zinc-800/50 rounded-2xl animate-pulse" />
          ) : (
            <>
              <p className="text-5xl font-bold text-center mb-2">
                ${balanceDollars.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-500 text-center">
                Available to use on orders
              </p>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Lifetime Earned
              </span>
              <span className="font-medium">${lifetimeEarnedDollars.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Rewards Added Summary */}
        {rewardCreditsCents > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-primary/10 to-zinc-900 border border-primary/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">Rewards Added</p>
                  <p className="text-xs text-zinc-400">Total credits from rewards</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">${rewardCreditsDollars.toFixed(2)}</p>
            </div>
            <button
              onClick={() => navigate("/account/rewards")}
              className="mt-3 w-full text-center text-xs text-primary hover:underline"
            >
              View all rewards →
            </button>
          </motion.div>
        )}

        {/* Pending Credits */}
        {pendingCreditsDollars > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium">Pending Credits</p>
              <p className="text-xs text-zinc-500">Will be available soon</p>
            </div>
            <p className="font-bold text-amber-400">${pendingCreditsDollars.toFixed(2)}</p>
          </motion.div>
        )}

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5"
        >
          <h2 className="font-bold mb-4">How to Earn Credits</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/account/referrals")}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Refer Friends</p>
                <p className="text-xs text-zinc-500">Earn credits when they book</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => navigate("/account/rewards")}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Rewards</p>
                <p className="text-xs text-zinc-500">Earn rewards for milestones</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => navigate("/account/promos")}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Promo Codes</p>
                <p className="text-xs text-zinc-500">View your available codes</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => navigate("/account/gift-cards")}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Gift Cards</p>
                <p className="text-xs text-zinc-500">Buy, send, or redeem gift cards</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bold text-lg mb-4">Transaction History</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-900/80 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-8 text-center">
              <Wallet className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No transactions yet</p>
              <p className="text-sm text-zinc-600 mt-1">
                Earn credits by referring friends!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const color = getTransactionColor(tx.type, tx.amount_cents);
                return (
                  <div
                    key={tx.id}
                    className="bg-zinc-900/80 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center ${color.text}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.description || getTransactionLabel(tx.type)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${color.text}`}>
                      {color.prefix}${Math.abs(tx.amount_cents / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Info Text */}
        <div className="text-xs text-zinc-600 space-y-1">
          <p>• Credits are automatically applied at checkout</p>
          <p>• Max $25 credit per order</p>
          <p>• Credits have no cash value</p>
        </div>
      </div>
    </div>
  );
}
