import { Award, Star, Crown, Zap, Gift, TrendingUp, CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Silver",
    icon: Star,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    points: "0 - 999",
    benefits: ["5% off rentals", "Free GPS", "Priority support"],
    current: false,
  },
  {
    name: "Gold",
    icon: Award,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    points: "1,000 - 4,999",
    benefits: ["10% off rentals", "Free upgrades", "Express pickup", "Bonus miles"],
    current: true,
  },
  {
    name: "Platinum",
    icon: Crown,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    points: "5,000+",
    benefits: ["15% off all rentals", "Guaranteed upgrades", "VIP lounge access", "Free additional driver", "Concierge service"],
    current: false,
  },
];

const perks = [
  { icon: Zap, title: "Earn Points", description: "$1 = 1 point on every rental" },
  { icon: Gift, title: "Redeem Rewards", description: "Free rentals, upgrades & more" },
  { icon: TrendingUp, title: "Level Up", description: "Unlock exclusive benefits" },
];

const CarMembershipBenefits = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Rewards Program
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              ZIVO Drive <span className="text-primary">Membership</span>
            </h2>
            <p className="text-muted-foreground">
              Earn points on every rental and unlock exclusive benefits
            </p>
          </div>

          {/* Quick Perks */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {perks.map((perk, index) => {
              const Icon = perk.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                    tier.current
                      ? "bg-gradient-to-br from-primary/20 to-amber-500/20 border-primary"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  {tier.current && (
                    <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Your Tier
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${tier.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${tier.color}`} />
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.points} points</p>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${tier.color}`} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-10 p-6 rounded-2xl bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Your Progress</h3>
                <p className="text-sm text-muted-foreground">2,450 / 5,000 points to Platinum</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium">
                Gold Member
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-amber-400 to-purple-400" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Silver (0)</span>
              <span>Gold (1,000)</span>
              <span>Platinum (5,000)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarMembershipBenefits;
