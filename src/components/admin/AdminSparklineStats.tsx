import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Car,
  DollarSign,
  Utensils,
  Plane,
  Building2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineStat {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  sparklineData: number[];
}

const AdminSparklineStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-sparkline-stats"],
    queryFn: async () => {
      // Generate sparkline data (in production, fetch from analytics)
      const generateSparkline = (base: number, variance: number) => 
        Array.from({ length: 7 }, () => base + Math.random() * variance - variance / 2);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [users, drivers, trips, orders] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("drivers").select("id", { count: "exact" }).eq("is_online", true),
        supabase.from("trips").select("fare_amount").gte("created_at", todayStart),
        supabase.from("food_orders").select("total_amount").gte("created_at", todayStart),
      ]);

      const todayRevenue = (trips.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const todayOrders = orders.count || 0;

      return [
        {
          id: "users",
          label: "Total Users",
          value: (users.count || 0).toLocaleString(),
          change: 12.5,
          icon: Users,
          color: "#3b82f6",
          sparklineData: generateSparkline(users.count || 100, 20),
        },
        {
          id: "drivers",
          label: "Online Drivers",
          value: (drivers.count || 0).toLocaleString(),
          change: 8.3,
          icon: Car,
          color: "#22c55e",
          sparklineData: generateSparkline(drivers.count || 50, 15),
        },
        {
          id: "revenue",
          label: "Today's Revenue",
          value: `$${todayRevenue.toLocaleString()}`,
          change: 22.1,
          icon: DollarSign,
          color: "#f59e0b",
          sparklineData: generateSparkline(todayRevenue || 5000, 1000),
        },
        {
          id: "orders",
          label: "Food Orders",
          value: todayOrders.toLocaleString(),
          change: -3.2,
          icon: Utensils,
          color: "#ef4444",
          sparklineData: generateSparkline(todayOrders || 200, 50),
        },
        {
          id: "flights",
          label: "Flight Bookings",
          value: "127",
          change: 15.7,
          icon: Plane,
          color: "#0ea5e9",
          sparklineData: generateSparkline(127, 30),
        },
        {
          id: "hotels",
          label: "Hotel Bookings",
          value: "89",
          change: 5.4,
          icon: Building2,
          color: "#8b5cf6",
          sparklineData: generateSparkline(89, 20),
        },
      ] as SparklineStat[];
    },
    refetchInterval: 60000,
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {isLoading ? (
        [...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))
      ) : (
        stats?.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="p-2 rounded-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: stat.color }} />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-1.5 gap-0.5",
                        isPositive 
                          ? "text-green-500 bg-green-500/10 border-green-500/20" 
                          : "text-red-500 bg-red-500/10 border-red-500/20"
                      )}
                    >
                      {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {Math.abs(stat.change)}%
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                  
                  {/* Sparkline */}
                  <div className="h-8 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stat.sparklineData.map((v, i) => ({ value: v, index: i }))}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={stat.color}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default AdminSparklineStats;
