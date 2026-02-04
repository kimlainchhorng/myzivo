import { Shield, CheckCircle, Clock, Globe, Users, Award, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const trustBadges = [
  { icon: Globe, label: "500+ Airlines", description: "Compared" },
  { icon: CheckCircle, label: "500,000+ Hotels", description: "Worldwide" },
  { icon: Shield, label: "Trusted Partners", description: "Licensed providers" },
  { icon: Clock, label: "No Hidden Fees", description: "On ZIVO" },
];

export default function TrustCredibilityBar() {
  return (
    <section className="py-8 sm:py-10 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-8">
          {trustBadges.map((badge, index) => (
            <div
              key={badge.label}
              className={cn(
                "flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Trust Line */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Prices provided by licensed travel partners.
          </p>
        </div>
      </div>
    </section>
  );
}
