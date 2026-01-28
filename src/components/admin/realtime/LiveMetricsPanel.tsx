import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Users, Car, ShoppingBag, Plane, Hotel, 
  TrendingUp, TrendingDown, Zap, Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

export default function LiveMetricsPanel() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { id: "active-users", label: "Active Users", value: 1247, previousValue: 1180, icon: Users, color: "text-primary", category: "users" },
    { id: "online-drivers", label: "Online Drivers", value: 89, previousValue: 85, icon: Car, color: "text-emerald-500", category: "drivers" },
    { id: "active-rides", label: "Active Rides", value: 34, previousValue: 28, icon: Activity, color: "text-cyan-500", category: "rides" },
    { id: "pending-orders", label: "Pending Orders", value: 156, previousValue: 142, icon: ShoppingBag, color: "text-eats", category: "food" },
    { id: "flight-bookings", label: "Today's Flights", value: 23, previousValue: 19, icon: Plane, color: "text-sky-500", category: "flights" },
    { id: "hotel-checkins", label: "Hotel Check-ins", value: 18, previousValue: 21, icon: Hotel, color: "text-amber-500", category: "hotels" },
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const change = Math.floor(Math.random() * 10) - 4;
        const newValue = Math.max(0, metric.value + change);
        return {
          ...metric,
          previousValue: metric.value,
          value: newValue
        };
      }));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getChangeIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-emerald-500", value: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-rose-500", value: `${diff}` };
    return null;
  };

  const serverLoad = 67;
  const apiLatency = 45;
  const successRate = 99.8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Metrics</h3>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"} className="gap-1.5">
          <Wifi className={cn("h-3 w-3", isConnected && "animate-pulse")} />
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const change = getChangeIndicator(metric.value, metric.previousValue);
          return (
            <Card key={metric.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", 
                metric.category === "users" && "from-primary to-teal-400",
                metric.category === "drivers" && "from-emerald-500 to-green-400",
                metric.category === "rides" && "from-cyan-500 to-blue-400",
                metric.category === "food" && "from-eats to-red-400",
                metric.category === "flights" && "from-sky-500 to-blue-400",
                metric.category === "hotels" && "from-amber-500 to-yellow-400"
              )} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50")}>
                      <metric.icon className={cn("h-5 w-5", metric.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums">{metric.value.toLocaleString()}</span>
                        {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                      </div>
                    </div>
                  </div>
                  {change && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", change.color)}>
                      <change.icon className="h-3 w-3" />
                      {change.value}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Server Load</span>
              <span className="text-sm text-muted-foreground">{serverLoad}%</span>
            </div>
            <Progress value={serverLoad} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Healthy capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">API Latency</span>
              <span className="text-sm text-muted-foreground">{apiLatency}ms</span>
            </div>
            <Progress value={100 - (apiLatency / 2)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Excellent response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm text-muted-foreground">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
