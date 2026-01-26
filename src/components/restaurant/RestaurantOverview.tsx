import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, DollarSign, Clock, TrendingUp, Package } from "lucide-react";

const RestaurantOverview = () => {
  const stats = [
    { label: "Today's Orders", value: "23", icon: Package, color: "text-eats", trend: "+12%" },
    { label: "Revenue", value: "$1,245", icon: DollarSign, color: "text-green-500", trend: "+8%" },
    { label: "Avg Prep Time", value: "18 min", icon: Clock, color: "text-amber-500", trend: "-2 min" },
    { label: "Rating", value: "4.8", icon: TrendingUp, color: "text-primary", trend: "+0.2" },
  ];

  const recentOrders = [
    { id: "ORD-001", items: "2x Pizza Margherita, 1x Tiramisu", time: "5 min ago", status: "preparing", total: "$45.99" },
    { id: "ORD-002", items: "1x Pasta Carbonara", time: "12 min ago", status: "ready", total: "$18.50" },
    { id: "ORD-003", items: "3x Bruschetta, 2x Gelato", time: "18 min ago", status: "picked_up", total: "$32.00" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing": return "bg-amber-500/10 text-amber-500";
      case "ready": return "bg-green-500/10 text-green-500";
      case "picked_up": return "bg-blue-500/10 text-blue-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">Manage your orders and menu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Orders that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <span className="font-semibold">{order.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Today's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orders Completed</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orders Pending</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-semibold text-red-500">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-semibold">$28.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantOverview;
