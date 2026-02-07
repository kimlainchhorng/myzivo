/**
 * Dispatch Audit Detail Page
 * Single audit log detail with JSON diff viewer
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuditLogDetail, getSeverityBadge } from "@/hooks/useAuditLog";
import JsonDiffViewer from "@/components/audit/JsonDiffViewer";
import { ArrowLeft, Calendar, User, FileText, Tag, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DispatchAuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: log, isLoading } = useAuditLogDetail(id || null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Audit log not found.</p>
        <Button variant="link" onClick={() => navigate("/dispatch/audit")}>
          Back to Audit Log
        </Button>
      </div>
    );
  }

  const severity = getSeverityBadge(log.severity);

  // Generate entity link if possible
  const getEntityLink = () => {
    if (!log.entity_id) return null;
    switch (log.entity_type) {
      case "order":
        return `/dispatch/orders/${log.entity_id}`;
      case "driver":
        return `/dispatch/drivers/${log.entity_id}`;
      case "merchant":
        return `/dispatch/merchants/${log.entity_id}`;
      case "dispute":
        return `/dispatch/disputes/${log.entity_id}`;
      default:
        return null;
    }
  };

  const entityLink = getEntityLink();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/dispatch/audit")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Audit Log
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-3">
                {log.action.replace(/_/g, " ")}
                <Badge variant="outline" className={severity.className}>
                  {severity.label}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1">{log.summary}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{log.actor_role || "System"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{log.entity_type}</span>
            </div>
            {entityLink && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <Link to={entityLink} className="text-primary hover:underline">
                  View {log.entity_type}
                </Link>
              </div>
            )}
          </div>

          {/* Technical details */}
          {(log.ip_address || log.user_agent) && (
            <>
              <Separator className="my-4" />
              <div className="text-xs text-muted-foreground space-y-1">
                {log.ip_address && <p>IP: {log.ip_address}</p>}
                {log.user_agent && (
                  <p className="truncate max-w-lg">User Agent: {log.user_agent}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Changes Diff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JsonDiffViewer
            before={log.before_values}
            after={log.after_values}
          />
        </CardContent>
      </Card>

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
