/**
 * Admin Damage Reports Module
 * Comprehensive admin panel for reviewing and resolving damage reports
 */

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Search,
  Eye,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAdminDamageReports,
  useDamageReportStats,
  useUpdateDamageStatus,
  useCreateInsuranceClaim,
  useResolveDamageReport,
  useDamageEvidence,
} from "@/hooks/useDamageReport";
import DamageStatusBadge from "@/components/damage/DamageStatusBadge";
import type { DamageReportWithDetails, P2PDamageStatus } from "@/types/damage";

export default function AdminDamageReportsModule() {
  const [statusFilter, setStatusFilter] = useState<P2PDamageStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<DamageReportWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);

  const { data: reports, isLoading } = useAdminDamageReports(
    statusFilter === "all" ? undefined : statusFilter
  );
  const { data: stats } = useDamageReportStats();
  const updateStatus = useUpdateDamageStatus();
  const createInsuranceClaim = useCreateInsuranceClaim();
  const resolveReport = useResolveDamageReport();

  // Filter reports
  const filteredReports = reports?.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.id.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.booking?.vehicle?.make?.toLowerCase().includes(query) ||
      report.booking?.vehicle?.model?.toLowerCase().includes(query)
    );
  });

  const handleViewReport = (report: DamageReportWithDetails) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (status: P2PDamageStatus) => {
    if (!selectedReport) return;
    await updateStatus.mutateAsync({
      reportId: selectedReport.id,
      status,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Damage Reports</h2>
        <p className="text-muted-foreground">
          Review and resolve damage reports from renters and owners
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reported || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.underReview || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resolvedThisMonth || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as P2PDamageStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="info_requested">Info Requested</SelectItem>
                <SelectItem value="insurance_claim_submitted">Insurance Pending</SelectItem>
                <SelectItem value="resolved_owner_paid">Resolved - Owner Paid</SelectItem>
                <SelectItem value="resolved_renter_charged">Resolved - Renter Charged</SelectItem>
                <SelectItem value="closed_no_action">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !filteredReports?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No damage reports found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-xs">
                      {report.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {report.booking?.vehicle ? (
                        <span>
                          {report.booking.vehicle.year} {report.booking.vehicle.make}{" "}
                          {report.booking.vehicle.model}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.reporter_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DamageStatusBadge status={report.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      {report.estimated_repair_cost ? (
                        `$${report.estimated_repair_cost.toFixed(2)}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DamageReportDetailModal
        report={selectedReport}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReport(null);
        }}
        onStatusChange={handleStatusChange}
        onResolve={() => {
          setDetailModalOpen(false);
          setResolveModalOpen(true);
        }}
        onInsuranceClaim={() => {
          setDetailModalOpen(false);
          setInsuranceModalOpen(true);
        }}
      />

      {/* Resolve Modal */}
      <ResolveReportModal
        report={selectedReport}
        open={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setSelectedReport(null);
        }}
        onResolve={async (data) => {
          await resolveReport.mutateAsync(data);
        }}
        isLoading={resolveReport.isPending}
      />

      {/* Insurance Modal */}
      <InsuranceClaimModal
        report={selectedReport}
        open={insuranceModalOpen}
        onClose={() => {
          setInsuranceModalOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={async (data) => {
          await createInsuranceClaim.mutateAsync(data);
        }}
        isLoading={createInsuranceClaim.isPending}
      />
    </div>
  );
}

// Detail Modal Component
function DamageReportDetailModal({
  report,
  open,
  onClose,
  onStatusChange,
  onResolve,
  onInsuranceClaim,
}: {
  report: DamageReportWithDetails | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: P2PDamageStatus) => Promise<void>;
  onResolve: () => void;
  onInsuranceClaim: () => void;
}) {
  const { data: evidence } = useDamageEvidence(report?.id);

  if (!report) return null;

  const isResolved = [
    "resolved_owner_paid",
    "resolved_renter_charged",
    "closed_no_action",
  ].includes(report.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Damage Report #{report.id.slice(0, 8).toUpperCase()}</span>
            <DamageStatusBadge status={report.status} />
          </DialogTitle>
          <DialogDescription>
            Reported by {report.reporter_role} on{" "}
            {format(new Date(report.created_at), "PPp")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="evidence">Evidence ({evidence?.length || 0})</TabsTrigger>
              <TabsTrigger value="booking">Booking</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Description
                </h4>
                <p className="whitespace-pre-wrap">{report.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Date Noticed
                  </h4>
                  <p>{format(new Date(report.date_noticed), "PPp")}</p>
                </div>
                {report.estimated_repair_cost && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Estimated Cost
                    </h4>
                    <p>${report.estimated_repair_cost.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Priority
                  </h4>
                  <Badge variant="outline" className="capitalize">
                    {report.priority}
                  </Badge>
                </div>
              </div>

              {report.admin_notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Admin Notes
                  </h4>
                  <p className="text-muted-foreground">{report.admin_notes}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
              {evidence?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {evidence.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <a
                        href={photo.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all"
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption || "Evidence"}
                          className="w-full h-full object-cover"
                        />
                      </a>
                      <div className="text-xs">
                        <Badge variant="outline" className="capitalize">
                          {photo.image_type}
                        </Badge>
                        {photo.caption && (
                          <p className="mt-1 text-muted-foreground">{photo.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No evidence uploaded
                </p>
              )}
            </TabsContent>

            <TabsContent value="booking" className="mt-4 space-y-4">
              {report.booking?.vehicle && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Vehicle
                  </h4>
                  <p>
                    {report.booking.vehicle.year} {report.booking.vehicle.make}{" "}
                    {report.booking.vehicle.model}
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Rental Period
                  </h4>
                  <p>
                    {report.booking && format(new Date(report.booking.pickup_date), "MMM d")} -{" "}
                    {report.booking && format(new Date(report.booking.return_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Total Amount
                  </h4>
                  <p>${report.booking?.total_amount?.toFixed(2)}</p>
                </div>
              </div>
              {report.booking?.renter && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Renter
                  </h4>
                  <p>{report.booking.renter.email}</p>
                </div>
              )}
              {report.booking?.owner && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Owner
                  </h4>
                  <p>{report.booking.owner.full_name}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {!isResolved && (
          <>
            <Separator className="my-4" />
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex gap-2 flex-1">
                {report.status === "reported" && (
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange("under_review")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start Review
                  </Button>
                )}
                {["reported", "under_review"].includes(report.status) && (
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange("info_requested")}
                  >
                    Request Info
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onInsuranceClaim}>
                  <Shield className="w-4 h-4 mr-2" />
                  Insurance Claim
                </Button>
                <Button onClick={onResolve}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Resolve Modal Component
function ResolveReportModal({
  report,
  open,
  onClose,
  onResolve,
  isLoading,
}: {
  report: DamageReportWithDetails | null;
  open: boolean;
  onClose: () => void;
  onResolve: (data: {
    damage_report_id: string;
    decision: "owner_paid" | "renter_charged" | "no_action" | "partial";
    owner_payout_adjustment?: number;
    renter_charge_amount?: number;
    admin_notes?: string;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  const [decision, setDecision] = useState<"owner_paid" | "renter_charged" | "no_action" | "partial">("no_action");
  const [payoutAdjustment, setPayoutAdjustment] = useState("");
  const [renterCharge, setRenterCharge] = useState("");
  const [notes, setNotes] = useState("");

  if (!report) return null;

  const handleSubmit = async () => {
    await onResolve({
      damage_report_id: report.id,
      decision,
      owner_payout_adjustment: payoutAdjustment ? parseFloat(payoutAdjustment) : undefined,
      renter_charge_amount: renterCharge ? parseFloat(renterCharge) : undefined,
      admin_notes: notes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Damage Report</DialogTitle>
          <DialogDescription>
            Choose a resolution for this damage report
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
                <SelectItem value="owner_paid">Compensate Owner</SelectItem>
                <SelectItem value="renter_charged">Charge Renter</SelectItem>
                <SelectItem value="partial">Partial Resolution</SelectItem>
                <SelectItem value="no_action">No Action Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["owner_paid", "partial"].includes(decision) && (
            <div className="space-y-2">
              <Label>Owner Payout Adjustment ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={payoutAdjustment}
                onChange={(e) => setPayoutAdjustment(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          )}

          {["renter_charged", "partial"].includes(decision) && (
            <div className="space-y-2">
              <Label>Amount to Charge Renter ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={renterCharge}
                onChange={(e) => setRenterCharge(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Resolution Notes</Label>
            <Textarea
              placeholder="Add notes about this resolution..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Resolve Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Insurance Claim Modal Component
function InsuranceClaimModal({
  report,
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  report: DamageReportWithDetails | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    damage_report_id: string;
    insurance_provider: string;
    claim_reference?: string;
    notes?: string;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  if (!report) return null;

  const handleSubmit = async () => {
    await onSubmit({
      damage_report_id: report.id,
      insurance_provider: provider,
      claim_reference: reference || undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Insurance Claim</DialogTitle>
          <DialogDescription>
            Record insurance claim details for this damage report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Insurance Provider *</Label>
            <Input
              placeholder="e.g., State Farm, Geico"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Claim Reference Number</Label>
            <Input
              placeholder="Claim #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any relevant notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !provider}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Submit Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
