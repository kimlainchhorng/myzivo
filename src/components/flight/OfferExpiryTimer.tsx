/**
 * Offer Expiry Timer Component
 * Shows countdown until flight offer expires
 */

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OfferExpiryTimerProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
  showLabel?: boolean;
  variant?: 'badge' | 'inline' | 'compact';
}

const OfferExpiryTimer = ({
  expiresAt,
  onExpired,
  className,
  showLabel = true,
  variant = 'badge',
}: OfferExpiryTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }, [expiresAt]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        onExpired?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, isExpired, onExpired]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine urgency level
  const isUrgent = timeLeft <= 120; // 2 minutes
  const isWarning = timeLeft <= 300; // 5 minutes

  if (isExpired) {
    return (
      <Badge 
        variant="destructive" 
        className={cn('gap-1.5 animate-pulse', className)}
      >
        <AlertTriangle className="w-3 h-3" />
        Price expired
      </Badge>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={cn(
        'text-xs font-mono',
        isUrgent ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-muted-foreground',
        className
      )}>
        {formatTime(timeLeft)}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-sm',
        isUrgent ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-muted-foreground',
        className
      )}>
        <Clock className="w-3.5 h-3.5" />
        {showLabel && <span>Price valid for</span>}
        <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
      </span>
    );
  }

  // Default: badge variant
  return (
    <Badge 
      variant={isUrgent ? 'destructive' : isWarning ? 'secondary' : 'outline'}
      className={cn(
        'gap-1.5 transition-colors',
        isUrgent && 'animate-pulse',
        className
      )}
    >
      <Clock className="w-3 h-3" />
      {showLabel && <span>Valid:</span>}
      <span className="font-mono">{formatTime(timeLeft)}</span>
    </Badge>
  );
};

export default OfferExpiryTimer;
