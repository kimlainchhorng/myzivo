/**
 * Audit Export Button Component
 * CSV export functionality for audit logs
 */

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAuditLogsToCSV, downloadFile } from "@/lib/auditHelpers";
import type { AuditLogEntry } from "@/hooks/useAuditLog";

interface AuditExportButtonProps {
  logs: AuditLogEntry[];
  disabled?: boolean;
}

export default function AuditExportButton({ logs, disabled }: AuditExportButtonProps) {
  const handleExport = () => {
    if (logs.length === 0) return;

    const csv = exportAuditLogsToCSV(logs);
    const filename = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    downloadFile(csv, filename, "text/csv");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || logs.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
