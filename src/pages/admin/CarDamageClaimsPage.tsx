/**
 * Admin Car Damage Claims Page
 * Review and resolve damage claims, manage deposit deductions
 */

import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Car,
  CheckCircle,
  DollarSign,
  Eye,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminDamageReports,
  useDamageReportStats,
  useUpdateDamageStatus,
  useResolveDamageReport,
  getDamageStatusBadge,
} from "@/hooks/useDamageReport";
import type { DamageReportWithDetails, P2PDamageStatus } from "@/types/damage";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CarDamageClaimsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<P2PDamageStatus | undefined>();
  const [selectedReport, setSelectedReport] = useState<DamageReportWithDetails | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  const { data: reports = [], isLoading } = useAdminDamageReports(statusFilter);
  const { data: stats } = useDamageReportStats();
  const updateStatus = useUpdateDamageStatus();
  const resolveReport = useResolveDamageReport();

  // Resolution form state
  const [decision, setDecision] = useState<"owner_paid" | "renter_charged" | "no_action" | "partial">("no_action");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleResolve = async () => {
    if (!selectedReport) return;

    await resolveReport.mutateAsync({
      damage_report_id: selectedReport.id,
      decision,
      owner_payout_adjustment: decision === "owner_paid" ? parseFloat(deductionAmount) || 0 : 0,
      renter_charge_amount: decision === "renter_charged" ? parseFloat(deductionAmount) || 0 : 0,
      admin_notes: adminNotes,
    });

    setResolveDialogOpen(false);
    setSelectedReport(null);
    setDecision("no_action");
    setDeductionAmount("");
    setAdminNotes("");
  };

  const openResolveDialog = (report: DamageReportWithDetails) => {
    setSelectedReport(report);
    setResolveDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Damage Claims | Admin" description="Review and resolve damage claims" />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  Damage Claims
                </h1>
                <p className="text-muted-foreground">
                  Review damage reports and manage deposit deductions
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-500/30">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-500">Reported</p>
                  <p className="text-2xl font-bold">{stats.reported}</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-500">Under Review</p>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                </CardContent>
              </Card>
              <Card className="border-cyan-500/30">
                <CardContent className="p-4">
                  <p className="text-sm text-cyan-500">Insurance Pending</p>
                  <p className="text-2xl font-bold">{stats.insurancePending}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/30">
                <CardContent className="p-4">
                  <p className="text-sm text-emerald-500">Resolved (Month)</p>
                  <p className="text-2xl font-bold">{stats.resolvedThisMonth}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter Tabs */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter(undefined)}>
                All
              </TabsTrigger>
              <TabsTrigger value="reported" onClick={() => setStatusFilter("reported")}>
                Reported
              </TabsTrigger>
              <TabsTrigger value="under_review" onClick={() => setStatusFilter("under_review")}>
                Under Review
              </TabsTrigger>
              <TabsTrigger value="insurance" onClick={() => setStatusFilter("insurance_claim_submitted")}>
                Insurance
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Claims List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-semibold mb-2">No Damage Claims</h3>
                <p className="text-muted-foreground">
                  {statusFilter ? "No claims match this filter." : "No damage claims have been reported."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const statusBadge = getDamageStatusBadge(report.status);
                const vehicle = report.booking?.vehicle;
                const hasEvidence = (report.evidence?.length || 0) > 0;

                return (
                  <Card key={report.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Vehicle Image */}
                        <div className="md:w-48 h-32 md:h-auto bg-muted flex-shrink-0">
                          {vehicle?.images && (vehicle.images as string[])[0] ? (
                            <img
                              src={(vehicle.images as string[])[0]}
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Car className="w-10 h-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">
                                {vehicle
                                  ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                                  : "Vehicle Details Unavailable"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Reported {format(new Date(report.created_at), "MMM d, yyyy")} by{" "}
                                {report.reporter_role === "owner" ? "Owner" : "Renter"}
                              </p>
                            </div>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {report.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            {report.estimated_repair_cost && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <DollarSign className="w-4 h-4" />
                                Est. ${report.estimated_repair_cost.toFixed(2)}
                              </span>
                            )}
                            {hasEvidence && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Camera className="w-4 h-4" />
                                {report.evidence?.length} photo(s)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t md:border-t-0 md:border-l flex md:flex-col gap-2 justify-end">
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <Link to={`/admin/damage/${report.id}`}>
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                          </Button>
                          {report.status === "reported" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                updateStatus.mutate({
                                  reportId: report.id,
                                  status: "under_review",
                                })
                              }
                            >
                              Start Review
                            </Button>
                          )}
                          {(report.status === "under_review" || report.status === "insurance_claim_submitted") && (
                            <Button size="sm" onClick={() => openResolveDialog(report)}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Damage Claim</DialogTitle>
            <DialogDescription>
              Decide how to handle this damage claim and any deposit deductions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_action">No Action - Release Deposit</SelectItem>
                  <SelectItem value="owner_paid">Pay Owner - Deduct from Deposit</SelectItem>
                  <SelectItem value="renter_charged">Charge Renter - Capture Deposit</SelectItem>
                  <SelectItem value="partial">Partial - Split Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(decision === "owner_paid" || decision === "renter_charged" || decision === "partial") && (
              <div className="space-y-2">
                <Label>
                  {decision === "owner_paid"
                    ? "Amount to Pay Owner"
                    : decision === "renter_charged"
                    ? "Amount to Deduct from Deposit"
                    : "Deduction Amount"}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                  />
                </div>
                {selectedReport?.estimated_repair_cost && (
                  <p className="text-xs text-muted-foreground">
                    Estimated cost: ${selectedReport.estimated_repair_cost.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Document your decision and reasoning..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolveReport.isPending}>
              {resolveReport.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Resolve Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
