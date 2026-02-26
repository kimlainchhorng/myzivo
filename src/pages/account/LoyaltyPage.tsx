/**
 * CUSTOMER LOYALTY PAGE
 * Shows points balance, history, available rewards, and redemptions
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Gift,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronRight,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import {
  usePointsHistory,
  useAvailableRewards,
  useRedeemReward,
  useUserRedemptions,
} from "@/hooks/useLoyalty";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import {
  PointsBalanceCard,
  TierProgressCard,
  ReferralCard,
  TierComparisonTable,
} from "@/components/loyalty";
import { POINTS_COMPLIANCE, type ZivoTier } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

export default function LoyaltyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { points, isLoading: pointsLoading } = useLoyaltyPoints();
  const { data: history = [], isLoading: historyLoading } = usePointsHistory();
  const { data: rewards = [], isLoading: rewardsLoading } = useAvailableRewards();
  const { data: redemptions = [] } = useUserRedemptions();
  const redeemMutation = useRedeemReward();
  const [activeTab, setActiveTab] = useState("overview");

  // Map old tier to new
  const mapTier = (oldTier: string): ZivoTier => {
    if (oldTier === "gold" || oldTier === "silver") return "elite";
    if (oldTier === "bronze") return "traveler";
    return "explorer";
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/account/loyalty" replace />;
  }

  const isLoading = authLoading || pointsLoading;

  const handleRedeem = (rewardId: string) => {
    redeemMutation.mutate(rewardId);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Points | Earn & Redeem Rewards"
        description="Track your ZIVO Points balance, view earning history, and redeem rewards."
        canonical="https://hizivo.com/account/loyalty"
      />

      <Header />

      <main className="pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 max-w-4xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" asChild aria-label="Go back">
              <Link to="/account">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                ZIVO Points
              </h1>
              <p className="text-muted-foreground text-sm">
                Earn rewards on every order
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Balance Card */}
              <PointsBalanceCard className="mb-6" />

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview" className="gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="levels" className="gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">Levels</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">History</span>
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="gap-1.5">
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">Rewards</span>
                  </TabsTrigger>
                  <TabsTrigger value="refer" className="gap-1.5">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Refer</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <TierProgressCard />

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("history")}
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {historyLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No activity yet. Complete an order to start earning!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {history.slice(0, 5).map((entry) => (
                            <HistoryItem key={entry.id} entry={entry} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pending Redemptions */}
                  {redemptions.filter((r) => r.status === "pending").length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pending Rewards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {redemptions
                            .filter((r) => r.status === "pending")
                            .map((r) => (
                              <div
                                key={r.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20"
                              >
                                <div>
                                  <p className="font-medium">{r.reward?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Expires {format(new Date(r.expiresAt!), "MMM d, yyyy")}
                                  </p>
                                </div>
                                <Badge variant="secondary">Ready to use</Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Levels Tab */}
                <TabsContent value="levels">
                  <TierComparisonTable currentTier={mapTier(points.tier)} />
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Points History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {historyLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">
                          No points history yet. Complete an order to start earning!
                        </p>
                      ) : (
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-3 pr-4">
                            {history.map((entry) => (
                              <HistoryItem key={entry.id} entry={entry} />
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Rewards Tab */}
                <TabsContent value="rewards">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rewardsLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : rewards.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">
                          No rewards available right now. Check back soon!
                        </p>
                      ) : (
                        <div className="grid gap-4">
                          {rewards.map((reward) => {
                            const canAfford = points.points_balance >= reward.pointsRequired;
                            return (
                              <div
                                key={reward.id}
                                className={cn(
                                  "p-4 rounded-xl border transition-all",
                                  canAfford
                                    ? "bg-gradient-to-r from-primary/5 to-amber-500/5 border-primary/20 hover:border-primary/40"
                                    : "bg-muted/30 border-border opacity-60"
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Gift className="w-4 h-4 text-primary" />
                                      <h4 className="font-semibold">{reward.name}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {reward.description}
                                    </p>
                                    <Badge variant="outline">
                                      {reward.pointsRequired.toLocaleString()} pts
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    disabled={!canAfford || redeemMutation.isPending}
                                    onClick={() => handleRedeem(reward.id)}
                                  >
                                    {redeemMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : canAfford ? (
                                      "Redeem"
                                    ) : (
                                      "Need more pts"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Refer Tab */}
                <TabsContent value="refer">
                  <ReferralCard
                    referralCode={user?.id?.slice(0, 8).toUpperCase() || "ZIVO-NEW"}
                    referralCount={0}
                  />
                </TabsContent>
              </Tabs>

              {/* Compliance Disclaimer */}
              <p className="text-[10px] text-muted-foreground text-center mt-8">
                {POINTS_COMPLIANCE.footerNote}
              </p>
            </>
          )}
        </motion.div>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

// History Item Component
function HistoryItem({
  entry,
}: {
  entry: {
    id: string;
    pointsAmount: number;
    transactionType: string;
    description: string | null;
    createdAt: string;
  };
}) {
  const isPositive = entry.pointsAmount > 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isPositive ? "bg-emerald-500/10" : "bg-rose-500/10"
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">
            {entry.description || entry.transactionType}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "font-semibold",
          isPositive ? "text-emerald-500" : "text-rose-500"
        )}
      >
        {isPositive ? "+" : ""}
        {entry.pointsAmount.toLocaleString()}
      </span>
    </div>
  );
}
