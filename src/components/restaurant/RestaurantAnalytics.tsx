import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const RestaurantAnalytics = () => {
  const dailyOrders = [
    { day: "Mon", orders: 45, revenue: 1250 },
    { day: "Tue", orders: 52, revenue: 1420 },
    { day: "Wed", orders: 38, revenue: 980 },
    { day: "Thu", orders: 65, revenue: 1780 },
    { day: "Fri", orders: 78, revenue: 2100 },
    { day: "Sat", orders: 92, revenue: 2450 },
    { day: "Sun", orders: 68, revenue: 1850 },
  ];

  const categoryBreakdown = [
    { name: "Pizza", value: 35, color: "#22c55e" },
    { name: "Pasta", value: 28, color: "#3b82f6" },
    { name: "Desserts", value: 18, color: "#f59e0b" },
    { name: "Appetizers", value: 12, color: "#8b5cf6" },
    { name: "Drinks", value: 7, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your restaurant performance</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">$11,830</p>
            <p className="text-xs text-green-500">+15% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold">438</p>
            <p className="text-xs text-green-500">+8% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold">$27.00</p>
            <p className="text-xs text-green-500">+3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rating</p>
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-xs text-green-500">+0.1 from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Orders & Revenue</CardTitle>
            <CardDescription>Orders and revenue trend this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Sales by menu category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;
