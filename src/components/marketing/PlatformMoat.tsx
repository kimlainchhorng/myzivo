/**
 * Platform Moat Component
 * Strategic positioning copy for competitive differentiation
 */

import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Globe,
  Award,
  Shield,
  Brain,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformMoatProps {
  variant?: 'full' | 'compact' | 'tagline';
  className?: string;
}

const differentiators = [
  {
    icon: Brain,
    title: "AI-Powered Personalization",
    description: "Smart recommendations that learn your travel preferences",
  },
  {
    icon: Zap,
    title: "Cross-Service Intelligence",
    description: "Flight → Hotel → Car suggestions in one seamless flow",
  },
  {
    icon: Award,
    title: "Unified Rewards",
    description: "Earn ZIVO Miles across all services, redeem anywhere",
  },
  {
    icon: Shield,
    title: "Trusted Partners",
    description: "Book with confidence through licensed travel providers",
  },
];

const PlatformMoat = ({ variant = 'full', className }: PlatformMoatProps) => {
  if (variant === 'tagline') {
    return (
      <p className={cn(
        "text-sm text-muted-foreground text-center max-w-lg mx-auto",
        className
      )}>
        ZIVO combines travel, mobility, and AI planning into one ecosystem.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("text-center py-8", className)}>
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
          <Sparkles className="w-3 h-3 mr-1" />
          The ZIVO Advantage
        </Badge>
        <p className="text-lg font-medium mb-2">
          One App. Complete Journey.
        </p>
        <p className="text-muted-foreground max-w-md mx-auto">
          ZIVO combines travel, mobility, and AI planning into one ecosystem — 
          from inspiration to destination.
        </p>
      </div>
    );
  }

  return (
    <section className={cn("py-16 px-4", className)}>
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Globe className="w-3 h-3 mr-1" />
            Why ZIVO
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Travel Smarter, Not Harder
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ZIVO combines travel, mobility, and AI planning into one ecosystem — 
            giving you everything you need for your complete journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {differentiators.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            One account. One app. Unlimited possibilities.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlatformMoat;
