import { Shield, Lock, CreditCard, Award, CheckCircle, Globe, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const trustIndicators = [
  {
    icon: Shield,
    title: "Secure Booking",
    description: "256-bit SSL encryption",
    color: "text-emerald-500",
  },
  {
    icon: Lock,
    title: "Data Protection",
    description: "GDPR compliant",
    color: "text-sky-500",
  },
  {
    icon: CreditCard,
    title: "Safe Payments",
    description: "PCI DSS certified",
    color: "text-purple-500",
  },
  {
    icon: Award,
    title: "Best Price",
    description: "Price match guarantee",
    color: "text-amber-500",
  },
];

const stats = [
  { icon: Users, value: "10M+", label: "Happy Travelers" },
  { icon: Globe, value: "190+", label: "Countries" },
  { icon: CheckCircle, value: "99.9%", label: "Uptime" },
  { icon: Clock, value: "24/7", label: "Support" },
];

const TrustIndicators = () => {
  return (
    <section className="py-8 px-4 border-y border-border/50 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustIndicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <div
                  key={indicator.title}
                  className="flex items-center gap-2.5"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center",
                    indicator.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {indicator.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {indicator.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-border" />

          {/* Quick Stats */}
          <div className="flex items-center gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
