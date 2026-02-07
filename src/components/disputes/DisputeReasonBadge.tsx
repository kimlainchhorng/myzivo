/**
 * Dispute Reason Badge Component
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  Clock,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  ThumbsDown,
  CreditCard,
  HelpCircle,
} from "lucide-react";

interface DisputeReasonBadgeProps {
  reason: string;
  className?: string;
  showIcon?: boolean;
}

const reasonConfig: Record<string, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  not_delivered: {
    label: "Not Delivered",
    icon: Package,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  late: {
    label: "Late Delivery",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  wrong_item: {
    label: "Wrong Item",
    icon: AlertTriangle,
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  damaged: {
    label: "Damaged",
    icon: AlertTriangle,
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  fraud: {
    label: "Fraud",
    icon: ShieldAlert,
    className: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  overcharged: {
    label: "Overcharged",
    icon: DollarSign,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  quality: {
    label: "Quality Issue",
    icon: ThumbsDown,
    className: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  chargeback: {
    label: "Chargeback",
    icon: CreditCard,
    className: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  other: {
    label: "Other",
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground border-muted",
  },
};

export function DisputeReasonBadge({ reason, className, showIcon = true }: DisputeReasonBadgeProps) {
  const config = reasonConfig[reason] || reasonConfig.other;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
