import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { 
  DollarSign, 
  Car, 
  Utensils, 
  Plane, 
  Building2,
  TrendingUp,
  Wallet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = [
  'hsl(var(--primary))',
  '#f97316',
  '#3b82f6',
  '#f59e0b',
];

const AdminRevenueBreakdown = () => {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ["admin-revenue-breakdown"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [trips, orders, flights, hotels] = await Promise.all([
        supabase.from("trips").select("fare_amount").eq("status", "completed").gte("created_at", monthStart),
        supabase.from("food_orders").select("total_amount").eq("status", "completed").gte("created_at", monthStart),
        supabase.from("flight_bookings").select("total_amount").eq("status", "confirmed").gte("created_at", monthStart),
        supabase.from("hotel_bookings").select("total_amount").eq("status", "confirmed").gte("created_at", monthStart),
      ]);

      const ridesRevenue = (trips.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const foodRevenue = (orders.data || []).reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const flightRevenue = (flights.data || []).reduce((acc, f) => acc + (f.total_amount || 0), 0);
      const hotelRevenue = (hotels.data || []).reduce((acc, h) => acc + (h.total_amount || 0), 0);
      const total = ridesRevenue + foodRevenue + flightRevenue + hotelRevenue;

      return {
        breakdown: [
          { name: 'Rides', value: ridesRevenue, icon: Car, color: 'text-primary', bg: 'bg-primary/10' },
          { name: 'Food', value: foodRevenue, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { name: 'Flights', value: flightRevenue, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { name: 'Hotels', value: hotelRevenue, icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
        total,
        chartData: [
          { name: 'Rides', value: ridesRevenue || 1 },
          { name: 'Food', value: foodRevenue || 1 },
          { name: 'Flights', value: flightRevenue || 1 },
          { name: 'Hotels', value: hotelRevenue || 1 },
        ]
      };
    },
    refetchInterval: 120000,
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-lg font-bold">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Revenue Breakdown
          </CardTitle>
          <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3" />
            This Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[250px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenue?.chartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(revenue?.chartData || []).map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown List */}
          <div className="space-y-3">
            {/* Total */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <p className="text-2xl font-bold">${(revenue?.total || 0).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Individual Services */}
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : (
              revenue?.breakdown.map((item, index) => {
                const Icon = item.icon;
                const percent = revenue.total > 0 ? ((item.value / revenue.total) * 100).toFixed(1) : 0;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className={cn("p-2 rounded-xl", item.bg)}>
                      <Icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.name}</p>
                        <p className="font-bold">${item.value.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mr-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{percent}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRevenueBreakdown;
