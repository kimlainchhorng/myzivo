/**
 * Seller of Travel Status Badge
 */

import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

type SoTStatus = 'not_required' | 'pending' | 'active' | 'expired' | 'exempt';

interface SoTStatusBadgeProps {
  status: SoTStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<SoTStatus, {
  label: string;
  icon: typeof CheckCircle;
  className: string;
}> = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  expired: {
    label: 'Expired',
    icon: AlertTriangle,
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
  },
  not_required: {
    label: 'Not Required',
    icon: MinusCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
  exempt: {
    label: 'Exempt',
    icon: CheckCircle,
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
};

export default function SoTStatusBadge({ status, size = 'md' }: SoTStatusBadgeProps) {
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
      {config.label}
    </span>
  );
}
