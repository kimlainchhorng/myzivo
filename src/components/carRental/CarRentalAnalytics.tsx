import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CarRentalAnalytics = () => {
  const monthlyData = [
    { month: "Jan", rentals: 45, revenue: 8500 },
    { month: "Feb", rentals: 52, revenue: 9200 },
    { month: "Mar", rentals: 48, revenue: 8800 },
    { month: "Apr", rentals: 65, revenue: 11500 },
    { month: "May", rentals: 72, revenue: 13200 },
    { month: "Jun", rentals: 80, revenue: 14500 },
  ];

  const categoryData = [
    { name: "SUV", value: 35, color: "#22c55e" },
    { name: "Sedan", value: 28, color: "#3b82f6" },
    { name: "Electric", value: 20, color: "#8b5cf6" },
    { name: "Luxury", value: 12, color: "#f59e0b" },
    { name: "Economy", value: 5, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your rental business performance</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue (6mo)</p>
            <p className="text-2xl font-bold">$65,700</p>
            <p className="text-xs text-green-500">+18% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Rentals</p>
            <p className="text-2xl font-bold">362</p>
            <p className="text-xs text-green-500">+22% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Rental Duration</p>
            <p className="text-2xl font-bold">3.2 days</p>
            <p className="text-xs text-muted-foreground">Consistent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Fleet Utilization</p>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-xs text-green-500">+5% vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Rentals and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rentals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rentals by Category</CardTitle>
            <CardDescription>Vehicle category popularity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((item) => (
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

export default CarRentalAnalytics;
