/**
 * Admin Finance Dashboard
 * Revenue tracking, financial transactions, and reporting
 */
import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  Compass,
  Car,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";
import {
  useRevenueMetrics,
  useOrdersWithRevenue,
  useDailyRevenue,
  useFinancialTransactions,
  exportOrdersToCSV,
} from "@/hooks/useFinanceData";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

type DateRange = "7d" | "30d" | "mtd" | "ytd";

export default function AdminFinanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isExporting, setIsExporting] = useState(false);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "mtd":
        return { start: startOfMonth(now), end: now };
      case "ytd":
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  // Fetch data
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useRevenueMetrics(startStr, endStr);
  const { data: orders, isLoading: ordersLoading } = useOrdersWithRevenue(startStr, endStr, 50);
  const { data: dailyRevenue, isLoading: chartLoading } = useDailyRevenue(dateRange === "7d" ? 7 : 30);
  const { data: transactions } = useFinancialTransactions(20);

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportOrdersToCSV(startStr, endStr);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zivo-finance-${format(start, "yyyy-MM-dd")}-to-${format(end, "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Pie chart data for product breakdown
  const productData = metrics
    ? [
        { name: "Hotels", value: metrics.byProduct.hotel },
        { name: "Activities", value: metrics.byProduct.activity },
        { name: "Transfers", value: metrics.byProduct.transfer },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Revenue tracking and financial reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="mtd">Month to date</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetchMetrics()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metricsLoading ? "..." : (metrics?.netRevenue.toLocaleString() || 0)}
            </div>
            <p className="text-xs text-muted-foreground">After refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metricsLoading ? "..." : (metrics?.totalRevenue.toLocaleString() || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Commission + Markup + Fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : (metrics?.totalOrders || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${metrics?.avgOrderValue.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -${metricsLoading ? "..." : (metrics?.totalRefunds.toLocaleString() || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total refunded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading
                ? "..."
                : metrics && metrics.totalOrders > 0
                ? `${((metrics.netRevenue / (metrics.avgOrderValue * metrics.totalOrders)) * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Revenue / GMV</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartLoading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => format(new Date(d), "MMM d")}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                      labelFormatter={(d) => format(new Date(d), "MMMM d, yyyy")}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="ZIVO Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gmv" name="GMV" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {productData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {productData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm">Hotels</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4" style={{ color: "hsl(var(--chart-2))" }} />
                <span className="text-sm">Activities</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" style={{ color: "hsl(var(--chart-3))" }} />
                <span className="text-sm">Transfers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders with Revenue</CardTitle>
          <CardDescription>Recent orders showing revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">ZIVO Revenue</TableHead>
                  <TableHead className="text-right">Supplier Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders in this period
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.holder_name}</span>
                          <span className="text-xs text-muted-foreground">{order.holder_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${order.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        ${(order.total_zivo_revenue || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${(order.total_supplier_payout || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "confirmed"
                              ? "default"
                              : order.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Transactions</CardTitle>
          <CardDescription>Commission, markup, fees, and refunds</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No transactions recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.created_at), "MMM d, HH:mm")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.type === "refund" ? "destructive" : "outline"}
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.type === "refund" ? "text-destructive" : "text-green-600"
                        }`}
                      >
                        {tx.type === "refund" ? "-" : "+"}${Math.abs(tx.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
