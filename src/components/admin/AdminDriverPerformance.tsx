import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign,
  Award,
  Target,
  ThumbsUp,
  AlertCircle,
  Trophy
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(48, 96%, 53%)", "hsl(262, 83%, 58%)"];

const AdminDriverPerformance = () => {
  // Fetch aggregated performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["admin-driver-performance"],
    queryFn: async () => {
      // Get all drivers with their trip stats
      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("*")
        .eq("status", "verified")
        .order("total_trips", { ascending: false })
        .limit(10);

      if (driversError) throw driversError;

      // Get trip stats for performance calculation
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("driver_id, status, rating, fare_amount, duration_minutes, created_at")
        .in("status", ["completed", "cancelled"])
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (tripsError) throw tripsError;

      // Calculate metrics
      const completedTrips = trips?.filter(t => t.status === "completed") || [];
      const totalTrips = trips?.length || 0;
      const completionRate = totalTrips > 0 ? (completedTrips.length / totalTrips) * 100 : 0;
      const avgRating = completedTrips.length > 0 
        ? completedTrips.reduce((acc, t) => acc + (t.rating || 0), 0) / completedTrips.filter(t => t.rating).length 
        : 0;
      const totalEarnings = completedTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0);

      // Weekly breakdown
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayTrips = completedTrips.filter(t => {
          const tripDate = new Date(t.created_at);
          return tripDate.toDateString() === date.toDateString();
        });
        weeklyData.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          trips: dayTrips.length,
          earnings: dayTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0)
        });
      }

      // Rating distribution
      const ratingDistribution = [
        { rating: "5★", count: completedTrips.filter(t => t.rating === 5).length, fill: COLORS[0] },
        { rating: "4★", count: completedTrips.filter(t => t.rating === 4).length, fill: COLORS[1] },
        { rating: "3★", count: completedTrips.filter(t => t.rating === 3).length, fill: COLORS[2] },
        { rating: "1-2★", count: completedTrips.filter(t => t.rating && t.rating <= 2).length, fill: COLORS[3] },
      ];

      return {
        topDrivers: drivers || [],
        metrics: {
          totalTrips,
          completionRate,
          avgRating: avgRating || 4.5,
          totalEarnings,
          activeDrivers: drivers?.length || 0
        },
        weeklyData,
        ratingDistribution
      };
    },
  });

  const topDrivers = performanceData?.topDrivers || [];
  const metrics = performanceData?.metrics;
  const weeklyData = performanceData?.weeklyData || [];
  const ratingDistribution = performanceData?.ratingDistribution || [];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Trips (30d)</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{metrics?.totalTrips.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{metrics?.completionRate.toFixed(1)}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{metrics?.avgRating.toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">${metrics?.totalEarnings.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Award className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Drivers</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{metrics?.activeDrivers}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              {isLoading ? (
                <Skeleton className="h-48 w-48 rounded-full mx-auto" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {ratingDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span>{item.rating}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Top Performing Drivers</CardTitle>
              <CardDescription>Based on trips completed, ratings, and earnings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
              ))
            ) : topDrivers.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No driver data available</p>
              </div>
            ) : (
              topDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-colors",
                    index === 0 ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20" :
                    index === 1 ? "bg-gradient-to-r from-slate-500/10 to-zinc-500/5 border border-slate-500/20" :
                    index === 2 ? "bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20" :
                    "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <span className={cn(
                      "absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-amber-500 text-white" :
                      index === 1 ? "bg-slate-400 text-white" :
                      index === 2 ? "bg-orange-600 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={driver.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20">
                        {driver.full_name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{driver.full_name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {driver.total_trips || 0} trips
                      </span>
                      {driver.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {Number(driver.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge className={cn(
                      "capitalize",
                      driver.is_online 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}>
                      {driver.is_online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDriverPerformance;
