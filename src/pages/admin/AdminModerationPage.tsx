/**
 * AdminModerationPage — Content & user report moderation queue
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flag, Search, CheckCircle, AlertTriangle, XCircle, Clock,
  Shield, User, MessageSquare, RefreshCw, Eye, Ban, ChevronDown, ChevronUp,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Low" },
  medium: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Medium" },
  high: { color: "bg-orange-500/10 text-orange-600 border-orange-500/20", label: "High" },
  critical: { color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Critical" },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Pending" },
  reviewing: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Reviewing" },
  resolved: { color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Resolved" },
  dismissed: { color: "bg-muted text-muted-foreground border-border", label: "Dismissed" },
  escalated: { color: "bg-purple-500/10 text-purple-600 border-purple-500/20", label: "Escalated" },
};

export default function AdminModerationPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Abuse reports
  const { data: abuseReports, isLoading: loadingAbuse } = useQuery({
    queryKey: ["admin-abuse-reports", statusFilter],
    queryFn: async () => {
      let q = (supabase as any)
        .from("abuse_reports")
        .select("id, report_type, reason, status, created_at, notes, reporter_id, reported_user_id, driver_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Feedback flags (complaints / reports from feedback_submissions)
  const { data: feedbackFlags, isLoading: loadingFeedback } = useQuery({
    queryKey: ["admin-feedback-flags"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("feedback_submissions")
        .select("id, category, message, created_at, user_id, status")
        .in("category", ["report_user", "inappropriate_content", "spam", "harassment", "scam", "safety_concern", "price_mismatch"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
    enabled: isAdmin,
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["admin-mod-stats"],
    queryFn: async () => {
      const db = supabase as any;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [pending, resolvedToday, escalated, total] = await Promise.all([
        db.from("abuse_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        db.from("abuse_reports").select("id", { count: "exact", head: true }).eq("status", "resolved").gte("updated_at", today.toISOString()),
        db.from("abuse_reports").select("id", { count: "exact", head: true }).eq("status", "escalated"),
        db.from("abuse_reports").select("id", { count: "exact", head: true }),
      ]);
      return {
        pending: pending.count || 0,
        resolvedToday: resolvedToday.count || 0,
        escalated: escalated.count || 0,
        total: total.count || 0,
      };
    },
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  // Update report status
  const updateReport = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await (supabase as any)
        .from("abuse_reports")
        .update({
          status,
          notes: notes || undefined,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast({ title: `Report ${vars.status}`, description: "Moderation action saved." });
      queryClient.invalidateQueries({ queryKey: ["admin-abuse-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-mod-stats"] });
      setExpandedId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to update report.", variant: "destructive" }),
  });

  const filteredAbuse = (abuseReports || []).filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (r.report_type || "").toLowerCase().includes(s) ||
      (r.reason || "").toLowerCase().includes(s) ||
      (r.reporter_id || "").toLowerCase().includes(s);
  });

  const filteredFeedback = (feedbackFlags || []).filter((f: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (f.category || "").toLowerCase().includes(s) ||
      (f.message || "").toLowerCase().includes(s);
  });

  if (!isAdmin) {
    return (
      <AdminLayout title="Moderation">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Moderation">
      <div className="max-w-5xl space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Review", value: stats?.pending ?? "—", icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
            { label: "Resolved Today", value: stats?.resolvedToday ?? "—", icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
            { label: "Escalated", value: stats?.escalated ?? "—", icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
            { label: "Total Reports", value: stats?.total ?? "—", icon: Flag, color: "text-primary bg-primary/10" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color.split(" ")[1])}>
                  <s.icon className={cn("w-5 h-5", s.color.split(" ")[0])} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by type, reason, user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {["pending", "reviewing", "escalated", "resolved", "all"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="text-xs h-7 px-3 capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="abuse">
          <TabsList>
            <TabsTrigger value="abuse" className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Abuse Reports
              {stats?.pending ? (
                <Badge variant="destructive" className="ml-1 text-[10px] h-4 min-w-4 px-1">{stats.pending}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback Flags
              {(feedbackFlags || []).length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 min-w-4 px-1">{(feedbackFlags || []).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Abuse Reports Tab */}
          <TabsContent value="abuse" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">Report Queue</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-abuse-reports"] })}
                  className="gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loadingAbuse ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : filteredAbuse.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="text-sm">No reports match your filters.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredAbuse.map((report: any) => {
                      const isExpanded = expandedId === report.id;
                      const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                      const typeSeverity = ["harassment", "scam", "threat"].includes(report.report_type) ? "high" :
                        ["spam", "inappropriate"].includes(report.report_type) ? "medium" : "low";
                      const sevCfg = SEVERITY_CONFIG[typeSeverity];

                      return (
                        <div key={report.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Flag className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-foreground capitalize">
                                    {(report.report_type || "Report").replace(/_/g, " ")}
                                  </span>
                                  <Badge variant="outline" className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</Badge>
                                  <Badge variant="outline" className={cn("text-[10px]", sevCfg.color)}>{sevCfg.label}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{report.reason || "No reason provided"}</p>
                                <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                  {report.reporter_id && <span className="flex items-center gap-1"><User className="w-3 h-3" />Reporter: {report.reporter_id.slice(0, 8)}…</span>}
                                  {report.reported_user_id && <span>Target: {report.reported_user_id.slice(0, 8)}…</span>}
                                  <span><Clock className="w-3 h-3 inline mr-1" />{new Date(report.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {report.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 gap-1.5 text-green-600 border-green-500/30 hover:bg-green-500/10"
                                    onClick={() => updateReport.mutate({ id: report.id, status: "resolved" })}
                                    disabled={updateReport.isPending}
                                  >
                                    <CheckCircle className="w-3 h-3" /> Dismiss
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 gap-1.5 text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                                    onClick={() => updateReport.mutate({ id: report.id, status: "escalated" })}
                                    disabled={updateReport.isPending}
                                  >
                                    <AlertTriangle className="w-3 h-3" /> Escalate
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="mt-4 ml-11 p-4 rounded-xl bg-muted/40 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground text-xs">Report ID</span><p className="font-mono text-xs mt-0.5">{report.id}</p></div>
                                <div><span className="text-muted-foreground text-xs">Status</span><p className="capitalize mt-0.5">{report.status}</p></div>
                                {report.driver_id && <div><span className="text-muted-foreground text-xs">Driver ID</span><p className="font-mono text-xs mt-0.5">{report.driver_id.slice(0, 16)}…</p></div>}
                                {report.notes && <div className="col-span-2"><span className="text-muted-foreground text-xs">Notes</span><p className="mt-0.5">{report.notes}</p></div>}
                              </div>
                              {report.status === "pending" && (
                                <div className="flex gap-2 pt-2 border-t border-border">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs gap-1.5"
                                    onClick={() => updateReport.mutate({ id: report.id, status: "reviewing" })}
                                    disabled={updateReport.isPending}
                                  >
                                    <Eye className="w-3 h-3" /> Mark Reviewing
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs gap-1.5 text-red-600 border-red-500/30 hover:bg-red-500/10"
                                    onClick={() => updateReport.mutate({ id: report.id, status: "escalated", notes: "Escalated for user action" })}
                                    disabled={updateReport.isPending}
                                  >
                                    <Ban className="w-3 h-3" /> Escalate + Note
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs gap-1.5 text-green-600 border-green-500/30 hover:bg-green-500/10"
                                    onClick={() => updateReport.mutate({ id: report.id, status: "dismissed" })}
                                    disabled={updateReport.isPending}
                                  >
                                    <XCircle className="w-3 h-3" /> Dismiss
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Flags Tab */}
          <TabsContent value="feedback" className="mt-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Flagged Feedback Submissions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingFeedback ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : filteredFeedback.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="text-sm">No flagged feedback submissions.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredFeedback.map((item: any) => (
                      <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground capitalize">
                                {(item.category || "feedback").replace(/_/g, " ")}
                              </span>
                              <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">
                                Flagged
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.message || "No message"}</p>
                            <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                              {item.user_id && <span><User className="w-3 h-3 inline mr-1" />{item.user_id.slice(0, 8)}…</span>}
                              <span><Clock className="w-3 h-3 inline mr-1" />{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
