import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Snowflake, 
  Zap,
  Crown,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subWeeks, subMonths } from "date-fns";

interface UserSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  trend: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const AdminUserSegments = () => {
  const { data: segmentData, isLoading } = useQuery({
    queryKey: ['admin-user-segments'],
    queryFn: async () => {
      const now = new Date();
      const weekAgo = subWeeks(now, 1);
      const monthAgo = subMonths(now, 1);
      const sevenDaysAgo = subDays(now, 7);
      const thirtyDaysAgo = subDays(now, 30);
      const twoWeeksAgo = subWeeks(now, 2);

      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Get all trips with rider activity
      const { data: trips } = await supabase
        .from('trips')
        .select('rider_id, created_at')
        .gte('created_at', subMonths(now, 2).toISOString());

      // Get all food orders with customer activity
      const { data: foodOrders } = await supabase
        .from('food_orders')
        .select('customer_id, created_at')
        .gte('created_at', subMonths(now, 2).toISOString());

      const totalUsers = profiles?.length || 0;
      
      // Calculate activity per user in the last week
      const weeklyActivity: Record<string, number> = {};
      const monthlyActivity: Record<string, number> = {};
      const lastWeekActivity: Record<string, number> = {};
      
      trips?.forEach(trip => {
        const userId = trip.rider_id;
        if (!userId) return;
        
        const tripDate = new Date(trip.created_at);
        if (tripDate >= weekAgo) {
          weeklyActivity[userId] = (weeklyActivity[userId] || 0) + 1;
        }
        if (tripDate >= monthAgo) {
          monthlyActivity[userId] = (monthlyActivity[userId] || 0) + 1;
        }
        if (tripDate >= twoWeeksAgo && tripDate < weekAgo) {
          lastWeekActivity[userId] = (lastWeekActivity[userId] || 0) + 1;
        }
      });

      foodOrders?.forEach(order => {
        const userId = order.customer_id;
        if (!userId) return;
        
        const orderDate = new Date(order.created_at);
        if (orderDate >= weekAgo) {
          weeklyActivity[userId] = (weeklyActivity[userId] || 0) + 1;
        }
        if (orderDate >= monthAgo) {
          monthlyActivity[userId] = (monthlyActivity[userId] || 0) + 1;
        }
        if (orderDate >= twoWeeksAgo && orderDate < weekAgo) {
          lastWeekActivity[userId] = (lastWeekActivity[userId] || 0) + 1;
        }
      });

      // Categorize users
      let powerUsers = 0;
      let activeUsers = 0;
      let occasionalUsers = 0;
      let dormantUsers = 0;
      let newUsers = 0;

      // Previous period counts for trend calculation
      let prevPowerUsers = 0;
      let prevActiveUsers = 0;

      profiles?.forEach(profile => {
        const userId = profile.id;
        const createdAt = new Date(profile.created_at);
        const weekly = weeklyActivity[userId] || 0;
        const monthly = monthlyActivity[userId] || 0;
        const lastWeek = lastWeekActivity[userId] || 0;

        // New users (joined in last 7 days)
        if (createdAt >= sevenDaysAgo) {
          newUsers++;
          return;
        }

        // Power users: 10+ activities per week
        if (weekly >= 10) {
          powerUsers++;
        } else if (weekly >= 2) {
          // Active users: 2-9 per week
          activeUsers++;
        } else if (monthly >= 1) {
          // Occasional users: 1-4 per month
          occasionalUsers++;
        } else {
          // Dormant: no activity in 30+ days
          dormantUsers++;
        }

        // Calculate previous week segments for trend
        if (lastWeek >= 10) {
          prevPowerUsers++;
        } else if (lastWeek >= 2) {
          prevActiveUsers++;
        }
      });

      // Calculate trends (percentage change)
      const powerTrend = prevPowerUsers > 0 ? ((powerUsers - prevPowerUsers) / prevPowerUsers) * 100 : 0;
      const activeTrend = prevActiveUsers > 0 ? ((activeUsers - prevActiveUsers) / prevActiveUsers) * 100 : 0;

      return {
        totalUsers,
        segments: [
          {
            id: "power",
            name: "Power Users",
            description: "10+ rides/orders per week",
            count: powerUsers,
            percentage: totalUsers > 0 ? (powerUsers / totalUsers) * 100 : 0,
            trend: Math.round(powerTrend * 10) / 10,
            icon: Zap,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
          {
            id: "active",
            name: "Active Users",
            description: "2-9 rides/orders per week",
            count: activeUsers,
            percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
            trend: Math.round(activeTrend * 10) / 10,
            icon: Flame,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            id: "occasional",
            name: "Occasional Users",
            description: "1-4 rides/orders per month",
            count: occasionalUsers,
            percentage: totalUsers > 0 ? (occasionalUsers / totalUsers) * 100 : 0,
            trend: 0,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            id: "dormant",
            name: "Dormant Users",
            description: "No activity in 30+ days",
            count: dormantUsers,
            percentage: totalUsers > 0 ? (dormantUsers / totalUsers) * 100 : 0,
            trend: 0,
            icon: Snowflake,
            color: "text-slate-500",
            bgColor: "bg-slate-500/10",
          },
          {
            id: "new",
            name: "New Users",
            description: "Joined in last 7 days",
            count: newUsers,
            percentage: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
            trend: 0,
            icon: Clock,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
          },
        ] as UserSegment[]
      };
    },
    staleTime: 60000,
  });

  const segments = segmentData?.segments || [];
  const totalUsers = segmentData?.totalUsers || 0;

  // Calculate engagement summary
  const highlyEngaged = segments.filter(s => s.id === 'power' || s.id === 'active')
    .reduce((sum, s) => sum + s.percentage, 0);
  const moderate = segments.find(s => s.id === 'occasional')?.percentage || 0;
  const atRisk = segments.filter(s => s.id === 'dormant')
    .reduce((sum, s) => sum + s.percentage, 0);

  if (isLoading) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            User Segments
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {totalUsers.toLocaleString()} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            
            return (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    segment.bgColor
                  )}>
                    <Icon className={cn("h-5 w-5", segment.color)} />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{segment.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {segment.count.toLocaleString()}
                        </span>
                        {segment.trend !== 0 && (
                          <span className={cn(
                            "flex items-center gap-0.5 text-xs font-medium",
                            segment.trend >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {segment.trend >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(segment.trend)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {segment.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={segment.percentage} 
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground w-10 text-right">
                        {segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Engagement Summary */}
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-green-500/5">
            <p className="text-lg font-bold text-green-500">{highlyEngaged.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">Highly Engaged</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/5">
            <p className="text-lg font-bold text-blue-500">{moderate.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">Moderate</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-500/5">
            <p className="text-lg font-bold text-slate-500">{atRisk.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserSegments;
