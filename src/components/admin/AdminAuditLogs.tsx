import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, History, Eye, User, Settings, Shield, Database, FileEdit, Trash2, Plus, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionIcons: Record<string, any> = {
  create: Plus,
  update: FileEdit,
  delete: Trash2,
  login: User,
  logout: User,
  settings_change: Settings,
  role_change: Shield,
  default: History,
};

const actionColors: Record<string, { color: string; bg: string }> = {
  create: { color: "text-green-500", bg: "bg-green-500/10" },
  update: { color: "text-blue-500", bg: "bg-blue-500/10" },
  delete: { color: "text-red-500", bg: "bg-red-500/10" },
  login: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  logout: { color: "text-amber-500", bg: "bg-amber-500/10" },
  settings_change: { color: "text-purple-500", bg: "bg-purple-500/10" },
  role_change: { color: "text-orange-500", bg: "bg-orange-500/10" },
  default: { color: "text-slate-500", bg: "bg-slate-500/10" },
};

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  }) || [];

  const uniqueActions = [...new Set(logs?.map(l => l.action) || [])];
  const uniqueEntities = [...new Set(logs?.map(l => l.entity_type) || [])];

  const getActionIcon = (action: string) => {
    return actionIcons[action.toLowerCase()] || actionIcons.default;
  };

  const getActionColor = (action: string) => {
    return actionColors[action.toLowerCase()] || actionColors.default;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
          <History className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <History className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-lg font-semibold">{logs?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Plus className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creates</p>
              <p className="text-lg font-semibold">
                {logs?.filter(l => l.action.toLowerCase() === 'create').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileEdit className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updates</p>
              <p className="text-lg font-semibold">
                {logs?.filter(l => l.action.toLowerCase() === 'update').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deletes</p>
              <p className="text-lg font-semibold">
                {logs?.filter(l => l.action.toLowerCase() === 'delete').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Activity Log
              </CardTitle>
              <CardDescription>Recent system events and user actions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action} className="capitalize">
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map((entity) => (
                    <SelectItem key={entity} value={entity} className="capitalize">
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden md:table-cell">Entity ID</TableHead>
                  <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const Icon = getActionIcon(log.action);
                    const colors = getActionColor(log.action);
                    return (
                      <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Badge className={cn("gap-1.5 capitalize", colors.bg, colors.color, "border-transparent")}>
                            <Icon className="h-3 w-3" />
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          {log.entity_type}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                          {log.entity_id ? log.entity_id.substring(0, 8) + "..." : "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {log.ip_address || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimestamp(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>Full details of this activity</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  <Badge className={cn("capitalize", getActionColor(selectedLog.action).bg, getActionColor(selectedLog.action).color)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Entity Type</p>
                  <p className="font-medium capitalize">{selectedLog.entity_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Entity ID</p>
                  <p className="font-mono text-sm">{selectedLog.entity_id || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ip_address || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-sm">{selectedLog.user_id || "System"}</p>
                </div>
              </div>

              {(selectedLog.old_values || selectedLog.new_values) && (
                <div className="space-y-3">
                  <p className="font-medium">Changes</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.old_values && (
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-500 mb-2">Old Values</p>
                        <ScrollArea className="h-32">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(selectedLog.old_values, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                    {selectedLog.new_values && (
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <p className="text-xs text-green-500 mb-2">New Values</p>
                        <ScrollArea className="h-32">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(selectedLog.new_values, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.user_agent && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                  <p className="text-xs font-mono break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
