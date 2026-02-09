/**
 * Admin Backups Page
 * View and manage system backups with download capability
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  HardDrive,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBackupLogs,
  useBackupStats,
  useTriggerDatabaseBackup,
  useTriggerStorageBackup,
  useDownloadBackup,
  formatBytes,
  formatTimeAgo,
} from "@/hooks/useBackups";

const BackupsPage = () => {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useBackupStats();
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useBackupLogs(50);

  const triggerDbBackup = useTriggerDatabaseBackup();
  const triggerStorageBackup = useTriggerStorageBackup();
  const downloadBackup = useDownloadBackup();

  const filteredLogs = typeFilter
    ? logs.filter((log) => log.backup_target === typeFilter)
    : logs;

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">System Backups</h1>
            <p className="text-muted-foreground mt-1">
              Manage database and storage backups
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Backup Now
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => triggerDbBackup.mutate()}
                  disabled={triggerDbBackup.isPending}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Database Backup
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => triggerStorageBackup.mutate()}
                  disabled={triggerStorageBackup.isPending}
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  Storage Backup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last DB Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {stats?.lastDbBackup?.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : stats?.lastDbBackup?.status === "failed" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-2xl font-bold">
                    {formatTimeAgo(stats?.lastDbBackup?.completed_at || null)}
                  </span>
                </div>
                {stats?.lastDbBackup?.size_bytes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(stats.lastDbBackup.size_bytes)}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Storage Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {stats?.lastStorageBackup?.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : stats?.lastStorageBackup?.status === "failed" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-2xl font-bold">
                    {formatTimeAgo(stats?.lastStorageBackup?.completed_at || null)}
                  </span>
                </div>
                {stats?.lastStorageBackup?.size_bytes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(stats.lastStorageBackup.size_bytes)} cataloged
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Backups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.totalBackups || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.successfulBackups || 0} successful
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Failed (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {(stats?.failedBackups7Days || 0) > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.failedBackups7Days || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.failedBackups7Days || 0) === 0
                    ? "All backups healthy"
                    : "Requires attention"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Backup Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Backups</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={typeFilter === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={typeFilter === "database" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter("database")}
                  >
                    <Database className="w-4 h-4 mr-1" />
                    Database
                  </Button>
                  <Button
                    variant={typeFilter === "storage" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter("storage")}
                  >
                    <HardDrive className="w-4 h-4 mr-1" />
                    Storage
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading backups...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No backups found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.backup_target === "database" ? (
                              <Database className="w-4 h-4 text-primary" />
                            ) : (
                              <HardDrive className="w-4 h-4 text-teal-500" />
                            )}
                            <span className="capitalize">{log.backup_target}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.started_at
                            ? new Date(log.started_at).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.completed_at
                            ? new Date(log.completed_at).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>{formatBytes(log.size_bytes)}</TableCell>
                        <TableCell className="text-right">
                          {log.storage_location && log.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadBackup.mutate(log.storage_location!)
                              }
                              disabled={downloadBackup.isPending}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {log.error_message && (
                            <span
                              className="text-xs text-red-400 max-w-[200px] truncate block"
                              title={log.error_message}
                            >
                              {log.error_message}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-muted/50 rounded-lg p-4 flex items-start gap-3"
        >
          <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Automated Backup Schedule</p>
            <p className="text-muted-foreground mt-1">
              Database backups run daily at 02:00 UTC (30-day retention). Storage
              manifests run daily at 03:00 UTC (90-day retention). Failed backups
              trigger immediate admin alerts.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BackupsPage;
