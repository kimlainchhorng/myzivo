import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  FileText,
  Scale,
  Globe,
  Building,
  Car,
  Users,
  Calendar,
  Download,
  Eye,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: "compliant" | "pending" | "non-compliant" | "expiring";
  dueDate: string;
  lastAudit: string;
  region: string;
  priority: "high" | "medium" | "low";
}

const complianceItems: ComplianceItem[] = [
  {
    id: "1",
    category: "Driver Licensing",
    requirement: "Background check renewal",
    status: "expiring",
    dueDate: "2024-02-15",
    lastAudit: "2024-01-10",
    region: "California",
    priority: "high",
  },
  {
    id: "2",
    category: "Vehicle Safety",
    requirement: "Annual vehicle inspections",
    status: "compliant",
    dueDate: "2024-06-30",
    lastAudit: "2024-01-05",
    region: "All Regions",
    priority: "medium",
  },
  {
    id: "3",
    category: "Data Privacy",
    requirement: "GDPR compliance audit",
    status: "compliant",
    dueDate: "2024-05-01",
    lastAudit: "2023-11-15",
    region: "Europe",
    priority: "high",
  },
  {
    id: "4",
    category: "Insurance",
    requirement: "Commercial liability coverage",
    status: "pending",
    dueDate: "2024-02-28",
    lastAudit: "2024-01-20",
    region: "United States",
    priority: "high",
  },
  {
    id: "5",
    category: "Tax Compliance",
    requirement: "1099 filing for drivers",
    status: "non-compliant",
    dueDate: "2024-01-31",
    lastAudit: "2024-01-25",
    region: "United States",
    priority: "high",
  },
  {
    id: "6",
    category: "Accessibility",
    requirement: "ADA vehicle requirements",
    status: "compliant",
    dueDate: "2024-12-31",
    lastAudit: "2023-12-01",
    region: "United States",
    priority: "medium",
  },
];

const statusConfig = {
  compliant: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Compliant" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  "non-compliant": { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Non-Compliant" },
  expiring: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", label: "Expiring Soon" },
};

const categoryIcons: Record<string, typeof ShieldCheck> = {
  "Driver Licensing": Users,
  "Vehicle Safety": Car,
  "Data Privacy": ShieldCheck,
  "Insurance": Building,
  "Tax Compliance": FileText,
  "Accessibility": Scale,
};

const AdminComplianceCenter = () => {
  const stats = {
    compliant: complianceItems.filter(i => i.status === "compliant").length,
    pending: complianceItems.filter(i => i.status === "pending").length,
    nonCompliant: complianceItems.filter(i => i.status === "non-compliant").length,
    expiring: complianceItems.filter(i => i.status === "expiring").length,
  };

  const overallScore = Math.round((stats.compliant / complianceItems.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            Compliance Center
          </h2>
          <p className="text-muted-foreground mt-1">Regulatory compliance tracking and audit management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Run Audit
          </Button>
        </div>
      </div>

      {/* Overall Score & Stats */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${overallScore * 2.51} 251`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallScore}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Compliance Score</h3>
                <p className="text-sm text-muted-foreground mb-2">Overall regulatory health</p>
                <Badge className={cn(
                  overallScore >= 80 ? "bg-green-500/10 text-green-500" :
                  overallScore >= 60 ? "bg-amber-500/10 text-amber-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {overallScore >= 80 ? "Good Standing" : overallScore >= 60 ? "Needs Attention" : "Critical"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusConfig).map(([key, config], index) => {
          const count = stats[key as keyof typeof stats] || 0;
          const Icon = config.icon;
          return (
            <Card 
              key={key}
              className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", config.bg)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Compliance Items */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/30 p-1">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="critical" className="text-red-500">Critical</TabsTrigger>
          <TabsTrigger value="expiring" className="text-orange-500">Expiring</TabsTrigger>
          <TabsTrigger value="compliant" className="text-green-500">Compliant</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {complianceItems.map((item, index) => {
              const config = statusConfig[item.status];
              const StatusIcon = config.icon;
              const CategoryIcon = categoryIcons[item.category] || FileText;

              return (
                <Card 
                  key={item.id}
                  className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-muted/50 shrink-0">
                          <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{item.requirement}</h3>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            {item.priority === "high" && (
                              <Badge className="bg-red-500/10 text-red-500 text-xs">High Priority</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {item.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Last audit: {new Date(item.lastAudit).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={cn("gap-1", config.bg, config.color)}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <div className="grid gap-4">
            {complianceItems.filter(i => i.status === "non-compliant").map((item, index) => {
              const config = statusConfig[item.status];
              const StatusIcon = config.icon;
              const CategoryIcon = categoryIcons[item.category] || FileText;

              return (
                <Card 
                  key={item.id}
                  className="border-0 bg-red-500/5 border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-red-500/10 shrink-0">
                          <CategoryIcon className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.requirement}</h3>
                          <p className="text-sm text-muted-foreground">{item.category} • {item.region}</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">Take Action</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            {complianceItems.filter(i => i.status === "expiring").length} items expiring soon
          </div>
        </TabsContent>

        <TabsContent value="compliant" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            {complianceItems.filter(i => i.status === "compliant").length} items fully compliant
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminComplianceCenter;
