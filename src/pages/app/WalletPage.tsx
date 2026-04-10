/**
 * ZIVO Wallet Page — Premium 2026
 * Unified payment methods, transactions, and credits
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, CreditCard, Plus, Trash2, Star,
  ArrowDownLeft, ArrowUpRight, Gift, Clock, Loader2,
  Wallet, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useWalletTransactions,
  useWalletCredits,
  useWalletSummary,
  getServiceMeta,
} from "@/hooks/useZivoWallet";
import {
  useStripePaymentMethods,
  useSetDefaultStripeCard,
  useDeleteStripeCard,
  type StripeCard,
} from "@/hooks/useStripePaymentMethods";
import AddCardForm from "@/components/wallet/AddCardForm";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";

function StripeCardItem({ card, onSetDefault, onDelete }: {
  card: StripeCard;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={`border-border/40 transition-all duration-200 ${card.is_default ? "border-primary/30 shadow-sm shadow-primary/5" : "hover:border-primary/15"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm flex items-center gap-2">
                {card.brand?.toUpperCase() || "Card"} •••• {card.last4}
                {card.is_default && (
                  <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary bg-primary/5">Default</Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires {card.exp_month}/{card.exp_year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!card.is_default && (
              <Button variant="ghost" size="icon" onClick={onSetDefault} className="rounded-xl">
                <Star className="w-4 h-4" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the card ending in {card.last4} from your wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default function WalletPage() {
  const [activeSection, setActiveSection] = useState<"cards" | "history" | "credits">("cards");
  const [showAddCard, setShowAddCard] = useState(false);
  
  const { data: paymentMethods, isLoading: loadingMethods } = useStripePaymentMethods();
  const { data: transactions, isLoading: loadingTx } = useWalletTransactions();
  const { data: credits } = useWalletCredits();
  const { data: summary } = useWalletSummary();
  
  const setDefault = useSetDefaultStripeCard();
  const deleteMethod = useDeleteStripeCard();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-xl -ml-1">
              <Link to="/app">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">ZIVO Wallet</h1>
              <p className="text-xs text-muted-foreground">Payments & credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Balance Card - Ultra Premium */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-emerald-500 text-primary-foreground p-6 relative overflow-hidden shadow-xl shadow-primary/20"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8 blur-xl" />
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <Badge className="bg-white/20 text-primary-foreground border-0 font-bold text-[10px]">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          </div>
          <p className="text-xs opacity-80 font-medium relative z-10">Available Balance</p>
          <p className="text-4xl font-bold relative z-10 mb-4">
            ${summary?.availableCredits?.toFixed(2) || "0.00"}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15 relative z-10">
            <div>
              <p className="text-[10px] opacity-60 font-medium">Total Spent</p>
              <p className="font-bold text-lg">${summary?.totalSpent?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-60 font-medium">Transactions</p>
              <p className="font-bold text-lg">{summary?.transactionCount || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Section Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {(["cards", "history", "credits"] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 touch-manipulation capitalize ${
                activeSection === section
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {section === "cards" ? "Cards" : section === "history" ? "History" : "Credits"}
            </button>
          ))}
        </div>

        {/* Cards Section */}
        {activeSection === "cards" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Payment Methods</h3>
              {!showAddCard && (
                <Button size="sm" className="rounded-xl font-bold gap-1 shadow-sm" onClick={() => setShowAddCard(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Card
                </Button>
              )}
            </div>

            {showAddCard && (
              <AddCardForm onClose={() => setShowAddCard(false)} />
            )}

            {loadingMethods ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-2">
                {paymentMethods.map((card) => (
                  <StripeCardItem
                    key={card.id}
                    card={card}
                    onSetDefault={() => setDefault.mutate(card.id)}
                    onDelete={() => deleteMethod.mutate(card.id)}
                  />
                ))}
              </div>
            ) : !showAddCard ? (
              <Card className="border-border/30">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold text-sm">No payment methods</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a card for one-click checkout</p>
                </CardContent>
              </Card>
            ) : null}
          </motion.div>
        )}
        {/* History Section */}
        {activeSection === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {loadingTx ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx, i) => {
                  const meta = getServiceMeta(tx.service_type);
                  const isCredit = tx.transaction_type === "refund" || tx.transaction_type === "credit";
                  
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="border-border/30">
                        <CardContent className="p-3.5 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCredit ? "bg-emerald-500/10" : "bg-muted/50"
                          }`}>
                            {isCredit 
                              ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                              : <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">
                              {tx.description || meta.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(tx.created_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${isCredit ? "text-emerald-500" : ""}`}>
                              {isCredit ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <Badge variant="outline" className="text-[8px] font-bold border-border/40">
                              {tx.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-border/30">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">No transactions yet</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Credits Section */}
        {activeSection === "credits" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {credits && credits.length > 0 ? (
              <div className="space-y-2">
                {credits.map((credit, i) => (
                  <motion.div
                    key={credit.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="border-border/30 hover:border-emerald-500/15 transition-all">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">${credit.amount.toFixed(2)} Credit</p>
                          <p className="text-[11px] text-muted-foreground">
                            {credit.source_description || credit.credit_type}
                          </p>
                          {credit.expires_at && (
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                              Expires {format(new Date(credit.expires_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-border/30">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold text-sm">No credits available</p>
                  <p className="text-xs text-muted-foreground mt-1">Credits from refunds & promos appear here</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}



      </div>

      <MobileBottomNav />
    </div>
  );
}
