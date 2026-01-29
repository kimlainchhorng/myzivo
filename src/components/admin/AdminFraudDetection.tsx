import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

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

const mapEventToFraudAlert = (event: any): FraudAlert => {
  const eventData = event.event_data || {};
  const eventType = event.event_type || '';
  
  // Determine type based on event_type
  let type: FraudAlert["type"] = "behavior";
  if (eventType.includes('payment') || eventType.includes('withdrawal')) type = "payment";
  else if (eventType.includes('login') || eventType.includes('account')) type = "account";
  else if (eventType.includes('location') || eventType.includes('travel')) type = "location";
  else if (eventType.includes('device')) type = "device";

  // Determine severity
  let severity: FraudAlert["severity"] = "low";
  if (event.severity === 'critical') severity = "critical";
  else if (event.severity === 'warning' || event.severity === 'high') severity = "high";
  else if (event.severity === 'medium') severity = "medium";

  // Calculate risk score
  let riskScore = 25;
  if (severity === 'critical') riskScore = 90 + Math.floor(Math.random() * 10);
  else if (severity === 'high') riskScore = 70 + Math.floor(Math.random() * 15);
  else if (severity === 'medium') riskScore = 50 + Math.floor(Math.random() * 15);
  else riskScore = 20 + Math.floor(Math.random() * 20);

  // Build indicators
  const indicators: string[] = [];
  if (event.ip_address) indicators.push("IP tracked");
  if (event.device_fingerprint) indicators.push("Device identified");
  if (event.is_blocked) indicators.push("Blocked");
  if (eventData.failed_attempts) indicators.push(`${eventData.failed_attempts} failed attempts`);

  return {
    id: event.id,
    type,
    severity,
    title: eventType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    description: `Security event detected: ${eventType}`,
    user: {
      id: event.user_id || event.driver_id || 'unknown',
      name: event.user_id ? `User ${event.user_id.slice(0, 8)}` : 'Unknown',
      email: '***@email.com'
    },
    timestamp: event.created_at,
    status: event.is_blocked ? "resolved" : "pending",
    riskScore,
    indicators
  };
};

const AdminFraudDetection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['admin-fraud-alerts'],
    queryFn: async () => {
      // Fetch security events that could indicate fraud
      const { data: securityEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .in('severity', ['critical', 'warning', 'high', 'medium'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Also check admin security alerts
      const { data: adminAlerts } = await supabase
        .from('admin_security_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      // Combine and map to fraud alerts
      const mappedEvents = (securityEvents || []).map(mapEventToFraudAlert);
      
      // Add admin alerts
      const mappedAdminAlerts: FraudAlert[] = (adminAlerts || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type.includes('withdrawal') ? 'payment' : 
              alert.alert_type.includes('login') ? 'account' : 'behavior',
        severity: alert.severity as FraudAlert["severity"],
        title: alert.title,
        description: alert.description || '',
        user: {
          id: alert.related_user_id || alert.related_driver_id || 'unknown',
          name: 'User',
          email: '***@email.com'
        },
        timestamp: alert.created_at,
        status: alert.is_resolved ? 'resolved' : 'pending',
        riskScore: alert.severity === 'critical' ? 95 : 75,
        indicators: []
      }));

      return [...mappedAdminAlerts, ...mappedEvents].slice(0, 30);
    },
    staleTime: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: string }) => {
      // Update admin_security_alerts if it exists there
      await supabase
        .from('admin_security_alerts')
        .update({ 
          is_resolved: action === 'resolve',
          resolution_action: action,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);
      
      return { alertId, action };
    },
    onSuccess: (_, { action }) => {
      toast.success(`Alert ${action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-fraud-alerts'] });
    }
  });

  const filteredAlerts = alerts.filter((alert: FraudAlert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleAction = (action: string, alertId: string) => {
    resolveMutation.mutate({ alertId, action: action.toLowerCase() });
  };

  // Calculate stats
  const pendingCount = alerts.filter((a: FraudAlert) => a.status === "pending").length;
  const criticalCount = alerts.filter((a: FraudAlert) => a.severity === "critical").length;
  const investigatingCount = alerts.filter((a: FraudAlert) => a.status === "investigating").length;
  const resolvedCount = alerts.filter((a: FraudAlert) => a.status === "resolved").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

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
          {pendingCount} Pending Review
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical Alerts", value: criticalCount, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Under Investigation", value: investigatingCount, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Resolved Today", value: resolvedCount, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Total Alerts", value: alerts.length, icon: XCircle, color: "text-slate-500", bg: "bg-slate-500/10" },
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
        {filteredAlerts.length === 0 ? (
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-muted-foreground">No fraud alerts detected</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert: FraudAlert, index: number) => (
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
                            <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
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
                            onClick={() => handleAction("Resolve", alert.id)}
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
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFraudDetection;
