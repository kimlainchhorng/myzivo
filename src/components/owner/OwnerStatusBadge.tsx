/**
 * Owner Status Badge Component
 * Displays owner verification status with appropriate styling
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { CarOwnerStatus } from "@/types/p2p";

interface OwnerStatusBadgeProps {
  status: CarOwnerStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<CarOwnerStatus, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  pending: {
    label: "Pending Review",
    variant: "secondary",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  verified: {
    label: "Verified",
    variant: "default",
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive",
    icon: AlertTriangle,
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
};

export default function OwnerStatusBadge({ status, size = "md" }: OwnerStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"} gap-1.5`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.label}
    </Badge>
  );
}
