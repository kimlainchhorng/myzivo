import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Check, Package } from "lucide-react";

const RestaurantOrders = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const orders = [
    { id: "ORD-001", customer: "John D.", items: "2x Pizza Margherita, 1x Tiramisu", time: "5 min ago", status: "pending", total: "$45.99", address: "123 Main St" },
    { id: "ORD-002", customer: "Sarah M.", items: "1x Pasta Carbonara", time: "12 min ago", status: "preparing", total: "$18.50", address: "456 Oak Ave" },
    { id: "ORD-003", customer: "Mike R.", items: "3x Bruschetta, 2x Gelato", time: "18 min ago", status: "ready", total: "$32.00", address: "789 Pine Rd" },
    { id: "ORD-004", customer: "Emily K.", items: "1x Caesar Salad, 1x Lasagna", time: "25 min ago", status: "completed", total: "$28.00", address: "321 Elm St" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "preparing": return "bg-amber-500/10 text-amber-500";
      case "ready": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return ["pending", "preparing"].includes(order.status);
    if (activeTab === "ready") return order.status === "ready";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage incoming and ongoing orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="ready" className="gap-2">
            <Package className="h-4 w-4" />
            Ready
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Check className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg">{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.items}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.address}</p>
                      <p className="text-xs text-muted-foreground">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{order.total}</p>
                      <div className="flex gap-2 mt-2">
                        {order.status === "pending" && (
                          <Button size="sm" variant="outline">Accept</Button>
                        )}
                        {order.status === "preparing" && (
                          <Button size="sm">Mark Ready</Button>
                        )}
                        {order.status === "ready" && (
                          <Button size="sm" variant="outline">Complete</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders in this category
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantOrders;
