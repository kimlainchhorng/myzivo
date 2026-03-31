/**
 * ZIVO Wallet — Unified payments & credits hub
 * All sections powered by real Supabase/Stripe data
 */
import { useState } from "react";
import {
  ArrowLeft, Wallet, CreditCard, Star, Trash2, Plus, Shield,
  BarChart3, Users, Tag, Gift, Trophy, ExternalLink, TrendingUp,
  Clock, DollarSign, Target, Lightbulb, Sparkles, PiggyBank
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCustomerWallet } from "@/hooks/useCustomerWallet";
import { useStripePaymentMethods, useDeleteStripeCard, useSetDefaultStripeCard } from "@/hooks/useStripePaymentMethods";
import { useWalletTransactions, useWalletCredits, useWalletSummary } from "@/hooks/useZivoWallet";
import { useWalletBudgets, useUpsertBudget } from "@/hooks/useWalletBudgets";
import { useSavingsGoals, useCreateSavingsGoal, useDeleteSavingsGoal } from "@/hooks/useSavingsGoals";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import AddCardForm from "@/components/wallet/AddCardForm";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

function brandLabel(brand: string) {
  const map: Record<string, string> = {
    visa: "VISA", mastercard: "MC", amex: "AMEX", discover: "Discover",
  };
  return map[brand?.toLowerCase()] || brand?.toUpperCase() || "CARD";
}

