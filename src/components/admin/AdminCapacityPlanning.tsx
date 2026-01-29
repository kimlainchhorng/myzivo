import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Car, Clock, TrendingUp, AlertTriangle, 
  Calendar, MapPin, BarChart3
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

const demandForecast = [
  { hour: "6AM", predicted: 120, actual: 115, capacity: 150 },
  { hour: "8AM", predicted: 280, actual: 295, capacity: 200 },
  { hour: "10AM", predicted: 180, actual: 175, capacity: 200 },
  { hour: "12PM", predicted: 220, actual: 230, capacity: 200 },
  { hour: "2PM", predicted: 160, actual: 155, capacity: 200 },
  { hour: "4PM", predicted: 200, actual: 210, capacity: 200 },
  { hour: "6PM", predicted: 320, actual: 340, capacity: 250 },
  { hour: "8PM", predicted: 260, actual: 255, capacity: 250 },
  { hour: "10PM", predicted: 180, actual: 170, capacity: 200 },
];

const zoneCapacity = [
  { zone: "Downtown", demand: 450, supply: 380, gap: -70, status: "critical" },
  { zone: "Airport", demand: 280, supply: 320, gap: 40, status: "good" },
  { zone: "Suburbs North", demand: 180, supply: 150, gap: -30, status: "warning" },
  { zone: "Business District", demand: 350, supply: 340, gap: -10, status: "ok" },
  { zone: "University", demand: 120, supply: 140, gap: 20, status: "good" },
];

const weeklyCapacity = [
  { day: "Mon", demand: 12500, supply: 11800 },
  { day: "Tue", demand: 11200, supply: 11500 },
  { day: "Wed", demand: 11800, supply: 11200 },
  { day: "Thu", demand: 12000, supply: 11600 },
  { day: "Fri", demand: 15500, supply: 13200 },
  { day: "Sat", demand: 18200, supply: 14500 },
  { day: "Sun", demand: 14800, supply: 12800 },
];

export default function AdminCapacityPlanning() {
  const currentUtilization = 87;
  const peakGap = -70;
  const avgWaitTime = 4.2;
  const driversNeeded = 45;

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      good: "bg-green-500/10 text-green-500",
      ok: "bg-blue-500/10 text-blue-500",
      warning: "bg-amber-500/10 text-amber-500",
      critical: "bg-red-500/10 text-red-500"
    };
    return <Badge className={config[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Capacity Planning
          </h2>
          <p className="text-muted-foreground">Demand forecasting and supply optimization</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{currentUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Gap</p>
                <p className="text-2xl font-bold">{peakGap}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait</p>
                <p className="text-2xl font-bold">{avgWaitTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Car className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers Needed</p>
                <p className="text-2xl font-bold">+{driversNeeded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Demand Forecast</CardTitle>
          <CardDescription>Predicted vs actual demand with capacity limits</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={demandForecast}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(var(--primary))" fill="url(#demandGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="hsl(var(--chart-2))" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="capacity" name="Capacity" stroke="hsl(var(--destructive))" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zone Capacity Status</CardTitle>
            <CardDescription>Real-time supply/demand by zone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {zoneCapacity.map((zone) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{zone.zone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={zone.gap >= 0 ? "text-green-500" : "text-red-500"}>
                      {zone.gap >= 0 ? "+" : ""}{zone.gap}
                    </span>
                    {getStatusBadge(zone.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Demand: {zone.demand}</span>
                  <span>|</span>
                  <span>Supply: {zone.supply}</span>
                </div>
                <Progress value={(zone.supply / zone.demand) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Demand Pattern</CardTitle>
            <CardDescription>Demand vs supply by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyCapacity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="demand" name="Demand" fill="hsl(var(--primary))" radius={4} />
                <Bar dataKey="supply" name="Supply" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
