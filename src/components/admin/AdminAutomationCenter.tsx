import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  Plus,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Mail,
  Bell,
  DollarSign,
  Users,
  MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused" | "draft";
  executions: number;
  lastRun?: Date;
  successRate: number;
  category: "notifications" | "payments" | "operations" | "marketing";
}

const automationRules: AutomationRule[] = [
  {
    id: "1",
    name: "New User Welcome",
    trigger: "User signs up",
    action: "Send welcome email + promo code",
    status: "active",
    executions: 1250,
    lastRun: new Date(Date.now() - 5 * 60000),
    successRate: 99.2,
    category: "notifications",
  },
  {
    id: "2",
    name: "Driver Weekly Payout",
    trigger: "Every Sunday 11PM",
    action: "Process driver earnings payout",
    status: "active",
    executions: 52,
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60000),
    successRate: 100,
    category: "payments",
  },
  {
    id: "3",
    name: "Low Rating Alert",
    trigger: "Driver rating < 4.0",
    action: "Notify admin + flag account",
    status: "active",
    executions: 45,
    lastRun: new Date(Date.now() - 2 * 60 * 60000),
    successRate: 100,
    category: "operations",
  },
  {
    id: "4",
    name: "Surge Zone Notification",
    trigger: "Demand exceeds supply by 50%",
    action: "Notify nearby drivers",
    status: "active",
    executions: 328,
    lastRun: new Date(Date.now() - 15 * 60000),
    successRate: 97.5,
    category: "operations",
  },
  {
    id: "5",
    name: "Inactive User Re-engagement",
    trigger: "User inactive for 30 days",
    action: "Send re-engagement email + 20% discount",
    status: "paused",
    executions: 890,
    successRate: 85.3,
    category: "marketing",
  },
  {
    id: "6",
    name: "Document Expiry Warning",
    trigger: "Document expires in 7 days",
    action: "Notify driver + admin",
    status: "active",
    executions: 156,
    lastRun: new Date(Date.now() - 1 * 60 * 60000),
    successRate: 100,
    category: "operations",
  },
];

const AdminAutomationCenter = () => {
  const [rules, setRules] = useState(automationRules);
  const [activeTab, setActiveTab] = useState("all");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "notifications": return Bell;
      case "payments": return DollarSign;
      case "operations": return Zap;
      case "marketing": return Mail;
      default: return Workflow;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "text-green-500", bg: "bg-green-500/10", label: "Active" };
      case "paused":
        return { color: "text-amber-500", bg: "bg-amber-500/10", label: "Paused" };
      case "draft":
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Draft" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const toggleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === "active" ? "paused" : "active" as const }
        : rule
    ));
  };

  const filteredRules = activeTab === "all" 
    ? rules 
    : rules.filter(r => r.category === activeTab);

  const activeCount = rules.filter(r => r.status === "active").length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Automation Center
          </h2>
          <p className="text-muted-foreground">Automated workflows and triggers</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            {activeCount} Active Rules
          </Badge>
          <Badge variant="secondary">
            {totalExecutions.toLocaleString()} Total Executions
          </Badge>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule, index) => {
          const CategoryIcon = getCategoryIcon(rule.category);
          const statusConfig = getStatusConfig(rule.status);
          
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all",
                rule.status === "active" && "ring-1 ring-green-500/20"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant="secondary" className={cn("text-xs mt-1", statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Settings className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => toggleStatus(rule.id)}
                        >
                          {rule.status === "active" ? (
                            <><Pause className="h-4 w-4" /> Pause</>
                          ) : (
                            <><Play className="h-4 w-4" /> Activate</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-muted-foreground">Trigger:</span>
                      <span className="font-medium">{rule.trigger}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-muted-foreground">Action:</span>
                      <span className="font-medium">{rule.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {rule.executions.toLocaleString()} runs
                      </span>
                      <span className="text-green-500">
                        {rule.successRate}% success
                      </span>
                    </div>
                    {rule.lastRun && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {new Date(rule.lastRun).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No automation rules</h3>
            <p className="text-muted-foreground mb-4">Create your first automation rule to get started</p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAutomationCenter;
