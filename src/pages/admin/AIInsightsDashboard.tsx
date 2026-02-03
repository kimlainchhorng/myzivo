/**
 * ZIVO Admin AI Insights Dashboard
 * AI-powered optimization monitoring and management
 */

import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAIInsightsSummary,
  useFraudAlerts,
  useUpdateFraudAlert,
  useAllPricingSuggestions,
  useAllCLVScores,
  useAIModelMetrics,
} from "@/hooks/useAIOptimization";
import { AIFraudAlert, UserCLVScore, AIPricingSuggestion, FraudAlertStatus } from "@/types/ai";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_COLORS = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  critical: "bg-red-500/10 text-red-600 border-red-500/30",
};

const CLV_TIER_COLORS = {
  standard: "bg-gray-500/10 text-gray-600",
  bronze: "bg-amber-700/10 text-amber-700",
  silver: "bg-slate-400/10 text-slate-500",
  gold: "bg-yellow-500/10 text-yellow-600",
  platinum: "bg-violet-500/10 text-violet-600",
};

export default function AIInsightsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAlert, setSelectedAlert] = useState<AIFraudAlert | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [fraudStatusFilter, setFraudStatusFilter] = useState<string>("pending");

  const { data: summary, isLoading: summaryLoading } = useAIInsightsSummary();
  const { data: fraudAlerts, isLoading: fraudLoading } = useFraudAlerts(
    fraudStatusFilter as FraudAlertStatus
  );
  const { data: pricingSuggestions } = useAllPricingSuggestions();
  const { data: clvScores } = useAllCLVScores();
  const { data: modelMetrics } = useAIModelMetrics();
  const updateFraudAlert = useUpdateFraudAlert();

  const handleReviewAlert = (status: FraudAlertStatus) => {
    if (!selectedAlert) return;
    updateFraudAlert.mutate({
      id: selectedAlert.id,
      status,
      review_notes: reviewNotes,
      action_taken: status === "confirmed" ? "Account flagged for review" : undefined,
    });
    setSelectedAlert(null);
    setReviewNotes("");
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform intelligence, optimization, and fraud detection
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Models
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary?.pendingFraudAlerts || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">pending</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.criticalAlerts || 0} critical alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pricing Suggestions</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.acceptedSuggestions || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {summary?.pricingSuggestions || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted by partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recommendation CTR</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary?.recommendationClickRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.totalRecommendations || 0} total shown
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg CLV Score</CardTitle>
            <Users className="w-4 h-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.avgCLVScore || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.churnRiskUsers || 0} high churn risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fraud" className="gap-2">
            <ShieldAlert className="w-4 h-4" />
            Fraud Detection
            {(summary?.pendingFraudAlerts || 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                {summary?.pendingFraudAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Pricing AI
          </TabsTrigger>
          <TabsTrigger value="clv" className="gap-2">
            <Users className="w-4 h-4" />
            Customer Value
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Model Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Transparency Notice */}
            <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI Transparency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ZIVO's AI systems are designed to <strong>suggest and optimize</strong>, never to
                  auto-book, auto-charge, or make changes without user/admin approval. All AI
                  decisions are logged and can be reviewed. Partners and admins always have final
                  control.
                </p>
              </CardContent>
            </Card>

            {/* Active AI Features */}
            <Card>
              <CardHeader>
                <CardTitle>Active AI Features</CardTitle>
                <CardDescription>Currently deployed optimization systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Smart Search Ranking", status: "active", impact: "+12% conversion" },
                  { name: "Dynamic Pricing Suggestions", status: "active", impact: "+8% revenue" },
                  { name: "Cross-Service Recommendations", status: "active", impact: "+15% cross-sell" },
                  { name: "Fraud Detection", status: "active", impact: "0.02% false positive" },
                  { name: "CLV Scoring", status: "active", impact: "85% accuracy" },
                  { name: "Partner Performance Insights", status: "active", impact: "+20% engagement" },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{feature.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                      {feature.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Activity</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Fraud alert generated", type: "alert", time: "2 minutes ago" },
                  { action: "Pricing suggestion sent to 12 car owners", type: "pricing", time: "15 minutes ago" },
                  { action: "CLV scores updated for 1,245 users", type: "clv", time: "1 hour ago" },
                  { action: "Search ranking model retrained", type: "model", time: "3 hours ago" },
                  { action: "Partner insights generated", type: "insights", time: "6 hours ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {activity.type === "alert" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {activity.type === "pricing" && <DollarSign className="w-4 h-4 text-emerald-500" />}
                      {activity.type === "clv" && <Users className="w-4 h-4 text-violet-500" />}
                      {activity.type === "model" && <Brain className="w-4 h-4 text-blue-500" />}
                      {activity.type === "insights" && <Sparkles className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fraud & Risk Alerts</CardTitle>
                  <CardDescription>AI-detected suspicious activity requiring review</CardDescription>
                </div>
                <Select value={fraudStatusFilter} onValueChange={setFraudStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {fraudLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading alerts...</p>
              ) : fraudAlerts?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No {fraudStatusFilter} alerts</p>
                  <p className="text-muted-foreground">All clear for now</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fraudAlerts?.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {alert.alert_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={SEVERITY_COLORS[alert.severity]}
                          >
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={alert.risk_score * 100}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">{(alert.risk_score * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {alert.entity_type}: {alert.entity_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing AI Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Suggestions</CardTitle>
              <CardDescription>
                AI-generated pricing recommendations for partners (suggestions only, never auto-applied)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Type</TableHead>
                    <TableHead>Suggestion</TableHead>
                    <TableHead>Current → Suggested</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingSuggestions?.slice(0, 20).map((suggestion) => (
                    <TableRow key={suggestion.id}>
                      <TableCell className="font-medium capitalize">
                        {suggestion.target_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          suggestion.suggestion_type === "increase" 
                            ? "bg-emerald-500/10 text-emerald-600"
                            : suggestion.suggestion_type === "decrease"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }>
                          {suggestion.suggestion_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${suggestion.current_value} → ${suggestion.suggested_value}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={suggestion.confidence_score * 100}
                            className="w-12 h-2"
                          />
                          <span className="text-sm">{(suggestion.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          suggestion.status === "accepted" ? "default" :
                          suggestion.status === "rejected" ? "destructive" :
                          "secondary"
                        }>
                          {suggestion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLV Tab */}
        <TabsContent value="clv">
          <Card>
            <CardHeader>
              <CardTitle>Customer Lifetime Value Scores</CardTitle>
              <CardDescription>
                AI-estimated value and churn risk for prioritizing support and offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>CLV Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Avg Order</TableHead>
                    <TableHead>Churn Risk</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clvScores?.slice(0, 20).map((score) => (
                    <TableRow key={score.id}>
                      <TableCell className="font-mono text-sm">
                        {score.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-bold">
                        ${parseFloat(String(score.clv_score)).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={CLV_TIER_COLORS[score.clv_tier]}>
                          {score.clv_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{score.total_bookings}</TableCell>
                      <TableCell>${parseFloat(String(score.avg_order_value)).toFixed(0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {parseFloat(String(score.churn_risk)) > 0.7 && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <Progress
                            value={parseFloat(String(score.churn_risk)) * 100}
                            className="w-12 h-2"
                          />
                          <span className="text-sm">{(parseFloat(String(score.churn_risk)) * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {score.last_activity_at
                          ? formatDistanceToNow(new Date(score.last_activity_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { name: "Search Ranking", version: "v2.3", accuracy: 94, lift: 12, updated: "2 hours ago" },
              { name: "Fraud Detection", version: "v1.8", accuracy: 98, lift: 0, updated: "1 day ago" },
              { name: "Pricing Optimization", version: "v1.5", accuracy: 87, lift: 8, updated: "3 hours ago" },
              { name: "CLV Prediction", version: "v1.2", accuracy: 85, lift: 0, updated: "6 hours ago" },
              { name: "Recommendations", version: "v2.0", accuracy: 76, lift: 15, updated: "12 hours ago" },
              { name: "Partner Insights", version: "v1.1", accuracy: 82, lift: 20, updated: "1 day ago" },
            ].map((model) => (
              <Card key={model.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge variant="outline">{model.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={model.accuracy} className="flex-1" />
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                    </div>
                    {model.lift > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Lift</p>
                        <p className="text-xl font-bold text-emerald-600">+{model.lift}%</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last updated: {model.updated}</span>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fraud Alert Review Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Review Fraud Alert
            </DialogTitle>
            <DialogDescription>
              Review the AI-detected indicators and take action
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Alert Type</p>
                  <p className="font-medium capitalize">
                    {selectedAlert.alert_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge className={SEVERITY_COLORS[selectedAlert.severity]}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="font-bold text-lg">{(selectedAlert.risk_score * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-mono text-sm">{selectedAlert.entity_id}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Risk Indicators</p>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  {selectedAlert.indicators?.map((indicator: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>{indicator.description || indicator.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Review Notes</p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your review..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleReviewAlert("dismissed")}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReviewAlert("confirmed")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Fraud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
