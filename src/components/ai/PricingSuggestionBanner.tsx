/**
 * ZIVO Pricing Suggestion Banner
 * AI-powered pricing recommendations for partners
 */

import { useState } from "react";
import { TrendingUp, TrendingDown, Sparkles, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIPricingSuggestion } from "@/types/ai";
import { useRespondToPricingSuggestion } from "@/hooks/useAIOptimization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PricingSuggestionBannerProps {
  suggestion: AIPricingSuggestion;
}

export function PricingSuggestionBanner({ suggestion }: PricingSuggestionBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const respond = useRespondToPricingSuggestion();

  const isIncrease = suggestion.suggestion_type === "increase" || suggestion.suggestion_type === "surge";
  const percentChange = suggestion.current_value && suggestion.suggested_value
    ? ((suggestion.suggested_value - suggestion.current_value) / suggestion.current_value * 100).toFixed(0)
    : null;

  const handleAccept = () => {
    respond.mutate({ id: suggestion.id, status: "accepted" });
  };

  const handleReject = () => {
    respond.mutate({ id: suggestion.id, status: "rejected" });
  };

  return (
    <Card className={`border-2 ${isIncrease ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncrease ? "bg-emerald-500/20" : "bg-blue-500/20"}`}>
              {isIncrease ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <Badge variant="secondary" className="text-[10px]">
                  AI Pricing Suggestion
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {Math.round(suggestion.confidence_score * 100)}% confidence
                </Badge>
              </div>

              <h4 className="font-semibold">
                {isIncrease ? "Increase" : "Decrease"} your price
                {percentChange && (
                  <span className={isIncrease ? "text-emerald-600" : "text-blue-600"}>
                    {" "}by {percentChange}%
                  </span>
                )}
              </h4>

              <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>

              {/* Price change visualization */}
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-lg font-bold">${suggestion.current_value}</p>
                </div>
                <div className={isIncrease ? "text-emerald-600" : "text-blue-600"}>→</div>
                <div>
                  <p className="text-xs text-muted-foreground">Suggested</p>
                  <p className={`text-lg font-bold ${isIncrease ? "text-emerald-600" : "text-blue-600"}`}>
                    ${suggestion.suggested_value}
                  </p>
                </div>
              </div>

              {/* Expandable details */}
              <CollapsibleContent className="mt-4 pt-4 border-t">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Why this suggestion?</p>
                    <div className="space-y-2">
                      {Object.entries(suggestion.factors || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> This is a suggestion only. You are always in control of your pricing.
                      AI recommendations are based on market data, demand patterns, and comparable listings.
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={respond.isPending}
                className={isIncrease ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                <Check className="w-4 h-4 mr-1" />
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={respond.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>

          {/* Expand toggle */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2 h-6">
              {isOpen ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Less details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  More details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
