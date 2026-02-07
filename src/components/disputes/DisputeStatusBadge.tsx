/**
 * Dispute Status Badge Component
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";

interface DisputeStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ElementType;
  className: string;
}> = {
  open: {
    label: "Open",
    variant: "destructive",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  under_review: {
    label: "Under Review",
    variant: "default",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  resolved: {
    label: "Resolved",
    variant: "secondary",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  rejected: {
    label: "Rejected",
    variant: "outline",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-muted",
  },
  escalated: {
    label: "Escalated",
    variant: "destructive",
    icon: AlertTriangle,
    className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
};

export function DisputeStatusBadge({ status, className }: DisputeStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.open;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
