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
    description: "Travelers in 50+ countries use ZIVO to book flights, hotels, and cars.",
  },
  {
    icon: Lock,
    title: "Secure payments",
    description: "Your payment info is encrypted and protected with bank-level security.",
  },
  {
    icon: Shield,
    title: "Licensed partners",
    description: "We work with licensed travel providers for reliable bookings.",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Trust Statement */}
        <div className="text-center mb-10">
          <p className="text-lg sm:text-xl font-medium text-foreground mb-2">
            Trusted by travelers worldwide
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built with secure payments and licensed partners
          </p>
        </div>

        {/* Trust Points */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className={cn(
                "text-center p-6 rounded-xl bg-muted/30 border border-border/50",
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
