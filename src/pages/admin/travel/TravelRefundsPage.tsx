/**
 * Travel Refunds Page
 * Manage refund requests for travel bookings
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Loader2, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RefundRequest {
  id: string;
  booking_id: string;
  requested_by: string;
  amount: number;
  reason: string;
  status: string;
  supplier_ref: string | null;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string;
  booking_reference?: string;
  customer_email?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  requested: { label: "Requested", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Clock },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  paid: { label: "Paid", color: "bg-primary/10 text-primary border-primary/20", icon: DollarSign },
};

const TravelRefundsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: "approve" | "reject" | null }>({
    open: false,
    action: null,
  });
  const [actionNotes, setActionNotes] = useState("");

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ["admin-travel-refunds", statusFilter],
    queryFn: async (): Promise<RefundRequest[]> => {
      // Table might not exist yet - return empty array
      // In production, this would query the travel_refund_requests table
      try {
        // Mock empty response since table doesn't exist yet
        return [];
      } catch {
        return [];
      }
    },
  });

  const updateRefundMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("travel_refund_requests" as any)
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-travel-refunds"] });
      toast.success("Refund status updated");
      setActionDialog({ open: false, action: null });
      setSelectedRefund(null);
      setActionNotes("");
    },
    onError: () => {
      toast.error("Failed to update refund");
    },
  });

  const handleAction = (refund: RefundRequest, action: "approve" | "reject") => {
    setSelectedRefund(refund);
    setActionDialog({ open: true, action });
  };

  const confirmAction = () => {
    if (!selectedRefund || !actionDialog.action) return;
    const newStatus = actionDialog.action === "approve" ? "approved" : "rejected";
    updateRefundMutation.mutate({ id: selectedRefund.id, status: newStatus, notes: actionNotes });
  };

  const filteredRefunds = refunds.filter((refund) => {
    if (statusFilter !== "all" && refund.status !== statusFilter) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      refund.booking_reference?.toLowerCase().includes(searchLower) ||
      refund.customer_email?.toLowerCase().includes(searchLower) ||
      refund.id.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    pending: refunds.filter((r) => r.status === "requested" || r.status === "processing").length,
    approved: refunds.filter((r) => r.status === "approved").length,
    totalAmount: refunds.filter((r) => r.status === "approved" || r.status === "paid").reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refund Requests</h1>
        <p className="text-muted-foreground">Process travel booking refunds</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Queue</CardTitle>
          <CardDescription>{filteredRefunds.length} request(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No refund requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => {
                  const config = statusConfig[refund.status] || statusConfig.requested;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={refund.id}>
                      <TableCell className="font-mono text-sm">
                        {refund.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {refund.booking_reference || refund.booking_id?.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm">
                          {refund.reason || "No reason provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${refund.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(refund.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {refund.status === "requested" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleAction(refund, "approve")}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleAction(refund, "reject")}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" ? "Approve Refund" : "Reject Refund"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "approve"
                ? "This will approve the refund request and notify the customer."
                : "This will reject the refund request. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${selectedRefund.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reason</span>
                  <span>{selectedRefund.reason || "—"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  placeholder="Add any notes..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={updateRefundMutation.isPending}
            >
              {updateRefundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionDialog.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelRefundsPage;
