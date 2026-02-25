import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign,
  Utensils,
  CheckCircle,
  AlertTriangle,
  Flame
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KPI {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
}

const AdminKPITracker = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();

      const [trips, drivers, orders, revenue] = await Promise.all([
        supabase.from("trips").select("id", { count: "exact" }).eq("status", "completed").gte("created_at", monthStart),
        supabase.from("drivers").select("id", { count: "exact" }).eq("status", "verified"),
        supabase.from("food_orders").select("id", { count: "exact" }).eq("status", "completed").gte("created_at", monthStart),
        supabase.from("trips").select("fare_amount").eq("status", "completed").gte("created_at", monthStart),
      ]);

      const totalRevenue = (revenue.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);

      return [
        {
          id: "trips",
          label: "Monthly Trips",
          current: trips.count || 0,
          target: 5000,
          unit: "trips",
          icon: Car,
          color: "text-primary",
          trend: "up" as const,
          trendValue: "+12%",
        },
        {
          id: "drivers",
          label: "Active Drivers",
          current: drivers.count || 0,
          target: 500,
          unit: "drivers",
          icon: Users,
          color: "text-green-500",
          trend: "up" as const,
          trendValue: "+8%",
        },
        {
          id: "orders",
          label: "Food Orders",
          current: orders.count || 0,
          target: 3000,
          unit: "orders",
          icon: Utensils,
          color: "text-orange-500",
          trend: "up" as const,
          trendValue: "+15%",
        },
        {
          id: "revenue",
          label: "Monthly Revenue",
          current: totalRevenue,
          target: 100000,
          unit: "$",
          icon: DollarSign,
          color: "text-emerald-500",
          trend: "up" as const,
          trendValue: "+22%",
        },
      ] as KPI[];
    },
    refetchInterval: 60000,
  });

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-green-500";
    if (percent >= 75) return "bg-primary";
    if (percent >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusIcon = (percent: number) => {
    if (percent >= 100) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (percent >= 75) return <Flame className="h-4 w-4 text-primary" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            KPI Tracker
          </CardTitle>
          <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3" />
            This Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : (
          kpis?.map((kpi, index) => {
            const percent = Math.min((kpi.current / kpi.target) * 100, 100);
            const Icon = kpi.icon;
            
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-muted/50", kpi.color.replace("text-", "bg-") + "/10")}>
                      <Icon className={cn("h-4 w-4", kpi.color)} />
                    </div>
                    <div>
                      <p className="font-medium">{kpi.label}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {kpi.unit === "$" ? `$${kpi.current.toLocaleString()}` : kpi.current.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-muted-foreground">
                          {kpi.unit === "$" ? `$${kpi.target.toLocaleString()}` : `${kpi.target.toLocaleString()} ${kpi.unit}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(percent)}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        kpi.trend === "up" ? "text-green-500 bg-green-500/10 border-green-500/20" : 
                        kpi.trend === "down" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                        "text-muted-foreground"
                      )}
                    >
                      {kpi.trendValue}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={cn("h-full rounded-full", getProgressColor(percent))}
                    />
                  </div>
                  <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AdminKPITracker;
