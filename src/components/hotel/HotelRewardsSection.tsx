import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Crown, Star, Zap, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const rewardTiers = [
  { name: "Silver", nights: 10, perks: ["5% off stays", "Early check-in"], icon: "🥈", color: "from-gray-400 to-gray-500" },
  { name: "Gold", nights: 25, perks: ["10% off stays", "Room upgrade", "Late checkout"], icon: "🥇", color: "from-amber-400 to-amber-500" },
  { name: "Platinum", nights: 50, perks: ["15% off stays", "Suite upgrade", "Lounge access", "Free breakfast"], icon: "💎", color: "from-violet-400 to-purple-500" },
];

const HotelRewardsSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-radial from-amber-500/15 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Info */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold mb-6 shadow-lg shadow-amber-500/30">
              <Crown className="w-4 h-4" />
              ZIVO Rewards
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Earn Points on
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Every Stay</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Join millions of travelers earning free nights, exclusive perks, and VIP experiences at 50,000+ hotels worldwide.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-medium">Free Nights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-medium">Instant Benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-medium">VIP Access</span>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25">
              <Sparkles className="w-4 h-4 mr-2" />
              Join Free Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right: Tier Cards */}
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {rewardTiers.map((tier, index) => (
              <Card
                key={tier.name}
                className={cn(
                  "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                  "hover:border-amber-500/50 hover:-translate-x-2 touch-manipulation active:scale-[0.98]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                      "bg-gradient-to-br shadow-lg",
                      tier.color
                    )}>
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg">{tier.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {tier.nights}+ nights/year
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tier.perks.map((perk) => (
                          <span key={perk} className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-400 transition-all duration-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelRewardsSection;
