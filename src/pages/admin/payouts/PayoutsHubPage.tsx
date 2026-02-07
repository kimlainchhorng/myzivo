/**
 * PayoutsHubPage - Admin payout management with balance calculations
 */

import { useState } from "react";
import { format } from "date-fns";
import { Wallet, Plus, Search, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePayouts, useAllDriverBalances, useCreatePayout, useUpdatePayoutStatus } from "@/hooks/useDriverPayouts";
import { useDrivers } from "@/hooks/useDrivers";
import { PAYOUT_STATUSES, PLATFORM_COMMISSION_RATE, DRIVER_SHARE_RATE } from "@/config/adminConfig";
import { cn } from "@/lib/utils";

const PayoutsHubPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");

  const { data: payouts, isLoading, refetch } = usePayouts({ status: statusFilter });
  const { data: balances } = useAllDriverBalances();
  const { data: drivers } = useDrivers();
  const createPayout = useCreatePayout();
  const updateStatus = useUpdatePayoutStatus();

  // Get driver balance
  const getDriverBalance = (driverId: string) => {
    return balances?.find((b) => b.driverId === driverId)?.balance || 0;
  };

  // Handle create payout
  const handleCreatePayout = async () => {
    if (!selectedDriverId || !payoutAmount) return;
    await createPayout.mutateAsync({
      driverId: selectedDriverId,
      amount: parseFloat(payoutAmount),
      notes: payoutNotes || undefined,
    });
    setIsCreateOpen(false);
    setSelectedDriverId("");
    setPayoutAmount("");
    setPayoutNotes("");
  };

  // Handle status update
  const handleStatusUpdate = async (payoutId: string, status: string) => {
    await updateStatus.mutateAsync({ payoutId, status });
  };

  // Calculate summary stats
  const totalPending = payouts?.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalPaid = payouts?.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalBalance = balances?.reduce((sum, b) => sum + b.balance, 0) || 0;

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "text-amber-500 bg-amber-500/10", icon: <Clock className="w-3 h-3" /> },
      processing: { color: "text-blue-500 bg-blue-500/10", icon: <Clock className="w-3 h-3" /> },
      paid: { color: "text-green-500 bg-green-500/10", icon: <CheckCircle className="w-3 h-3" /> },
      failed: { color: "text-red-500 bg-red-500/10", icon: <XCircle className="w-3 h-3" /> },
    };
    const cfg = config[status || ""] || { color: "text-muted-foreground bg-muted", icon: null };
    return (
      <Badge className={cn("gap-1", cfg.color)}>
        {cfg.icon}
        {status || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Payouts Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage driver payouts and track balances
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Payout</DialogTitle>
                  <DialogDescription>
                    Create a payout for a driver. Balance = 85% of completed rides - paid payouts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.map((driver) => {
                          const balance = getDriverBalance(driver.id);
                          return (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.full_name} (Balance: ${balance.toFixed(2)})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedDriverId && (
                      <p className="text-xs text-muted-foreground">
                        Available balance: ${getDriverBalance(selectedDriverId).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Add notes..."
                      value={payoutNotes}
                      onChange={(e) => setPayoutNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePayout}
                    disabled={!selectedDriverId || !payoutAmount || createPayout.isPending}
                  >
                    Create Payout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-500">
                ${totalPending.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Pending Payouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                ${totalPaid.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                ${totalBalance.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Owed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-lg font-bold">
                {(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% / {(DRIVER_SHARE_RATE * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Platform / Driver Split</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {PAYOUT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !payouts || payouts.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No payouts found</h3>
                <p className="text-muted-foreground text-sm">
                  Create a new payout to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="hidden md:table-cell">Processed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payout.driver?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{payout.driver?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          ${(payout.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {format(new Date(payout.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {payout.processed_at
                            ? format(new Date(payout.processed_at), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {payout.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(payout.id, "paid")}
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(payout.id, "failed")}
                                disabled={updateStatus.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayoutsHubPage;
