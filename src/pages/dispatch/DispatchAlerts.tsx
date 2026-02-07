/**
 * Dispatch Alerts Page
 * Admin alerts panel for critical actions
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTenant } from "@/contexts/TenantContext";
import { useAdminAlerts, type AdminAlert } from "@/hooks/useAdminAlerts";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DispatchAlerts() {
  const { currentTenant, hasPermission } = useTenant();
  const [showResolved, setShowResolved] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const { alerts, unresolvedCount, isLoading, resolveAlert, isResolving } = useAdminAlerts(
    currentTenant?.id || null,
    showResolved
  );

  const handleResolve = () => {
    if (!selectedAlert) return;
    resolveAlert(
      { alertId: selectedAlert.id, notes: resolveNotes },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setSelectedAlert(null);
          setResolveNotes("");
        },
      }
    );
  };

  const openResolveDialog = (alert: AdminAlert) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
  };

  if (!hasPermission("alerts.manage") && !hasPermission("tenant.manage_settings")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Shield className="h-12 w-12 mb-4" />
        <p>You don't have permission to view alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Admin Alerts
            {unresolvedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unresolvedCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            Critical actions requiring review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-resolved"
            checked={showResolved}
            onCheckedChange={setShowResolved}
          />
          <Label htmlFor="show-resolved" className="text-sm">
            Show resolved
          </Label>
        </div>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">
              {showResolved ? "No alerts found." : "No unresolved alerts. All clear!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={alert.resolved_at ? "opacity-60" : ""}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {alert.severity === "critical" ? (
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            alert.severity === "critical"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        {alert.resolved_at && (
                          <Badge variant="secondary">Resolved</Badge>
                        )}
                      </div>
                      {alert.body && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.body}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                        {alert.audit_log_id && (
                          <Link
                            to={`/dispatch/audit/${alert.audit_log_id}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View log
                          </Link>
                        )}
                      </div>
                      {alert.resolve_notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Resolution: {alert.resolve_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {!alert.resolved_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openResolveDialog(alert)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Mark this alert as resolved. Optionally add notes about the resolution.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Resolution notes (optional)"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={isResolving}>
              {isResolving ? "Resolving..." : "Resolve Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
