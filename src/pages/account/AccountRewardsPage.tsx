/**
 * Account Rewards Page — /account/rewards
 * Shows active rewards, history, and expired/used
 */
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Gift, Crown, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRewards, type UserReward } from "@/hooks/useUserRewards";
import { useAutoRewards } from "@/hooks/useAutoRewards";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

function getRewardIcon(type: string) {
  if (type.startsWith("tier_")) return <Crown className="w-5 h-5 text-primary" />;
  if (type.includes("orders")) return <Trophy className="w-5 h-5 text-primary" />;
  return <Gift className="w-5 h-5 text-primary" />;
}

function getRewardLabel(type: string): string {
  const labels: Record<string, string> = {
    "5_orders": "5 Orders Milestone",
    "10_orders": "10 Orders Milestone",
    "25_orders": "25 Orders Milestone",
    tier_traveler: "Traveler Tier Reward",
    tier_elite: "Elite Tier Reward",
  };
  return labels[type] || type;
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function RewardCard({ reward, variant }: { reward: UserReward; variant: "active" | "used" | "expired" }) {
  const days = daysUntil(reward.expires_at);
  const isActive = variant === "active";

  return (
    <Card className={`${!isActive ? "opacity-60" : ""} transition-all`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {getRewardIcon(reward.reward_type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{getRewardLabel(reward.reward_type)}</p>
          <p className="text-lg font-bold text-primary">${reward.reward_value} off</p>
          {isActive && days !== null && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Expires in {days} day{days !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div>
          {variant === "active" && (
            <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
          )}
          {variant === "used" && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" /> Used
            </Badge>
          )}
          {variant === "expired" && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <XCircle className="w-3 h-3" /> Expired
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountRewardsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { active, redeemed, expired, isLoading } = useUserRewards();

  // Trigger auto-award check
  useAutoRewards();

  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/account/rewards" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Rewards | ZIVO"
        description="View your earned rewards, coupons, and loyalty bonuses."
        canonical="https://hizivo.com/account/rewards"
      />
      <Header />

      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" />
                My Rewards
              </h1>
              <p className="text-muted-foreground text-sm">Earned coupons &amp; loyalty rewards</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">
                  Active ({active.length})
                </TabsTrigger>
                <TabsTrigger value="used">
                  Used ({redeemed.length})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({expired.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {active.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No active rewards yet</p>
                    <p className="text-sm mt-1">Keep ordering to earn milestones!</p>
                  </div>
                ) : (
                  active.map((r) => <RewardCard key={r.id} reward={r} variant="active" />)
                )}
              </TabsContent>

              <TabsContent value="used" className="space-y-3">
                {redeemed.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No redeemed rewards yet</p>
                  </div>
                ) : (
                  redeemed.map((r) => <RewardCard key={r.id} reward={r} variant="used" />)
                )}
              </TabsContent>

              <TabsContent value="expired" className="space-y-3">
                {expired.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No expired rewards</p>
                  </div>
                ) : (
                  expired.map((r) => <RewardCard key={r.id} reward={r} variant="expired" />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
