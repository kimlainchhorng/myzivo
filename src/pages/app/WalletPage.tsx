/**
  * ZIVO Wallet Page — Responsive
 * Unified payment methods, transactions, and credits
  *
  * Mobile: Premium "Secure Vault" visual experience
  * Desktop: Functional wallet management
 */

import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, CreditCard, Plus, Trash2, Star,
  ArrowDownLeft, ArrowUpRight, Gift, Clock, Loader2,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  usePaymentMethods,
  useWalletTransactions,
  useWalletCredits,
  useWalletSummary,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
  getServiceMeta,
  type PaymentMethod,
} from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load mobile premium component
// MobileWalletPremium removed

function PaymentMethodCard({ method, onSetDefault, onDelete }: {
  method: PaymentMethod;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const brandIcon: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
  };

  return (
    <Card className={method.is_default ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{brandIcon[method.brand || ""] || "💳"}</div>
            <div>
              <p className="font-medium flex items-center gap-2">
                {method.brand?.toUpperCase() || "Card"} •••• {method.last_four}
                {method.is_default && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {method.exp_month}/{method.exp_year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!method.is_default && (
              <Button variant="ghost" size="icon" onClick={onSetDefault}>
                <Star className="w-4 h-4" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the card ending in {method.last_four} from your wallet.
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
  const [serviceFilter, setServiceFilter] = useState<string | undefined>();
  const isMobile = useIsMobile();
  
  const { data: paymentMethods, isLoading: loadingMethods } = usePaymentMethods();
  const { data: transactions, isLoading: loadingTx } = useWalletTransactions(serviceFilter);
  const { data: credits } = useWalletCredits();
  const { data: summary } = useWalletSummary();
  
  const setDefault = useSetDefaultPaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const services = ["flights", "cars", "p2p_cars", "rides", "eats", "move", "hotels"];

  // Mobile: Premium visual experience
  if (isMobile) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <div />
      </Suspense>
    );
  }

  // Desktop: Functional wallet management
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">ZIVO Wallet</h1>
              <p className="text-sm text-muted-foreground">
                Manage payments & credits
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-10 h-10" />
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Credits Available
              </Badge>
            </div>
            <p className="text-sm opacity-90">Available Balance</p>
            <p className="text-4xl font-bold">
              ${summary?.availableCredits?.toFixed(2) || "0.00"}
            </p>
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs opacity-75">Total Spent</p>
                <p className="font-semibold">${summary?.totalSpent?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Transactions</p>
                <p className="font-semibold">{summary?.transactionCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="methods">Cards</TabsTrigger>
            <TabsTrigger value="transactions">History</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
          </TabsList>

          {/* Payment Methods */}
          <TabsContent value="methods" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Payment Methods</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </div>

            {loadingMethods ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSetDefault={() => setDefault.mutate(method.id)}
                    onDelete={() => deleteMethod.mutate(method.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No payment methods</p>
                  <p className="text-sm text-muted-foreground">
                    Add a card to enable one-click checkout
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Transaction History</h3>
              <div className="flex gap-1 overflow-x-auto">
                <Button 
                  size="sm" 
                  variant={!serviceFilter ? "default" : "outline"}
                  onClick={() => setServiceFilter(undefined)}
                >
                  All
                </Button>
                {services.slice(0, 3).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={serviceFilter === s ? "default" : "outline"}
                    onClick={() => setServiceFilter(s)}
                  >
                    {getServiceMeta(s).icon}
                  </Button>
                ))}
              </div>
            </div>

            {loadingTx ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const meta = getServiceMeta(tx.service_type);
                  const isCredit = tx.transaction_type === "refund" || tx.transaction_type === "credit";
                  
                  return (
                    <Card key={tx.id}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCredit ? "bg-emerald-100" : "bg-muted"
                        }`}>
                          {isCredit 
                            ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                            : <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {tx.description || meta.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isCredit ? "text-emerald-600" : ""}`}>
                            {isCredit ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Credits */}
          <TabsContent value="credits" className="space-y-4 mt-4">
            <h3 className="font-semibold">Available Credits</h3>
            
            {credits && credits.length > 0 ? (
              <div className="space-y-2">
                {credits.map((credit) => (
                  <Card key={credit.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">${credit.amount.toFixed(2)} Credit</p>
                        <p className="text-sm text-muted-foreground">
                          {credit.source_description || credit.credit_type}
                        </p>
                        {credit.expires_at && (
                          <p className="text-xs text-amber-600">
                            Expires {format(new Date(credit.expires_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No credits available</p>
                  <p className="text-sm text-muted-foreground">
                    Credits from refunds and promotions appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
}
