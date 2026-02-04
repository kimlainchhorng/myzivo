/**
 * Sponsored Badge Component
 * Clear labeling for sponsored content (FTC compliant)
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SponsoredBadgeProps {
  variant?: 'default' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

const SponsoredBadge = ({
  variant = 'default',
  size = 'sm',
  showTooltip = true,
  className,
}: SponsoredBadgeProps) => {
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        variant === 'default' && "bg-amber-500/10 text-amber-600 border-amber-500/30",
        variant === 'subtle' && "bg-muted text-muted-foreground border-border",
        variant === 'outline' && "bg-transparent text-muted-foreground border-border",
        size === 'sm' && "text-[10px] px-1.5 py-0",
        size === 'md' && "text-xs px-2 py-0.5",
        className
      )}
    >
      Sponsored
      {showTooltip && <Info className="w-2.5 h-2.5 ml-1 opacity-60" />}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          <p className="text-xs">
            Sponsored results are clearly labeled and do not affect price transparency.
            All prices shown are the final prices from our partners.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SponsoredBadge;
