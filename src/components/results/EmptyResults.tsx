/**
 * Empty Results State
 * Consistent empty state across all services
 * Premium design with helpful suggestions
 */

import { Plane, Hotel, Car, ExternalLink, RefreshCw } from "lucide-react";
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
  onRetry?: () => void;
  className?: string;
}

const serviceConfig = {
  flights: {
    icon: Plane,
    title: "No flights found",
    message: "We couldn't find any flights matching your search.",
    suggestions: [
      "Try different travel dates",
      "Check nearby airports",
      "Consider flexible dates",
    ],
    color: "text-sky-500",
    bg: "bg-sky-500",
    bgLight: "bg-sky-500/10",
  },
  hotels: {
    icon: Hotel,
    title: "No hotels found",
    message: "We couldn't find any hotels matching your criteria.",
    suggestions: [
      "Try different dates",
      "Expand your search area",
      "Adjust your filters",
    ],
    color: "text-amber-500",
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/10",
  },
  cars: {
    icon: Car,
    title: "No cars available",
    message: "We couldn't find any cars matching your search.",
    suggestions: [
      "Try different dates or times",
      "Check nearby locations",
      "Adjust your filters",
    ],
    color: "text-violet-500",
    bg: "bg-violet-500",
    bgLight: "bg-violet-500/10",
  },
};

export function EmptyResults({
  service,
  message,
  suggestion,
  partnerCta,
  onRetry,
  className,
}: EmptyResultsProps) {
  const config = serviceConfig[service];
  const Icon = config.icon;

  return (
    <div className={cn("text-center py-16 px-6 bg-muted/20 rounded-2xl border border-border/50", className)}>
      <div
        className={cn(
          "w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center",
          config.bgLight
        )}
      >
        <Icon className={cn("w-10 h-10", config.color)} />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message || config.message}
      </p>

      {/* Suggestions */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-3">Try the following:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {(suggestion ? [suggestion] : config.suggestions).map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Search
          </Button>
        )}
        {partnerCta && (
          <Button
            onClick={partnerCta.onClick}
            className={cn("gap-2 text-white font-semibold", config.bg)}
          >
            {partnerCta.label}
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
