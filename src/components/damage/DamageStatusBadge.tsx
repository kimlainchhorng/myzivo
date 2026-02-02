/**
 * Damage Status Badge Component
 * Displays damage report status with appropriate styling
 */

import { Badge } from "@/components/ui/badge";
import { getDamageStatusBadge } from "@/hooks/useDamageReport";
import type { P2PDamageStatus } from "@/types/damage";

interface DamageStatusBadgeProps {
  status: P2PDamageStatus | string | null;
  size?: "sm" | "default";
}

export default function DamageStatusBadge({ status, size = "default" }: DamageStatusBadgeProps) {
  const { className, label } = getDamageStatusBadge(status);

  return (
    <Badge
      variant="outline"
      className={`${className} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
    >
      {label}
    </Badge>
  );
}
