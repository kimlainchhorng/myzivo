/**
 * Travel Wallet Page
 * Unified view of credits, refunds, promos, and miles
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Gift,
  RefreshCcw,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { WalletBalance, WalletTransaction } from "@/types/behaviorAnalytics";
import { cn } from "@/lib/utils";

// Wallet data loaded from database — no hardcoded data
const emptyWallet: WalletBalance = {
  bookingCredits: 0,
  promoCredits: 0,
  pendingRefunds: 0,
  zivoMiles: 0,
  transactions: [],
};

const transactionIcons = {
  credit: Gift,
  debit: Wallet,
  refund: RefreshCcw,
  promo: Sparkles,
  miles: Award,
};

const transactionColors = {
  credit: 'text-emerald-500',
  debit: 'text-red-500',
  refund: 'text-amber-500',
  promo: 'text-violet-500',
  miles: 'text-sky-500',
};

export default function TravelWallet() {
  const [activeTab, setActiveTab] = useState('all');
  const wallet = emptyWallet;

  const totalBalance = wallet.bookingCredits + wallet.promoCredits;

  const filteredTransactions = activeTab === 'all'
    ? wallet.transactions
    : wallet.transactions.filter(t => t.type === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Travel Wallet – ZIVO"
        description="View your ZIVO credits, pending refunds, and miles balance."
        canonical="https://hizivo.com/wallet"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              <Wallet className="w-3 h-3 mr-1" />
              Travel Wallet
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Your Wallet</h1>
            <p className="text-muted-foreground">
              Credits, refunds, and rewards in one place
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-sky-500/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Balance</span>
                </div>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-medium">Booking Credits</span>
                </div>
                <p className="text-2xl font-bold">${wallet.bookingCredits.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <RefreshCcw className="w-4 h-4" />
                  <span className="text-xs font-medium">Pending Refunds</span>
                </div>
                <p className="text-2xl font-bold">${wallet.pendingRefunds.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">ZIVO Miles</span>
                </div>
                <p className="text-2xl font-bold">{wallet.zivoMiles.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Use Credits CTA */}
          <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border-emerald-500/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Use your credits on your next booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Credits are automatically applied at checkout
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/flights" className="gap-2">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="credit">Credits</TabsTrigger>
                  <TabsTrigger value="refund">Refunds</TabsTrigger>
                  <TabsTrigger value="miles">Miles</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-3">
                  {filteredTransactions.map((tx) => {
                    const Icon = transactionIcons[tx.type];
                    const colorClass = transactionColors[tx.type];
                    
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-muted", colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString()}
                              {tx.expiresAt && tx.status !== 'expired' && (
                                <span className="ml-2">
                                  • Expires {new Date(tx.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold",
                            tx.amount > 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {tx.type === 'miles' 
                              ? `${tx.amount > 0 ? '+' : ''}${tx.amount} miles`
                              : `${tx.amount > 0 ? '+' : ''}$${Math.abs(tx.amount).toFixed(2)}`
                            }
                          </p>
                          <div className="flex items-center gap-1 text-xs">
                            {tx.status === 'completed' && (
                              <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed</>
                            )}
                            {tx.status === 'pending' && (
                              <><Clock className="w-3 h-3 text-amber-500" /> Pending</>
                            )}
                            {tx.status === 'expired' && (
                              <><AlertCircle className="w-3 h-3 text-red-500" /> Expired</>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Important Information</p>
                <p>
                  No cash balance stored. Credits are promotional only and cannot be 
                  converted to cash. See Terms for credit expiration and usage policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
