/**
 * Dispute Timeline Component
 * Shows audit log and events for a dispute
 */
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  RefreshCcw,
  User,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { DisputeAuditLog, RefundRequest } from "@/hooks/useDisputes";

interface DisputeTimelineProps {
  auditLogs: DisputeAuditLog[];
  refundRequests: RefundRequest[];
  className?: string;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "audit" | "refund";
  action: string;
  description: string;
  icon: React.ElementType;
  iconClassName: string;
}

function getAuditEventConfig(action: string): {
  description: string;
  icon: React.ElementType;
  iconClassName: string;
} {
  switch (action) {
    case "dispute_created":
      return {
        description: "Dispute opened",
        icon: AlertCircle,
        iconClassName: "bg-red-500/10 text-red-500",
      };
    case "dispute_updated":
      return {
        description: "Dispute updated",
        icon: RefreshCcw,
        iconClassName: "bg-blue-500/10 text-blue-500",
      };
    case "dispute_assigned":
      return {
        description: "Assigned to admin",
        icon: User,
        iconClassName: "bg-violet-500/10 text-violet-500",
      };
    case "payout_held":
      return {
        description: "Payout held",
        icon: Shield,
        iconClassName: "bg-amber-500/10 text-amber-500",
      };
    case "payout_released":
      return {
        description: "Payout released",
        icon: CheckCircle,
        iconClassName: "bg-green-500/10 text-green-500",
      };
    default:
      return {
        description: action.replace(/_/g, " "),
        icon: AlertCircle,
        iconClassName: "bg-muted text-muted-foreground",
      };
  }
}

function getRefundEventConfig(status: string): {
  description: string;
  icon: React.ElementType;
  iconClassName: string;
} {
  switch (status) {
    case "queued":
      return {
        description: "Refund queued",
        icon: DollarSign,
        iconClassName: "bg-amber-500/10 text-amber-500",
      };
    case "processing":
      return {
        description: "Refund processing",
        icon: RefreshCcw,
        iconClassName: "bg-blue-500/10 text-blue-500",
      };
    case "refunded":
      return {
        description: "Refund completed",
        icon: CheckCircle,
        iconClassName: "bg-green-500/10 text-green-500",
      };
    case "failed":
      return {
        description: "Refund failed",
        icon: XCircle,
        iconClassName: "bg-red-500/10 text-red-500",
      };
    default:
      return {
        description: `Refund ${status}`,
        icon: DollarSign,
        iconClassName: "bg-muted text-muted-foreground",
      };
  }
}

export function DisputeTimeline({
  auditLogs,
  refundRequests,
  className,
}: DisputeTimelineProps) {
  // Combine and sort events
  const events: TimelineEvent[] = [
    ...auditLogs.map((log) => {
      const config = getAuditEventConfig(log.action);
      return {
        id: log.id,
        timestamp: log.created_at,
        type: "audit" as const,
        action: log.action,
        description: config.description,
        icon: config.icon,
        iconClassName: config.iconClassName,
      };
    }),
    ...refundRequests.map((req) => {
      const config = getRefundEventConfig(req.status);
      return {
        id: req.id,
        timestamp: req.created_at,
        type: "refund" as const,
        action: req.status,
        description: `${config.description} - $${req.amount.toFixed(2)}`,
        icon: config.icon,
        iconClassName: config.iconClassName,
      };
    }),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  event.iconClassName
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < events.length - 1 && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4">
              <p className="font-medium text-sm">{event.description}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
