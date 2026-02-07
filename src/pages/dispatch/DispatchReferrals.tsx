/**
 * Dispatch Referrals Management Page
 * View and manage customer & driver referrals
 */

import { useState } from 'react';
import { 
  Gift, Users, UserCheck, DollarSign, Clock, 
  CheckCircle, AlertCircle, TrendingUp, Car
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useDispatchReferrals } from '@/hooks/useDispatchReferrals';

export default function DispatchReferrals() {
  const { 
    customerReferrals, 
    driverReferrals, 
    isLoading, 
    customerStats, 
    driverStats,
    creditReferral 
  } = useDispatchReferrals();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'credited':
        return <Badge className="bg-green-500">Credited</Badge>;
      case 'qualified':
        return <Badge className="bg-blue-500">Qualified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">Manage customer and driver referral programs</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.pending} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Car className="h-4 w-4" />
              Driver Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {driverStats.pending} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Customer Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${customerStats.totalCredits.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {customerStats.credited} credited
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Driver Bonuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${driverStats.totalBonuses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {driverStats.credited} credited
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customer Referrals
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Car className="h-4 w-4" />
            Driver Referrals
          </TabsTrigger>
        </TabsList>

        {/* Customer Referrals Tab */}
        <TabsContent value="customers" className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading referrals...
              </CardContent>
            </Card>
          ) : customerReferrals?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Gift className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No customer referrals yet</p>
              </CardContent>
            </Card>
          ) : (
            customerReferrals?.map(referral => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-medium bg-muted px-2 py-1 rounded">
                          {referral.referral_code}
                        </code>
                        {getStatusBadge(referral.status)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Referrer:</span>{' '}
                          {referral.referrer_email || referral.referrer_id.slice(0, 8)}...
                        </p>
                        <p>
                          <span className="text-muted-foreground">Referee:</span>{' '}
                          {referral.referee_email || referral.referee_id.slice(0, 8)}...
                        </p>
                        <p className="text-muted-foreground">
                          Created: {format(new Date(referral.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {referral.first_booking_at && (
                          <p className="text-green-600">
                            First booking: {referral.first_booking_service} on{' '}
                            {format(new Date(referral.first_booking_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rewards</p>
                        <p className="font-medium">
                          Referrer: ${referral.referrer_credit_amount || 5}
                        </p>
                        <p className="font-medium">
                          Referee: ${referral.referee_credit_amount || 5}
                        </p>
                      </div>
                      {referral.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => creditReferral.mutate(referral.id)}
                          disabled={creditReferral.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Credit Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Driver Referrals Tab */}
        <TabsContent value="drivers" className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading referrals...
              </CardContent>
            </Card>
          ) : driverReferrals?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Car className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No driver referrals yet</p>
              </CardContent>
            </Card>
          ) : (
            driverReferrals?.map(referral => {
              const progress = referral.required_orders > 0 
                ? ((referral.completed_orders || referral.trips_completed || 0) / referral.required_orders) * 100 
                : 0;
              const completedOrders = referral.completed_orders || referral.trips_completed || 0;
              
              return (
                <Card key={referral.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">
                            {referral.referee_name || referral.referee_email || 'Driver'}
                          </span>
                          {getStatusBadge(referral.status)}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Referred by driver #{referral.referrer_id?.slice(0, 8) || referral.referrer_driver_id?.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Signed up: {referral.signed_up_at 
                              ? format(new Date(referral.signed_up_at), 'MMM d, yyyy') 
                              : format(new Date(referral.created_at), 'MMM d, yyyy')}
                          </p>
                          
                          {/* Progress bar */}
                          {referral.status === 'pending' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Orders Progress</span>
                                <span>{completedOrders} / {referral.required_orders}</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Bonus</p>
                          <p className="text-xl font-bold text-green-600">
                            ${referral.reward_amount || referral.bonus_earned || 50}
                          </p>
                        </div>
                        {referral.status === 'credited' && referral.credited_at && (
                          <p className="text-xs text-green-600">
                            Credited {format(new Date(referral.credited_at), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
