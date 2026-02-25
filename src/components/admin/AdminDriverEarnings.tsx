import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  Wallet,
  Coins,
  Gift,
  Car,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminDriverEarningsProps {
  driverId?: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const AdminDriverEarnings = ({ driverId }: AdminDriverEarningsProps) => {
  const [periodDays, setPeriodDays] = useState(30);

  // Fetch earnings data
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ["admin-driver-earnings", driverId, periodDays],
    queryFn: async () => {
      // Get completed trips with earnings
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("fare_amount, duration_minutes, completed_at, driver_id")
        .eq("status", "completed")
        .gte("completed_at", subDays(new Date(), periodDays).toISOString())
        .order("completed_at", { ascending: true });

      if (tripsError) throw tripsError;

      // Filter by driver if specified
      // Get tips data
      const { data: tipsData } = await supabase
        .from("driver_earnings")
        .select("tip_amount, bonus_amount, driver_id, created_at")
        .gte("created_at", subDays(new Date(), periodDays).toISOString());

      const filteredTrips = driverId 
        ? trips?.filter(t => t.driver_id === driverId)
        : trips;

      // Calculate daily earnings for the last 7 days
      const dailyEarnings = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayTrips = filteredTrips?.filter(t => 
          t.completed_at && 
          new Date(t.completed_at).toDateString() === date.toDateString()
        ) || [];
        
        dailyEarnings.push({
          day: format(date, "EEE"),
          earnings: dayTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0),
          trips: dayTrips.length
        });
      }

      // Calculate weekly totals
      const thisWeekStart = startOfWeek(new Date());
      const thisWeekTrips = filteredTrips?.filter(t => 
        t.completed_at && new Date(t.completed_at) >= thisWeekStart
      ) || [];

      const lastWeekStart = subDays(thisWeekStart, 7);
      const lastWeekTrips = filteredTrips?.filter(t => 
        t.completed_at && 
        new Date(t.completed_at) >= lastWeekStart && 
        new Date(t.completed_at) < thisWeekStart
      ) || [];

      const thisWeekEarnings = thisWeekTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const lastWeekEarnings = lastWeekTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const weeklyChange = lastWeekEarnings > 0 
        ? ((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100 
        : 0;

      // Today's earnings
      const today = new Date().toDateString();
      const todayTrips = filteredTrips?.filter(t => 
        t.completed_at && new Date(t.completed_at).toDateString() === today
      ) || [];
      const todayEarnings = todayTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0);

      // Calculate platform fee (20% average)
      const platformFee = thisWeekEarnings * 0.20;
      const netEarnings = thisWeekEarnings - platformFee;

      // Tips and bonuses
      const filteredTips = driverId 
        ? tipsData?.filter(t => t.driver_id === driverId) 
        : tipsData;
      const totalTips = filteredTips?.reduce((acc, t) => acc + (t.tip_amount || 0), 0) || 0;
      const totalBonuses = filteredTips?.reduce((acc, t) => acc + (t.bonus_amount || 0), 0) || 0;

      // Hourly breakdown for today
      const hourlyBreakdown = [];
      for (let h = 6; h <= 23; h++) {
        const hourTrips = todayTrips.filter(t => {
          const hour = new Date(t.completed_at!).getHours();
          return hour === h;
        });
        hourlyBreakdown.push({
          hour: h > 12 ? `${h - 12}PM` : h === 12 ? "12PM" : `${h}AM`,
          earnings: hourTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0)
        });
      }

      // Earnings breakdown by type
      const earningsBreakdown = [
        { name: "Trip Fares", value: thisWeekEarnings },
        { name: "Tips", value: totalTips },
        { name: "Bonuses", value: totalBonuses },
      ].filter(e => e.value > 0);

      return {
        dailyEarnings,
        hourlyBreakdown,
        earningsBreakdown,
        todayEarnings,
        todayTrips: todayTrips.length,
        thisWeekEarnings,
        lastWeekEarnings,
        weeklyChange,
        platformFee,
        netEarnings,
        totalTips,
        totalBonuses,
        totalTrips: filteredTrips?.length || 0,
        avgPerTrip: (filteredTrips?.length || 0) > 0 
          ? (filteredTrips?.reduce((acc, t) => acc + (t.fare_amount || 0), 0) || 0) / filteredTrips!.length 
          : 0
      };
    },
  });

  const handleExportCSV = () => {
    if (!earningsData) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ["Today's Earnings", `$${earningsData.todayEarnings.toFixed(2)}`],
      ["This Week Earnings", `$${earningsData.thisWeekEarnings.toFixed(2)}`],
      ["Net Earnings", `$${earningsData.netEarnings.toFixed(2)}`],
      ["Platform Fees", `$${earningsData.platformFee.toFixed(2)}`],
      ["Tips", `$${earningsData.totalTips.toFixed(2)}`],
      ["Bonuses", `$${earningsData.totalBonuses.toFixed(2)}`],
      ["Total Trips", earningsData.totalTrips.toString()],
      ["Avg Per Trip", `$${earningsData.avgPerTrip.toFixed(2)}`],
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Earnings report exported");
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Earnings Dashboard</h2>
            <p className="text-sm text-muted-foreground">Track driver earnings and payouts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodDays.toString()} onValueChange={(v) => setPeriodDays(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-500">
                    ${earningsData?.todayEarnings.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {earningsData?.todayTrips || 0} trips completed
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-500">
                    ${earningsData?.thisWeekEarnings.toFixed(2)}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs mt-1">
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    (earningsData?.weeklyChange || 0) >= 0 ? "text-green-500" : "text-red-500"
                  )} />
                  <span className={cn(
                    (earningsData?.weeklyChange || 0) >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {earningsData?.weeklyChange.toFixed(1)}% vs last week
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Earnings</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-violet-500">
                    ${earningsData?.netEarnings.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  After ${earningsData?.platformFee.toFixed(2)} fees
                </p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10">
                <Wallet className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Trip</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-amber-500">
                    ${earningsData?.avgPerTrip.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {earningsData?.totalTrips || 0} total trips
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Car className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Daily Earnings (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData?.dailyEarnings}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Breakdown */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Today's Hourly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData?.hourlyBreakdown}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                    />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Breakdown */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                <Coins className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Week-to-date earnings summary</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Car className="h-4 w-4 text-green-500" />
                  </div>
                  <span>Trip Earnings</span>
                </div>
              <span className="font-semibold text-green-500">
                ${earningsData?.thisWeekEarnings.toFixed(2) || "0.00"}
              </span>
            </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Gift className="h-4 w-4 text-amber-500" />
                  </div>
                  <span>Tips</span>
                </div>
                <span className="font-semibold text-amber-500">
                  ${earningsData?.totalTips.toFixed(2) || "0.00"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Gift className="h-4 w-4 text-violet-500" />
                  </div>
                  <span>Bonuses</span>
                </div>
                <span className="font-semibold text-violet-500">
                  ${earningsData?.totalBonuses.toFixed(2) || "0.00"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </div>
                  <span>Platform Fee (20%)</span>
                </div>
                <span className="font-semibold text-red-500">
                  -${earningsData?.platformFee.toFixed(2) || "0.00"}
                </span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Net Earnings</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  ${earningsData?.netEarnings.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart Distribution */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Earnings Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : earningsData?.earningsBreakdown && earningsData.earningsBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={earningsData.earningsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {earningsData.earningsBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No earnings data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDriverEarnings;
