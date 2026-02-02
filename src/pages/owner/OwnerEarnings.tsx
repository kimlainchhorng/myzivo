/**
 * Owner Earnings Page
 * Earnings breakdown and payout history for car owners
 */

import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, CreditCard, ChevronRight, Wallet } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOwnerEarnings, useOwnerPayouts } from "@/hooks/useOwnerData";
import { format, parseISO } from "date-fns";

export default function OwnerEarnings() {
  const navigate = useNavigate();
  const { data: earnings, isLoading: earningsLoading } = useOwnerEarnings();
  const { data: payouts, isLoading: payoutsLoading } = useOwnerPayouts();

  const isLoading = earningsLoading || payoutsLoading;

  // Calculate totals
  const totalEarnings = earnings?.reduce((sum, e) => sum + (e.owner_payout || 0), 0) || 0;
  const pendingEarnings = earnings?.filter(e => e.status === "pending" || e.status === "confirmed")
    .reduce((sum, e) => sum + (e.owner_payout || 0), 0) || 0;
  const paidEarnings = earnings?.filter(e => e.status === "completed")
    .reduce((sum, e) => sum + (e.owner_payout || 0), 0) || 0;

  const platformCommission = earnings?.reduce((sum, e) => sum + (e.platform_fee || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Earnings | ZIVO Owner"
        description="View your earnings and payout history"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/owner/dashboard")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-semibold">Earnings</h1>
            </div>
            <Button onClick={() => navigate("/owner/payouts")} variant="outline" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              Payouts
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-16" /> : `$${totalEarnings.toFixed(0)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-16" /> : `$${pendingEarnings.toFixed(0)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-16" /> : `$${paidEarnings.toFixed(0)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Paid Out</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-7 w-8" /> : earnings?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Platform Commission</h3>
                <p className="text-sm text-muted-foreground">20% of each booking</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${platformCommission.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : earnings && earnings.length > 0 ? (
              <div className="divide-y">
                {earnings.slice(0, 10).map((earning) => (
                  <div key={earning.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium">Booking #{earning.booking_id?.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.created_at && format(parseISO(earning.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        +${earning.owner_payout?.toFixed(2)}
                      </p>
                      <Badge variant={earning.status === "completed" ? "outline" : "secondary"} className="text-xs">
                        {earning.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No earnings yet</p>
                <p className="text-sm text-muted-foreground">Complete your first booking to start earning</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Payouts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/owner/payouts" className="gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : payouts && payouts.length > 0 ? (
              <div className="divide-y">
                {payouts.slice(0, 5).map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium">${payout.amount?.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payout.created_at && format(parseISO(payout.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={payout.status === "completed" ? "default" : "secondary"}>
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No payouts yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
