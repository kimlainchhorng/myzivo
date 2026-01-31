import { Crown, Car, Gift, Fuel, Shield, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const rewards = [
  { icon: Fuel, title: "Free Fuel Top-up", points: 300, available: true },
  { icon: Car, title: "Vehicle Upgrade", points: 500, available: true },
  { icon: Shield, title: "Premium Insurance", points: 750, available: true },
  { icon: Zap, title: "Express Pickup", points: 200, available: true },
];

const CarLoyaltyRewards = () => {
  const currentPoints = 850;
  const rentals = 12;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-card/50 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
              <div>
                <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Crown className="w-3 h-3 mr-1" /> Driver Rewards
                </Badge>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Your Rental Rewards
                </h2>
                <p className="text-muted-foreground">
                  Earn points with every rental and unlock exclusive perks
                </p>
              </div>

              <div className="flex gap-4">
                <div className="p-4 bg-card/60 backdrop-blur-xl rounded-xl border border-emerald-500/20 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-emerald-400">{currentPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="p-4 bg-card/60 backdrop-blur-xl rounded-xl border border-border/30 text-center min-w-[120px]">
                  <p className="text-3xl font-bold">{rentals}</p>
                  <p className="text-xs text-muted-foreground">Rentals</p>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="mb-10 p-6 bg-card/40 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Progress to Gold Status</span>
                <span className="text-sm text-emerald-400">8/15 rentals</span>
              </div>
              <Progress value={53} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete 7 more rentals to unlock Gold status with 2x points earning
              </p>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {rewards.map((reward) => (
                <div
                  key={reward.title}
                  className={`p-4 rounded-xl border transition-all ${
                    currentPoints >= reward.points
                      ? "bg-card/60 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-card/30 border-border/30 opacity-60"
                  }`}
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
                    <reward.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-bold mb-1">{reward.title}</h4>
                  <p className="text-sm text-emerald-400 mb-3">{reward.points} points</p>
                  <Button
                    size="sm"
                    className="w-full"
                    variant={currentPoints >= reward.points ? "default" : "outline"}
                    disabled={currentPoints < reward.points}
                  >
                    {currentPoints >= reward.points ? "Redeem" : `Need ${reward.points - currentPoints}`}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg">
                View History <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <Gift className="w-4 h-4 mr-2" />
                All Rewards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarLoyaltyRewards;
