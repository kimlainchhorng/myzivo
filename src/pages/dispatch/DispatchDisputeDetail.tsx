/**
 * Dispatch Dispute Detail Page
 * Admin view for managing a single dispute with refund actions
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  User,
  DollarSign,
  Shield,
  ShieldOff,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  useDispute,
  useRefundRequests,
  useDisputeAuditLogs,
  useUpdateDispute,
  useAssignDispute,
} from "@/hooks/useDisputes";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { DisputeReasonBadge } from "@/components/disputes/DisputeReasonBadge";
import { DisputePriorityBadge } from "@/components/disputes/DisputePriorityBadge";
import { DisputeTimeline } from "@/components/disputes/DisputeTimeline";
import { DisputeRefundDialog } from "@/components/disputes/DisputeRefundDialog";

const formatCurrency = (value: number | null | undefined) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const DispatchDisputeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: dispute, isLoading } = useDispute(id);
  const { data: refundRequests = [] } = useRefundRequests(id);
  const { data: auditLogs = [] } = useDisputeAuditLogs(id);
  const updateDispute = useUpdateDispute();
  const assignDispute = useAssignDispute();

  // Calculate total refunded
  const totalRefunded = refundRequests
    .filter((r) => r.status === "refunded")
    .reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Dispute not found</h2>
        <Button variant="link" asChild className="mt-4">
          <Link to="/dispatch/disputes">Back to Disputes</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: string) => {
    await updateDispute.mutateAsync({ id: dispute.id, status });
  };

  const handlePriorityChange = async (priority: string) => {
    await updateDispute.mutateAsync({ id: dispute.id, priority });
  };

  const handlePayoutHoldToggle = async (hold: boolean) => {
    await updateDispute.mutateAsync({ id: dispute.id, payout_hold: hold });
  };

  const handleSaveNotes = async () => {
    await updateDispute.mutateAsync({
      id: dispute.id,
      resolution_notes: resolutionNotes,
    });
  };

  const handleAssign = async () => {
    await assignDispute.mutateAsync(dispute.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dispatch/disputes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Dispute #{dispute.id.slice(0, 8).toUpperCase()}
            </h1>
            <DisputeStatusBadge status={dispute.status} />
            <DisputePriorityBadge priority={dispute.priority} />
            {dispute.payout_hold && (
              <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Shield className="h-3 w-3" />
                Payout Held
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Created {format(new Date(dispute.created_at), "PPP 'at' p")}
          </p>
        </div>
        {!dispute.assigned_admin_id && (
          <Button onClick={handleAssign} disabled={assignDispute.isPending}>
            {assignDispute.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            Assign to Me
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Details
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/dispatch/orders/${dispute.order_id}`}>
                    View Order <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm text-muted-foreground">Order ID</span>
                <p className="font-mono">{dispute.order_id.slice(0, 8)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Order Total</span>
                <p className="font-bold text-lg">
                  {formatCurrency(dispute.order?.total_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Customer</span>
                <p>{dispute.order?.customer_name || "Unknown"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <p className="capitalize">{dispute.order?.payment_status || "Unknown"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Details */}
          <Card>
            <CardHeader>
              <CardTitle>Dispute Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <div className="mt-1">
                    <DisputeReasonBadge reason={dispute.reason} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Created By</span>
                  <p className="capitalize">{dispute.created_role}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Requested Refund
                  </span>
                  <p className="font-medium">
                    {dispute.requested_refund_amount > 0
                      ? formatCurrency(dispute.requested_refund_amount)
                      : "Full refund requested"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Total Refunded
                  </span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(totalRefunded)}
                  </p>
                </div>
              </div>

              {dispute.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="mt-1 p-3 bg-muted rounded-xl text-sm">
                    {dispute.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund History */}
          {refundRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refund History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {refundRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium">{formatCurrency(req.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(req.created_at), "PPP")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={req.status === "refunded" ? "default" : "secondary"}
                          className={
                            req.status === "refunded"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : req.status === "failed"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : ""
                          }
                        >
                          {req.status}
                        </Badge>
                        {req.stripe_refund_id && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {req.stripe_refund_id}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <DisputeTimeline
                auditLogs={auditLogs}
                refundRequests={refundRequests}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={dispute.status}
                  onValueChange={handleStatusChange}
                  disabled={updateDispute.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={dispute.priority}
                  onValueChange={handlePriorityChange}
                  disabled={updateDispute.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Refund Action */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Total</span>
                  <span>{formatCurrency(dispute.order?.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Refunded</span>
                  <span className="text-amber-600">
                    -{formatCurrency(totalRefunded)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Available</span>
                  <span>
                    {formatCurrency(
                      (dispute.order?.total_amount || 0) - totalRefunded
                    )}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setRefundDialogOpen(true)}
                disabled={
                  (dispute.order?.total_amount || 0) - totalRefunded <= 0
                }
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Process Refund
              </Button>
            </CardContent>
          </Card>

          {/* Payout Hold */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Hold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hold Driver Payout</Label>
                  <p className="text-xs text-muted-foreground">
                    Prevents driver payout until resolved
                  </p>
                </div>
                <Switch
                  checked={dispute.payout_hold}
                  onCheckedChange={handlePayoutHoldToggle}
                  disabled={updateDispute.isPending}
                />
              </div>

              {dispute.payout_hold ? (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Payout is currently held
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl">
                  <ShieldOff className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Payout can proceed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes about the resolution..."
                value={resolutionNotes || dispute.resolution_notes || ""}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveNotes}
                disabled={updateDispute.isPending}
              >
                {updateDispute.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refund Dialog */}
      <DisputeRefundDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        disputeId={dispute.id}
        orderId={dispute.order_id}
        maxAmount={dispute.order?.total_amount || 0}
        requestedAmount={dispute.requested_refund_amount}
        previouslyRefunded={totalRefunded}
      />
    </div>
  );
};

export default DispatchDisputeDetail;
