/**
 * Future AI Features Preview
 * UI-ready components for upcoming AI capabilities
 */

import { Link } from "react-router-dom";
import {
  Sparkles,
  DollarSign,
  Heart,
  Package,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FUTURE_AI_FEATURES, type FeatureStatus } from "@/config/aiPersonalization";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  DollarSign,
  Heart,
  Package,
};

const STATUS_BADGES: Record<FeatureStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "bg-emerald-500/20 text-emerald-500",
  },
  beta: {
    label: "Beta",
    className: "bg-violet-500/20 text-violet-500",
  },
  coming_soon: {
    label: "Coming Soon",
    className: "bg-muted text-muted-foreground",
  },
};

interface FutureAIFeaturesProps {
  layout?: "grid" | "list";
  showAll?: boolean;
  className?: string;
}

export function FutureAIFeatures({
  layout = "grid",
  showAll = false,
  className,
}: FutureAIFeaturesProps) {
  const features = showAll
    ? FUTURE_AI_FEATURES
    : FUTURE_AI_FEATURES.filter((f) => f.status !== "coming_soon" || showAll);

  if (layout === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {features.map((feature) => {
          const Icon = ICON_MAP[feature.icon] || Sparkles;
          const statusConfig = STATUS_BADGES[feature.status];
          const isClickable = feature.status !== "coming_soon" && feature.link;

          const content = (
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                isClickable
                  ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  : "opacity-70"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    feature.status === "coming_soon"
                      ? "bg-muted"
                      : "bg-violet-500/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      feature.status === "coming_soon"
                        ? "text-muted-foreground"
                        : "text-violet-500"
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{feature.title}</p>
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              {isClickable && (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          );

          if (isClickable && feature.link) {
            return (
              <Link key={feature.id} to={feature.link}>
                {content}
              </Link>
            );
          }

          return <div key={feature.id}>{content}</div>;
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {features.map((feature) => {
        const Icon = ICON_MAP[feature.icon] || Sparkles;
        const statusConfig = STATUS_BADGES[feature.status];
        const isClickable = feature.status !== "coming_soon" && feature.link;

        const card = (
          <Card
            className={cn(
              "h-full transition-all",
              isClickable
                ? "hover:border-primary/50 hover:shadow-md cursor-pointer"
                : "opacity-70",
              feature.status === "beta" &&
                "border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    feature.status === "coming_soon"
                      ? "bg-muted"
                      : "bg-violet-500/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      feature.status === "coming_soon"
                        ? "text-muted-foreground"
                        : "text-violet-500"
                    )}
                  />
                </div>
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              </div>

              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>

              {isClickable && feature.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-primary"
                >
                  Try Now <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {feature.status === "coming_soon" && (
                <p className="text-xs text-center text-muted-foreground">
                  Notify me when available
                </p>
              )}
            </CardContent>
          </Card>
        );

        if (isClickable && feature.link) {
          return (
            <Link key={feature.id} to={feature.link} className="block h-full">
              {card}
            </Link>
          );
        }

        return <div key={feature.id}>{card}</div>;
      })}
    </div>
  );
}

// Compact version for sidebars
export function FutureAIFeaturesCompact({ className }: { className?: string }) {
  const betaFeature = FUTURE_AI_FEATURES.find((f) => f.status === "beta");

  if (!betaFeature) return null;

  const Icon = ICON_MAP[betaFeature.icon] || Sparkles;

  return (
    <Link to={betaFeature.link || "#"} className={cn("block", className)}>
      <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/15 hover:to-purple-500/15 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{betaFeature.title}</p>
                <Badge className="bg-violet-500/20 text-violet-500 text-[10px]">
                  Beta
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {betaFeature.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default FutureAIFeatures;
