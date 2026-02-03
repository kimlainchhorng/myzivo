/**
 * ZIVO Smart Recommendation Card
 * AI-powered cross-service suggestions
 */

import { X, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIRecommendation } from "@/types/ai";
import { useMarkRecommendationShown, useMarkRecommendationClicked } from "@/hooks/useAIOptimization";
import { useEffect } from "react";
import { Link } from "react-router-dom";

interface SmartRecommendationCardProps {
  recommendation: AIRecommendation;
  onDismiss?: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  flights: "✈️",
  hotels: "🏨",
  cars: "🚗",
  rides: "🚕",
  eats: "🍔",
  move: "📦",
};

export function SmartRecommendationCard({
  recommendation,
  onDismiss,
}: SmartRecommendationCardProps) {
  const markShown = useMarkRecommendationShown();
  const markClicked = useMarkRecommendationClicked();

  const context = recommendation.context;
  const icon = context.icon || SERVICE_ICONS[recommendation.recommended_service] || "✨";

  // Mark as shown when component mounts
  useEffect(() => {
    if (!recommendation.is_shown) {
      markShown.mutate(recommendation.id);
    }
  }, [recommendation.id, recommendation.is_shown]);

  const handleClick = () => {
    markClicked.mutate(recommendation.id);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                AI Suggestion
              </Badge>
            </div>
            <h4 className="font-semibold text-sm">{context.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {context.description}
            </p>
            
            {/* Action */}
            {context.link && (
              <Link to={context.link} onClick={handleClick}>
                <Button size="sm" variant="link" className="h-auto p-0 mt-2 text-primary">
                  Explore
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
