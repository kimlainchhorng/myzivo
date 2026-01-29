import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Lock,
  Key,
  UserX,
  AlertTriangle,
  Eye,
  Activity,
  Globe,
  Server,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SecurityEvent {
  id: string;
  type: "login_failed" | "suspicious_activity" | "api_abuse" | "permission_escalation" | "data_access";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  resolved: boolean;
}

const securityEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "login_failed",
    severity: "medium",
    title: "Multiple Failed Login Attempts",
    description: "5 failed login attempts from IP 192.168.1.105",
    timestamp: new Date(Date.now() - 10 * 60000),
    source: "Auth Service",
    resolved: false,
  },
  {
    id: "2",
    type: "api_abuse",
    severity: "high",
    title: "Rate Limit Exceeded",
    description: "API key 'prod_xyz' exceeded rate limit by 500%",
    timestamp: new Date(Date.now() - 25 * 60000),
    source: "API Gateway",
    resolved: false,
  },
  {
    id: "3",
    type: "suspicious_activity",
    severity: "critical",
    title: "Unusual Data Export Pattern",
    description: "Large data export detected from admin account",
    timestamp: new Date(Date.now() - 45 * 60000),
    source: "Data Monitor",
    resolved: true,
  },
  {
    id: "4",
    type: "permission_escalation",
    severity: "high",
    title: "Unauthorized Permission Change",
    description: "Attempt to elevate user permissions blocked",
    timestamp: new Date(Date.now() - 2 * 3600000),
    source: "Access Control",
    resolved: true,
  },
];

const securityMetrics = {
  threatLevel: "Medium",
  blockedThreats: 1247,
  activeIncidents: 3,
  resolvedToday: 12,
  uptime: 99.98,
  sslScore: "A+",
  lastScan: "2 hours ago",
  vulnerabilities: { critical: 0, high: 2, medium: 5, low: 12 },
};

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return { color: "text-red-500", bg: "bg-red-500/10", badge: "bg-red-500 text-white" };
    case "high":
      return { color: "text-orange-500", bg: "bg-orange-500/10", badge: "bg-orange-500 text-white" };
    case "medium":
      return { color: "text-amber-500", bg: "bg-amber-500/10", badge: "bg-amber-500 text-white" };
    case "low":
      return { color: "text-blue-500", bg: "bg-blue-500/10", badge: "bg-blue-500 text-white" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted", badge: "bg-muted text-foreground" };
  }
};

const formatTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const AdminSecurityDashboard = () => {
  const unresolvedEvents = securityEvents.filter(e => !e.resolved);
  const criticalEvents = securityEvents.filter(e => e.severity === "critical" && !e.resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className={cn(
            "px-3 py-1",
            securityMetrics.threatLevel === "Low" ? "bg-green-500/10 text-green-500" :
            securityMetrics.threatLevel === "Medium" ? "bg-amber-500/10 text-amber-500" :
            "bg-red-500/10 text-red-500"
          )}>
            Threat Level: {securityMetrics.threatLevel}
          </Badge>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{securityMetrics.blockedThreats}</p>
            <p className="text-xs text-muted-foreground">Threats Blocked (24h)</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <ShieldAlert className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{securityMetrics.activeIncidents}</p>
            <p className="text-xs text-muted-foreground">Active Incidents</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="p-4">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{securityMetrics.resolvedToday}</p>
            <p className="text-xs text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <Activity className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{securityMetrics.uptime}%</p>
            <p className="text-xs text-muted-foreground">System Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Security Events */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Recent Security Events
                </CardTitle>
                <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                  {unresolvedEvents.length} Unresolved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityEvents.map((event, index) => {
                const severityConfig = getSeverityConfig(event.severity);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      event.resolved ? "bg-muted/30 border-border/50" : severityConfig.bg,
                      !event.resolved && "border-" + event.severity === "critical" ? "border-red-500/30" : "border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", severityConfig.bg)}>
                        <ShieldAlert className={cn("h-5 w-5", severityConfig.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge className={cn("text-[10px]", severityConfig.badge)}>
                            {event.severity}
                          </Badge>
                          {event.resolved && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(event.timestamp)}
                          </span>
                          <span>Source: {event.source}</span>
                        </div>
                      </div>
                      {!event.resolved && (
                        <Button variant="outline" size="sm">Investigate</Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        <div className="space-y-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SSL Certificate</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  {securityMetrics.sslScore}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Security Scan</span>
                </div>
                <span className="text-sm text-muted-foreground">{securityMetrics.lastScan}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">2FA Enabled</span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Critical</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-500">{securityMetrics.vulnerabilities.critical}</span>
                  {securityMetrics.vulnerabilities.critical === 0 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High</span>
                <span className="font-bold text-orange-500">{securityMetrics.vulnerabilities.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Medium</span>
                <span className="font-bold text-amber-500">{securityMetrics.vulnerabilities.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low</span>
                <span className="font-bold text-blue-500">{securityMetrics.vulnerabilities.low}</span>
              </div>
              <Button className="w-full mt-2" variant="outline">Run Security Scan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityDashboard;
