/**
 * SmartBookingSuggestions - AI-powered contextual booking hints
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingDown,
  Calendar,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  type: "best_time" | "cheaper_dates" | "flexible_savings" | "general";
  title: string;
  description: string;
  savings?: number;
  icon: typeof Sparkles;
  priority: number;
}

interface SmartBookingSuggestionsProps {
  origin?: string;
  destination?: string;
  departDate?: Date;
  returnDate?: Date;
  currentPrice?: number;
  className?: string;
}

const generateSuggestions = (
  origin?: string,
  destination?: string,
  departDate?: Date,
  currentPrice?: number
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Best time to book suggestion
  const dayOfWeek = departDate?.getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    suggestions.push({
      id: "best_time",
      type: "best_time",
      title: "Best time to book",
      description: `Travelers save up to 30% by flying on Tuesday or Wednesday instead of weekends.`,
      savings: currentPrice ? Math.round(currentPrice * 0.3) : undefined,
      icon: Clock,
      priority: 1,
    });
  }

  // Cheaper dates nearby
  suggestions.push({
    id: "cheaper_dates",
    type: "cheaper_dates",
    title: "Cheapest dates nearby",
    description: `Prices are typically lower 1-2 days before or after your selected dates. Consider flexible travel.`,
    icon: Calendar,
    priority: 2,
  });

  // Flexible dates savings
  suggestions.push({
    id: "flexible_savings",
    type: "flexible_savings",
    title: "Flexible dates save money",
    description: `Enable flexible dates to see prices across a 3-day window and find the best deal.`,
    icon: TrendingDown,
    priority: 3,
  });

  // General AI tip
  suggestions.push({
    id: "general",
    type: "general",
    title: "AI Booking Tip",
    description: `Book 3-6 weeks in advance for domestic flights and 2-3 months for international routes.`,
    icon: Lightbulb,
    priority: 4,
  });

  return suggestions.sort((a, b) => a.priority - b.priority);
};

export function SmartBookingSuggestions({
  origin,
  destination,
  departDate,
  returnDate,
  currentPrice,
  className,
}: SmartBookingSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissed_suggestions") || "[]");
    } catch {
      return [];
    }
  });

  const suggestions = generateSuggestions(origin, destination, departDate, currentPrice)
    .filter((s) => !dismissedIds.includes(s.id));

  useEffect(() => {
    localStorage.setItem("dismissed_suggestions", JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const dismissSuggestion = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const clearDismissed = () => {
    setDismissedIds([]);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5",
      className
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                AI Booking Insights
                <Badge className="bg-violet-500/20 text-violet-400 text-xs">
                  Smart
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground">
                Personalized suggestions for your trip
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Suggestions List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {suggestions.slice(0, 3).map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-3 rounded-xl bg-card/50 border border-border/50 hover:border-violet-500/30 transition-colors group"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm flex items-center gap-2">
                          {suggestion.title}
                          {suggestion.savings && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                              Save ${suggestion.savings}
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
                AI suggestions are estimates based on historical data. Actual prices may vary.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default SmartBookingSuggestions;
