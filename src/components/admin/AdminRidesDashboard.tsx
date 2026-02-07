import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, Users, CheckCircle, XCircle, DollarSign, 
  TrendingUp, Percent, Activity, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeRidesStats } from "@/hooks/useRealtimeRidesStats";

export default function AdminRidesDashboard() {
  const stats = useRealtimeRidesStats();

  const statCards = [
    {
      label: "Rides Today",
      value: stats.totalRidesToday,
      icon: Car,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      description: "Total rides requested",
    },
    {
      label: "Active Now",
      value: stats.activeRides,
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "In progress",
      pulse: stats.activeRides > 0,
    },
    {
      label: "Completed",
      value: stats.completedRides,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      description: "Finished today",
    },
    {
      label: "Cancelled",
      value: stats.cancelledRides,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      description: "Dropped rides",
    },
    {
      label: "Online Drivers",
      value: stats.onlineDrivers,
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      description: "Available now",
      pulse: stats.onlineDrivers > 0,
    },
    {
      label: "Avg Fare",
      value: `$${stats.avgFare.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      description: "Per completed ride",
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
      description: "From paid rides",
      large: true,
    },
    {
      label: "Platform Commission",
      value: `$${stats.platformCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Percent,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "15% of revenue",
      large: true,
    },
  ];

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </Badge>
          <span className="text-sm text-muted-foreground">Real-time dashboard</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        {statCards.slice(0, 6).map((stat, i) => (
          <Card 
            key={i} 
            className={cn(
              "border-0 bg-card/50 backdrop-blur-xl transition-all hover:bg-card/70",
              stat.large && "md:col-span-2"
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center relative",
                  stat.bg
                )}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                  {stat.pulse && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {statCards.slice(6).map((stat, i) => (
          <Card 
            key={i} 
            className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  stat.bg
                )}>
                  <stat.icon className={cn("h-7 w-7", stat.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
