/**
 * SmartSavingsBanner - Sticky banner showing AI-detected savings opportunities
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartSavingsBannerProps {
  savings?: number;
  alternativeDay?: string;
  alternativeDate?: Date;
  onViewDates?: () => void;
  className?: string;
}

export function SmartSavingsBanner({
  savings = 120,
  alternativeDay = "Tuesday",
  alternativeDate,
  onViewDates,
  className,
}: SmartSavingsBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "sticky top-0 z-40 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 border-b border-violet-500/20 backdrop-blur-xl",
          className
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  <span className="text-violet-400">AI Insight:</span>{" "}
                  <span className="text-foreground">
                    Fly {alternativeDay} instead to save ${savings} on this route
                  </span>
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Based on price analysis of similar bookings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={onViewDates}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Dates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SmartSavingsBanner;
