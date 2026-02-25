/**
 * Admin Car Revenue Overview Page
 * Platform-wide revenue analytics and metrics
 */

import { Navigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Car,
  Users,
  CreditCard,
  PieChart,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePlatformRevenueSummary,
  useTopPerformingCars,
  useRevenueChart,
  useCommissionByCategory,
} from "@/hooks/useAdminRevenue";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
  "hsl(280, 87%, 60%)",
  "hsl(199, 89%, 48%)",
];

export default function CarRevenueOverviewPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: summary, isLoading: summaryLoading } = usePlatformRevenueSummary();
  const { data: topCars = [], isLoading: carsLoading } = useTopPerformingCars(5);
  const { data: chartData = [], isLoading: chartLoading } = useRevenueChart();
  const { data: categoryData = [], isLoading: categoryLoading } = useCommissionByCategory();

  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Revenue Overview | Admin" description="Platform revenue analytics" />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                  Revenue Overview
                </h1>
                <p className="text-muted-foreground">
                  Platform-wide car rental revenue and commission analytics
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          {summaryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Gross Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${summary.totalGrossRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Commission Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${summary.totalCommissionEarned.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Owner Payouts</span>
                  </div>
                  <p className="text-2xl font-bold">${summary.totalOwnerPayouts.toFixed(2)}</p>
                  {summary.pendingPayouts > 0 && (
                    <p className="text-xs text-amber-500">
                      ${summary.pendingPayouts.toFixed(2)} pending
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Bookings</span>
                  </div>
                  <p className="text-2xl font-bold">{summary.completedBookings}</p>
                  <p className="text-xs text-muted-foreground">
                    of {summary.totalBookings} total
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Month Stats */}
          {summary && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xl font-bold">${summary.currentMonthRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Last Month</p>
                  <p className="text-xl font-bold">${summary.lastMonthRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Month-over-Month</p>
                    <p className="text-xl font-bold">
                      {summary.monthOverMonthGrowth >= 0 ? "+" : ""}
                      {summary.monthOverMonthGrowth}%
                    </p>
                  </div>
                  {summary.monthOverMonthGrowth >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <Skeleton className="h-64" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `$${value.toFixed(2)}`,
                          name === "commission" ? "Commission" : "Gross Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="commission"
                        stroke="hsl(var(--primary))"
                        fill="url(#commissionGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No revenue data yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission by Category</CardTitle>
                <CardDescription>Vehicle type breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryLoading ? (
                  <Skeleton className="h-64" />
                ) : categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Commission"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Bar dataKey="commission" radius={[0, 4, 4, 0]}>
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No category data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Cars */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Vehicles</CardTitle>
              <CardDescription>Highest revenue generators</CardDescription>
            </CardHeader>
            <CardContent>
              {carsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : topCars.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No booking data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCars.map((car, index) => (
                    <div
                      key={car.id}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="font-bold text-2xl text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {car.image_url ? (
                          <img
                            src={car.image_url}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Car className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {car.year} {car.make} {car.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{car.owner_name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Bookings</p>
                        <p className="font-bold">{car.total_bookings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-bold">${car.total_revenue.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-bold text-primary">${car.commission_earned.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
