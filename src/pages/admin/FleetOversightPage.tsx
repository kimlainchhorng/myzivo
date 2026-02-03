/**
 * Admin Fleet Oversight Page
 * Manage fleet accounts, approvals, and performance
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  Car,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  DollarSign,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FleetOwnerProfile } from "@/hooks/useFleetManagement";

// Fetch all fleet profiles
function useAllFleets(status?: string) {
  return useQuery({
    queryKey: ["adminFleets", status],
    queryFn: async (): Promise<FleetOwnerProfile[]> => {
      let query = supabase
        .from("fleet_owner_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status as "pending" | "approved" | "suspended" | "rejected");
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FleetOwnerProfile[];
    },
  });
}

// Approve/reject fleet
function useUpdateFleetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fleetId,
      status,
      rejectionReason,
      customCommission,
    }: {
      fleetId: string;
      status: "approved" | "suspended" | "rejected";
      rejectionReason?: string;
      customCommission?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
        if (customCommission !== undefined) {
          updates.custom_commission_percent = customCommission;
        }
      }

      if (status === "rejected" && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from("fleet_owner_profiles")
        .update(updates)
        .eq("id", fleetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminFleets"] });
      toast.success(`Fleet ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update fleet");
    },
  });
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function FleetOversightPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFleet, setSelectedFleet] = useState<FleetOwnerProfile | null>(null);
  const [actionModal, setActionModal] = useState<"approve" | "reject" | "suspend" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customCommission, setCustomCommission] = useState<string>("");

  const { data: fleets, isLoading } = useAllFleets(statusFilter);
  const updateStatus = useUpdateFleetStatus();

  // Filter by search
  const filteredFleets = fleets?.filter((fleet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      fleet.business_name.toLowerCase().includes(query) ||
      fleet.contact_email.toLowerCase().includes(query) ||
      fleet.contact_name.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: fleets?.length || 0,
    pending: fleets?.filter((f) => f.status === "pending").length || 0,
    active: fleets?.filter((f) => f.status === "approved").length || 0,
    suspended: fleets?.filter((f) => f.status === "suspended").length || 0,
  };

  const handleApprove = () => {
    if (!selectedFleet) return;
    updateStatus.mutate({
      fleetId: selectedFleet.id,
      status: "approved",
      customCommission: customCommission ? parseFloat(customCommission) : undefined,
    });
    setActionModal(null);
    setSelectedFleet(null);
    setCustomCommission("");
  };

  const handleReject = () => {
    if (!selectedFleet) return;
    updateStatus.mutate({
      fleetId: selectedFleet.id,
      status: "rejected",
      rejectionReason,
    });
    setActionModal(null);
    setSelectedFleet(null);
    setRejectionReason("");
  };

  const handleSuspend = () => {
    if (!selectedFleet) return;
    updateStatus.mutate({
      fleetId: selectedFleet.id,
      status: "suspended",
      rejectionReason,
    });
    setActionModal(null);
    setSelectedFleet(null);
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Fleet Oversight</h1>
            <p className="text-sm text-muted-foreground">
              Manage fleet accounts and performance
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Fleets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.suspended}</p>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Active</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Fleet Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFleets && filteredFleets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFleets.map((fleet) => {
                    const status = statusConfig[fleet.status];
                    return (
                      <TableRow key={fleet.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fleet.business_name}</p>
                            <p className="text-sm text-muted-foreground">{fleet.contact_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", status.color)}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            {fleet.total_vehicles}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${(fleet.total_revenue || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {fleet.custom_commission_percent !== null
                            ? `${fleet.custom_commission_percent}%`
                            : "15% (default)"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(fleet.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {fleet.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-600"
                                  onClick={() => {
                                    setSelectedFleet(fleet);
                                    setActionModal("approve");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedFleet(fleet);
                                    setActionModal("reject");
                                  }}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {fleet.status === "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600"
                                onClick={() => {
                                  setSelectedFleet(fleet);
                                  setActionModal("suspend");
                                }}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/fleets/${fleet.id}`)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No fleet accounts found
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Approve Modal */}
      <Dialog open={actionModal === "approve"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Fleet Account</DialogTitle>
            <DialogDescription>
              Approve {selectedFleet?.business_name} as a fleet owner
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Commission Rate (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="15"
                  value={customCommission}
                  onChange={(e) => setCustomCommission(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for default 15% commission
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={actionModal === "reject"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Fleet Account</DialogTitle>
            <DialogDescription>
              Reject {selectedFleet?.business_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for Rejection</Label>
            <Textarea
              placeholder="Explain why this application is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateStatus.isPending || !rejectionReason}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={actionModal === "suspend"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Fleet Account</DialogTitle>
            <DialogDescription>
              Suspend {selectedFleet?.business_name}'s account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for Suspension</Label>
            <Textarea
              placeholder="Explain why this account is being suspended..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={updateStatus.isPending || !rejectionReason}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
