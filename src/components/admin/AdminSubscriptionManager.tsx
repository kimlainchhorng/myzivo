import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Crown, Users, TrendingUp, DollarSign, Search, MoreVertical, 
  Check, X, Clock, RefreshCw, Star, Zap, Shield
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  plan: "basic" | "premium" | "vip";
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: string;
  renewalDate: string;
  amount: number;
  billingCycle: "monthly" | "yearly";
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  subscribers: number;
  revenue: number;
  icon: React.ReactNode;
  color: string;
}

const mockSubscriptions: Subscription[] = [
  { id: "1", customerId: "c1", customerName: "John Smith", customerEmail: "john@example.com", plan: "premium", status: "active", startDate: "2024-01-01", renewalDate: "2024-02-01", amount: 14.99, billingCycle: "monthly" },
  { id: "2", customerId: "c2", customerName: "Sarah Johnson", customerEmail: "sarah@example.com", plan: "vip", status: "active", startDate: "2023-06-15", renewalDate: "2024-06-15", amount: 149.99, billingCycle: "yearly" },
  { id: "3", customerId: "c3", customerName: "Mike Brown", customerEmail: "mike@example.com", plan: "basic", status: "trial", startDate: "2024-01-10", renewalDate: "2024-01-24", amount: 0, billingCycle: "monthly" },
  { id: "4", customerId: "c4", customerName: "Emma Wilson", customerEmail: "emma@example.com", plan: "premium", status: "cancelled", startDate: "2023-11-01", renewalDate: "2024-01-01", amount: 14.99, billingCycle: "monthly" },
  { id: "5", customerId: "c5", customerName: "David Lee", customerEmail: "david@example.com", plan: "vip", status: "expired", startDate: "2023-01-01", renewalDate: "2024-01-01", amount: 149.99, billingCycle: "yearly" },
];

const plans: SubscriptionPlan[] = [
  { 
    id: "basic", 
    name: "Zivo Basic", 
    price: 4.99, 
    billingCycle: "monthly", 
    features: ["Priority support", "No booking fees", "Basic rewards"],
    subscribers: 1250,
    revenue: 6237.50,
    icon: <Star className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "premium", 
    name: "Zivo Premium", 
    price: 14.99, 
    billingCycle: "monthly", 
    features: ["All Basic features", "2x rewards points", "Free cancellations", "Premium vehicles"],
    subscribers: 850,
    revenue: 12741.50,
    icon: <Zap className="h-5 w-5" />,
    color: "from-violet-500 to-purple-500"
  },
  { 
    id: "vip", 
    name: "Zivo VIP", 
    price: 149.99, 
    billingCycle: "yearly", 
    features: ["All Premium features", "Dedicated support", "Airport lounge access", "Exclusive deals", "5x rewards"],
    subscribers: 320,
    revenue: 47996.80,
    icon: <Crown className="h-5 w-5" />,
    color: "from-amber-500 to-orange-500"
  },
];

export default function AdminSubscriptionManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  const totalSubscribers = 2420;
  const mrr = 18979.00;
  const churnRate = 3.2;
  const trialConversion = 68;

  const filteredSubscriptions = subscriptions.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadge = (plan: Subscription["plan"]) => {
    const variants: Record<string, string> = {
      basic: "bg-blue-500/10 text-blue-500",
      premium: "bg-violet-500/10 text-violet-500",
      vip: "bg-amber-500/10 text-amber-500"
    };
    return <Badge className={variants[plan]}><Crown className="h-3 w-3 mr-1" />{plan}</Badge>;
  };

  const getStatusBadge = (status: Subscription["status"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      active: { icon: <Check className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      cancelled: { icon: <X className="h-3 w-3" />, class: "bg-red-500/10 text-red-500" },
      expired: { icon: <Clock className="h-3 w-3" />, class: "bg-muted text-muted-foreground" },
      trial: { icon: <Clock className="h-3 w-3" />, class: "bg-cyan-500/10 text-cyan-500" }
    };
    return (
      <Badge className={config[status].class}>
        {config[status].icon}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            Subscription Manager
          </h2>
          <p className="text-muted-foreground">Manage subscription plans and member benefits</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${mrr.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{churnRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <RefreshCw className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trial Conversion</p>
                <p className="text-2xl font-bold">{trialConversion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Subscribers</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.customerName}</p>
                          <p className="text-sm text-muted-foreground">{sub.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${sub.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{sub.billingCycle}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.renewalDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Change Plan</DropdownMenuItem>
                            <DropdownMenuItem>Extend Trial</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancel Subscription</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color} text-white`}>
                      {plan.icon}
                    </div>
                    <Badge variant="outline">{plan.billingCycle}</Badge>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers</span>
                      <span className="font-medium">{plan.subscribers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium text-green-500">${plan.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={(plan.subscribers / totalSubscribers) * 100} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full">Edit Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
