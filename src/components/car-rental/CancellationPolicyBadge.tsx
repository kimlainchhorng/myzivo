/**
 * Cancellation Policy Badge & Info Component
 */

import { Info, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CancellationPolicy = "flexible" | "moderate" | "strict";

interface CancellationPolicyBadgeProps {
  policy: CancellationPolicy;
  showTooltip?: boolean;
  variant?: "badge" | "card";
  className?: string;
}

const policyConfig: Record<CancellationPolicy, {
  label: string;
  shortDesc: string;
  fullDesc: string;
  refundRules: string[];
  color: string;
  icon: typeof CheckCircle;
}> = {
  flexible: {
    label: "Flexible",
    shortDesc: "Full refund up to 24h before pickup",
    fullDesc: "Cancel up to 24 hours before pickup for a full refund (minus service fees).",
    refundRules: [
      "Full refund if cancelled 24+ hours before pickup",
      "50% refund if cancelled within 24 hours",
      "No refund for no-shows",
    ],
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle,
  },
  moderate: {
    label: "Moderate",
    shortDesc: "Full refund up to 5 days before pickup",
    fullDesc: "Cancel up to 5 days before pickup for a full refund (minus service fees).",
    refundRules: [
      "Full refund if cancelled 5+ days before pickup",
      "50% refund if cancelled 2-5 days before",
      "No refund if cancelled within 48 hours",
    ],
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  strict: {
    label: "Strict",
    shortDesc: "50% refund up to 7 days before pickup",
    fullDesc: "Cancel up to 7 days before pickup for a 50% refund. No refunds after that.",
    refundRules: [
      "50% refund if cancelled 7+ days before pickup",
      "No refund if cancelled within 7 days",
      "No refund for no-shows",
    ],
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

export default function CancellationPolicyBadge({
  policy,
  showTooltip = true,
  variant = "badge",
  className,
}: CancellationPolicyBadgeProps) {
  const config = policyConfig[policy];
  const Icon = config.icon;

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.color.split(" ")[1])} />
            <span className="font-medium">{config.label} Cancellation</span>
          </div>
          <p className="text-sm text-muted-foreground">{config.fullDesc}</p>
          <ul className="space-y-1.5">
            {config.refundRules.map((rule, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  const badge = (
    <Badge className={cn("gap-1", config.color, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{config.label} Cancellation</p>
          <p className="text-xs text-muted-foreground mt-1">{config.shortDesc}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
