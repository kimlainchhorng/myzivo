/**
 * Behavior-Based Suggestions
 * "Travelers who searched this route also viewed..."
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Plane,
  TrendingUp,
  Sun,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserBehavior } from "@/hooks/useUserBehavior";
import { BEHAVIOR_SUGGESTION_TYPES, AI_DISCLAIMERS } from "@/config/aiPersonalization";
import { cn } from "@/lib/utils";

interface SuggestedDestination {
  code: string;
  name: string;
  reason: string;
  avgPrice?: number;
}

interface BehaviorSuggestionsProps {
  currentRoute?: { origin: string; destination: string };
  similarDestinations?: SuggestedDestination[];
  seasonalPicks?: SuggestedDestination[];
  budgetFriendly?: SuggestedDestination[];
  alsoViewed?: SuggestedDestination[];
  className?: string;
}

// TODO: Replace with real AI/ML suggestions from API

export function BehaviorSuggestions({
  currentRoute,
  similarDestinations,
  seasonalPicks,
  budgetFriendly,
  alsoViewed,
  className,
}: BehaviorSuggestionsProps) {
  const { profile } = useUserBehavior();

  // Use provided suggestions or empty defaults
  const similar = similarDestinations || [];
  const seasonal = seasonalPicks || [];
  const budget = budgetFriendly || [];
  const viewed = alsoViewed || [];

  const hasAnySuggestions =
    similar.length > 0 || seasonal.length > 0 || budget.length > 0 || viewed.length > 0;

  if (!hasAnySuggestions) return null;

  const renderDestinationCard = (dest: SuggestedDestination, origin?: string) => (
    <Link
      key={dest.code}
      to={`/flights?origin=${origin || "LAX"}&destination=${dest.code}`}
      className="group"
    >
      <div className="p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">{dest.name}</span>
          </div>
          {dest.avgPrice && (
            <span className="text-sm font-semibold text-primary">
              ${dest.avgPrice}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{dest.reason}</p>
      </div>
    </Link>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          Personalized Suggestions
          <Badge className="bg-violet-500/20 text-violet-500 text-xs">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Also Viewed */}
        {viewed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Travelers also viewed</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {viewed.map((dest) => renderDestinationCard(dest, currentRoute?.origin))}
            </div>
          </section>
        )}

        {/* Similar Destinations */}
        {similar.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Similar destinations</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {similar.map((dest) => renderDestinationCard(dest, currentRoute?.origin))}
            </div>
          </section>
        )}

        {/* Seasonal Picks */}
        {seasonal.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-medium">Great for this season</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {seasonal.map((dest) => renderDestinationCard(dest, currentRoute?.origin))}
            </div>
          </section>
        )}

        {/* Budget Friendly */}
        {budget.length > 0 && profile.preferences.budgetTier === "budget" && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-medium">Budget-friendly options</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {budget.map((dest) => renderDestinationCard(dest, currentRoute?.origin))}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center pt-3 border-t border-border/50">
          {AI_DISCLAIMERS.recommendations}
        </p>
      </CardContent>
    </Card>
  );
}

export default BehaviorSuggestions;
