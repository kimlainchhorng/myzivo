import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Award, Star, Gift, TrendingUp, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  { name: "Silver", points: 0, multiplier: 1, color: "text-slate-400", perks: ["10% room discount", "Late checkout"] },
  { name: "Gold", points: 10000, multiplier: 1.5, color: "text-amber-400", perks: ["15% room discount", "Free breakfast", "Room upgrade"] },
  { name: "Platinum", points: 25000, multiplier: 2, color: "text-purple-400", perks: ["20% room discount", "Lounge access", "Suite upgrades"] },
  { name: "Diamond", points: 50000, multiplier: 3, color: "text-cyan-400", perks: ["25% room discount", "Personal concierge", "Free nights"] }
];

export default function HotelLoyaltyCalculator() {
  const [nights, setNights] = useState([5]);
  const [avgRate, setAvgRate] = useState([150]);
  const [currentPoints, setCurrentPoints] = useState(8500);

  const pointsPerDollar = 10;
  const earnedPoints = nights[0] * avgRate[0] * pointsPerDollar;
  const totalPoints = currentPoints + earnedPoints;

  const getCurrentTier = (points: number) => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points >= tiers[i].points) return tiers[i];
    }
    return tiers[0];
  };

  const getNextTier = (points: number) => {
    for (let i = 0; i < tiers.length; i++) {
      if (points < tiers[i].points) return tiers[i];
    }
    return null;
  };

  const currentTier = getCurrentTier(totalPoints);
  const nextTier = getNextTier(totalPoints);
  const pointsToNext = nextTier ? nextTier.points - totalPoints : 0;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Loyalty Points Calculator</CardTitle>
              <p className="text-sm text-muted-foreground">Estimate your rewards</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <Badge className={cn("border-0", currentTier.color, "bg-current/10")}>
              <Crown className="w-3 h-3 mr-1" />
              {currentTier.name}
            </Badge>
          </div>
          <p className="text-2xl font-bold">{currentPoints.toLocaleString()} pts</p>
          {nextTier && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{pointsToNext.toLocaleString()} pts to {nextTier.name}</span>
                <span>{Math.round((totalPoints / nextTier.points) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${(totalPoints / nextTier.points) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Calculator */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Number of Nights</label>
              <span className="text-sm font-medium">{nights[0]} nights</span>
            </div>
            <Slider
              value={nights}
              onValueChange={setNights}
              min={1}
              max={14}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Average Nightly Rate</label>
              <span className="text-sm font-medium">${avgRate[0]}</span>
            </div>
            <Slider
              value={avgRate}
              onValueChange={setAvgRate}
              min={50}
              max={500}
              step={25}
              className="w-full"
            />
          </div>
        </div>

        {/* Earnings Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-400">+{earnedPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Points earned</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-400">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">New balance</p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            {currentTier.name} Benefits
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentTier.perks.map((perk) => (
              <Badge key={perk} variant="outline" className="text-xs">
                {perk}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Star className="w-4 h-4 mr-2" />
          Join Rewards Program
        </Button>
      </CardContent>
    </Card>
  );
}
