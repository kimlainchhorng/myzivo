import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  TrendingUp,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface ReconciliationItem {
  id: string;
  date: string;
  channel: "stripe" | "paypal" | "bank" | "cash";
  expectedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: "matched" | "discrepancy" | "pending";
  transactionCount: number;
}

interface DailyReconciliation {
  date: string;
  revenue: number;
  payouts: number;
  fees: number;
  net: number;
  status: "reconciled" | "pending" | "issue";
}

const mockReconciliationItems: ReconciliationItem[] = [
  {
    id: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    channel: "stripe",
    expectedAmount: 45280.50,
    actualAmount: 45280.50,
    variance: 0,
    variancePercent: 0,
    status: "matched",
    transactionCount: 1245,
  },
  {
    id: "2",
    date: format(new Date(), "yyyy-MM-dd"),
    channel: "paypal",
    expectedAmount: 12450.00,
    actualAmount: 12448.75,
    variance: -1.25,
    variancePercent: -0.01,
    status: "discrepancy",
    transactionCount: 342,
  },
  {
    id: "3",
    date: format(new Date(), "yyyy-MM-dd"),
    channel: "cash",
    expectedAmount: 8920.00,
    actualAmount: 8750.00,
    variance: -170.00,
    variancePercent: -1.9,
    status: "discrepancy",
    transactionCount: 156,
  },
  {
    id: "4",
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    channel: "stripe",
    expectedAmount: 52100.00,
    actualAmount: 52100.00,
    variance: 0,
    variancePercent: 0,
    status: "matched",
    transactionCount: 1389,
  },
];

const mockDailyReconciliation: DailyReconciliation[] = Array.from({ length: 7 }, (_, i) => ({
  date: format(subDays(new Date(), i), "yyyy-MM-dd"),
  revenue: 65000 + Math.random() * 15000,
  payouts: 45000 + Math.random() * 10000,
  fees: 3500 + Math.random() * 1000,
  net: 16500 + Math.random() * 4000,
  status: i === 0 ? "pending" : Math.random() > 0.1 ? "reconciled" : "issue",
}));

const channelConfig = {
  stripe: { icon: CreditCard, color: "text-violet-500", bg: "bg-violet-500/10", label: "Stripe" },
  paypal: { icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10", label: "PayPal" },
  bank: { icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Bank Transfer" },
  cash: { icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10", label: "Cash" },
};

const statusConfig = {
  matched: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle, label: "Matched" },
  discrepancy: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle, label: "Discrepancy" },
  pending: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Clock, label: "Pending" },
  reconciled: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle, label: "Reconciled" },
  issue: { color: "text-red-500", bg: "bg-red-500/10", icon: XCircle, label: "Issue" },
};

const AdminRevenueReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);

  const stats = {
    totalExpected: mockReconciliationItems.reduce((sum, item) => sum + item.expectedAmount, 0),
    totalActual: mockReconciliationItems.reduce((sum, item) => sum + item.actualAmount, 0),
    matchedCount: mockReconciliationItems.filter(i => i.status === "matched").length,
    discrepancyCount: mockReconciliationItems.filter(i => i.status === "discrepancy").length,
    totalVariance: mockReconciliationItems.reduce((sum, item) => sum + item.variance, 0),
  };

  const matchRate = (stats.matchedCount / mockReconciliationItems.length) * 100;

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => setIsReconciling(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expected Revenue</p>
                <p className="text-xl font-bold text-emerald-500">${stats.totalExpected.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Actual Received</p>
                <p className="text-xl font-bold text-blue-500">${stats.totalActual.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Variance</p>
                <p className={cn("text-xl font-bold", stats.totalVariance < 0 ? "text-red-500" : "text-green-500")}>
                  {stats.totalVariance < 0 ? "-" : "+"}${Math.abs(stats.totalVariance).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Scale className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Match Rate</p>
                <p className="text-xl font-bold text-violet-500">{matchRate.toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <FileCheck className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <Progress value={matchRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-card/50">
            <TabsTrigger value="channels" className="gap-2">
              <CreditCard className="h-4 w-4" />
              By Channel
            </TabsTrigger>
            <TabsTrigger value="daily" className="gap-2">
              <Clock className="h-4 w-4" />
              Daily Summary
            </TabsTrigger>
          </TabsList>

          <Button 
            onClick={handleReconcile} 
            disabled={isReconciling}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isReconciling && "animate-spin")} />
            {isReconciling ? "Reconciling..." : "Run Reconciliation"}
          </Button>
        </div>

        <TabsContent value="channels" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Channel Reconciliation
              </CardTitle>
              <CardDescription>Compare expected vs actual amounts by payment channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {mockReconciliationItems.map((item, index) => {
                    const channel = channelConfig[item.channel];
                    const status = statusConfig[item.status];
                    const ChannelIcon = channel.icon;
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all",
                          item.status === "discrepancy" && "border-amber-500/30"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2.5 rounded-xl", channel.bg)}>
                            <ChannelIcon className={cn("h-5 w-5", channel.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{channel.label}</span>
                              <Badge className={cn("text-[10px] h-5", status.bg, status.color, "border-transparent gap-1")}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.date} • {item.transactionCount.toLocaleString()} transactions
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-xs text-muted-foreground">Expected</p>
                                <p className="font-semibold">${item.expectedAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Actual</p>
                                <p className="font-semibold">${item.actualAmount.toLocaleString()}</p>
                              </div>
                              <div className="min-w-[80px]">
                                <p className="text-xs text-muted-foreground">Variance</p>
                                <div className={cn(
                                  "flex items-center gap-1 font-semibold",
                                  item.variance === 0 ? "text-green-500" : item.variance < 0 ? "text-red-500" : "text-amber-500"
                                )}>
                                  {item.variance !== 0 && (
                                    item.variance > 0 ? 
                                      <ArrowUpRight className="h-3 w-3" /> : 
                                      <ArrowDownRight className="h-3 w-3" />
                                  )}
                                  {item.variance === 0 ? "$0.00" : `$${Math.abs(item.variance).toLocaleString()}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Daily Financial Summary
              </CardTitle>
              <CardDescription>Revenue, payouts, and net income by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {mockDailyReconciliation.map((day, index) => {
                    const status = statusConfig[day.status];
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-center min-w-[50px]">
                              <p className="text-lg font-bold">{format(new Date(day.date), "dd")}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(day.date), "MMM")}</p>
                            </div>
                            <Badge className={cn("text-[10px] h-5 gap-1", status.bg, status.color, "border-transparent")}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-8 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <p className="font-semibold text-green-500">+${day.revenue.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Payouts</p>
                              <p className="font-semibold text-red-500">-${day.payouts.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Fees</p>
                              <p className="font-semibold text-muted-foreground">${day.fees.toLocaleString()}</p>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <p className="text-xs text-muted-foreground">Net Income</p>
                              <p className="font-bold text-primary">${day.net.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRevenueReconciliation;
