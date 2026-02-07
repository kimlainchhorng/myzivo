/**
 * Audit Log Table Component
 * Reusable table for displaying audit logs
 */

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getSeverityBadge, type AuditLogEntry } from "@/hooks/useAuditLog";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
  onRowClick?: (log: AuditLogEntry) => void;
}

export default function AuditLogTable({ logs, isLoading, onRowClick }: AuditLogTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (log: AuditLogEntry) => {
    if (onRowClick) {
      onRowClick(log);
    } else {
      navigate(`/dispatch/audit/${log.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No audit logs found matching your filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Time</TableHead>
          <TableHead className="w-[100px]">Severity</TableHead>
          <TableHead className="w-[120px]">Actor</TableHead>
          <TableHead className="w-[150px]">Action</TableHead>
          <TableHead className="w-[120px]">Entity</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const severity = getSeverityBadge(log.severity);
          return (
            <TableRow
              key={log.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(log)}
            >
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={severity.className}>
                  {severity.label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {log.actor_role || "System"}
              </TableCell>
              <TableCell className="font-medium text-sm">
                {log.action.replace(/_/g, " ")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.entity_type}
                {log.entity_id && (
                  <span className="block text-xs truncate max-w-[100px]">
                    {log.entity_id.slice(0, 8)}...
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm max-w-[300px] truncate">
                {log.summary}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