const BUDGET_CATEGORIES = [
  { key: "flights", label: "Flights", color: "bg-blue-500" },
  { key: "hotels", label: "Hotels", color: "bg-amber-500" },
  { key: "rides", label: "Rides", color: "bg-emerald-500" },
  { key: "food", label: "Food", color: "bg-orange-500" },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalEmoji, setNewGoalEmoji] = useState("🏖️");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  // Real data hooks
  const { balanceDollars, lifetimeEarnedDollars, isLoading: walletLoading } = useCustomerWallet();
  const { data: stripeCards = [], isLoading: cardsLoading } = useStripePaymentMethods();
  const deleteCard = useDeleteStripeCard();
  const setDefault = useSetDefaultStripeCard();
  const { data: walletTransactions = [], isLoading: txLoading } = useWalletTransactions();
  const { data: walletCredits = [], isLoading: creditsLoading } = useWalletCredits();
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: budgets = [], isLoading: budgetsLoading } = useWalletBudgets();
  const upsertBudget = useUpsertBudget();
  const { data: savingsGoals = [], isLoading: goalsLoading } = useSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();
  const { points, isLoading: pointsLoading, getNextTierProgress } = useLoyaltyPoints();

  const totalSpent = summary?.totalSpent ?? 0;
  const txCount = summary?.transactionCount ?? 0;
  const spentByService = summary?.spentByService ?? {};

  // Build budget data from real sources
  const budgetMap = budgets.reduce((acc, b) => {
    acc[b.category] = b.budget_amount;
    return acc;
  }, {} as Record<string, number>);

  // Cashback from wallet credits, pending from unused credits with expiry
  const earnedCredits = walletCredits
    .filter((c) => !c.expires_at || new Date(c.expires_at) > new Date())
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingCredits = walletCredits
    .filter((c) => c.credit_type === "pending" || c.credit_type === "cashback")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // Dynamic tips based on real data
  const tierProgress = getNextTierProgress();

  const tips: { icon: React.ReactNode; text: string }[] = [];
  const expiringCredit = walletCredits.find(
    (c) => c.expires_at && new Date(c.expires_at) > new Date() &&
      new Date(c.expires_at).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
  );
  if (expiringCredit) {
    const expDate = new Date(expiringCredit.expires_at!);
    tips.push({
      icon: <span>💡</span>,
      text: `Use your $${Number(expiringCredit.amount).toFixed(0)} cashback before it expires on ${expDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    });
  }
  if (tierProgress.pointsNeeded > 0) {
    tips.push({
      icon: <span>🔥</span>,
      text: `You're ${tierProgress.pointsNeeded.toLocaleString()} pts away from ${tierProgress.nextTier} tier (2x points)`,
    });
  }
  if (stripeCards.length === 0) {
    tips.push({
      icon: <span>💳</span>,
      text: `Add a payment method for faster checkouts`,
    });
  }
  if (tips.length === 0) {
    tips.push({ icon: <span>✨</span>, text: "Book with ZIVO to earn cashback and loyalty points" });
  }

  const handleCreateGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    createGoal.mutate(
      { name: newGoalName, emoji: newGoalEmoji, target_amount: Number(newGoalTarget) },
      {
        onSuccess: () => {
          setShowAddGoal(false);
          setNewGoalName("");
          setNewGoalEmoji("🏖️");
          setNewGoalTarget("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEOHead title="ZIVO Wallet" description="Payments & credits" />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">ZIVO Wallet</h1>
            <p className="text-xs text-muted-foreground">Payments & credits</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1">
              <Shield className="w-3 h-3" /> Secure
            </Badge>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-white/80">Available Balance</p>
          <p className="text-4xl font-bold mt-1">
            {walletLoading ? "..." : `$${balanceDollars.toFixed(2)}`}
          </p>
          <div className="flex gap-8 mt-6 pt-4 border-t border-white/20">
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">6-month total</p>
              <p className="font-bold text-lg">{summaryLoading ? "..." : `$${totalSpent.toFixed(0).toLocaleString()}`}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Transactions</p>
              <p className="font-bold text-lg">{summaryLoading ? "..." : txCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs: Cards / History / Credits */}
        <Tabs defaultValue="cards">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
          </TabsList>

          {/* CARDS TAB */}
          <TabsContent value="cards" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Payment Methods</h2>
              <Button size="sm" className="rounded-xl gap-1 font-bold" onClick={() => setShowAddCard(true)}>
                <Plus className="w-4 h-4" /> Add Card
              </Button>
            </div>

            {showAddCard && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <AddCardForm onClose={() => setShowAddCard(false)} />
              </motion.div>
            )}

            {cardsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stripeCards.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No payment methods</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Add a card to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stripeCards.map((card) => (
                  <div key={card.id} className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {brandLabel(card.brand)} •••• {card.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires {card.exp_month}/{card.exp_year}
                      </p>
                    </div>
                    <button
                      onClick={() => setDefault.mutate(card.id)}
                      disabled={card.is_default || setDefault.isPending}
                      className={`p-2 rounded-lg transition-colors ${card.is_default ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500"}`}
                    >
                      <Star className="w-4 h-4" fill={card.is_default ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => { if (confirm("Remove this card?")) deleteCard.mutate(card.id); }}
                      disabled={deleteCard.isPending}
                      className="p-2 rounded-lg text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="mt-4 space-y-4">
            <h2 className="font-bold">Transaction History</h2>
            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : walletTransactions.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                <Wallet className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {walletTransactions.map((tx) => {
                  const isCredit = tx.transaction_type !== "payment";
                  return (
                    <div key={tx.id} className="bg-card border border-border/50 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isCredit ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"}`}>
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description || tx.service_type}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold text-sm ${isCredit ? "text-emerald-500" : "text-destructive"}`}>
                        {isCredit ? "+" : "-"}${Math.abs(Number(tx.amount)).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* CREDITS TAB */}
          <TabsContent value="credits" className="mt-4 space-y-4">
            <h2 className="font-bold">Available Credits</h2>
            {creditsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : walletCredits.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No credits yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Earn credits from referrals, promos & rewards</p>
              </div>
            ) : (
              <div className="space-y-2">
                {walletCredits.map((credit) => (
                  <div key={credit.id} className="bg-card border border-border/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{credit.source_description || credit.credit_type}</p>
                        {credit.expires_at && (
                          <p className="text-[11px] text-muted-foreground">
                            Expires {formatDistanceToNow(new Date(credit.expires_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-sm text-emerald-500">
                      ${Number(credit.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Earn more CTA */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Earn More Credits</h3>
              {[
                { label: "Refer Friends", desc: "Earn when they book", icon: Users, path: "/account/referrals" },
                { label: "Rewards", desc: "Milestones & achievements", icon: Trophy, path: "/account/rewards" },
                { label: "Gift Cards", desc: "Buy, send, or redeem", icon: Gift, path: "/account/gift-cards" },
              ].map(({ label, desc, icon: Icon, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── BUDGET TRACKER ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-bold mb-4">Budget Tracker</h3>
            {budgetsLoading || summaryLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {BUDGET_CATEGORIES.map(({ key, label, color }) => {
                  const spent = Number(spentByService[key] ?? 0);
                  const budget = Number(budgetMap[key] ?? 0);
                  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          ${spent.toFixed(0)} / ${budget > 0 ? `$${budget.toFixed(0)}` : "—"}
                        </span>
                      </div>
                      {budget > 0 ? (
                        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const val = prompt(`Set monthly ${label} budget ($):`);
                            if (val && !isNaN(Number(val))) {
                              upsertBudget.mutate({ category: key, budget_amount: Number(val) });
                            }
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          + Set budget
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── CASHBACK & REWARDS ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold">Cashback & Rewards</h3>
            </div>
            {creditsLoading || pointsLoading ? (
              <div className="h-16 bg-muted/30 rounded-xl animate-pulse" />
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${earnedCredits.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${pendingCredits.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">
                    {points.points_balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Points</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── SAVINGS GOALS ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Savings Goals</h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs gap-1"
                onClick={() => setShowAddGoal(!showAddGoal)}
              >
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>

            {showAddGoal && (
              <div className="bg-muted/30 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={newGoalEmoji}
                    onChange={(e) => setNewGoalEmoji(e.target.value)}
                    className="w-12 text-center bg-background border border-border rounded-lg p-1.5 text-lg"
                    maxLength={2}
                  />
                  <input
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="Goal name"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    placeholder="Target amount ($)"
                    type="number"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                  />
                  <Button size="sm" onClick={handleCreateGoal} disabled={createGoal.isPending}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {goalsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />)}
              </div>
            ) : savingsGoals.length === 0 ? (
              <div className="text-center py-4">
                <PiggyBank className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No savings goals yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create a goal to start saving</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savingsGoals.map((goal) => {
                  const pct = goal.target_amount > 0 ? Math.min((goal.saved_amount / goal.target_amount) * 100, 100) : 0;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{goal.emoji}</span>
                          <span className="font-medium text-sm">{goal.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ${goal.saved_amount.toFixed(0)}/${goal.target_amount.toFixed(0)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── MONEY-SAVING TIPS ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold">Money-Saving Tips</h3>
            </div>
            <div className="space-y-2.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 shrink-0">{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground/60 space-y-1">
          <p>• Credits are automatically applied at checkout</p>
          <p>• Cards are securely stored by Stripe</p>
          <p>• Credits have no cash value</p>
        </div>
      </div>
    </div>
  );
}
