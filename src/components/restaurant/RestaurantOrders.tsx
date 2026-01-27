import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Check, Package, Sparkles, MapPin, Phone, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RestaurantOrders = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const orders = [
    { id: "ORD-001", customer: "John D.", items: "2x Pizza Margherita, 1x Tiramisu", time: "5 min ago", status: "pending", total: "$45.99", address: "123 Main St", phone: "+1 234 5678" },
    { id: "ORD-002", customer: "Sarah M.", items: "1x Pasta Carbonara", time: "12 min ago", status: "preparing", total: "$18.50", address: "456 Oak Ave", phone: "+1 345 6789" },
    { id: "ORD-003", customer: "Mike R.", items: "3x Bruschetta, 2x Gelato", time: "18 min ago", status: "ready", total: "$32.00", address: "789 Pine Rd", phone: "+1 456 7890" },
    { id: "ORD-004", customer: "Emily K.", items: "1x Caesar Salad, 1x Lasagna", time: "25 min ago", status: "completed", total: "$28.00", address: "321 Elm St", phone: "+1 567 8901" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", dot: "bg-yellow-500", gradient: "from-yellow-500 to-amber-500" };
      case "preparing": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-500" };
      case "ready": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-600" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground", gradient: "from-muted to-muted" };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return ["pending", "preparing"].includes(order.status);
    if (activeTab === "ready") return order.status === "ready";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-eats" />
          Orders
        </h1>
        <p className="text-muted-foreground">Manage incoming and ongoing orders</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 backdrop-blur-xl border border-border/50 p-1">
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="ready" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              Ready
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">1</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Check className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <motion.div key={order.id} variants={item}>
                      <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${statusConfig.gradient}`} />
                        <CardContent className="p-5 pl-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                                <ChefHat className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-lg">{order.id}</span>
                                  <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${order.status === 'preparing' ? 'animate-pulse' : ''}`} />
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="font-medium">{order.customer}</p>
                                <p className="text-sm text-muted-foreground">{order.items}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {order.address}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {order.phone}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xl">{order.total}</p>
                              <div className="flex gap-2 mt-3">
                                {order.status === "pending" && (
                                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl">
                                    Accept
                                  </Button>
                                )}
                                {order.status === "preparing" && (
                                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl">
                                    Mark Ready
                                  </Button>
                                )}
                                {order.status === "ready" && (
                                  <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto mb-4">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">No orders in this category</p>
                    <p className="text-sm text-muted-foreground">Orders will appear here when received</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RestaurantOrders;
