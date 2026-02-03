/**
 * Owner Earnings Dashboard
 * View earnings, payouts, and performance stats
 */

import { Navigate, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Percent,
  Car,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile } from "@/hooks/useCarOwner";
import {
  useOwnerEarningsSummary,
  useOwnerPayoutsList,
  useOwnerEarningsChart,
} from "@/hooks/useOwnerEarningsDashboard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function OwnerEarningsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCarOwnerProfile();
  const { data: summary, isLoading: summaryLoading } = useOwnerEarningsSummary();
  const { data: payouts = [], isLoading: payoutsLoading } = useOwnerPayoutsList();
  const { data: chartData = [], isLoading: chartLoading } = useOwnerEarningsChart();

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading) {
    return (
      <AppLayout title="Earnings">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return <Navigate to="/owner/apply" replace />;
  }

  const earningsChange = summary
    ? ((summary.currentMonthEarnings - summary.lastMonthEarnings) / (summary.lastMonthEarnings || 1)) * 100
    : 0;

  return (
    <AppLayout title="Earnings">
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/owner/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Track your income and payouts</p>
          </div>
        </div>

        {/* Stats Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                </div>
                <p className="text-2xl font-bold">${summary.totalEarnings.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                <p className="text-2xl font-bold">${summary.currentMonthEarnings.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {earningsChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={earningsChange >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {earningsChange >= 0 ? "+" : ""}{earningsChange.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Pending Payouts</span>
                </div>
                <p className="text-2xl font-bold">${summary.pendingPayouts.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                </div>
                <p className="text-2xl font-bold">{summary.occupancyRate}%</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-64" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary))"
                    fill="url(#earningsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No earnings data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        {summary && (
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Commission Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fee Paid</p>
                  <p className="text-xl font-bold text-red-500">
                    -${summary.totalCommissionPaid.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Bookings</p>
                  <p className="text-xl font-bold">{summary.completedBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                  <p className="text-xl font-bold">${summary.averageBookingValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payouts History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No payouts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.slice(0, 10).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        payout.status === "completed" 
                          ? "bg-emerald-100 dark:bg-emerald-900/30" 
                          : "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        {payout.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {payout.vehicle_make} {payout.vehicle_model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payout.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+${payout.amount.toFixed(2)}</p>
                      <Badge
                        variant="secondary"
                        className={payout.status === "completed" ? "bg-emerald-100 text-emerald-700" : ""}
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
