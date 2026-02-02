import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  Car, 
  UtensilsCrossed, 
  Package,
  Calendar,
  Clock
} from 'lucide-react';
import { useDriverEarnings } from '@/hooks/useDriverEarnings';
import { format, formatDistanceToNow } from 'date-fns';

interface DriverEarningsTabProps {
  driverId: string | undefined;
}

const jobTypeConfig = {
  ride: { icon: Car, label: 'Ride', color: 'text-blue-600 bg-blue-100' },
  eats: { icon: UtensilsCrossed, label: 'Eats', color: 'text-orange-600 bg-orange-100' },
  move: { icon: Package, label: 'Move', color: 'text-purple-600 bg-purple-100' },
};

export const DriverEarningsTab = ({ driverId }: DriverEarningsTabProps) => {
  const { data: earnings, isLoading } = useDriverEarnings(driverId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!earnings) return null;

  const { today, week, month, tripsByType, completedJobs } = earnings;

  return (
    <div className="space-y-4">
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Today</p>
            <p className="text-2xl font-bold text-green-600">${today.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">This Week</p>
            <p className="text-2xl font-bold text-green-600">${week.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">This Month</p>
            <p className="text-2xl font-bold text-green-600">${month.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Type Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Jobs by Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{tripsByType.ride} rides</span>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-orange-600" />
              <span className="text-sm">{tripsByType.eats} deliveries</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm">{tripsByType.move} packages</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Jobs List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {completedJobs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No completed jobs yet
              </div>
            ) : (
              <div className="divide-y">
                {completedJobs.map(job => {
                  const config = jobTypeConfig[job.type];
                  const Icon = config.icon;
                  
                  return (
                    <div key={job.id} className="p-3 flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {job.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-sm truncate text-muted-foreground">
                          {job.pickupAddress} → {job.dropoffAddress}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.date), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${job.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
