import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  MapPin,
  Smartphone,
  Flag,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FraudAlert {
  id: string;
  type: "payment" | "account" | "location" | "device" | "behavior";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  status: "pending" | "investigating" | "resolved" | "false_positive";
  riskScore: number;
  indicators: string[];
}

const alerts: FraudAlert[] = [
  {
    id: "fa_001",
    type: "payment",
    severity: "critical",
    title: "Multiple Failed Payment Attempts",
    description: "15 failed transactions in 10 minutes from different cards",
    user: { id: "u1", name: "John Doe", email: "john.d***@email.com" },
    timestamp: "2 min ago",
    status: "pending",
    riskScore: 95,
    indicators: ["Multiple cards", "Velocity spike", "New device"],
  },
  {
    id: "fa_002",
    type: "location",
    severity: "high",
    title: "Impossible Travel Detected",
    description: "Login from NYC and London within 30 minutes",
    user: { id: "u2", name: "Sarah Smith", email: "sarah.s***@email.com" },
    timestamp: "15 min ago",
    status: "investigating",
    riskScore: 88,
    indicators: ["Geo anomaly", "VPN detected"],
  },
  {
    id: "fa_003",
    type: "account",
    severity: "high",
    title: "Mass Account Creation",
    description: "50 accounts from same IP in last hour",
    user: { id: "u3", name: "Multiple", email: "various@***" },
    timestamp: "32 min ago",
    status: "pending",
    riskScore: 82,
    indicators: ["Same IP", "Similar emails", "Bot pattern"],
  },
  {
    id: "fa_004",
    type: "behavior",
    severity: "medium",
    title: "Unusual Booking Pattern",
    description: "Driver completing trips without movement",
    user: { id: "u4", name: "Mike Johnson", email: "mike.j***@email.com" },
    timestamp: "1 hour ago",
    status: "investigating",
    riskScore: 67,
    indicators: ["No GPS movement", "Short trips", "Same location"],
  },
  {
    id: "fa_005",
    type: "device",
    severity: "low",
    title: "New Device Login",
    description: "First login from Android device (previously iOS only)",
    user: { id: "u5", name: "Emily Chen", email: "emily.c***@email.com" },
    timestamp: "2 hours ago",
    status: "resolved",
    riskScore: 25,
    indicators: ["Device change", "Known location"],
  },
];

const getTypeIcon = (type: FraudAlert["type"]) => {
  switch (type) {
    case "payment":
      return <CreditCard className="h-4 w-4" />;
    case "account":
      return <User className="h-4 w-4" />;
    case "location":
      return <MapPin className="h-4 w-4" />;
    case "device":
      return <Smartphone className="h-4 w-4" />;
    case "behavior":
      return <Flag className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: FraudAlert["severity"]) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "low":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
};

const getStatusBadge = (status: FraudAlert["status"]) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    case "investigating":
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><Eye className="h-3 w-3" /> Investigating</Badge>;
    case "resolved":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
    case "false_positive":
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 gap-1"><XCircle className="h-3 w-3" /> False Positive</Badge>;
  }
};

const getRiskColor = (score: number) => {
  if (score >= 80) return "text-red-500";
  if (score >= 60) return "text-orange-500";
  if (score >= 40) return "text-amber-500";
  return "text-green-500";
};

const AdminFraudDetection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleAction = (action: string, alertId: string) => {
    toast.success(`${action} action triggered for alert ${alertId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Fraud Detection</h1>
            <p className="text-muted-foreground">Monitor and respond to suspicious activity</p>
          </div>
        </div>
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {alerts.filter(a => a.status === "pending").length} Pending Review
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical Alerts", value: alerts.filter(a => a.severity === "critical").length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Under Investigation", value: alerts.filter(a => a.status === "investigating").length, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Resolved Today", value: 12, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "False Positives", value: 3, icon: XCircle, color: "text-slate-500", bg: "bg-slate-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {["all", "critical", "high", "medium", "low"].map((sev) => (
                <Button
                  key={sev}
                  size="sm"
                  variant={filterSeverity === sev ? "default" : "outline"}
                  onClick={() => setFilterSeverity(sev)}
                  className="capitalize"
                >
                  {sev}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn(
              "border-0 bg-card/50 backdrop-blur-xl border-l-4",
              alert.severity === "critical" ? "border-l-red-500" :
              alert.severity === "high" ? "border-l-orange-500" :
              alert.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500"
            )}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0",
                        getSeverityColor(alert.severity)
                      )}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        
                        {/* Indicators */}
                        <div className="flex flex-wrap gap-2">
                          {alert.indicators.map((indicator) => (
                            <Badge key={indicator} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>{alert.user.name} ({alert.user.email})</span>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score & Actions */}
                  <div className="flex flex-col gap-3 lg:items-end lg:min-w-[180px]">
                    <div className="p-4 rounded-xl bg-muted/20 text-center lg:text-right">
                      <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                      <p className={cn("text-3xl font-bold", getRiskColor(alert.riskScore))}>
                        {alert.riskScore}
                      </p>
                    </div>
                    
                    {alert.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction("Investigate", alert.id)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction("Block", alert.id)}
                          className="gap-1 text-red-500 border-red-500/20 hover:bg-red-500/10"
                        >
                          <Ban className="h-3 w-3" /> Block
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminFraudDetection;
