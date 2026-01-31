import { Crown, Star, Gift, Zap, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const tiers = [
  { name: "Silver", points: 0, color: "from-gray-400 to-gray-500", benefits: ["5% off bookings", "Free WiFi", "Late checkout"] },
  { name: "Gold", points: 10000, color: "from-yellow-400 to-amber-500", benefits: ["10% off bookings", "Room upgrades", "Free breakfast"] },
  { name: "Platinum", points: 25000, color: "from-purple-400 to-purple-600", benefits: ["15% off bookings", "Suite upgrades", "Airport transfers"] },
  { name: "Diamond", points: 50000, color: "from-cyan-400 to-blue-500", benefits: ["20% off bookings", "VIP concierge", "Exclusive access"] },
];

const HotelLoyaltyProgram = () => {
  const currentPoints = 12500;
  const currentTier = tiers[1];
  const nextTier = tiers[2];
  const progress = ((currentPoints - currentTier.points) / (nextTier.points - currentTier.points)) * 100;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" /> ZIVO Rewards
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Earn Points on Every Stay
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our loyalty program and unlock exclusive benefits, room upgrades, and savings
          </p>
        </div>

        {/* Current Status Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentTier.color} flex items-center justify-center`}>
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm text-muted-foreground">Your Status</p>
              <h3 className="text-2xl font-bold">{currentTier.name} Member</h3>
              <p className="text-primary font-semibold">{currentPoints.toLocaleString()} points</p>
            </div>
            <div className="w-full md:w-64">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Next: {nextTier.name}</span>
                <span className="text-primary">{nextTier.points - currentPoints} pts to go</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative p-4 rounded-xl border ${
                tier.name === currentTier.name
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-card/30"
              }`}
            >
              {tier.name === currentTier.name && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-xs">
                  Current
                </Badge>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-3`}>
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-center mb-1">{tier.name}</h4>
              <p className="text-xs text-muted-foreground text-center mb-3">
                {tier.points.toLocaleString()}+ pts
              </p>
              <ul className="space-y-1">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold">
            <Gift className="w-4 h-4 mr-2" />
            Join ZIVO Rewards Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotelLoyaltyProgram;
