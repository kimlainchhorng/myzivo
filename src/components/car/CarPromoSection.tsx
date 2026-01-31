import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Zap, 
  Gift, 
  ArrowRight,
  Percent,
  Crown,
  Flame,
  Timer,
  CheckCircle,
  Car,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CarPromoSectionProps {
  className?: string;
  onPromoClick?: (promoCode: string) => void;
}

export default function CarPromoSection({ className, onPromoClick }: CarPromoSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const promos = [
    {
      id: "flash",
      type: "flash",
      title: "Flash Deal",
      subtitle: "Today Only",
      description: "Up to 35% off luxury cars",
      code: "DRIVE35",
      discount: "35% OFF",
      bgGradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      icon: Flame,
      iconBg: "bg-violet-500/20",
      badge: "Hot Deal",
      badgeColor: "bg-red-500 text-white",
      features: ["Premium Vehicles", "No Hidden Fees", "Free Upgrades"],
      countdown: { hours: 11, minutes: 23 },
    },
    {
      id: "member",
      type: "member",
      title: "VIP Member",
      subtitle: "ZIVO Rewards",
      description: "Free upgrade on every rental",
      code: "UPGRADE",
      discount: "FREE UPGRADE",
      bgGradient: "from-amber-500 via-yellow-500 to-orange-400",
      icon: Crown,
      iconBg: "bg-amber-500/20",
      badge: "VIP Only",
      badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
      features: ["Priority Service", "Extra Driver Free", "Flex Cancellation"],
    },
    {
      id: "first",
      type: "first",
      title: "First Rental",
      subtitle: "Welcome Offer",
      description: "Get $25 off your first rental",
      code: "FIRST25",
      discount: "$25 OFF",
      bgGradient: "from-cyan-500 via-teal-500 to-emerald-500",
      icon: Gift,
      iconBg: "bg-cyan-500/20",
      badge: "New User",
      badgeColor: "bg-cyan-500 text-white",
      features: ["No Minimum Days", "All Car Types", "Any Location"],
    },
    {
      id: "weekend",
      type: "weekend",
      title: "Weekend Special",
      subtitle: "Fri-Mon Rates",
      description: "3 days for the price of 2",
      code: "WEEKEND3",
      discount: "3 FOR 2",
      bgGradient: "from-pink-500 via-rose-500 to-red-500",
      icon: Calendar,
      iconBg: "bg-pink-500/20",
      badge: "Popular",
      badgeColor: "bg-pink-500 text-white",
      features: ["Weekend Pickups", "All Categories", "Unlimited Miles"],
    },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onPromoClick?.(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className={cn("py-8 sm:py-12", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-10">
          <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30 text-xs sm:text-sm">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Exclusive Deals
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Save More on Your Rental
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Unlock special discounts and perks with our limited-time offers
          </p>
        </div>

        {/* Promo Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {promos.map((promo, index) => (
            <Card
              key={promo.id}
              className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4 touch-manipulation active:scale-[0.98]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Top Border */}
              <div className={cn(
                "h-1 sm:h-1.5 bg-gradient-to-r",
                promo.bgGradient
              )} />
              
              {/* Background Glow */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b opacity-10 group-hover:opacity-20 transition-opacity",
                promo.bgGradient
              )} />

              <CardContent className="p-3 sm:p-4 md:p-6 relative">
                {/* Badge */}
                <Badge className={cn("absolute top-2 sm:top-4 right-2 sm:right-4 text-[9px] sm:text-xs font-semibold", promo.badgeColor)}>
                  {promo.badge}
                </Badge>

                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-transform group-hover:scale-110",
                  promo.iconBg
                )}>
                  <promo.icon className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7",
                    promo.type === "flash" ? "text-violet-500" :
                    promo.type === "member" ? "text-amber-500" :
                    promo.type === "first" ? "text-cyan-500" : "text-pink-500"
                  )} />
                </div>

                {/* Content */}
                <div className="mb-2 sm:mb-3 md:mb-4">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5 sm:mb-1">
                    {promo.subtitle}
                  </p>
                  <h3 className="text-sm sm:text-base md:text-xl font-bold mb-1 sm:mb-2 line-clamp-1">{promo.title}</h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                </div>

                {/* Discount Badge */}
                <div className={cn(
                  "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r text-white font-bold text-xs sm:text-sm md:text-lg mb-2 sm:mb-3 md:mb-4",
                  promo.bgGradient
                )}>
                  <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  {promo.discount}
                </div>

                {/* Features - Hidden on small mobile */}
                <div className="hidden sm:block space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                  {promo.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Countdown (for flash sales) */}
                {promo.countdown && (
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">
                    <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-violet-500 animate-pulse" />
                    <span className="font-mono font-bold text-violet-500">
                      {promo.countdown.hours}h {promo.countdown.minutes}m
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Button
                  onClick={() => handleCopyCode(promo.code)}
                  size="sm"
                  className={cn(
                    "w-full font-semibold transition-all text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9",
                    copiedCode === promo.code
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-gradient-to-r hover:opacity-90",
                    promo.bgGradient
                  )}
                >
                  {copiedCode === promo.code ? (
                    <>
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Use Code:</span> {promo.code}
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
