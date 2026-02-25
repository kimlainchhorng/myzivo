import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Car, 
  Building2, 
  Plane,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  category: string;
  name: string;
  icon: React.ElementType;
  total: number;
  available: number;
  reserved: number;
  maintenance: number;
  utilizationRate: number;
  trend: number;
  status: "healthy" | "low" | "critical";
}

const inventoryItems: InventoryItem[] = [
  {
    id: "economy-cars",
    category: "Car Rentals",
    name: "Economy Cars",
    icon: Car,
    total: 150,
    available: 42,
    reserved: 95,
    maintenance: 13,
    utilizationRate: 72,
    trend: 5.2,
    status: "healthy",
  },
  {
    id: "suv",
    category: "Car Rentals",
    name: "SUVs & Crossovers",
    icon: Car,
    total: 80,
    available: 8,
    reserved: 68,
    maintenance: 4,
    utilizationRate: 90,
    trend: 12.5,
    status: "low",
  },
  {
    id: "luxury",
    category: "Car Rentals",
    name: "Luxury Vehicles",
    icon: Car,
    total: 35,
    available: 3,
    reserved: 30,
    maintenance: 2,
    utilizationRate: 94,
    trend: 8.3,
    status: "critical",
  },
  {
    id: "hotel-standard",
    category: "Hotels",
    name: "Standard Rooms",
    icon: Building2,
    total: 500,
    available: 125,
    reserved: 350,
    maintenance: 25,
    utilizationRate: 75,
    trend: -2.1,
    status: "healthy",
  },
  {
    id: "hotel-suites",
    category: "Hotels",
    name: "Suites & Premium",
    icon: Building2,
    total: 120,
    available: 15,
    reserved: 98,
    maintenance: 7,
    utilizationRate: 88,
    trend: 6.8,
    status: "low",
  },
  {
    id: "flight-economy",
    category: "Flights",
    name: "Economy Seats",
    icon: Plane,
    total: 2400,
    available: 820,
    reserved: 1520,
    maintenance: 60,
    utilizationRate: 66,
    trend: 3.5,
    status: "healthy",
  },
  {
    id: "flight-business",
    category: "Flights",
    name: "Business Class",
    icon: Plane,
    total: 480,
    available: 95,
    reserved: 375,
    maintenance: 10,
    utilizationRate: 80,
    trend: 15.2,
    status: "healthy",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "healthy":
      return { color: "text-green-500", bg: "bg-green-500/10", label: "Healthy" };
    case "low":
      return { color: "text-amber-500", bg: "bg-amber-500/10", label: "Low Stock" };
    case "critical":
      return { color: "text-red-500", bg: "bg-red-500/10", label: "Critical" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
  }
};

const AdminInventoryManagement = () => {
  const totalItems = inventoryItems.reduce((sum, i) => sum + i.total, 0);
  const totalAvailable = inventoryItems.reduce((sum, i) => sum + i.available, 0);
  const avgUtilization = Math.round(
    inventoryItems.reduce((sum, i) => sum + i.utilizationRate, 0) / inventoryItems.length
  );
  const criticalCount = inventoryItems.filter(i => i.status === "critical").length;

  const categories = [...new Set(inventoryItems.map(i => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory Management
          </h2>
          <p className="text-muted-foreground">Monitor and manage service inventory levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Inventory</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{totalAvailable.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Available Now</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{avgUtilization}%</p>
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-red-500/10 to-rose-500/5">
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mb-2" />
            <p className="text-2xl font-bold">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Category */}
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {category === "Car Rentals" && <Car className="h-5 w-5 text-indigo-500" />}
            {category === "Hotels" && <Building2 className="h-5 w-5 text-amber-500" />}
            {category === "Flights" && <Plane className="h-5 w-5 text-sky-500" />}
            {category}
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventoryItems
              .filter(i => i.category === category)
              .map((item, index) => {
                const Icon = item.icon;
                const statusConfig = getStatusConfig(item.status);
                const availablePercent = Math.round((item.available / item.total) * 100);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all",
                      item.status === "critical" && "ring-1 ring-red-500/30"
                    )}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusConfig.bg)}>
                              <Icon className={cn("h-5 w-5", statusConfig.color)} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.total} total units</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                          <div className="p-2 rounded-xl bg-green-500/10">
                            <p className="text-lg font-bold text-green-500">{item.available}</p>
                            <p className="text-[10px] text-muted-foreground">Available</p>
                          </div>
                          <div className="p-2 rounded-xl bg-blue-500/10">
                            <p className="text-lg font-bold text-blue-500">{item.reserved}</p>
                            <p className="text-[10px] text-muted-foreground">Reserved</p>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-500/10">
                            <p className="text-lg font-bold text-amber-500">{item.maintenance}</p>
                            <p className="text-[10px] text-muted-foreground">Maintenance</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Utilization</span>
                            <span className="font-medium">{item.utilizationRate}%</span>
                          </div>
                          <Progress value={item.utilizationRate} className="h-2" />
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            item.trend >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {item.trend >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(item.trend)}% vs last week
                          </span>
                          <Button variant="ghost" size="sm">Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminInventoryManagement;
