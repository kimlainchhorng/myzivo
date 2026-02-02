/**
 * Owner Payouts Page
 * View earnings summary and payout history
 */

import { format, parseISO } from "date-fns";
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, Wallet, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCarOwnerProfile } from "@/hooks/useCarOwner";
import { useOwnerEarnings, useOwnerPayouts, getPayoutStatusBadge } from "@/hooks/useP2PPayment";
import { formatPrice } from "@/lib/currency";
import { Link } from "react-router-dom";

export default function OwnerPayouts() {
  const { data: ownerProfile, isLoading: profileLoading } = useCarOwnerProfile();
  const { data: earnings, isLoading: earningsLoading } = useOwnerEarnings(ownerProfile?.id);
  const { data: payouts, isLoading: payoutsLoading } = useOwnerPayouts(ownerProfile?.id);

  const isLoading = profileLoading || earningsLoading || payoutsLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Earnings & Payouts | ZIVO Owner Dashboard"
        description="View your earnings, pending payouts, and payout history"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Earnings & Payouts</h1>
            <p className="text-muted-foreground">
              Track your earnings from vehicle rentals and view payout history
            </p>
          </div>

          {/* Earnings Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings?.totalEarnings || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      From {earnings?.completedBookings || 0} completed trips
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      This Month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(earnings?.monthlyEarnings || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current month earnings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Payout
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatPrice(earnings?.pendingAmount || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Awaiting processing
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Total Paid Out
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings?.totalPaid || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Successfully transferred
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Bank Account Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Payout Account
              </CardTitle>
              <CardDescription>
                Your connected bank account for receiving payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownerProfile?.stripe_account_id ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Stripe Connect Account</p>
                    <p className="text-sm text-muted-foreground">
                      Account ID: {ownerProfile.stripe_account_id.slice(0, 10)}...
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No payout account connected. Contact support to set up payouts.
                  </p>
                  <Button variant="outline" disabled>
                    Connect Bank Account (Coming Soon)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Payout History
              </CardTitle>
              <CardDescription>
                Your past and pending payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payoutsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : !payouts || payouts.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">No payouts yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your first rental to start earning!
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/owner/cars">
                      View Your Vehicles
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payouts.map((payout) => {
                    const statusBadge = getPayoutStatusBadge(payout.status);
                    return (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">
                            {formatPrice(payout.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(payout.created_at!), "MMM d, yyyy")}
                            {payout.processed_at && (
                              <> • Paid {format(parseISO(payout.processed_at), "MMM d, yyyy")}</>
                            )}
                          </p>
                        </div>
                        <Badge className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Payouts Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  1. When a renter completes a trip, the payment is captured.
                </p>
                <p>
                  2. After a 24-48 hour hold period, your earnings become available.
                </p>
                <p>
                  3. Payouts are processed weekly on Wednesdays.
                </p>
                <p>
                  4. Funds arrive in your bank account within 2-3 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  ZIVO charges a 15% commission on each completed rental.
                </p>
                <p>
                  This covers payment processing, insurance support, and platform maintenance.
                </p>
                <p>
                  Renters pay a separate service fee - you receive 85% of the rental amount.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
