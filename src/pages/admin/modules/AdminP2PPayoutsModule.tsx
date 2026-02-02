/**
 * Admin P2P Payouts Module
 * Manage owner payouts and process pending payouts
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  DollarSign, Users, Clock, CheckCircle, XCircle,
  Search, MoreHorizontal, RefreshCw, Send, Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminP2PPayouts,
  useUpdatePayoutStatus,
  useProcessP2PPayout,
  getPayoutStatusBadge,
} from "@/hooks/useP2PPayment";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

export default function AdminP2PPayoutsModule() {
  const { data: payouts, isLoading, refetch } = useAdminP2PPayouts();
  const updateStatus = useUpdatePayoutStatus();
  const processPayout = useProcessP2PPayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [stripeTransferId, setStripeTransferId] = useState("");

  // Calculate stats
  const stats = {
    total: payouts?.length || 0,
    pending: payouts?.filter((p) => p.status === "pending").length || 0,
    processing: payouts?.filter((p) => p.status === "processing").length || 0,
    completed: payouts?.filter((p) => p.status === "completed").length || 0,
    totalAmount: payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    pendingAmount:
      payouts
        ?.filter((p) => p.status === "pending" || p.status === "processing")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
  };

  // Filter payouts
  const filteredPayouts = payouts?.filter((payout) => {
    const owner = payout.owner as { full_name?: string; email?: string } | null;
    const matchesSearch =
      !searchTerm ||
      owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async () => {
    if (!selectedPayout || !newStatus) return;

    try {
      await updateStatus.mutateAsync({
        payoutId: selectedPayout.id,
        status: newStatus as any,
        notes: notes || undefined,
        stripeTransferId: stripeTransferId || undefined,
      });
      setShowStatusDialog(false);
      setSelectedPayout(null);
      setNewStatus("");
      setNotes("");
      setStripeTransferId("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleProcessAllPending = async () => {
    try {
      await processPayout.mutateAsync({ processAllPending: true });
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openStatusDialog = (payout: any) => {
    setSelectedPayout(payout);
    setNewStatus(payout.status);
    setNotes(payout.notes || "");
    setStripeTransferId(payout.stripe_transfer_id || "");
    setShowStatusDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(stats.totalAmount)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(stats.pendingAmount)} to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            <p className="text-sm text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by owner or payout ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleProcessAllPending}
            disabled={processPayout.isPending || stats.pending === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Process All Pending
          </Button>
        </div>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Records</CardTitle>
          <CardDescription>
            Manage owner payouts and track payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !filteredPayouts || filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No payouts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => {
                    const owner = payout.owner as { full_name?: string; email?: string } | null;
                    const statusBadge = getPayoutStatusBadge(payout.status);
                    return (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{owner?.full_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {owner?.email || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(payout.created_at!), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payout.processed_at
                            ? format(parseISO(payout.processed_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openStatusDialog(payout)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View / Update
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payout Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this payout
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {formatPrice(selectedPayout.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner ID</span>
                  <span className="font-mono text-sm">{selectedPayout.owner_id.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stripe Transfer ID (optional)</Label>
                <Input
                  placeholder="tr_..."
                  value={stripeTransferId}
                  onChange={(e) => setStripeTransferId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes about this payout..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
