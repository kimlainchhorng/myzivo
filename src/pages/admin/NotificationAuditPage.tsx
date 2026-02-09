/**
 * Notification Audit Page
 * Admin view for compliance audit logs of all notification sends
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  Filter,
  Phone,
  Mail,
  Bell,
  PhoneCall,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuditChannel = "push" | "sms" | "email" | "call" | "all";
type AuditStatus = "sent" | "failed" | "skipped" | "opted_out" | "all";

interface NotificationAuditEntry {
  id: string;
  user_id: string | null;
  channel: string;
  event_type: string;
  destination_masked: string | null;
  provider_id: string | null;
  status: string;
  error: string | null;
  skip_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Transform raw DB data to handle column name differences
function mapAuditEntry(raw: Record<string, unknown>): NotificationAuditEntry {
  return {
    id: raw.id as string,
    user_id: raw.user_id as string | null,
    channel: raw.channel as string,
    event_type: raw.event_type as string,
    destination_masked: (raw.destination_masked || raw.destination || null) as string | null,
    provider_id: raw.provider_id as string | null,
    status: raw.status as string,
    error: raw.error as string | null,
    skip_reason: (raw.skip_reason || null) as string | null,
    metadata: (raw.metadata || null) as Record<string, unknown> | null,
    created_at: raw.created_at as string,
  };
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  push: <Bell className="h-4 w-4" />,
  sms: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  call: <PhoneCall className="h-4 w-4" />,
};

const STATUS_BADGES: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
  sent: { variant: "default", label: "Sent" },
  failed: { variant: "destructive", label: "Failed" },
  skipped: { variant: "secondary", label: "Skipped" },
  opted_out: { variant: "outline", label: "Opted Out" },
};

export default function NotificationAuditPage() {
  const navigate = useNavigate();
  const [channelFilter, setChannelFilter] = useState<AuditChannel>("all");
  const [statusFilter, setStatusFilter] = useState<AuditStatus>("all");
  const [dateRange, setDateRange] = useState<string>("7d");

  // Calculate date range
  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notification-audit", channelFilter, statusFilter, dateRange],
    queryFn: async (): Promise<NotificationAuditEntry[]> => {
      let query = supabase
        .from("notification_audit")
        .select("*")
        .gte("created_at", getStartDate().toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row) => mapAuditEntry(row as Record<string, unknown>));
    },
  });

  // Stats
  const stats = {
    total: logs?.length || 0,
    sent: logs?.filter((l) => l.status === "sent").length || 0,
    failed: logs?.filter((l) => l.status === "failed").length || 0,
    skipped: logs?.filter((l) => l.status === "skipped").length || 0,
    optedOut: logs?.filter((l) => l.status === "opted_out").length || 0,
    sms: logs?.filter((l) => l.channel === "sms").length || 0,
    email: logs?.filter((l) => l.channel === "email").length || 0,
    push: logs?.filter((l) => l.channel === "push").length || 0,
  };

  const handleExport = () => {
    if (!logs || logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const csv = [
      ["Timestamp", "Channel", "Event", "Destination", "Status", "Error", "Skip Reason", "Provider ID"].join(","),
      ...logs.map((log) =>
        [
          log.created_at,
          log.channel,
          log.event_type,
          log.destination_masked || "",
          log.status,
          (log.error || "").replace(/,/g, ";"),
          log.skip_reason || "",
          log.provider_id || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notification-audit-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Notification Audit Log</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Notifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-success">{stats.sent}</div>
              <p className="text-xs text-muted-foreground">Sent Successfully</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.skipped}</div>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.sms}</div>
                <p className="text-xs text-muted-foreground">SMS</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.email}</div>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.push}</div>
                <p className="text-xs text-muted-foreground">Push</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as AuditChannel)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AuditStatus)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="opted_out">Opted Out</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Time</TableHead>
                    <TableHead className="w-[80px]">Channel</TableHead>
                    <TableHead className="w-[120px]">Event</TableHead>
                    <TableHead className="w-[140px]">Destination</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const statusBadge = STATUS_BADGES[log.status] || { variant: "secondary" as const, label: log.status };
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {CHANNEL_ICONS[log.channel]}
                            <span className="text-xs uppercase">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{log.event_type}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {log.destination_masked || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.error && (
                            <span className="text-destructive">{log.error}</span>
                          )}
                          {log.skip_reason && (
                            <span className="text-muted-foreground">
                              Reason: {log.skip_reason}
                            </span>
                          )}
                          {log.provider_id && !log.error && !log.skip_reason && (
                            <span className="text-muted-foreground text-xs font-mono">
                              {log.provider_id.substring(0, 20)}...
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No audit logs found for the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
