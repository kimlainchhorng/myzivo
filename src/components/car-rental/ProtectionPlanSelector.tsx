/**
 * Protection Plan Selector
 * Checkout component for selecting insurance coverage tier
 */

import { useState } from "react";
import { Shield, Check, X, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProtectionPlans, type ProtectionPlan } from "@/hooks/useProtectionPlans";
import { cn } from "@/lib/utils";

interface ProtectionPlanSelectorProps {
  totalDays: number;
  minimumTier?: "basic" | "standard" | "premium";
  selectedTier: string;
  onSelect: (plan: ProtectionPlan) => void;
  className?: string;
}

export default function ProtectionPlanSelector({
  totalDays,
  minimumTier = "basic",
  selectedTier,
  onSelect,
  className,
}: ProtectionPlanSelectorProps) {
  const { data: plans, isLoading } = useProtectionPlans();
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Tier order for minimum requirement check
  const tierOrder = { basic: 0, standard: 1, premium: 2 };
  const minTierLevel = tierOrder[minimumTier];

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Protection Plan
        </h3>
        {minimumTier !== "basic" && (
          <Badge variant="secondary" className="text-xs">
            Owner requires {minimumTier}+
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {plans?.map((plan) => {
          const isSelected = selectedTier === plan.tier;
          const tierLevel = tierOrder[plan.tier];
          const isDisabled = tierLevel < minTierLevel;
          const totalCost = plan.daily_rate * totalDays;

          return (
            <Card
              key={plan.id}
              className={cn(
                "cursor-pointer transition-all",
                isSelected && "ring-2 ring-primary border-primary",
                isDisabled && "opacity-50 cursor-not-allowed",
                !isSelected && !isDisabled && "hover:border-primary/50"
              )}
              onClick={() => !isDisabled && onSelect(plan)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{plan.name}</h4>
                      {plan.tier === "standard" && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Recommended
                        </Badge>
                      )}
                      {isDisabled && (
                        <Badge variant="outline" className="text-xs">
                          Below minimum
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>

                    {/* Quick coverage info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Deductible: <strong>${plan.deductible.toLocaleString()}</strong>
                      </span>
                      <span>
                        Liability: <strong>${(plan.liability_coverage / 1000).toFixed(0)}K</strong>
                      </span>
                    </div>

                    {/* Expand/collapse details */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs p-0 h-auto mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(showDetails === plan.id ? null : plan.id);
                      }}
                    >
                      {showDetails === plan.id ? "Hide details" : "View coverage details"}
                    </Button>

                    {/* Expanded details */}
                    {showDetails === plan.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            What's covered:
                          </p>
                          <ul className="space-y-1">
                            {plan.coverage_includes.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-3 h-3 text-emerald-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Not covered:
                          </p>
                          <ul className="space-y-1">
                            {plan.coverage_excludes.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <X className="w-3 h-3 text-red-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0 ml-4">
                    {plan.daily_rate === 0 ? (
                      <p className="font-bold text-emerald-600">Included</p>
                    ) : (
                      <>
                        <p className="font-bold">${plan.daily_rate}/day</p>
                        <p className="text-sm text-muted-foreground">
                          ${totalCost.toFixed(2)} total
                        </p>
                      </>
                    )}
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="mt-2 flex justify-end">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legal disclosure */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Insurance Disclosure</p>
            <p className="mt-1">
              ZIVO does not provide insurance coverage. Protection plans are offered by 
              licensed third-party providers. Coverage is subject to terms, conditions, 
              and exclusions. Review the full policy before booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
