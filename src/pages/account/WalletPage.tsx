/**
 * ZIVO Wallet — Premium 2026 redesign
 * Real Supabase/Stripe data throughout
 */
import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, Wallet, CreditCard, Star, Trash2, Plus, Shield,
  Users, Gift, Trophy,
  Clock, DollarSign, ChevronRight, Eye, EyeOff,
  TrendingUp, Zap, Banknote, Building2, Send, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";
import { useStripePaymentMethods, useDeleteStripeCard, useSetDefaultStripeCard } from "@/hooks/useStripePaymentMethods";
import { useWalletTransactions, useWalletCredits, useWalletSummary } from "@/hooks/useZivoWallet";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import AddCardForm from "@/components/wallet/AddCardForm";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

function brandIcon(brand: string) {
  const b = brand?.toLowerCase();
  if (b === "visa") return "💳";
  if (b === "mastercard") return "🔶";
  if (b === "amex") return "💎";
  return "💳";
}

function brandLabel(brand: string) {
  const map: Record<string, string> = {
    visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover",
  };
  return map[brand?.toLowerCase()] || brand?.toUpperCase() || "Card";
}

const TAB_ITEMS = [
  { key: "cards", label: "Cards", icon: CreditCard },
  { key: "cashout", label: "Cash Out", icon: Banknote },
  { key: "history", label: "History", icon: Clock },
  { key: "credits", label: "Credits", icon: Gift },
] as const;

