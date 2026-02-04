/**
 * Price Confidence Badge
 * Shows if current price is Good / Average / High
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingDown, Minus, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfidenceLevel = 'good' | 'average' | 'high';

interface PriceConfidenceBadgeProps {
  level: ConfidenceLevel;
  percentFromAvg?: number;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const levelConfig = {
  good: {
    label: 'Good Price',
    icon: TrendingDown,
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Below average price for this route',
  },
  average: {
    label: 'Average',
    icon: Minus,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    description: 'Within normal price range',
  },
  high: {
    label: 'High Price',
    icon: TrendingUp,
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
    description: 'Above average price for this route',
  },
};

const PriceConfidenceBadge = ({
  level,
  percentFromAvg,
  showTooltip = true,
  size = 'sm',
  className,
}: PriceConfidenceBadgeProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium gap-1",
        config.className,
        size === 'sm' && "text-[10px] px-1.5 py-0",
        size === 'md' && "text-xs px-2 py-0.5",
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
      {percentFromAvg !== undefined && (
        <span className="opacity-70">
          ({percentFromAvg > 0 ? '+' : ''}{percentFromAvg}%)
        </span>
      )}
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
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs font-medium">{config.description}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Based on recent partner pricing data
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PriceConfidenceBadge;
