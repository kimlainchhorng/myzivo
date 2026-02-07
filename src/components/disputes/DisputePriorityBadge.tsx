/**
 * Dispute Priority Badge Component
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DisputePriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig: Record<string, {
  label: string;
  className: string;
}> = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-muted",
  },
  normal: {
    label: "Normal",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export function DisputePriorityBadge({ priority, className }: DisputePriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.normal;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
