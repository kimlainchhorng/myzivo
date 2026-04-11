import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Clock, ArrowLeft, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const services = [
  { name: "Web App", status: "operational", uptime: 99.98, latency: 45 },
  { name: "Supabase API", status: "operational", uptime: 99.95, latency: 62 },
  { name: "Duffel Flight API", status: "operational", uptime: 99.87, latency: 320 },
  { name: "Stripe Payments", status: "operational", uptime: 99.99, latency: 180 },
  { name: "Edge Functions", status: "degraded", uptime: 98.5, latency: 890 },
  { name: "Push Notifications", status: "operational", uptime: 99.92, latency: 150 },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  operational: { label: "Operational", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: AlertTriangle },
  down: { label: "Down", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
};

const recentIncidents = [
  { date: "2026-03-20", service: "Edge Functions", description: "Elevated latency on cold starts", duration: "23 min", severity: "minor" },
  { date: "2026-03-18", service: "Duffel Flight API", description: "Intermittent 503 errors from upstream", duration: "8 min", severity: "minor" },
  { date: "2026-03-12", service: "Supabase API", description: "Planned maintenance window", duration: "15 min", severity: "maintenance" },
];

export default function AdminSystemHealth() {
  const navigate = useNavigate();
  const operationalCount = services.filter(s => s.status === "operational").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Health</h1>
          <p className="text-muted-foreground">Real-time status of all platform services</p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/chat-security')}>
            <ShieldAlert className="h-4 w-4" />
            Open Chat Security Monitor
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/security-sentinel')}>
            <ShieldAlert className="h-4 w-4" />
            Open Security Sentinel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/auth-shield')}>
            <ShieldAlert className="h-4 w-4" />
            Open Auth Shield Control
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{services.length}</p>
              <p className="text-xs text-muted-foreground">Total Services</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{operationalCount}</p>
              <p className="text-xs text-muted-foreground">Operational</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{services.length - operationalCount}</p>
              <p className="text-xs text-muted-foreground">Degraded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">99.87%</p>
              <p className="text-xs text-muted-foreground">Avg Uptime (30d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Service Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((service) => {
            const cfg = statusConfig[service.status];
            const Icon = cfg.icon;
            return (
              <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${service.status === "operational" ? "text-green-500" : service.status === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
                  <span className="font-medium text-foreground">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">{service.latency}ms</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <Progress value={service.uptime} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{service.uptime}%</p>
                  </div>
                  <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map((inc, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-foreground">{inc.service}</p>
                  <p className="text-sm text-muted-foreground">{inc.description}</p>
                </div>
                <div className="text-right text-sm shrink-0 ml-4">
                  <p className="text-muted-foreground">{inc.date}</p>
                  <p className="text-muted-foreground">{inc.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
