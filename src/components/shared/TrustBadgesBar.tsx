import { Shield, Award, Lock, Clock, HeadphonesIcon, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Shield, label: "Secure Booking", color: "text-green-400" },
  { icon: Award, label: "Best Price Guarantee", color: "text-amber-400" },
  { icon: Lock, label: "Data Protected", color: "text-blue-400" },
  { icon: Clock, label: "24/7 Support", color: "text-violet-400" },
  { icon: HeadphonesIcon, label: "Live Chat", color: "text-pink-400" },
  { icon: RefreshCcw, label: "Free Cancellation", color: "text-cyan-400" },
];

const TrustBadgesBar = () => {
  return (
    <section className="py-8 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-12 overflow-x-auto pb-2 scrollbar-hide">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className={cn(
                  "flex items-center gap-2 flex-shrink-0",
                  "animate-in fade-in zoom-in-95"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={cn("w-5 h-5", badge.color)} />
                <span className="text-sm font-medium whitespace-nowrap">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesBar;
