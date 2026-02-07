/**
 * Dispatch Audit Page
 * Audit log list with filters and export
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import AuditFilters, { type AuditFiltersState } from "@/components/audit/AuditFilters";
import AuditLogTable from "@/components/audit/AuditLogTable";
import AuditExportButton from "@/components/audit/AuditExportButton";
import { ChevronLeft, ChevronRight, FileText, Shield } from "lucide-react";

export default function DispatchAudit() {
  const { currentTenant, hasPermission } = useTenant();
  const [filters, setFilters] = useState<AuditFiltersState>({});
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { logs, total, isLoading } = useAuditLog(currentTenant?.id || null, {
    ...filters,
    page,
    limit: pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleFiltersChange = (newFilters: AuditFiltersState) => {
    setFilters(newFilters);
    setPage(0);
  };

  if (!hasPermission("audit.view") && !hasPermission("tenant.manage_settings")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Shield className="h-12 w-12 mb-4" />
        <p>You don't have permission to view audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Audit Log
          </h1>
          <p className="text-muted-foreground text-sm">
            Track all administrative actions and changes
          </p>
        </div>
        <AuditExportButton logs={logs} disabled={isLoading} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <AuditFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              {total > 0 ? `${total} log${total !== 1 ? "s" : ""} found` : "No logs"}
            </CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <AuditLogTable logs={logs} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
