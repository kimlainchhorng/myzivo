import { DollarSign, Shield, Globe, Lock, Search, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * TRUST FEATURE CARDS - Marketing Component
 * Clean visual cards highlighting ZIVO value props
 * Neutral, trust-focused tone for affiliate compliance
 */

const features = [
  {
    icon: Search,
    title: "Compare Prices",
    description: "Search across 500+ airlines, hotels, and car rental companies",
    gradient: "from-sky-500/20 to-blue-500/10",
    iconColor: "text-sky-500",
    borderColor: "border-sky-500/30",
  },
  {
    icon: DollarSign,
    title: "No Booking Fees",
    description: "ZIVO never charges you fees — book directly with partners",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Complete your reservation safely on trusted partner sites",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/30",
  },
  {
    icon: Globe,
    title: "Worldwide Coverage",
    description: "Find travel options for any destination around the globe",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
  },
];

interface TrustFeatureCardsProps {
  className?: string;
  columns?: 2 | 4;
}

export default function TrustFeatureCards({ className, columns = 4 }: TrustFeatureCardsProps) {
  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Why travelers choose ZIVO</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Travel Search Made{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Simple
            </span>
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className={cn(
          "grid gap-6 max-w-5xl mx-auto",
          columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"
        )}>
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={cn(
                "border transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl",
                `bg-gradient-to-br ${feature.gradient}`,
                feature.borderColor,
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                  "bg-card/80 backdrop-blur-sm border border-border/50"
                )}>
                  <feature.icon className={cn("w-7 h-7", feature.iconColor)} />
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
