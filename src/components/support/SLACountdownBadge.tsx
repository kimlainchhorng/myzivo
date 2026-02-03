/**
 * SLA Countdown Badge
 * Shows real-time countdown to SLA breach with visual indicators
 */

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, AlertTriangle, Pause, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateSLATimeRemaining, formatSLACountdown } from "@/hooks/useSupportTickets";

interface SLACountdownBadgeProps {
  dueAt: string | null;
  pausedAt: string | null;
  pausedMinutes: number;
  isBreached: boolean;
  type: 'response' | 'resolution';
  className?: string;
}

export function SLACountdownBadge({
  dueAt,
  pausedAt,
  pausedMinutes,
  isBreached,
  type,
  className,
}: SLACountdownBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => 
    calculateSLATimeRemaining(dueAt, pausedAt, pausedMinutes)
  );

  useEffect(() => {
    if (!dueAt || pausedAt) return;

    const interval = setInterval(() => {
      setTimeRemaining(calculateSLATimeRemaining(dueAt, pausedAt, pausedMinutes));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueAt, pausedAt, pausedMinutes]);

  if (!dueAt) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <CheckCircle className="w-3 h-3" />
        No SLA
      </Badge>
    );
  }

  if (isBreached || timeRemaining.isBreached) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="destructive" 
              className={cn("gap-1 animate-pulse", className)}
            >
              <AlertTriangle className="w-3 h-3" />
              Breached
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{type === 'response' ? 'Response' : 'Resolution'} SLA breached</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (timeRemaining.isPaused) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn("gap-1 bg-amber-500/10 text-amber-500 border-amber-500/30", className)}
            >
              <Pause className="w-3 h-3" />
              Paused
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>SLA timer paused (waiting on supplier)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Determine urgency level
  const isUrgent = timeRemaining.minutes < 60; // Less than 1 hour
  const isWarning = timeRemaining.minutes < 240; // Less than 4 hours

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={cn(
              "gap-1",
              isUrgent && "bg-red-500/10 text-red-500 border-red-500/30",
              !isUrgent && isWarning && "bg-amber-500/10 text-amber-500 border-amber-500/30",
              !isUrgent && !isWarning && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
              className
            )}
          >
            <Clock className="w-3 h-3" />
            {formatSLACountdown(timeRemaining.minutes)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{type === 'response' ? 'Response' : 'Resolution'} due in {formatSLACountdown(timeRemaining.minutes)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SLACountdownBadge;
