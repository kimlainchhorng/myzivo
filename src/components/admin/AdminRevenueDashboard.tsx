import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  MoreHorizontal,
  Car,
  Utensils,
  Plane,
  Building2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const revenueData = [
  { date: "Jan", rides: 125000, eats: 85000, flights: 45000, hotels: 35000 },
  { date: "Feb", rides: 132000, eats: 92000, flights: 48000, hotels: 38000 },
  { date: "Mar", rides: 145000, eats: 98000, flights: 52000, hotels: 42000 },
  { date: "Apr", rides: 158000, eats: 105000, flights: 58000, hotels: 45000 },
  { date: "May", rides: 172000, eats: 112000, flights: 62000, hotels: 48000 },
  { date: "Jun", rides: 185000, eats: 118000, flights: 68000, hotels: 52000 },
];

const serviceBreakdown = [
  { name: "Rides", value: 45, color: "hsl(var(--primary))" },
  { name: "Eats", value: 30, color: "#f97316" },
  { name: "Flights", value: 15, color: "#0ea5e9" },
  { name: "Hotels", value: 10, color: "#8b5cf6" },
];

const paymentMethods = [
  { method: "Credit Card", amount: 285000, percentage: 58 },
  { method: "Debit Card", amount: 125000, percentage: 25 },
  { method: "Digital Wallet", amount: 65000, percentage: 13 },
  { method: "Cash", amount: 20000, percentage: 4 },
];

const revenueMetrics = [
  {
    id: "total",
    label: "Total Revenue",
    value: 485250,
    change: 18.5,
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "transactions",
    label: "Transactions",
    value: 28450,
    change: 12.3,
    icon: CreditCard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "avg-order",
    label: "Avg Order Value",
    value: 17.05,
    change: 5.8,
    icon: Wallet,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "recurring",
    label: "Recurring Revenue",
    value: 125000,
    change: 22.1,
    icon: PiggyBank,
    gradient: "from-amber-500 to-orange-500",
  },
];

const AdminRevenueDashboard = () => {
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Revenue Dashboard
          </h2>
          <p className="text-muted-foreground">Financial performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all overflow-hidden">
                <div className={cn("h-1 bg-gradient-to-r", metric.gradient)} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      metric.gradient
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                      isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {metric.id === "transactions" 
                      ? metric.value.toLocaleString()
                      : `$${metric.value.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="ridesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="eatsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="rides" name="Rides" stroke="hsl(var(--primary))" fill="url(#ridesGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="eats" name="Eats" stroke="#f97316" fill="url(#eatsGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="flights" name="Flights" stroke="#0ea5e9" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="hotels" name="Hotels" stroke="#8b5cf6" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Breakdown Pie */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {serviceBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((payment, index) => (
              <motion.div
                key={payment.method}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{payment.method}</span>
                  <Badge variant="secondary">{payment.percentage}%</Badge>
                </div>
                <p className="text-2xl font-bold">${(payment.amount / 1000).toFixed(0)}K</p>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full"
                    style={{ width: `${payment.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevenueDashboard;
