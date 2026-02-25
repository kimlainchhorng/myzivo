import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Smartphone,
  TrendingUp,
  DollarSign,
  Settings,
  Plus
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  transactions: number;
  volume: number;
  percentage: number;
  growth: number;
  color: string;
  status: "active" | "limited" | "disabled";
}

const paymentMethods: PaymentMethod[] = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, transactions: 45200, volume: 892000, percentage: 52, growth: 12, color: "#3b82f6", status: "active" },
  { id: "wallet", name: "Digital Wallet", icon: Wallet, transactions: 28500, volume: 485000, percentage: 28, growth: 25, color: "#8b5cf6", status: "active" },
  { id: "cash", name: "Cash", icon: Banknote, transactions: 12800, volume: 198000, percentage: 12, growth: -8, color: "#22c55e", status: "active" },
  { id: "upi", name: "UPI/Bank Transfer", icon: Smartphone, transactions: 8500, volume: 125000, percentage: 8, growth: 45, color: "#f59e0b", status: "active" }
];

const pieData = paymentMethods.map(m => ({ name: m.name, value: m.percentage, color: m.color }));

const AdminPaymentMethods = () => {
  const totalVolume = paymentMethods.reduce((sum, m) => sum + m.volume, 0);
  const totalTransactions = paymentMethods.reduce((sum, m) => sum + m.transactions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Methods
          </h2>
          <p className="text-muted-foreground">Analyze payment method usage and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalVolume / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalTransactions / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
                <p className="text-xs text-muted-foreground">Active Methods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+18%</p>
                <p className="text-xs text-muted-foreground">Digital Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Method Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${method.color}20` }}
                    >
                      <method.icon className="h-4 w-4" style={{ color: method.color }} />
                    </div>
                    <span className="font-medium text-sm">{method.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">${(method.volume / 1000).toFixed(0)}K</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      method.growth >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {method.growth >= 0 ? "+" : ""}{method.growth}%
                    </span>
                  </div>
                </div>
                <Progress value={method.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
