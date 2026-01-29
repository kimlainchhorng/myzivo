import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  LayoutDashboard, 
  TrendingUp,
  Users,
  Car,
  Utensils,
  DollarSign,
  Activity,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AdminQuickStats from "./AdminQuickStats";
import AdminRealtimeAlerts from "./AdminRealtimeAlerts";

interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  change: number;
  icon: React.ElementType;
  gradient: string;
}

const widgets: DashboardWidget[] = [
  {
    id: "revenue",
    title: "Today's Revenue",
    value: "$48,250",
    subtitle: "vs $41,800 yesterday",
    change: 15.4,
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "trips",
    title: "Active Trips",
    value: 142,
    subtitle: "128 completed today",
    change: 8.2,
    icon: Car,
    gradient: "from-primary to-teal-500",
  },
  {
    id: "orders",
    title: "Food Orders",
    value: 89,
    subtitle: "67 in preparation",
    change: 12.5,
    icon: Utensils,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "users",
    title: "Active Users",
    value: "2.8K",
    subtitle: "1.2K new today",
    change: 22.1,
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
  },
];

const quickActions = [
  { label: "View Live Map", icon: Activity },
  { label: "Process Payouts", icon: DollarSign },
  { label: "Review Drivers", icon: Car },
  { label: "Check Alerts", icon: AlertTriangle },
];

const AdminExecutiveDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Executive Dashboard
          </h2>
          <p className="text-muted-foreground">High-level platform overview</p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} variant="outline" size="sm" className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          
          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all overflow-hidden group">
                <div className={cn("h-1 bg-gradient-to-r transition-all group-hover:h-2", widget.gradient)} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                      widget.gradient
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                      <ArrowUpRight className="h-4 w-4" />
                      {widget.change}%
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{widget.value}</p>
                  <p className="text-sm text-muted-foreground">{widget.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{widget.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <AdminQuickStats />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Health */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "API Uptime", value: 99.99, status: "healthy" },
              { label: "Database Health", value: 98.5, status: "healthy" },
              { label: "Payment Gateway", value: 100, status: "healthy" },
              { label: "Maps Service", value: 95.2, status: "warning" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {item.status === "healthy" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <Progress 
                  value={item.value} 
                  className={cn(
                    "h-2",
                    item.status === "warning" && "[&>div]:bg-amber-500"
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Alerts */}
        <AdminRealtimeAlerts />
      </div>

      {/* Performance Summary */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-teal-500/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Avg Rating", value: "4.87", icon: Star },
              { label: "Completion Rate", value: "97.2%", icon: CheckCircle2 },
              { label: "Avg Wait Time", value: "4.2m", icon: Clock },
              { label: "Customer Satisfaction", value: "94%", icon: Users },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExecutiveDashboard;
