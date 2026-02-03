/**
 * Admin Cancellations Module
 * Review and process cancellation requests
 */
import { useState } from "react";
import { 
  XCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminProcessCancellation } from "@/hooks/useAdminTravelDashboard";
import { format } from "date-fns";

interface CancellationRequest {
  id: string;
  order_number: string;
  holder_name: string;
  holder_email: string;
  total: number;
  cancellation_status: string;
  cancellation_reason: string | null;
  cancellation_requested_at: string | null;
  created_at: string;
  travel_order_items: {
    id: string;
    type: string;
    title: string;
    cancellable: boolean;
    cancellation_deadline: string | null;
  }[];
}

const AdminCancellationsModule = () => {
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["admin-cancellation-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_orders")
        .select(`
          id,
          order_number,
          holder_name,
          holder_email,
          total,
          cancellation_status,
          cancellation_reason,
          cancellation_requested_at,
          created_at,
          travel_order_items (id, type, title, cancellable, cancellation_deadline)
        `)
        .in("cancellation_status", ["requested", "under_review"])
        .order("cancellation_requested_at", { ascending: true });

      if (error) throw error;
      return data as CancellationRequest[];
    },
  });

  const processCancellation = useAdminProcessCancellation();

  const handleProcess = async () => {
    if (!selectedRequest || !actionType) return;

    await processCancellation.mutateAsync({
      orderId: selectedRequest.id,
      action: actionType,
      adminNotes: adminNotes || undefined,
      refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
    });

    setSelectedRequest(null);
    setAdminNotes("");
    setRefundAmount("");
    setActionType(null);
    refetch();
  };

  const openActionDialog = (request: CancellationRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setRefundAmount(request.total.toString());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cancellation Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review and process customer cancellation requests
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !requests?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <p className="text-lg font-medium">No Pending Requests</p>
            <p className="text-muted-foreground">All cancellation requests have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="font-mono">{request.order_number}</CardTitle>
                    <Badge className="bg-amber-500/10 text-amber-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {request.cancellation_status === "requested" ? "Pending Review" : "Under Review"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">${request.total.toLocaleString()}</p>
                </div>
                <CardDescription>
                  Requested {request.cancellation_requested_at 
                    ? format(new Date(request.cancellation_requested_at), "PPp")
                    : "Unknown"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{request.holder_name}</span>
                  </div>
                  <span className="text-muted-foreground">{request.holder_email}</span>
                </div>

                {/* Reason */}
                {request.cancellation_reason && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Customer Reason</p>
                        <p className="text-sm text-muted-foreground">{request.cancellation_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Summary */}
                <div className="flex flex-wrap gap-2">
                  {request.travel_order_items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm"
                    >
                      <span>{item.title}</span>
                      {item.cancellable ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Cancellation Policy Warning */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Review supplier cancellation policies before approving. Some items may be non-refundable.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    onClick={() => openActionDialog(request, "approve")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Refund
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => openActionDialog(request, "reject")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Cancellation & Process Refund" : "Reject Cancellation Request"}
            </DialogTitle>
            <DialogDescription>
              Order {selectedRequest?.order_number} - {selectedRequest?.holder_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "approve" && (
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="refundAmount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-9"
                    step="0.01"
                    min="0"
                    max={selectedRequest?.total}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Original total: ${selectedRequest?.total.toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes {actionType === "reject" && "(Required)"}</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={actionType === "approve" 
                  ? "Optional notes about this refund..."
                  : "Explain why this cancellation is being rejected..."
                }
                rows={3}
              />
            </div>

            {actionType === "approve" && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Process a Stripe refund of ${refundAmount || "0"}</li>
                  <li>Mark the order as cancelled</li>
                  <li>Send confirmation email to customer</li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={processCancellation.isPending || (actionType === "reject" && !adminNotes)}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {processCancellation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : actionType === "approve" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {actionType === "approve" ? "Approve & Refund" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCancellationsModule;
