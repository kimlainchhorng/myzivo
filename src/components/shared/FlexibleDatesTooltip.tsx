/**
 * FlexibleDatesTooltip - Hint for flexible date selection
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar, TrendingDown, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FlexibleDatesTooltipProps {
  variant?: "icon" | "inline" | "banner";
  onEnableFlexible?: () => void;
  isFlexibleEnabled?: boolean;
  className?: string;
}

export function FlexibleDatesTooltip({
  variant = "icon",
  onEnableFlexible,
  isFlexibleEnabled = false,
  className,
}: FlexibleDatesTooltipProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("w-6 h-6 p-0", className)}
            >
              <Info className="w-4 h-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            <p className="text-sm">
              <span className="font-semibold">Flexible dates tip:</span>{" "}
              Prices change frequently. Select flexible dates for better deals.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}>
        <Calendar className="w-3.5 h-3.5" />
        <span>Prices change frequently. Select flexible dates for better deals.</span>
      </div>
    );
  }

  // Banner variant
  if (isDismissed || isFlexibleEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-3",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Enable Flexible Dates</p>
              <p className="text-xs text-muted-foreground">
                See prices across ±3 days and find the best deal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={onEnableFlexible}
              className="bg-violet-500 hover:bg-violet-600 gap-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Enable
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="w-8 h-8 p-0 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FlexibleDatesTooltip;
