/**
 * Beta Environment Badge
 * Displays "Private Beta" indicator when beta mode is enabled
 */

import { useRenterBetaSettings } from "@/hooks/useRenterBetaSettings";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function BetaBadge({ className, variant = "default" }: BetaBadgeProps) {
  const { data: betaSettings, isLoading } = useRenterBetaSettings();

  // Don't show if not in beta mode or still loading
  if (isLoading || !betaSettings?.betaMode) {
    return null;
  }

  if (variant === "compact") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-violet-500/10 text-violet-600 border-violet-500/30 text-xs font-medium",
          className
        )}
      >
        Beta
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/30 gap-1",
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      Private Beta
    </Badge>
  );
}
