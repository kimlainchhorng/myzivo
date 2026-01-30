import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Building2,
  CreditCard,
  FileText,
  Users,
  TrendingUp,
  Receipt,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plane,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CorporateTravelProps {
  companyName?: string;
  className?: string;
}

interface BookingRequest {
  id: string;
  traveler: string;
  route: string;
  dates: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  department: string;
  priority: 'normal' | 'urgent';
}

const MOCK_REQUESTS: BookingRequest[] = [
  {
    id: 'REQ-001',
    traveler: 'John Smith',
    route: 'NYC → London',
    dates: 'Feb 15-20, 2026',
    amount: 2450,
    status: 'pending',
    department: 'Sales',
    priority: 'urgent'
  },
  {
    id: 'REQ-002',
    traveler: 'Sarah Johnson',
    route: 'LAX → Tokyo',
    dates: 'Mar 1-10, 2026',
    amount: 3200,
    status: 'approved',
    department: 'Engineering',
    priority: 'normal'
  },
  {
    id: 'REQ-003',
    traveler: 'Mike Chen',
    route: 'SFO → Singapore',
    dates: 'Feb 28 - Mar 5, 2026',
    amount: 2800,
    status: 'pending',
    department: 'Marketing',
    priority: 'normal'
  },
];

const EXPENSE_CATEGORIES = [
  { name: 'Flights', amount: 45600, budget: 60000, icon: Plane },
  { name: 'Hotels', amount: 28400, budget: 35000, icon: Building2 },
  { name: 'Ground Transport', amount: 8200, budget: 12000, icon: Receipt },
  { name: 'Meals', amount: 4800, budget: 8000, icon: DollarSign },
];

export const CorporateTravel = ({
  companyName = "Acme Corporation",
  className
}: CorporateTravelProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [selectedPolicy, setSelectedPolicy] = useState("standard");

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'rejected' as const } : r
    ));
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const totalSpent = EXPENSE_CATEGORIES.reduce((acc, cat) => acc + cat.amount, 0);
  const totalBudget = EXPENSE_CATEGORIES.reduce((acc, cat) => acc + cat.budget, 0);

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/40 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Corporate Travel Portal</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{companyName}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  Enterprise
                </Badge>
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse">
              {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0">
            {[
              { value: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { value: 'approvals', icon: CheckCircle2, label: 'Approvals' },
              { value: 'expenses', icon: Receipt, label: 'Expenses' },
              { value: 'policies', icon: Shield, label: 'Policies' },
              { value: 'settings', icon: Settings, label: 'Settings' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="p-4 space-y-4 m-0">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Trips', value: '47', icon: Plane, color: 'sky' },
                { label: 'Active Travelers', value: '23', icon: Users, color: 'violet' },
                { label: 'Month Spend', value: '$87K', icon: DollarSign, color: 'emerald' },
                { label: 'Avg. Savings', value: '18%', icon: TrendingUp, color: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border",
                    `bg-${stat.color}-500/5 border-${stat.color}-500/30`
                  )}
                >
                  <stat.icon className={cn("w-5 h-5 mb-2", `text-${stat.color}-400`)} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Budget Overview */}
            <div className="rounded-xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Monthly Budget Overview</h3>
                <span className="text-sm text-muted-foreground">
                  ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
                </span>
              </div>
              <Progress value={(totalSpent / totalBudget) * 100} className="h-2 mb-4" />
              
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <cat.icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="font-medium">${cat.amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(cat.amount / cat.budget) * 100} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="p-4 space-y-3 m-0">
            {requests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border",
                  request.status === 'pending' && "border-amber-500/30 bg-amber-500/5",
                  request.status === 'approved' && "border-emerald-500/30 bg-emerald-500/5",
                  request.status === 'rejected' && "border-red-500/30 bg-red-500/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{request.traveler}</span>
                      {request.priority === 'urgent' && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.route} • {request.dates}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {request.department}
                      </Badge>
                      <span className="text-sm font-medium">${request.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          className="text-red-400 border-red-500/40 hover:bg-red-500/10"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          Approve
                        </Button>
                      </>
                    ) : (
                      <Badge className={cn(
                        request.status === 'approved' 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/20 text-red-400"
                      )}>
                        {request.status === 'approved' ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Rejected</>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="p-4 space-y-4 m-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Submit Expense Report</h3>
              <Button size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Receipt
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select defaultValue="flight">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="transport">Ground Transport</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Amount</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea 
                placeholder="Describe the expense..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <Button className="w-full">Submit Expense</Button>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="p-4 space-y-4 m-0">
            <div className="space-y-3">
              {[
                { id: 'standard', name: 'Standard Policy', description: 'Economy class, 3-star hotels, $75/day meals', limit: '$5,000' },
                { id: 'executive', name: 'Executive Policy', description: 'Business class, 4-star hotels, $150/day meals', limit: '$15,000' },
                { id: 'unlimited', name: 'C-Suite Policy', description: 'First class, 5-star hotels, unlimited', limit: 'Unlimited' },
              ].map(policy => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    selectedPolicy === policy.id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{policy.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                    </div>
                    <Badge variant="outline">{policy.limit}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-4 space-y-4 m-0">
            <div className="space-y-4">
              {[
                { label: 'Require approval for all bookings', checked: true },
                { label: 'Auto-approve within policy limits', checked: true },
                { label: 'Send expense reminders', checked: false },
                { label: 'Enable carbon offsetting', checked: true },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">{setting.label}</span>
                  <Switch defaultChecked={setting.checked} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CorporateTravel;
