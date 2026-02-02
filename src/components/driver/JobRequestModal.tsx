import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  UtensilsCrossed, 
  Package, 
  MapPin, 
  Navigation, 
  DollarSign,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncomingJob, JobType } from '@/hooks/useJobDispatch';

interface JobRequestModalProps {
  job: IncomingJob | null;
  timeRemaining: number;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const JOB_TIMEOUT_SECONDS = 30;

const jobTypeConfig: Record<JobType, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  ride: {
    icon: Car,
    label: 'Ride',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  eats: {
    icon: UtensilsCrossed,
    label: 'Eats',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  move: {
    icon: Package,
    label: 'Move',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

export const JobRequestModal = ({
  job,
  timeRemaining,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}: JobRequestModalProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (job) {
      setProgress((timeRemaining / JOB_TIMEOUT_SECONDS) * 100);
    }
  }, [timeRemaining, job]);

  if (!job) return null;

  const config = jobTypeConfig[job.type];
  const Icon = config.icon;

  // Calculate circumference for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Dialog open={!!job} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header with Job Type Badge */}
        <div className={cn('p-4 flex items-center justify-between', config.bgColor)}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full bg-background', config.color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="secondary" className={cn('text-sm font-semibold', config.color, config.bgColor)}>
                New {config.label} Request
              </Badge>
              {job.restaurantName && (
                <p className="text-sm text-muted-foreground mt-0.5">{job.restaurantName}</p>
              )}
            </div>
          </div>

          {/* Circular Countdown Timer */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <svg className="absolute transform -rotate-90" width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted-foreground/20"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn(
                  'transition-all duration-1000 ease-linear',
                  timeRemaining <= 10 ? 'text-destructive' : 'text-primary'
                )}
              />
            </svg>
            <span className={cn(
              'text-2xl font-bold',
              timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'
            )}>
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="p-4 space-y-4">
          {/* Pickup Location */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pickup</p>
              <p className="text-sm font-medium truncate">{job.pickup.address}</p>
              <p className="text-xs text-muted-foreground">{job.distanceToPickup.toFixed(1)} mi away</p>
            </div>
          </div>

          {/* Dropoff Location */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <Navigation className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {job.type === 'eats' ? 'Deliver to' : 'Dropoff'}
              </p>
              <p className="text-sm font-medium truncate">{job.dropoff.address}</p>
              {job.customerName && (
                <p className="text-xs text-muted-foreground">{job.customerName}</p>
              )}
            </div>
          </div>

          {/* Package Size for Move */}
          {job.type === 'move' && job.packageSize && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Package: {job.packageSize}</span>
            </div>
          )}

          {/* Estimated Payout */}
          <div className="flex items-center justify-center py-3 bg-muted/50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{job.estimatedPayout.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground ml-1">estimated</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onDecline}
            disabled={isAccepting || isDeclining}
            className="h-14"
          >
            <X className="h-5 w-5 mr-2" />
            Decline
          </Button>
          <Button
            size="lg"
            onClick={onAccept}
            disabled={isAccepting || isDeclining}
            className="h-14 bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? (
              <span className="animate-pulse">Accepting...</span>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Accept
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
