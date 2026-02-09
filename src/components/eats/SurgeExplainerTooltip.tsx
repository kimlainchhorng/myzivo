/**
 * SurgeExplainerTooltip — Info tooltip explaining surge pricing
 */

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SurgeExplainerTooltipProps {
  className?: string;
}

export function SurgeExplainerTooltip({ className }: SurgeExplainerTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className={cn("w-3.5 h-3.5 text-orange-400 cursor-help", className)} />
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-xs bg-zinc-900 border-white/10">
          <p>
            Prices may be higher due to high demand in your area. This helps ensure 
            faster delivery times and more available drivers.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
