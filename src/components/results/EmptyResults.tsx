/**
 * Empty Results State
 * Consistent empty state across all services
 */

import { Plane, Hotel, Car, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyResultsProps {
  service: "flights" | "hotels" | "cars";
  message?: string;
  suggestion?: string;
  partnerCta?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const serviceConfig = {
  flights: {
    icon: Plane,
    title: "No flights found",
    message: "Try different dates or destinations.",
    color: "text-sky-500",
    bg: "bg-sky-500",
  },
  hotels: {
    icon: Hotel,
    title: "No hotels found",
    message: "Try different dates or another destination.",
    color: "text-amber-500",
    bg: "bg-amber-500",
  },
  cars: {
    icon: Car,
    title: "No cars found",
    message: "Try different dates or another location.",
    color: "text-violet-500",
    bg: "bg-violet-500",
  },
};

export function EmptyResults({
  service,
  message,
  suggestion,
  partnerCta,
  className,
}: EmptyResultsProps) {
  const config = serviceConfig[service];
  const Icon = config.icon;

  return (
    <div className={cn("text-center py-16 bg-muted/30 rounded-2xl", className)}>
      <div
        className={cn(
          "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
          `${config.bg}/10`
        )}
      >
        <Icon className={cn("w-8 h-8", config.color)} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message || config.message}
        {suggestion && <span className="block mt-1">{suggestion}</span>}
      </p>
      {partnerCta && (
        <Button
          onClick={partnerCta.onClick}
          className={cn("gap-2 text-white", config.bg, `hover:${config.bg}/90`)}
        >
          {partnerCta.label}
          <ExternalLink className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
