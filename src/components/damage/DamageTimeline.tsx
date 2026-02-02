/**
 * Damage Timeline Component
 * Displays timeline of events for a damage report
 */

import { format } from "date-fns";
import {
  AlertTriangle,
  Search,
  HelpCircle,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { P2PDamageStatus } from "@/types/damage";

interface TimelineEvent {
  status: P2PDamageStatus;
  date: string;
  description?: string;
}

interface DamageTimelineProps {
  currentStatus: P2PDamageStatus;
  createdAt: string;
  updatedAt: string;
  resolution?: {
    decision: string;
    resolved_at: string;
  } | null;
}

const statusConfig: Record<P2PDamageStatus, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}> = {
  reported: {
    icon: AlertTriangle,
    label: "Damage Reported",
    color: "text-amber-500",
  },
  under_review: {
    icon: Search,
    label: "Under Review",
    color: "text-blue-500",
  },
  info_requested: {
    icon: HelpCircle,
    label: "Additional Information Requested",
    color: "text-purple-500",
  },
  insurance_claim_submitted: {
    icon: Shield,
    label: "Insurance Claim Submitted",
    color: "text-cyan-500",
  },
  resolved_owner_paid: {
    icon: CheckCircle,
    label: "Resolved - Owner Compensated",
    color: "text-green-500",
  },
  resolved_renter_charged: {
    icon: CheckCircle,
    label: "Resolved - Renter Charged",
    color: "text-green-500",
  },
  closed_no_action: {
    icon: XCircle,
    label: "Closed - No Action Taken",
    color: "text-muted-foreground",
  },
};

export default function DamageTimeline({
  currentStatus,
  createdAt,
  updatedAt,
  resolution,
}: DamageTimelineProps) {
  // Build timeline based on current status
  const events: TimelineEvent[] = [
    { status: "reported", date: createdAt },
  ];

  // Add intermediate statuses if applicable
  if (currentStatus !== "reported") {
    const statusOrder: P2PDamageStatus[] = [
      "reported",
      "under_review",
      "info_requested",
      "insurance_claim_submitted",
      "resolved_owner_paid",
      "resolved_renter_charged",
      "closed_no_action",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    
    // For review statuses, add them
    if (["under_review", "info_requested"].includes(currentStatus)) {
      events.push({ status: currentStatus, date: updatedAt });
    } else if (["insurance_claim_submitted", "resolved_owner_paid", "resolved_renter_charged", "closed_no_action"].includes(currentStatus)) {
      // For final statuses, add review step then final
      events.push({ status: "under_review", date: updatedAt });
      events.push({ status: currentStatus, date: resolution?.resolved_at || updatedAt });
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
        Timeline
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {events.map((event, index) => {
            const config = statusConfig[event.status];
            const Icon = config.icon;
            const isLast = index === events.length - 1;

            return (
              <div key={`${event.status}-${index}`} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 ${
                    isLast ? "border-primary" : "border-muted"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isLast ? config.color : "text-muted-foreground"}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`font-medium ${isLast ? "" : "text-muted-foreground"}`}>
                    {config.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
