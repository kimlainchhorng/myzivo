import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Repeat,
  Heart,
  ShoppingBag,
  Clock
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const segmentData = [
  { name: "Power Users", value: 15, color: "hsl(var(--primary))", description: "10+ orders/month" },
  { name: "Regular", value: 35, color: "hsl(217, 91%, 60%)", description: "4-9 orders/month" },
  { name: "Occasional", value: 30, color: "hsl(263, 70%, 50%)", description: "1-3 orders/month" },
  { name: "New", value: 12, color: "hsl(142, 71%, 45%)", description: "First month" },
  { name: "Dormant", value: 8, color: "hsl(38, 92%, 50%)", description: "No activity 30+ days" },
];

const retentionData = [
  { month: "Month 1", rate: 100 },
  { month: "Month 2", rate: 72 },
  { month: "Month 3", rate: 58 },
  { month: "Month 4", rate: 48 },
  { month: "Month 5", rate: 42 },
  { month: "Month 6", rate: 38 },
];

const behaviorMetrics = [
  { label: "Avg. Order Value", value: "$32.50", change: "+5.2%", icon: ShoppingBag, positive: true },
  { label: "Repeat Rate", value: "68%", change: "+3.1%", icon: Repeat, positive: true },
  { label: "Avg. Session Time", value: "4.2 min", change: "-0.5%", icon: Clock, positive: false },
  { label: "Loyalty Score", value: "7.8/10", change: "+0.3", icon: Heart, positive: true },
];

const AdminCustomerInsights = () => {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Customer Insights
          </CardTitle>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            +2.4K This Week
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="segments" className="text-xs">Segments</TabsTrigger>
            <TabsTrigger value="retention" className="text-xs">Retention</TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
          </TabsList>
          
          <TabsContent value="segments" className="mt-0">
            <div className="flex gap-4">
              {/* Pie Chart */}
              <div className="w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex-1 space-y-2">
                {segmentData.map((segment, index) => (
                  <motion.div
                    key={segment.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-medium">{segment.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{segment.description}</span>
                      <span className="font-semibold">{segment.value}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="retention" className="mt-0">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="month" width={60} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, "Retention"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="rate" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Customer retention over 6 months
            </p>
          </TabsContent>
          
          <TabsContent value="behavior" className="mt-0">
            <div className="grid grid-cols-2 gap-3">
              {behaviorMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold">{metric.value}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        metric.positive ? "text-green-500" : "text-red-500"
                      )}>
                        {metric.change}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminCustomerInsights;
