/**
 * Social Proof Section
 * Soft trust statement for platform credibility
 */

import { Shield, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const trustPoints = [
  {
    icon: Globe,
    title: "Trusted worldwide",
    description: "Travelers worldwide use ZIVO to compare travel prices from licensed providers.",
  },
  {
    icon: Lock,
    title: "Secure bookings",
    description: "Complete your booking securely on trusted partner websites.",
  },
  {
    icon: Shield,
    title: "Licensed partners",
    description: "All travel services are fulfilled by licensed travel providers.",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Trust Statement */}
        <div className="text-center mb-10">
          <p className="text-lg sm:text-xl font-medium text-foreground mb-2">
            Trusted by travelers worldwide to compare travel prices
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto">
            from licensed providers
          </p>
        </div>

        {/* Trust Points */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className={cn(
                "text-center p-6 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
                "animate-in fade-in zoom-in-95"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <point.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
