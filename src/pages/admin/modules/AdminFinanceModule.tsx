/**
 * Admin Finance Module
 * Revenue dashboard with totals, refunds, payables, and CSV export
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Download,
  Calendar,
  Car,
  UtensilsCrossed,
  Users,
  Store,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { useRideRequests } from "@/hooks/useRideRequests";
import { useFoodOrders } from "@/hooks/useEatsOrders";

export default function AdminFinanceModule() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: rideRequests, isLoading: ridesLoading } = useRideRequests("all");
  const { data: foodOrders, isLoading: eatsLoading } = useFoodOrders("all");

  const isLoading = ridesLoading || eatsLoading;

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const startDate = startOfDay(parseISO(dateRange.start));
    const endDate = endOfDay(parseISO(dateRange.end));

    // Filter by date range
    const filteredRides = (rideRequests || []).filter((r) => {
      const date = new Date(r.created_at);
      return date >= startDate && date <= endDate;
    });

    const filteredOrders = (foodOrders || []).filter((o) => {
      const date = new Date(o.created_at);
      return date >= startDate && date <= endDate;
    });

    // Rides metrics - using quoted_total for paid rides
    const paidRides = filteredRides.filter((r) => 
      (r as unknown as { payment_status?: string }).payment_status === "paid"
    );
    const ridesRevenue = paidRides.reduce(
      (sum, r) => sum + ((r as unknown as { quoted_total?: number }).quoted_total || 0),
      0
    );
    const ridesRefunded = filteredRides
      .filter((r) => (r as unknown as { refund_status?: string }).refund_status === "refunded")
      .reduce((sum, r) => sum + ((r as unknown as { quoted_total?: number }).quoted_total || 0), 0);

    // Eats metrics
    const paidOrders = filteredOrders.filter((o) => 
      (o as { payment_status?: string }).payment_status === "paid"
    );
    const eatsRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );
    const eatsRefunded = filteredOrders
      .filter((o) => (o as { refund_status?: string }).refund_status === "refunded")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Payables (simplified: 80% to drivers/restaurants)
    const driverPayable = ridesRevenue * 0.8;
    const restaurantPayable = eatsRevenue * 0.7;

    return {
      totalRevenue: ridesRevenue + eatsRevenue,
      ridesRevenue,
      eatsRevenue,
      totalRefunded: ridesRefunded + eatsRefunded,
      ridesRefunded,
      eatsRefunded,
      netRevenue: ridesRevenue + eatsRevenue - ridesRefunded - eatsRefunded,
      driverPayable,
      restaurantPayable,
      totalPayable: driverPayable + restaurantPayable,
      ridesCount: paidRides.length,
      ordersCount: paidOrders.length,
      platformFee: (ridesRevenue * 0.2) + (eatsRevenue * 0.3),
    };
  }, [rideRequests, foodOrders, dateRange]);

  // Export to CSV
  const exportCSV = () => {
    const headers = [
      "Type",
      "ID",
      "Date",
      "Customer",
      "Amount",
      "Payment Status",
      "Refund Status",
    ];

    const rideRows = (rideRequests || []).map((r) => [
      "Ride",
      r.id,
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
      r.customer_name,
      (r as unknown as { quoted_total?: number }).quoted_total?.toFixed(2) || "0.00",
      (r as unknown as { payment_status?: string }).payment_status || "unpaid",
      (r as unknown as { refund_status?: string }).refund_status || "",
    ]);

    const orderRows = (foodOrders || []).map((o) => {
      const customer = parseCustomerName(o.special_instructions);
      return [
        "Eats",
        o.id,
        format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
        customer,
        (o.total_amount || 0).toFixed(2),
        (o as { payment_status?: string }).payment_status || "unpaid",
        (o as { refund_status?: string }).refund_status || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rideRows.map((row) => row.join(",")),
      ...orderRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zivo-finance-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Revenue, refunds, and payables overview
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-40"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
                    end: format(new Date(), "yyyy-MM-dd"),
                  })
                }
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
                    end: format(new Date(), "yyyy-MM-dd"),
                  })
                }
              >
                Last 30 days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingUp}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          loading={isLoading}
          trend={12.5}
        />
        <StatCard
          label="Total Refunded"
          value={`$${metrics.totalRefunded.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={RefreshCcw}
          color="text-amber-500"
          bg="bg-amber-500/10"
          loading={isLoading}
        />
        <StatCard
          label="Net Revenue"
          value={`$${metrics.netRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          color="text-green-500"
          bg="bg-green-500/10"
          loading={isLoading}
        />
        <StatCard
          label="Platform Fee"
          value={`$${metrics.platformFee.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingUp}
          color="text-violet-500"
          bg="bg-violet-500/10"
          loading={isLoading}
        />
      </div>

      {/* Revenue Breakdown Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rides">Rides</TabsTrigger>
          <TabsTrigger value="eats">Eats</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Rides Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-rides" />
                  ZIVO Rides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Rides</span>
                    <span className="font-bold">{metrics.ridesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-bold text-emerald-500">
                      ${metrics.ridesRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refunded</span>
                    <span className="font-bold text-amber-500">
                      ${metrics.ridesRefunded.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="font-medium">Net</span>
                    <span className="font-bold">
                      ${(metrics.ridesRevenue - metrics.ridesRefunded).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-eats" />
                  ZIVO Eats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Orders</span>
                    <span className="font-bold">{metrics.ordersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-bold text-emerald-500">
                      ${metrics.eatsRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refunded</span>
                    <span className="font-bold text-amber-500">
                      ${metrics.eatsRefunded.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="font-medium">Net</span>
                    <span className="font-bold">
                      ${(metrics.eatsRevenue - metrics.eatsRefunded).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rides" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rides Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <RidesPaymentTable data={rideRequests || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eats Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <EatsPaymentTable data={foodOrders || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Owed to Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-500" />
                  Owed to Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-sky-500">
                    ${metrics.driverPayable.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    80% of rides revenue
                  </p>
                  <Badge variant="outline" className="mt-4">
                    Pending Payout
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Owed to Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-eats" />
                  Owed to Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-eats">
                    ${metrics.restaurantPayable.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    70% of eats revenue
                  </p>
                  <Badge variant="outline" className="mt-4">
                    Pending Payout
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>
                Stripe Connect payouts will be automated in Phase 2.
                <br />
                Current payables are tracked here for manual processing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  loading,
  trend,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  color: string;
  bg: string;
  loading?: boolean;
  trend?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">
              {loading ? "..." : value}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              {trend !== undefined && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {trend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Rides Payment Table
function RidesPaymentTable({ data }: { data: unknown[] }) {
  const paidRides = data.filter(
    (r) => (r as { payment_status?: string }).payment_status === "paid"
  );

  if (paidRides.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No paid rides in this period
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">ID</th>
            <th className="text-left py-2 px-2">Date</th>
            <th className="text-left py-2 px-2">Customer</th>
            <th className="text-right py-2 px-2">Amount</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {paidRides.slice(0, 20).map((r) => {
            const ride = r as {
              id: string;
              created_at: string;
              customer_name: string;
              quoted_total?: number;
              payment_status?: string;
              refund_status?: string;
            };
            return (
              <tr key={ride.id} className="border-b">
                <td className="py-2 px-2 font-mono text-xs">
                  {ride.id.slice(0, 8)}
                </td>
                <td className="py-2 px-2">
                  {format(new Date(ride.created_at), "MMM d, h:mm a")}
                </td>
                <td className="py-2 px-2">{ride.customer_name}</td>
                <td className="py-2 px-2 text-right font-medium">
                  ${(ride.quoted_total || 0).toFixed(2)}
                </td>
                <td className="py-2 px-2 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      ride.refund_status === "refunded"
                        ? "bg-violet-500/10 text-violet-500"
                        : "bg-green-500/10 text-green-500"
                    )}
                  >
                    {ride.refund_status === "refunded" ? "Refunded" : "Paid"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Eats Payment Table
function EatsPaymentTable({ data }: { data: unknown[] }) {
  const paidOrders = data.filter(
    (o) => (o as { payment_status?: string }).payment_status === "paid"
  );

  if (paidOrders.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No paid orders in this period
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">ID</th>
            <th className="text-left py-2 px-2">Date</th>
            <th className="text-left py-2 px-2">Restaurant</th>
            <th className="text-right py-2 px-2">Amount</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {paidOrders.slice(0, 20).map((o) => {
            const order = o as {
              id: string;
              created_at: string;
              restaurants?: { name?: string };
              total_amount?: number;
              payment_status?: string;
              refund_status?: string;
            };
            return (
              <tr key={order.id} className="border-b">
                <td className="py-2 px-2 font-mono text-xs">
                  {order.id.slice(0, 8)}
                </td>
                <td className="py-2 px-2">
                  {format(new Date(order.created_at), "MMM d, h:mm a")}
                </td>
                <td className="py-2 px-2">
                  {order.restaurants?.name || "Unknown"}
                </td>
                <td className="py-2 px-2 text-right font-medium">
                  ${(order.total_amount || 0).toFixed(2)}
                </td>
                <td className="py-2 px-2 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      order.refund_status === "refunded"
                        ? "bg-violet-500/10 text-violet-500"
                        : "bg-green-500/10 text-green-500"
                    )}
                  >
                    {order.refund_status === "refunded" ? "Refunded" : "Paid"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Helper to parse customer name from special_instructions
function parseCustomerName(specialInstructions: string | null): string {
  if (!specialInstructions) return "Unknown";
  try {
    const match = specialInstructions.match(/Customer Info: ({.*})/);
    if (match) {
      const info = JSON.parse(match[1]);
      return info.customer_name || "Unknown";
    }
  } catch {
    // ignore
  }
  return "Unknown";
}
