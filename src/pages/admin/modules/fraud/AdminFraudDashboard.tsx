/**
 * Admin Fraud Dashboard
 * Monitor, review, and manage fraud assessments
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  RefreshCw,
  TrendingUp,
  Activity,
  Target,
} from "lucide-react";
import {
  useFraudAssessments,
  useFraudStats,
  useOverrideFraudDecision,
  useBlockUser,
  useFraudRules,
  useFraudThresholds,
  type FraudAssessment,
} from "@/hooks/useFraudData";

const riskLevelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

const decisionIcons: Record<string, React.ReactNode> = {
  allow: <CheckCircle className="h-4 w-4 text-green-500" />,
  review: <Eye className="h-4 w-4 text-yellow-500" />,
  block: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function AdminFraudDashboard() {
  const [riskFilter, setRiskFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<FraudAssessment | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [blockUserDialogOpen, setBlockUserDialogOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [newDecision, setNewDecision] = useState<"allow" | "review" | "block">("allow");

  const { data: assessments, isLoading, refetch } = useFraudAssessments({
    riskLevel: riskFilter,
    decision: decisionFilter,
  });
  const { data: stats } = useFraudStats();
  const { data: rules } = useFraudRules();
  const { data: thresholds } = useFraudThresholds();
  const overrideMutation = useOverrideFraudDecision();
  const blockUserMutation = useBlockUser();

  const handleOverride = async () => {
    if (!selectedAssessment || !overrideReason.trim()) {
      toast.error("Please provide a reason for the override");
      return;
    }

    try {
      await overrideMutation.mutateAsync({
        assessmentId: selectedAssessment.id,
        newDecision,
        reason: overrideReason,
        orderId: selectedAssessment.order_id,
      });
      toast.success("Decision overridden successfully");
      setOverrideDialogOpen(false);
      setOverrideReason("");
      setSelectedAssessment(null);
    } catch (error) {
      toast.error("Failed to override decision");
    }
  };

  const handleBlockUser = async () => {
    if (!selectedAssessment?.user_id || !overrideReason.trim()) {
      toast.error("Please provide a reason for blocking");
      return;
    }

    try {
      await blockUserMutation.mutateAsync({
        userId: selectedAssessment.user_id,
        reason: overrideReason,
      });
      toast.success("User blocked successfully");
      setBlockUserDialogOpen(false);
      setOverrideReason("");
      setSelectedAssessment(null);
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            Fraud Detection
          </h1>
          <p className="text-muted-foreground">Monitor risk scores and manage fraud decisions</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats?.totalAssessments || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats?.blockedCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{stats?.reviewCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats?.avgRiskScore || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {(stats?.criticalAlerts || 0) > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-100">
                  {stats?.criticalAlerts} Critical Alert{(stats?.criticalAlerts || 0) > 1 ? "s" : ""} Require Immediate Attention
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Review blocked transactions and take necessary action
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="rules">Rules & Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="allow">Allowed</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="block">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assessments Table */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Reasons</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : assessments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No fraud assessments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      assessments?.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-mono text-xs">
                            {assessment.order?.order_number || assessment.order_id?.slice(0, 8) || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {assessment.order?.holder_email || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    assessment.risk_score >= 80
                                      ? "bg-red-500"
                                      : assessment.risk_score >= 60
                                      ? "bg-orange-500"
                                      : assessment.risk_score >= 30
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${assessment.risk_score}%` }}
                                />
                              </div>
                              <span className="font-mono text-sm">{assessment.risk_score}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={riskLevelColors[assessment.risk_level]}>
                              {assessment.risk_level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {decisionIcons[assessment.decision]}
                              <span className="capitalize">{assessment.decision}</span>
                              {assessment.manual_override && (
                                <Badge variant="outline" className="ml-1 text-xs">Override</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(assessment.reasons || []).slice(0, 2).map((reason, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {reason.length > 20 ? reason.slice(0, 20) + "..." : reason}
                                </Badge>
                              ))}
                              {(assessment.reasons?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(assessment.reasons?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(assessment.created_at), "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedAssessment(assessment)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Fraud Assessment Details</DialogTitle>
                                    <DialogDescription>
                                      Order: {assessment.order?.order_number || assessment.order_id}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Risk Score</label>
                                        <p className="text-2xl font-bold">{assessment.risk_score}/100</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Decision</label>
                                        <div className="flex items-center gap-2 mt-1">
                                          {decisionIcons[assessment.decision]}
                                          <span className="text-lg capitalize">{assessment.decision}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Risk Signals</label>
                                      <div className="mt-2 space-y-2">
                                        {(assessment.reasons || []).map((reason, i) => (
                                          <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm">{reason}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">IP Address</label>
                                        <p className="text-muted-foreground">{assessment.ip_address || "Unknown"}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">Geo Country</label>
                                        <p className="text-muted-foreground">{assessment.geo_country || "Unknown"}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">Card Country</label>
                                        <p className="text-muted-foreground">{assessment.card_country || "Unknown"}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">VPN Detected</label>
                                        <p className="text-muted-foreground">{assessment.is_vpn ? "Yes" : "No"}</p>
                                      </div>
                                    </div>

                                    {assessment.manual_override && (
                                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-100">
                                          Manual Override Applied
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-300">
                                          Reason: {assessment.override_reason}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssessment(assessment);
                                  setOverrideDialogOpen(true);
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>

                              {assessment.user_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setSelectedAssessment(assessment);
                                    setBlockUserDialogOpen(true);
                                  }}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Thresholds</CardTitle>
                <CardDescription>Score ranges and automatic decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Score Range</TableHead>
                      <TableHead>Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {thresholds?.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Badge className={riskLevelColors[t.level]}>{t.level}</Badge>
                        </TableCell>
                        <TableCell>{t.min_score} - {t.max_score}</TableCell>
                        <TableCell className="capitalize">{t.default_decision}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Active Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Rules</CardTitle>
                <CardDescription>Fraud signals and their weights</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {rules?.filter((r) => r.is_active).map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium text-sm">{rule.rule_name}</p>
                          <p className="text-xs text-muted-foreground">{rule.description}</p>
                        </div>
                        <Badge variant="outline">+{rule.weight}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Fraud Decision</DialogTitle>
            <DialogDescription>
              Change the decision for this assessment. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Decision</label>
              <Select value={newDecision} onValueChange={(v) => setNewDecision(v as typeof newDecision)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason (Required)</label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you're overriding this decision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOverride} disabled={overrideMutation.isPending}>
              {overrideMutation.isPending ? "Saving..." : "Override Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={blockUserDialogOpen} onOpenChange={setBlockUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Block User
            </DialogTitle>
            <DialogDescription>
              This will prevent the user from making any future bookings.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason (Required)</label>
            <Textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why you're blocking this user..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockUser} disabled={blockUserMutation.isPending}>
              {blockUserMutation.isPending ? "Blocking..." : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
