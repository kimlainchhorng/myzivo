import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  MapPin,
  Utensils,
  DollarSign,
  UserPlus,
  Car,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "trip" | "order" | "payment" | "user" | "driver" | "review";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  amount?: number;
  avatarUrl?: string;
  initials?: string;
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "trip":
      return MapPin;
    case "order":
      return Utensils;
    case "payment":
      return DollarSign;
    case "user":
      return UserPlus;
    case "driver":
      return Car;
    case "review":
      return Star;
    default:
      return Activity;
  }
};

const getStatusColor = (status?: ActivityItem["status"]) => {
  switch (status) {
    case "success":
      return "bg-green-500/10 text-green-500";
    case "warning":
      return "bg-amber-500/10 text-amber-500";
    case "error":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-blue-500/10 text-blue-500";
  }
};

const AdminRecentActivity = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const [tripsRes, ordersRes, payoutsRes, driversRes] = await Promise.all([
        supabase
          .from("trips")
          .select("id, status, fare_amount, created_at, pickup_address")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("food_orders")
          .select("id, status, total_amount, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("payouts")
          .select("id, status, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("drivers")
          .select("id, full_name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(3)
      ]);

      const activities: ActivityItem[] = [];

      tripsRes.data?.forEach(trip => {
        activities.push({
          id: trip.id,
          type: "trip",
          title: trip.status === "completed" ? "Trip Completed" : "New Trip Request",
          description: trip.pickup_address.substring(0, 30) + "...",
          timestamp: trip.created_at,
          status: trip.status === "completed" ? "success" : trip.status === "cancelled" ? "error" : "info",
          amount: trip.fare_amount
        });
      });

      ordersRes.data?.forEach(order => {
        activities.push({
          id: order.id,
          type: "order",
          title: order.status === "completed" ? "Order Delivered" : "New Food Order",
          description: `Order #${order.id.slice(0, 8)}`,
          timestamp: order.created_at,
          status: order.status === "completed" ? "success" : "info",
          amount: order.total_amount
        });
      });

      payoutsRes.data?.forEach(payout => {
        activities.push({
          id: payout.id,
          type: "payment",
          title: payout.status === "completed" ? "Payout Completed" : "Payout Requested",
          description: `Payout #${payout.id.slice(0, 8)}`,
          timestamp: payout.created_at,
          status: payout.status === "completed" ? "success" : payout.status === "failed" ? "error" : "warning",
          amount: payout.amount
        });
      });

      driversRes.data?.forEach(driver => {
        activities.push({
          id: driver.id,
          type: "driver",
          title: driver.status === "verified" ? "Driver Verified" : "New Driver Application",
          description: driver.full_name,
          timestamp: driver.created_at,
          status: driver.status === "verified" ? "success" : driver.status === "rejected" ? "error" : "warning",
          initials: driver.full_name.split(" ").map(n => n[0]).join("")
        });
      });

      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    },
    refetchInterval: 30000
  });

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : activities?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities?.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div 
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      getStatusColor(activity.status)
                    )}>
                      {activity.initials ? (
                        <span className="text-sm font-semibold">{activity.initials}</span>
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{activity.title}</p>
                        {activity.amount && (
                          <Badge variant="outline" className="shrink-0">
                            ${activity.amount.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminRecentActivity;
