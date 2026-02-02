import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DriverPayoutsTabProps {
  driverId: string | undefined;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
  method?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: ArrowRight },
  completed: { label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircle },
};

export const DriverPayoutsTab = ({ driverId }: DriverPayoutsTabProps) => {
  const queryClient = useQueryClient();

  // Fetch available balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['driver-available-balance', driverId],
    queryFn: async () => {
      if (!driverId) return { available: 0, pending: 0 };

      // Get total earnings
      const { data: trips } = await supabase
        .from('trips')
        .select('fare_amount')
        .eq('driver_id', driverId)
        .eq('status', 'completed');

      const { data: orders } = await supabase
        .from('food_orders')
        .select('delivery_fee')
        .eq('driver_id', driverId)
        .eq('status', 'completed');

      const { data: packages } = await supabase
        .from('package_deliveries')
        .select('actual_payout')
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

      const totalEarnings = 
        (trips?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0) +
        (orders?.reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0) +
        (packages?.reduce((sum, p) => sum + (p.actual_payout || 0), 0) || 0);

      // Get total withdrawals
      const { data: withdrawals } = await supabase
        .from('driver_withdrawals')
        .select('amount, status')
        .eq('driver_id', driverId);

      const completedWithdrawals = withdrawals
        ?.filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      const pendingWithdrawals = withdrawals
        ?.filter(w => w.status === 'pending' || w.status === 'processing')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      return {
        available: totalEarnings - completedWithdrawals - pendingWithdrawals,
        pending: pendingWithdrawals,
      };
    },
    enabled: !!driverId,
  });

  // Fetch payout history
  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ['driver-payout-history', driverId],
    queryFn: async () => {
      if (!driverId) return [];

      const { data, error } = await supabase
        .from('driver_withdrawals')
        .select('id, amount, status, created_at, processed_at, method')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Withdrawal[];
    },
    enabled: !!driverId,
  });

  // Request payout mutation
  const requestPayout = useMutation({
    mutationFn: async (amount: number) => {
      if (!driverId) throw new Error('No driver ID');

      const { error } = await supabase
        .from('driver_withdrawals')
        .insert({
          driver_id: driverId,
          amount,
          status: 'pending',
          method: 'bank_transfer',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payout requested!');
      queryClient.invalidateQueries({ queryKey: ['driver-available-balance'] });
      queryClient.invalidateQueries({ queryKey: ['driver-payout-history'] });
    },
    onError: (error: any) => {
      toast.error('Failed to request payout', { description: error.message });
    },
  });

  const isLoading = balanceLoading || payoutsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-12 w-48" />
          </CardContent>
        </Card>
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

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-green-600">
                ${(balance?.available || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </div>

          {(balance?.pending || 0) > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>${balance?.pending.toFixed(2)} pending</span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={(balance?.available || 0) < 10 || requestPayout.isPending}
            onClick={() => requestPayout.mutate(balance?.available || 0)}
          >
            {requestPayout.isPending ? (
              'Requesting...'
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Request Payout
              </>
            )}
          </Button>
          {(balance?.available || 0) < 10 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Minimum payout amount is $10.00
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Payout History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {payouts?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No payouts yet
              </div>
            ) : (
              <div className="divide-y">
                {payouts?.map(payout => {
                  const config = statusConfig[payout.status] || statusConfig.pending;
                  const Icon = config.icon;
                  
                  return (
                    <div key={payout.id} className="p-3 flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payout.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {payout.processed_at && (
                          <p className="text-xs text-muted-foreground">
                            Processed: {format(new Date(payout.processed_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payout.amount.toFixed(2)}</p>
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
