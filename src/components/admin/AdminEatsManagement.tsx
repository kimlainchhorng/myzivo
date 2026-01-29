import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Utensils, Store, ChefHat, Bike, Clock, DollarSign, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Search, Filter, RefreshCw, Eye, Star, Package
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockOrders = [
  { id: "FO001", customer: "Alice W.", restaurant: "Pizza Palace", status: "preparing", items: 3, total: 32.50, driver: "Tom K.", eta: "15 min" },
  { id: "FO002", customer: "Bob R.", restaurant: "Sushi Garden", status: "out_for_delivery", items: 5, total: 67.00, driver: "Lisa M.", eta: "8 min" },
  { id: "FO003", customer: "Carol S.", restaurant: "Burger Barn", status: "pending", items: 2, total: 18.99, driver: null, eta: "Pending" },
];

const mockEatsStats = {
  activeOrders: 234,
  completedToday: 1456,
  avgPrepTime: "18 min",
  avgDeliveryTime: "25 min",
  topRestaurant: "Pizza Palace",
  revenue: 45670,
};

export default function AdminEatsManagement() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      preparing: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      ready: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      out_for_delivery: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      delivered: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-eats/20 to-red-500/10">
            <Utensils className="h-6 w-6 text-eats" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ZIVO Eats Management</h1>
            <p className="text-muted-foreground">Manage food orders, restaurants & delivery</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Active Orders", value: mockEatsStats.activeOrders, icon: Package, color: "text-eats", bg: "bg-eats/10" },
          { label: "Completed Today", value: mockEatsStats.completedToday, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Avg Prep Time", value: mockEatsStats.avgPrepTime, icon: ChefHat, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Delivery", value: mockEatsStats.avgDeliveryTime, icon: Bike, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Top Restaurant", value: mockEatsStats.topRestaurant, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Revenue Today", value: `$${(mockEatsStats.revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-eats data-[state=active]:text-white">
            <Package className="h-4 w-4" />
            Live Orders
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="gap-2">
            <ChefHat className="h-4 w-4" />
            Kitchen Status
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Bike className="h-4 w-4" />
            Delivery Fleet
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders, customers, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-eats" />
                Live Orders
                <Badge variant="outline" className="ml-2 text-eats border-eats/30">
                  {mockOrders.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrders.map((order, i) => (
                  <div 
                    key={order.id}
                    className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-mono text-sm font-bold">{order.id}</p>
                          <Badge variant="outline" className={cn("text-[10px] mt-1", getStatusBadge(order.status))}>
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">Customer</p>
                        </div>
                        <div>
                          <p className="font-medium">{order.restaurant}</p>
                          <p className="text-xs text-muted-foreground">{order.items} items</p>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div>
                          <p className="font-medium">{order.driver || "Unassigned"}</p>
                          <p className="text-xs text-muted-foreground">Driver</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">ETA: {order.eta}</p>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Restaurant management and status overview</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kitchen" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Real-time kitchen preparation status</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bike className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Delivery driver fleet management</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Order issues and complaints</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
