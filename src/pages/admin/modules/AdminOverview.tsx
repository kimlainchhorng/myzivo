/**
 * Admin Dashboard Overview
 * Summary cards, stats, activity feed
 */
import { 
  Car, UtensilsCrossed, MousePointerClick, TrendingUp, Users, Store, 
  Clock, DollarSign, MapPin, ExternalLink, Activity, ArrowUp, ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRideRequests } from "@/hooks/useRideRequests";
import { useFoodOrders } from "@/hooks/useEatsOrders";
import { useDrivers } from "@/hooks/useDrivers";
import { useClickStats } from "@/hooks/useClickStats";
import { cn } from "@/lib/utils";
import { format, subDays, isAfter } from "date-fns";

export default function AdminOverview() {
  const { data: rideRequests, isLoading: ridesLoading } = useRideRequests("all");
  const { data: foodOrders, isLoading: eatsLoading } = useFoodOrders("all");
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const { data: clickStats, isLoading: clicksLoading } = useClickStats();

  const isLoading = ridesLoading || eatsLoading || driversLoading || clicksLoading;

  // Calculate stats
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);

  const ridesStats = {
    today: rideRequests?.filter(r => 
      new Date(r.created_at).toDateString() === today.toDateString()
    ).length ?? 0,
    week: rideRequests?.filter(r => 
      isAfter(new Date(r.created_at), sevenDaysAgo)
    ).length ?? 0,
    new: rideRequests?.filter(r => r.status === "new").length ?? 0,
  };

  const eatsStats = {
    today: foodOrders?.filter(o => 
      new Date(o.created_at).toDateString() === today.toDateString()
    ).length ?? 0,
    week: foodOrders?.filter(o => 
      isAfter(new Date(o.created_at), sevenDaysAgo)
    ).length ?? 0,
    pending: foodOrders?.filter(o => o.status === "pending").length ?? 0,
  };

  const activeDrivers = drivers?.filter(d => d.is_online).length ?? 0;
  const verifiedDrivers = drivers?.filter(d => d.status === "verified").length ?? 0;

  // Get recent activity (combine rides + eats)
  const recentActivity = [
    ...(rideRequests?.slice(0, 5).map(r => ({
      id: r.id,
      type: "ride" as const,
      title: `New ride request from ${r.customer_name}`,
      subtitle: `${r.pickup_address} → ${r.dropoff_address}`,
      time: r.created_at,
      status: r.status,
    })) || []),
    ...(foodOrders?.slice(0, 5).map(o => ({
      id: o.id,
      type: "eats" as const,
      title: `Food order #${o.id.slice(0, 8)}`,
      subtitle: (o.restaurants as { name?: string })?.name || "Restaurant",
      time: o.created_at,
      status: o.status,
    })) || []),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  // Top cities (mock for now - would come from analytics)
  const topCities = [
    { name: "New York", rides: 45, eats: 32 },
    { name: "Los Angeles", rides: 38, eats: 28 },
    { name: "Chicago", rides: 22, eats: 18 },
    { name: "Miami", rides: 18, eats: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rides Today/Week */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              {ridesStats.new > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {ridesStats.new} New
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{isLoading ? "..." : ridesStats.today}</p>
            <p className="text-xs text-muted-foreground">Rides Today</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>{ridesStats.week} this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Eats Today/Week */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-eats/10 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-eats" />
              </div>
              {eatsStats.pending > 0 && (
                <Badge className="text-[10px] bg-amber-500">
                  {eatsStats.pending} Pending
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{isLoading ? "..." : eatsStats.today}</p>
            <p className="text-xs text-muted-foreground">Eats Orders Today</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>{eatsStats.week} this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{isLoading ? "..." : activeDrivers}</p>
            <p className="text-xs text-muted-foreground">Active Drivers</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>{verifiedDrivers} verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Clicks - Now with real data */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-violet-500" />
              </div>
              {clickStats && clickStats.today > 0 && (
                <Badge className="text-[10px] bg-violet-500">
                  +{clickStats.today} today
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{isLoading ? "..." : (clickStats?.today ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Clicks Today</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>{clickStats?.week ?? 0} this week</span>
              {clickStats?.byPartner?.[0] && (
                <span className="ml-2 text-violet-400">
                  Top: {clickStats.byPartner[0].partner}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        activity.type === "ride" ? "bg-primary/10" : "bg-eats/10"
                      )}>
                        {activity.type === "ride" ? (
                          <Car className="w-4 h-4 text-primary" />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4 text-eats" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant="outline" className="text-[10px] mb-1">
                          {activity.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(activity.time), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-4 h-4 text-primary" />
              Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCities.map((city, i) => (
                <div key={city.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm">{city.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{city.rides} rides</span>
                    <span>•</span>
                    <span>{city.eats} eats</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
