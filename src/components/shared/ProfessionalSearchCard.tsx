import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

/**
 * PROFESSIONAL SEARCH CARD
 * Clean, elevated card for search forms
 * Consistent across all travel verticals
 */

export type ServiceType = "flights" | "hotels" | "cars";

const serviceAccents = {
  flights: {
    bar: "from-sky-500 via-blue-500 to-cyan-500",
    shadow: "shadow-sky-500/10",
  },
  hotels: {
    bar: "from-amber-500 via-orange-500 to-yellow-500",
    shadow: "shadow-amber-500/10",
  },
  cars: {
    bar: "from-violet-500 via-purple-500 to-fuchsia-500",
    shadow: "shadow-violet-500/10",
  },
};

interface ProfessionalSearchCardProps {
  service: ServiceType;
  children: ReactNode;
  className?: string;
}

export default function ProfessionalSearchCard({
  service,
  children,
  className,
}: ProfessionalSearchCardProps) {
  const accent = serviceAccents[service];

  return (
    <Card className={cn(
      "max-w-5xl mx-auto overflow-hidden border-0",
      "bg-card/95 backdrop-blur-xl",
      "shadow-2xl shadow-black/30 ring-1 ring-white/10",
      accent.shadow,
      className
    )}>
      {/* Accent bar */}
      <div className={cn("h-1 bg-gradient-to-r", accent.bar)} />
      
      <CardContent className="p-5 sm:p-6">
        {children}
        
        {/* Redirect Notice */}
        <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>You will be redirected to our trusted partner to complete your booking</span>
        </div>
      </CardContent>
    </Card>
  );
}
