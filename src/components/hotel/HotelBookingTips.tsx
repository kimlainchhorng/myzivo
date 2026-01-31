import { Lightbulb, Calendar, Clock, CreditCard, Bell, Gift, Shield, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const tips = [
  {
    icon: Calendar,
    title: "Book 3-4 Weeks Ahead",
    description: "Sweet spot for best rates - not too early, not too late",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Clock,
    title: "Check-in Timing",
    description: "Sunday/Monday arrivals often have better upgrade availability",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: TrendingDown,
    title: "Off-Peak Seasons",
    description: "Save 30-50% by traveling during shoulder seasons",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: CreditCard,
    title: "Use the Right Card",
    description: "Hotel credit cards offer 10-15x points on bookings",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Bell,
    title: "Set Price Alerts",
    description: "Get notified when prices drop for your destination",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Gift,
    title: "Join Loyalty Programs",
    description: "Free signup often includes instant perks and discounts",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Shield,
    title: "Book Refundable",
    description: "Plans change - flexible rates are worth the small premium",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Lightbulb,
    title: "Call the Hotel",
    description: "Direct bookings sometimes include extra perks not online",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

const HotelBookingTips = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Pro Tips</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Hotel Booking Secrets
          </h2>
          <p className="text-muted-foreground">Insider tips to save money and get upgrades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className={cn(
                  "group p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "transition-all duration-300 hover:border-amber-500/30",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", tip.bg)}>
                  <Icon className={cn("w-5 h-5", tip.color)} />
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-amber-400 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotelBookingTips;
