import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Users,
  UserPlus,
  UserCheck,
  LogIn,
  ShoppingCart,
  Car,
  Plane,
  Building2,
  CreditCard,
  Star,
  RefreshCw,
  Utensils
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, subHours } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: "signup" | "trip" | "food_order" | "car_rental" | "flight" | "hotel";
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    user_name?: string;
  };
}

const activityConfig = {
  signup: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "New User",
  },
  trip: {
    icon: Car,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Trip",
  },
  food_order: {
    icon: Utensils,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Food Order",
  },
  car_rental: {
    icon: Car,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Car Rental",
  },
  flight: {
    icon: Plane,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    label: "Flight",
  },
  hotel: {
    icon: Building2,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Hotel",
  },
};

const AdminUserActivity = () => {
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["user-activity"],
    queryFn: async () => {
      const since = subHours(new Date(), 24).toISOString();
      const allActivities: ActivityItem[] = [];

      // Fetch recent trips
      const { data: trips } = await supabase
        .from("trips")
        .select("id, pickup_address, fare_amount, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10);

      trips?.forEach((trip) => {
        allActivities.push({
          id: `trip-${trip.id}`,
          type: "trip",
          description: `Ride to ${trip.pickup_address?.substring(0, 30) || "destination"}`,
          timestamp: new Date(trip.created_at),
          metadata: { amount: trip.fare_amount || 0 },
        });
      });

      // Fetch recent food orders
      const { data: orders } = await supabase
        .from("food_orders")
        .select("id, total_amount, created_at, restaurants(name)")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10);

      orders?.forEach((order) => {
        allActivities.push({
          id: `order-${order.id}`,
          type: "food_order",
          description: `Order from ${(order.restaurants as any)?.name || "restaurant"}`,
          timestamp: new Date(order.created_at),
          metadata: { amount: order.total_amount || 0 },
        });
      });

      // Fetch recent car rentals
      const { data: rentals } = await supabase
        .from("car_rentals")
        .select("id, total_amount, created_at, pickup_location")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5);

      rentals?.forEach((rental) => {
        allActivities.push({
          id: `rental-${rental.id}`,
          type: "car_rental",
          description: `Rental pickup at ${rental.pickup_location?.substring(0, 25) || "location"}`,
          timestamp: new Date(rental.created_at),
          metadata: { amount: rental.total_amount || 0 },
        });
      });

      // Fetch recent hotel bookings
      const { data: hotelBookings } = await supabase
        .from("hotel_bookings")
        .select("id, total_amount, created_at, hotels(name)")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5);

      hotelBookings?.forEach((booking) => {
        allActivities.push({
          id: `hotel-${booking.id}`,
          type: "hotel",
          description: `Booking at ${(booking.hotels as any)?.name || "hotel"}`,
          timestamp: new Date(booking.created_at),
          metadata: { amount: booking.total_amount || 0 },
        });
      });

      // Sort all activities by timestamp
      return allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
    },
    refetchInterval: 60000,
  });

  const recentCount = activities?.length || 0;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              {recentCount} recent
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[380px] pr-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : !activities?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />
              
              <div className="space-y-1">
                {activities.map((activity, index) => {
                  const config = activityConfig[activity.type];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex gap-3 py-2 group"
                    >
                      {/* Timeline Node */}
                      <div className={cn(
                        "relative z-10 p-2 rounded-full shrink-0 transition-transform group-hover:scale-110",
                        config.bg
                      )}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", config.bg, config.color)}>
                            {config.label}
                          </Badge>
                          {activity.metadata?.amount && activity.metadata.amount > 0 && (
                            <span className="text-xs text-green-500 font-medium">
                              ${activity.metadata.amount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {activity.description}
                        </p>
                        
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminUserActivity;
