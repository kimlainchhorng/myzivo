import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, TrendingUp, TrendingDown, Users, Car, 
  Clock, DollarSign
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";

const cityData = [
  { city: "New York", trips: 45000, revenue: 850000, drivers: 1200, growth: 12.5 },
  { city: "Los Angeles", trips: 38000, revenue: 720000, drivers: 980, growth: 8.2 },
  { city: "Chicago", trips: 28000, revenue: 520000, drivers: 720, growth: 15.3 },
  { city: "Houston", trips: 22000, revenue: 410000, drivers: 580, growth: -2.1 },
  { city: "Miami", trips: 18000, revenue: 340000, drivers: 450, growth: 22.8 },
];

const zoneData = [
  { zone: "Downtown", trips: 12500, avgWait: 3.2, peakHour: "8-9 AM" },
  { zone: "Airport", trips: 8900, avgWait: 5.1, peakHour: "6-7 PM" },
  { zone: "Suburbs North", trips: 6200, avgWait: 7.8, peakHour: "5-6 PM" },
  { zone: "Business District", trips: 9800, avgWait: 4.2, peakHour: "12-1 PM" },
  { zone: "University Area", trips: 4500, avgWait: 5.5, peakHour: "3-4 PM" },
];

const pieData = [
  { name: "New York", value: 35, color: "hsl(var(--primary))" },
  { name: "Los Angeles", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Chicago", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Houston", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Miami", value: 7, color: "hsl(var(--chart-5))" },
];

export default function AdminLocationAnalytics() {
  const totalCities = 45;
  const totalRevenue = 2840000;
  const avgGrowth = 11.3;
  const topPerformer = "Miami";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Location Analytics
          </h2>
          <p className="text-muted-foreground">Performance metrics by city and zone</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cities</p>
                <p className="text-2xl font-bold">{totalCities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Growth</p>
                <p className="text-2xl font-bold">+{avgGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="text-2xl font-bold">{topPerformer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by City</CardTitle>
            <CardDescription>Top 5 cities by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="city" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Distribution</CardTitle>
            <CardDescription>Share of trips by city</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>City Performance</CardTitle>
          <CardDescription>Detailed metrics by city</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cityData.map((city) => (
              <div key={city.city} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{city.city}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Car className="h-3 w-3" />{city.drivers} drivers</span>
                      <span>{city.trips.toLocaleString()} trips</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium text-green-500">${(city.revenue / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                  <Badge className={city.growth >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                    {city.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(city.growth)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zone Performance</CardTitle>
          <CardDescription>Metrics by service zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zoneData.map((zone) => (
              <div key={zone.zone} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="font-medium">{zone.zone}</span>
                <div className="flex items-center gap-6 text-sm">
                  <span>{zone.trips.toLocaleString()} trips</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {zone.avgWait} min avg wait
                  </span>
                  <Badge variant="outline">Peak: {zone.peakHour}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
