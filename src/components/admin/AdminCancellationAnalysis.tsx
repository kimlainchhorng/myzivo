import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  XCircle, 
  TrendingDown, 
  Clock, 
  User,
  Car,
  DollarSign,
  PieChart,
  BarChart3
} from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const cancellationReasons = [
  { name: "Driver took too long", value: 35, color: "#ef4444" },
  { name: "Changed plans", value: 25, color: "#f59e0b" },
  { name: "Found alternative", value: 18, color: "#3b82f6" },
  { name: "Price too high", value: 12, color: "#8b5cf6" },
  { name: "Other", value: 10, color: "#6b7280" }
];

const weeklyData = [
  { day: "Mon", rider: 45, driver: 12, auto: 5 },
  { day: "Tue", rider: 52, driver: 15, auto: 8 },
  { day: "Wed", rider: 38, driver: 10, auto: 4 },
  { day: "Thu", rider: 48, driver: 18, auto: 6 },
  { day: "Fri", rider: 65, driver: 22, auto: 10 },
  { day: "Sat", rider: 58, driver: 20, auto: 8 },
  { day: "Sun", rider: 42, driver: 14, auto: 6 }
];

const AdminCancellationAnalysis = () => {
  const totalCancellations = weeklyData.reduce((sum, d) => sum + d.rider + d.driver + d.auto, 0);
  const riderCancellations = weeklyData.reduce((sum, d) => sum + d.rider, 0);
  const driverCancellations = weeklyData.reduce((sum, d) => sum + d.driver, 0);
  const revenueLost = totalCancellations * 15; // Estimated avg ride value

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            Cancellation Analysis
          </h2>
          <p className="text-muted-foreground">Understand and reduce cancellation rates</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          This Week
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-red-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCancellations}</p>
                <p className="text-xs text-muted-foreground">Total Cancellations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riderCancellations}</p>
                <p className="text-xs text-muted-foreground">By Riders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Car className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{driverCancellations}</p>
                <p className="text-xs text-muted-foreground">By Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(revenueLost / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Est. Revenue Lost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Cancellation Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={cancellationReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {cancellationReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="rider" stackId="a" fill="#3b82f6" name="Rider" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="driver" stackId="a" fill="#f59e0b" name="Driver" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="auto" stackId="a" fill="#6b7280" name="Auto" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            High-Cancellation Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { pattern: "Peak Hours (5-7 PM)", rate: "18%", impact: "High", reason: "Long wait times" },
              { pattern: "Airport Pickups", rate: "12%", impact: "Medium", reason: "Flight delays" },
              { pattern: "Weekend Nights", rate: "15%", impact: "High", reason: "Price surge complaints" }
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-muted/20">
                <h4 className="font-semibold mb-2">{item.pattern}</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Cancellation Rate</span>
                  <span className="font-bold text-red-500">{item.rate}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Impact</span>
                  <Badge variant={item.impact === "High" ? "destructive" : "secondary"}>{item.impact}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Primary reason: {item.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCancellationAnalysis;
