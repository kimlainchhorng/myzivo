import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface SecurityAlert {
  id: string;
  type: "suspicious_login" | "failed_attempts" | "unusual_activity" | "permission_escalation" | "data_export" | "api_abuse";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  location: string;
  timestamp: Date;
  status: "new" | "investigating" | "resolved" | "dismissed";
  resolvedAt: Date | null;
  resolvedBy: string | null;
  notes: string | null;
}

const mockAlerts: SecurityAlert[] = [
  {
    id: "1",
    type: "suspicious_login",
    severity: "high",
    title: "Login from new location",
    description: "User logged in from an unrecognized location (Vietnam) for the first time",
    userId: "usr_123",
    userEmail: "john@example.com",
    ipAddress: "203.113.152.45",
    location: "Ho Chi Minh City, Vietnam",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: "new",
    resolvedAt: null,
    resolvedBy: null,
    notes: null,
  },
  {
    id: "2",
    type: "failed_attempts",
    severity: "medium",
    title: "Multiple failed login attempts",
    description: "5 failed login attempts in the last 10 minutes from the same IP",
    userId: null,
    userEmail: "admin@zivo.app",
    ipAddress: "45.33.32.156",
    location: "Moscow, Russia",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "investigating",
    resolvedAt: null,
    resolvedBy: null,
    notes: "IP added to watchlist",
  },
  {
    id: "3",
    type: "permission_escalation",
    severity: "critical",
    title: "Unauthorized role change attempt",
    description: "User attempted to modify their own role to admin through API manipulation",
    userId: "usr_456",
    userEmail: "hacker@test.com",
    ipAddress: "192.168.1.100",
    location: "Unknown (VPN)",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "resolved",
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolvedBy: "security@zivo.app",
    notes: "Account suspended, IP blocked",
  },
  {
    id: "4",
    type: "data_export",
    severity: "medium",
    title: "Large data export detected",
    description: "User exported 50,000+ records from the customers table",
    userId: "usr_789",
    userEmail: "analyst@zivo.app",
    ipAddress: "10.0.0.50",
    location: "New York, USA",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "dismissed",
    resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    resolvedBy: "admin@zivo.app",
    notes: "Verified: authorized export for quarterly report",
  },
  {
    id: "5",
    type: "api_abuse",
    severity: "low",
    title: "API rate limit exceeded",
    description: "API key exceeded 10,000 requests/hour limit",
    userId: "usr_321",
    userEmail: "developer@partner.com",
    ipAddress: "52.14.144.171",
    location: "San Francisco, USA",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "resolved",
    resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    resolvedBy: "support@zivo.app",
    notes: "Rate limit increased for verified partner",
  },
];

const SecurityAlertsPanel = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-red-500/10 text-red-500";
      case "investigating": return "bg-amber-500/10 text-amber-500";
      case "resolved": return "bg-green-500/10 text-green-500";
      case "dismissed": return "bg-slate-500/10 text-slate-500";
      default: return "bg-slate-500/10 text-slate-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suspicious_login": return ShieldAlert;
      case "failed_attempts": return XCircle;
      case "permission_escalation": return AlertOctagon;
      case "data_export": return Eye;
      case "api_abuse": return AlertTriangle;
      default: return Bell;
    }
  };

  const handleResolve = (alert: SecurityAlert, action: "resolve" | "dismiss") => {
    setAlerts(alerts.map(a => 
      a.id === alert.id 
        ? { 
            ...a, 
            status: action === "resolve" ? "resolved" : "dismissed",
            resolvedAt: new Date(),
            resolvedBy: "admin@zivo.app",
            notes: resolutionNotes || a.notes
          } 
        : a
    ));
    setIsDetailOpen(false);
    setResolutionNotes("");
    toast.success(`Alert ${action === "resolve" ? "resolved" : "dismissed"}`);
  };

  const handleInvestigate = (alert: SecurityAlert) => {
    setAlerts(alerts.map(a => 
      a.id === alert.id ? { ...a, status: "investigating" } : a
    ));
    toast.success("Alert marked as investigating");
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.ipAddress.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const criticalCount = alerts.filter(a => a.severity === "critical" && a.status === "new").length;
  const newCount = alerts.filter(a => a.status === "new").length;
  const investigatingCount = alerts.filter(a => a.status === "investigating").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            criticalCount > 0 
              ? "bg-gradient-to-br from-red-500/20 to-orange-500/10 animate-pulse" 
              : "bg-gradient-to-br from-green-500/20 to-emerald-500/10"
          )}>
            {criticalCount > 0 ? (
              <ShieldAlert className="h-5 w-5 text-red-500" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">Security Alerts</h2>
            <p className="text-sm text-muted-foreground">Monitor and respond to security events</p>
          </div>
        </div>
        {criticalCount > 0 && (
          <Badge className="bg-red-500 text-white animate-pulse">
            {criticalCount} Critical Alert{criticalCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3",
          newCount > 0 ? "bg-red-500/10" : "bg-muted/30"
        )}>
          <div className={cn("p-2 rounded-lg", newCount > 0 ? "bg-red-500/20" : "bg-muted")}>
            <Bell className={cn("h-4 w-4", newCount > 0 ? "text-red-500" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">New</p>
            <p className="text-xl font-bold">{newCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Investigating</p>
            <p className="text-xl font-bold">{investigatingCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-xl font-bold">{alerts.filter(a => a.status === "resolved").length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{alerts.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <div className="flex gap-2">
          {["all", "new", "investigating", "resolved", "dismissed"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const TypeIcon = getTypeIcon(alert.type);
          
          return (
            <Card key={alert.id} className={cn(
              "border-0 bg-card/50 backdrop-blur-xl cursor-pointer transition-all hover:bg-card/70",
              alert.severity === "critical" && alert.status === "new" && "ring-2 ring-red-500/50"
            )} onClick={() => { setSelectedAlert(alert); setIsDetailOpen(true); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", getSeverityColor(alert.severity))}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={cn("text-xs capitalize", getSeverityColor(alert.severity))}>
                          {alert.severity}
                        </Badge>
                        <Badge className={cn("text-xs capitalize", getStatusColor(alert.status))}>
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.userEmail && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.userEmail}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </span>
                        <span>{alert.ipAddress}</span>
                        <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  {alert.status === "new" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); handleInvestigate(alert); }}
                    >
                      Investigate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheck className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
            <p className="text-muted-foreground">No security alerts</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={cn("capitalize", getSeverityColor(selectedAlert.severity))}>
                  {selectedAlert.severity}
                </Badge>
                <Badge className={cn("capitalize", getStatusColor(selectedAlert.status))}>
                  {selectedAlert.status}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{selectedAlert.title}</h3>
                <p className="text-muted-foreground mt-1">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selectedAlert.userEmail || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-medium">{selectedAlert.ipAddress}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedAlert.location}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{format(selectedAlert.timestamp, "MMM d, h:mm a")}</p>
                </div>
              </div>

              {selectedAlert.notes && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAlert.notes}</p>
                </div>
              )}

              {(selectedAlert.status === "new" || selectedAlert.status === "investigating") && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Resolution Notes</p>
                  <Textarea 
                    placeholder="Add notes about how this was handled..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedAlert && (selectedAlert.status === "new" || selectedAlert.status === "investigating") && (
              <>
                <Button variant="outline" onClick={() => handleResolve(selectedAlert, "dismiss")}>
                  Dismiss
                </Button>
                <Button onClick={() => handleResolve(selectedAlert, "resolve")}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityAlertsPanel;
