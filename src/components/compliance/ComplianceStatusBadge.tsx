/**
 * Compliance Status Badge
 * Visual indicator for compliance requirement status
 */

import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

type ComplianceStatus = 'pending' | 'in_progress' | 'compliant' | 'non_compliant' | 'not_applicable';

interface ComplianceStatusBadgeProps {
  status: ComplianceStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ComplianceStatus, {
  label: string;
  icon: typeof CheckCircle;
  className: string;
}> = {
  compliant: {
    label: 'Compliant',
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  non_compliant: {
    label: 'Non-Compliant',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
  },
  not_applicable: {
    label: 'N/A',
    icon: MinusCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export default function ComplianceStatusBadge({
  status,
  showLabel = true,
  size = 'md',
}: ComplianceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {showLabel && config.label}
    </span>
  );
}