const CASHOUT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "Transfer to your bank account" },
  { id: "aba", label: "ABA / KHQR", icon: Banknote, desc: "Withdraw via ABA PayWay" },
] as const;

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export default function WalletPage() {
  const navigate = useNavigate();
  const [showAddCard, setShowAddCard] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "cashout" | "history" | "credits">("cards");
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashoutMethod, setCashoutMethod] = useState<string>("bank_transfer");
  const [cashoutNote, setCashoutNote] = useState("");
  const [cashoutSubmitting, setCashoutSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { balanceDollars, lifetimeEarnedDollars, isLoading: walletLoading } = useCustomerWallet();
  const { data: stripeCards = [], isLoading: cardsLoading } = useStripePaymentMethods();
  const deleteCard = useDeleteStripeCard();
  const setDefault = useSetDefaultStripeCard();
  const { data: walletTransactions = [], isLoading: txLoading } = useWalletTransactions();
  const { data: walletCredits = [], isLoading: creditsLoading } = useWalletCredits();
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { points, isLoading: pointsLoading } = useLoyaltyPoints();

  const totalSpent = summary?.totalSpent ?? 0;
  const txCount = summary?.transactionCount ?? 0;

  const earnedCredits = walletCredits
    .filter((c) => !c.expires_at || new Date(c.expires_at) > new Date())
    .reduce((sum, c) => sum + Number(c.amount), 0);


  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEOHead title="ZIVO Wallet" description="Payments & credits" />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="flex items-center px-5 py-3.5 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-[17px] leading-tight">Wallet</h1>
          </div>
          <button
            onClick={() => setBalanceHidden(!balanceHidden)}
            className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center"
          >
            {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 space-y-5">

        {/* ── BALANCE HERO ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-[22px] overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600" />
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/8" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5 blur-xl" />

          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[14px] bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[11px] font-medium tracking-wide uppercase">Available Balance</p>
                </div>
              </div>
              <Badge className="bg-white/15 text-white border-0 text-[9px] font-semibold gap-1 backdrop-blur-sm">
                <Shield className="w-2.5 h-2.5" /> Encrypted
              </Badge>
            </div>

            <div className="mb-6">
              <motion.p
                key={balanceHidden ? "hidden" : "visible"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[42px] font-extrabold text-white leading-none tracking-tight"
              >
                {walletLoading ? "..." : balanceHidden ? "••••••" : `$${balanceDollars.toFixed(2)}`}
              </motion.p>
              {lifetimeEarnedDollars > 0 && (
                <p className="text-white/50 text-[11px] mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ${lifetimeEarnedDollars.toFixed(2)} lifetime earned
                </p>
              )}
            </div>

            <div className="flex gap-0 border-t border-white/15 -mx-6 px-6 pt-4">
              <div className="flex-1">
                <p className="text-white/45 text-[10px] font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-white font-bold text-lg mt-0.5">
                  {summaryLoading ? "..." : balanceHidden ? "••••" : `$${totalSpent.toFixed(0)}`}
                </p>
              </div>
              <div className="w-px bg-white/15 mx-4" />
              <div className="flex-1">
                <p className="text-white/45 text-[10px] font-medium uppercase tracking-wider">Transactions</p>
                <p className="text-white font-bold text-lg mt-0.5">
                  {summaryLoading ? "..." : txCount}
                </p>
              </div>
              <div className="w-px bg-white/15 mx-4" />
              <div className="flex-1">
                <p className="text-white/45 text-[10px] font-medium uppercase tracking-wider">Points</p>
                <p className="text-white font-bold text-lg mt-0.5 flex items-center gap-1">
                  {pointsLoading ? "..." : points.points_balance.toLocaleString()}
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <div className="flex bg-muted/40 rounded-2xl p-1 gap-0.5">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-2.5 rounded-[14px] transition-all duration-200 touch-manipulation ${
                activeTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === "cards" && (
            <motion.div key="cards" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[15px]">Payment Methods</h2>
                {!showAddCard && (
                  <Button size="sm" className="rounded-xl font-semibold gap-1.5 h-8 text-xs" onClick={() => setShowAddCard(true)}>
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </Button>
                )}
              </div>

              {showAddCard && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <AddCardForm onClose={() => setShowAddCard(false)} />
                </motion.div>
              )}

              {cardsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-[72px] bg-muted/30 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : stripeCards.length === 0 && !showAddCard ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-sm">No payment methods</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a card for fast checkout</p>
                  <Button size="sm" variant="outline" className="mt-4 rounded-xl text-xs font-semibold gap-1.5" onClick={() => setShowAddCard(true)}>
                    <Plus className="w-3 h-3" /> Add Your First Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {stripeCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all ${
                        card.is_default
                          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                          : "border-border/40 bg-card"
                      }`}
                    >
                      <div className="text-2xl w-10 h-10 flex items-center justify-center">
                        {brandIcon(card.brand)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{brandLabel(card.brand)}</p>
                          <span className="text-muted-foreground text-sm">•••• {card.last4}</span>
                          {card.is_default && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px] font-bold px-1.5 py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Expires {card.exp_month}/{card.exp_year}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {!card.is_default && (
                          <button
                            onClick={() => setDefault.mutate(card.id)}
                            disabled={setDefault.isPending}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-amber-500 transition-colors"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm("Remove this card?")) deleteCard.mutate(card.id); }}
                          disabled={deleteCard.isPending}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "cashout" && (
            <motion.div key="cashout" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
              {/* Available to withdraw */}
              <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Available to Withdraw</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {walletLoading ? "..." : `$${balanceDollars.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Method selection */}
              <div>
                <h3 className="font-bold text-[13px] mb-2.5">Withdrawal Method</h3>
                <div className="space-y-2">
                  {CASHOUT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setCashoutMethod(id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left active:scale-[0.98] ${
                        cashoutMethod === id
                          ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                          : "border-border/40 bg-card"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        cashoutMethod === id ? "bg-emerald-500/15" : "bg-muted/60"
                      }`}>
                        <Icon className={`w-5 h-5 ${cashoutMethod === id ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[13px]">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        cashoutMethod === id ? "border-emerald-500" : "border-muted-foreground/30"
                      }`}>
                        {cashoutMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <h3 className="font-bold text-[13px] mb-2.5">Amount</h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {QUICK_AMOUNTS.filter(a => a <= balanceDollars).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashoutAmount(String(amt))}
                      className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${
                        cashoutAmount === String(amt)
                          ? "bg-emerald-500 text-white"
                          : "bg-muted/50 text-foreground border border-border/40"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                  {balanceDollars >= 5 && (
                    <button
                      onClick={() => setCashoutAmount(balanceDollars.toFixed(2))}
                      className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${
                        cashoutAmount === balanceDollars.toFixed(2)
                          ? "bg-emerald-500 text-white"
                          : "bg-muted/50 text-foreground border border-border/40"
                      }`}
                    >
                      All (${balanceDollars.toFixed(2)})
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Enter custom amount"
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  className="rounded-xl h-11"
                  min="5"
                  max={balanceDollars}
                />
                {Number(cashoutAmount) > 0 && Number(cashoutAmount) < 5 && (
                  <p className="text-[11px] text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Minimum withdrawal is $5.00
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <h3 className="font-bold text-[13px] mb-2.5">Note (optional)</h3>
                <Input
                  placeholder="Account number, reference, etc."
                  value={cashoutNote}
                  onChange={(e) => setCashoutNote(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              {/* Submit */}
              <Button
                className="w-full h-12 rounded-2xl font-bold text-[15px] gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={
                  cashoutSubmitting ||
                  !cashoutAmount ||
                  Number(cashoutAmount) < 5 ||
                  Number(cashoutAmount) > balanceDollars
                }
                onClick={async () => {
                  if (!user) { toast.error("Please sign in"); return; }
                  setCashoutSubmitting(true);
                  try {
                    const amountCents = Math.round(Number(cashoutAmount) * 100);
                    const { data, error } = await supabase.functions.invoke("process-withdrawal", {
                      body: {
                        amount_cents: amountCents,
                        method: cashoutMethod,
                        note: cashoutNote || undefined,
                      },
                    });
                    if (error) throw new Error(error.message || "Withdrawal failed");
                    if (data?.error) throw new Error(data.error);

                    toast.success(`Withdrawal of $${Number(cashoutAmount).toFixed(2)} submitted!`, {
                      description: "Processing usually takes 1-3 business days.",
                    });
                    setCashoutAmount("");
                    setCashoutNote("");
                    queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
                    queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
                    queryClient.invalidateQueries({ queryKey: ["wallet-summary"] });
                  } catch (err: any) {
                    toast.error(err?.message || "Withdrawal failed");
                  } finally {
                    setCashoutSubmitting(false);
                  }
                }}
              >
                <Send className="w-4.5 h-4.5" />
                {cashoutSubmitting ? "Processing..." : `Withdraw $${Number(cashoutAmount || 0).toFixed(2)}`}
              </Button>

              {/* Info */}
              <div className="text-[11px] text-muted-foreground/60 space-y-0.5">
                <p>• Minimum withdrawal: $5.00</p>
                <p>• Processing time: 1-3 business days</p>
                <p>• Bank Transfer available worldwide</p>
                <p>• ABA / KHQR for Cambodia accounts</p>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
              <h2 className="font-bold text-[15px]">Recent Transactions</h2>
              {txLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : walletTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-sm">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your payment history appears here</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {walletTransactions.map((tx, i) => {
                    const isCredit = tx.transaction_type !== "payment";
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-xl bg-card border border-border/30 p-3.5 flex items-center gap-3"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit ? "bg-emerald-500/10" : "bg-muted/60"
                        }`}>
                          {isCredit
                            ? <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
                            : <Wallet className="w-4.5 h-4.5 text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[13px] truncate">
                            {tx.description || tx.service_type}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <p className={`font-bold text-sm tabular-nums ${isCredit ? "text-emerald-500" : "text-foreground"}`}>
                          {isCredit ? "+" : "−"}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "credits" && (
            <motion.div key="credits" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
              {/* Credits summary */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">${earnedCredits.toFixed(0)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Available</p>
                </div>
                <div className="flex-1 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{points.points_balance.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Points</p>
                </div>
              </div>

              <h2 className="font-bold text-[15px]">Credit History</h2>
              {creditsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-14 bg-muted/30 rounded-2xl animate-pulse" />)}
                </div>
              ) : walletCredits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-sm">No credits yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Earn credits from referrals & promos</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {walletCredits.map((credit) => (
                    <div key={credit.id} className="rounded-xl bg-card border border-border/30 p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Gift className="w-4.5 h-4.5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px]">{credit.source_description || credit.credit_type}</p>
                        {credit.expires_at && (
                          <p className="text-[11px] text-amber-600 mt-0.5">
                            Expires {format(new Date(credit.expires_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-sm text-emerald-500">+${Number(credit.amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Earn more */}
              <div className="space-y-2">
                <h3 className="font-bold text-[13px] text-muted-foreground">Earn More</h3>
                {[
                  { label: "Refer Friends", desc: "Earn when they book", icon: Users, path: "/account/referrals" },
                  { label: "Achievements", desc: "Milestones & rewards", icon: Trophy, path: "/account/rewards" },
                  { label: "Gift Cards", desc: "Buy, send, or redeem", icon: Gift, path: "/account/gift-cards" },
                ].map(({ label, desc, icon: Icon, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/30 hover:border-primary/20 transition-colors text-left active:scale-[0.98]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[13px]">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Footer */}
        <div className="text-[11px] text-muted-foreground/50 space-y-0.5 pt-2">
          <p>• Credits auto-applied at checkout</p>
          <p>• Cards secured by Stripe</p>
        </div>
      </div>
    </div>
  );
}
