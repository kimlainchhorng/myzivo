/**
 * Admin P2P Disputes Module
 * Manage and resolve P2P booking disputes
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle, Search, MoreHorizontal, Eye, CheckCircle,
  Clock, XCircle, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  useAdminDisputes,
  useUpdateDisputeStatus,
  getDisputeStatusBadge,
  getDisputeTypeLabel,
} from "@/hooks/useP2PDispute";
import { formatPrice } from "@/lib/currency";

export default function AdminP2PDisputesModule() {
  const { data: disputes, isLoading, refetch } = useAdminDisputes();
  const updateStatus = useUpdateDisputeStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolutionAmount, setResolutionAmount] = useState("");

  // Calculate stats
  const stats = {
    total: disputes?.length || 0,
    open: disputes?.filter((d) => d.status === "open").length || 0,
    investigating: disputes?.filter((d) => d.status === "investigating").length || 0,
    resolved: disputes?.filter((d) => d.status === "resolved").length || 0,
  };

  // Filter disputes
  const filteredDisputes = disputes?.filter((dispute) => {
    const booking = dispute.booking as any;
    const matchesSearch =
      !searchTerm ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetailDialog = (dispute: any) => {
    setSelectedDispute(dispute);
    setNewStatus(dispute.status || "open");
    setAdminNotes(dispute.admin_notes || "");
    setResolution(dispute.resolution || "");
    setResolutionAmount(dispute.resolution_amount?.toString() || "");
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDispute || !newStatus) return;

    await updateStatus.mutateAsync({
      disputeId: selectedDispute.id,
      status: newStatus as any,
      adminNotes: adminNotes || undefined,
      resolution: resolution || undefined,
      resolutionAmount: resolutionAmount ? parseFloat(resolutionAmount) : undefined,
    });

    setShowDetailDialog(false);
    setSelectedDispute(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Total Disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Open
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Investigating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search disputes..."
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes</CardTitle>
          <CardDescription>Manage and resolve P2P booking disputes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !filteredDisputes || filteredDisputes.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No disputes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => {
                    const statusBadge = getDisputeStatusBadge(dispute.status);
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">
                          {getDisputeTypeLabel(dispute.dispute_type)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {dispute.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={dispute.priority === "high" ? "destructive" : "outline"}>
                            {dispute.priority || "medium"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(dispute.created_at!), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(dispute)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
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

      {/* Detail/Update Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Review and update the dispute status
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {getDisputeTypeLabel(selectedDispute.dispute_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedDispute.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filed</p>
                  <p className="text-sm">
                    {format(parseISO(selectedDispute.created_at!), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes (internal)</Label>
                <Textarea
                  placeholder="Add internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Resolution (visible to user)</Label>
                <Textarea
                  placeholder="Describe the resolution..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Resolution Amount (if applicable)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={resolutionAmount}
                  onChange={(e) => setResolutionAmount(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
              Update Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
