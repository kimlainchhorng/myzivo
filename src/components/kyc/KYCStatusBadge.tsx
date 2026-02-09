/**
 * KYC Status Badge Component
 * Displays consistent status badges across all KYC-related pages
 */

import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KYCStatus } from "@/lib/kyc";
import { getStatusBadgeConfig } from "@/lib/kyc";

interface KYCStatusBadgeProps {
  status: KYCStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const iconMap = {
  Edit,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function KYCStatusBadge({ 
  status, 
  size = "md", 
  showIcon = true,
  className 
}: KYCStatusBadgeProps) {
  const config = getStatusBadgeConfig(status);
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        sizeClasses[size],
        "flex items-center gap-1.5 font-medium",
        className
      )}
    >
      {showIcon && Icon && (
        <Icon className={cn(iconSizes[size], config.color)} />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}

export default KYCStatusBadge;
