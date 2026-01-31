import { Crown, Star, Gift, Bed, Coffee, Sparkles, ArrowRight, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const rewards = [
  { icon: Coffee, title: "Free Breakfast", points: 500, available: true },
  { icon: Bed, title: "Room Upgrade", points: 1000, available: true },
  { icon: Star, title: "Late Checkout", points: 750, available: true },
  { icon: Gift, title: "Spa Credit $50", points: 1500, available: false },
];

const HotelLoyaltyRewards = () => {
  const currentPoints = 1250;
  const tierProgress = 65;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card/50 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
              <div>
                <Badge className="mb-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Crown className="w-3 h-3 mr-1" /> ZIVO Rewards
                </Badge>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Your Rewards Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Earn points with every stay and unlock exclusive perks
                </p>
              </div>

              <div className="p-6 bg-card/60 backdrop-blur-xl rounded-2xl border border-amber-500/20 min-w-[200px]">
                <p className="text-sm text-muted-foreground mb-1">Points Balance</p>
                <p className="text-4xl font-bold text-amber-400">{currentPoints.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span>+250 this month</span>
                </div>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="mb-10 p-6 bg-card/40 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Silver Member</p>
                    <p className="text-xs text-muted-foreground">5 nights until Gold</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center opacity-50">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-muted-foreground">Gold Member</p>
                    <p className="text-xs text-muted-foreground">Next tier</p>
                  </div>
                </div>
              </div>
              <Progress value={tierProgress} className="h-3" />
            </div>

            {/* Available Rewards */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Redeem Your Points</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.title}
                    className={`p-4 rounded-xl border transition-all ${
                      reward.available && currentPoints >= reward.points
                        ? "bg-card/60 border-amber-500/30 hover:border-amber-500/50"
                        : "bg-card/30 border-border/30 opacity-60"
                    }`}
                  >
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
                      <reward.icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="font-bold mb-1">{reward.title}</h4>
                    <p className="text-sm text-amber-400 mb-3">{reward.points} points</p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={reward.available && currentPoints >= reward.points ? "default" : "outline"}
                      disabled={!reward.available || currentPoints < reward.points}
                    >
                      {currentPoints >= reward.points ? "Redeem" : `Need ${reward.points - currentPoints}`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg">
                View All Rewards <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelLoyaltyRewards;
