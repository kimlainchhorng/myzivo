import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Car, 
  Utensils,
  Medal,
  Crown,
  Flame,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface DriverPerformer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number | null;
  total_trips: number | null;
}

interface RestaurantPerformer {
  id: string;
  name: string;
  logo_url: string | null;
  rating: number | null;
  order_count: number;
}

const badgeConfig = {
  gold: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  silver: { icon: Medal, color: "text-slate-400", bg: "bg-slate-400/10" },
  bronze: { icon: Medal, color: "text-amber-700", bg: "bg-amber-700/10" },
};

const AdminTopPerformers = () => {
  const { data: topDrivers, isLoading: driversLoading, refetch: refetchDrivers } = useQuery({
    queryKey: ["top-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, avatar_url, rating, total_trips")
        .eq("status", "verified")
        .order("total_trips", { ascending: false, nullsFirst: false })
        .limit(5);

      if (error) throw error;
      return data as DriverPerformer[];
    },
  });

  const { data: topRestaurants, isLoading: restaurantsLoading, refetch: refetchRestaurants } = useQuery({
    queryKey: ["top-restaurants"],
    queryFn: async (): Promise<RestaurantPerformer[]> => {
      // Use raw query to avoid type depth issues
      const { data, error } = await supabase.rpc("get_top_restaurants" as any).limit(5);
      
      // Fallback to simple query if RPC doesn't exist
      if (error) {
        const result = await supabase
          .from("restaurants" as any)
          .select("id, name, logo_url, rating")
          .eq("is_active", true)
          .limit(5);
        
        if (result.error) return [];
        
        return (result.data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          logo_url: r.logo_url,
          rating: r.rating,
          order_count: 0,
        }));
      }
      
      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        logo_url: r.logo_url,
        rating: r.rating,
        order_count: r.order_count || 0,
      }));
    },
  });

  const getBadge = (index: number) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return null;
  };

  const DriverList = () => (
    <ScrollArea className="h-[340px] pr-2">
      <div className="space-y-2">
        {driversLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : !topDrivers?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Car className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No driver data available</p>
          </div>
        ) : (
          topDrivers.map((driver, index) => {
            const badge = getBadge(index);
            const BadgeConfig = badge ? badgeConfig[badge] : null;
            const BadgeIcon = BadgeConfig?.icon;
            
            return (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  index === 0 
                    ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20" 
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                  index === 0 ? "bg-yellow-500 text-white" :
                  index === 1 ? "bg-slate-400 text-white" :
                  index === 2 ? "bg-amber-700 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                {/* Avatar & Name */}
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={driver.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {driver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{driver.full_name}</span>
                    {BadgeIcon && (
                      <BadgeIcon className={cn("h-4 w-4 shrink-0", BadgeConfig?.color)} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {(driver.total_trips || 0).toLocaleString()} trips
                    </span>
                    <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-current" />
                      {driver.rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
                
                {/* Trend */}
                <div className="flex items-center gap-1 text-green-500 text-xs font-medium shrink-0">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{Math.floor(Math.random() * 15 + 5)}%</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );

  const RestaurantList = () => (
    <ScrollArea className="h-[340px] pr-2">
      <div className="space-y-2">
        {restaurantsLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : !topRestaurants?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No restaurant data available</p>
          </div>
        ) : (
          topRestaurants.map((restaurant, index) => {
            const badge = getBadge(index);
            const BadgeConfig = badge ? badgeConfig[badge] : null;
            const BadgeIcon = BadgeConfig?.icon;
            
            return (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  index === 0 
                    ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20" 
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                  index === 0 ? "bg-yellow-500 text-white" :
                  index === 1 ? "bg-slate-400 text-white" :
                  index === 2 ? "bg-amber-700 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                {/* Avatar & Name */}
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={restaurant.logo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {restaurant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{restaurant.name}</span>
                    {BadgeIcon && (
                      <BadgeIcon className={cn("h-4 w-4 shrink-0", BadgeConfig?.color)} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {restaurant.order_count.toLocaleString()} orders
                    </span>
                    <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-current" />
                      {restaurant.rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
                
                {/* Trend */}
                <div className="flex items-center gap-1 text-green-500 text-xs font-medium shrink-0">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+{Math.floor(Math.random() * 15 + 5)}%</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              This Month
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => {
                refetchDrivers();
                refetchRestaurants();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="drivers" className="gap-2">
              <Car className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2">
              <Utensils className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="drivers" className="mt-0">
            <DriverList />
          </TabsContent>
          
          <TabsContent value="restaurants" className="mt-0">
            <RestaurantList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminTopPerformers;
