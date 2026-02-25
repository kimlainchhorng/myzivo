/**
 * Admin Renters Module
 * Admin interface for managing renter verification
 */

import { useState } from "react";
import {
  useAdminRenters,
  useAdminRenterStats,
  useUpdateRenterStatus,
  useAdminRenterDocuments,
  useUpdateRenterDocumentStatus,
} from "@/hooks/useRenterVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  FileText,
  ExternalLink,
  Loader2,
  UserCheck,
  Ban,
} from "lucide-react";
import type { RenterVerificationStatus, AdminRenterListItem, RenterDocument } from "@/types/renter";
import { format, parseISO, differenceInDays } from "date-fns";

const statusFilters: { value: RenterVerificationStatus | "all"; label: string }[] = [
  { value: "all", label: "All Renters" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

function RenterStatusBadge({ status }: { status: RenterVerificationStatus }) {
  const config = {
    pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
    approved: { variant: "default" as const, label: "Approved", icon: CheckCircle },
    rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
    suspended: { variant: "destructive" as const, label: "Suspended", icon: Ban },
  };
  const { variant, label, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export default function AdminRentersModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RenterVerificationStatus | "all">("all");
  const [selectedRenter, setSelectedRenter] = useState<AdminRenterListItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});

  const { data: stats, isLoading: loadingStats } = useAdminRenterStats();
  const { data: renters = [], isLoading: loadingRenters } = useAdminRenters(
    statusFilter === "all" ? undefined : statusFilter
  );
  const { data: renterDocuments = [], isLoading: loadingDocs } = useAdminRenterDocuments(
    selectedRenter?.id || ""
  );
  const updateStatus = useUpdateRenterStatus();
  const updateDocStatus = useUpdateRenterDocumentStatus();

  // Filter renters by search
  const filteredRenters = renters.filter((renter) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      renter.full_name.toLowerCase().includes(query) ||
      renter.email?.toLowerCase().includes(query) ||
      renter.license_number?.toLowerCase().includes(query)
    );
  });

  const handleApproveRenter = async (renter: AdminRenterListItem) => {
    await updateStatus.mutateAsync({ renterId: renter.id, status: "approved" });
    setSelectedRenter(null);
  };

  const handleRejectRenter = async (renter: AdminRenterListItem) => {
    await updateStatus.mutateAsync({
      renterId: renter.id,
      status: "rejected",
      rejectionReason,
    });
    setRejectionReason("");
    setSelectedRenter(null);
  };

  const handleSuspendRenter = async (renter: AdminRenterListItem) => {
    await updateStatus.mutateAsync({
      renterId: renter.id,
      status: "suspended",
      rejectionReason,
    });
    setRejectionReason("");
    setSelectedRenter(null);
  };

  const handleDocumentAction = async (doc: RenterDocument, action: "approved" | "rejected") => {
    await updateDocStatus.mutateAsync({
      documentId: doc.id,
      status: action,
      notes: documentNotes[doc.id],
    });
  };

  const statsCards = [
    { label: "Total Renters", value: stats?.total ?? 0, icon: Users, color: "text-primary" },
    { label: "Pending Review", value: stats?.pending ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Approved", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Suspended", value: stats?.suspended ?? 0, icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">P2P Renters</h1>
        <p className="text-muted-foreground">Manage renter verification and document review</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {loadingStats ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RenterVerificationStatus | "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Renters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renter Verifications</CardTitle>
          <CardDescription>
            {filteredRenters.length} renter{filteredRenters.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRenters ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRenters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No renters found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Renter</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRenters.map((renter) => {
                    const licenseExpired = new Date(renter.license_expiration) < new Date();
                    return (
                      <TableRow key={renter.id}>
                        <TableCell>
                          <div className="font-medium">{renter.full_name}</div>
                          <div className="text-sm text-muted-foreground">{renter.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{renter.license_state} ****{renter.license_number.slice(-4)}</div>
                          <div className={`text-xs ${licenseExpired ? "text-destructive" : "text-muted-foreground"}`}>
                            Exp: {format(parseISO(renter.license_expiration), "MMM d, yyyy")}
                            {licenseExpired && " (Expired)"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RenterStatusBadge status={renter.verification_status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {renter.approvedDocumentsCount}/{renter.documentsCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(renter.created_at), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRenter(renter)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
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

      {/* Renter Detail Modal */}
      <Dialog open={!!selectedRenter} onOpenChange={() => setSelectedRenter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedRenter?.full_name}
              {selectedRenter && <RenterStatusBadge status={selectedRenter.verification_status} />}
            </DialogTitle>
            <DialogDescription>Review renter details and documents</DialogDescription>
          </DialogHeader>

          {selectedRenter && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedRenter.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">
                      {format(parseISO(selectedRenter.date_of_birth), "MMMM d, yyyy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">License Number</div>
                    <div className="font-medium">{selectedRenter.license_number}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">License State</div>
                    <div className="font-medium">{selectedRenter.license_state}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">License Expiration</div>
                    <div className={`font-medium ${new Date(selectedRenter.license_expiration) < new Date() ? "text-destructive" : ""}`}>
                      {format(parseISO(selectedRenter.license_expiration), "MMMM d, yyyy")}
                      {new Date(selectedRenter.license_expiration) < new Date() && " (EXPIRED)"}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium mb-3">Documents</h4>
                  {loadingDocs ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : renterDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-xl">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {renterDocuments.map((doc) => (
                        <Card
                          key={doc.id}
                          className={`${
                            doc.status === "approved"
                              ? "border-emerald-500/30"
                              : doc.status === "rejected"
                              ? "border-destructive/30"
                              : ""
                          }`}
                        >
                          <CardContent className="py-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium capitalize">
                                    {doc.document_type.replace("_", " ")}
                                  </span>
                                  <Badge
                                    variant={
                                      doc.status === "approved"
                                        ? "default"
                                        : doc.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {doc.status}
                                  </Badge>
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="px-0 h-auto text-xs"
                                  asChild
                                >
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    View Document <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              </div>

                              {doc.status === "pending" && (
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-emerald-600 hover:bg-emerald-500/10"
                                      onClick={() => handleDocumentAction(doc, "approved")}
                                      disabled={updateDocStatus.isPending}
                                    >
                                      {updateDocStatus.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDocumentAction(doc, "rejected")}
                                      disabled={updateDocStatus.isPending}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    placeholder="Note (optional)"
                                    className="text-xs h-8"
                                    value={documentNotes[doc.id] || ""}
                                    onChange={(e) =>
                                      setDocumentNotes((prev) => ({
                                        ...prev,
                                        [doc.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rejection reason */}
                {selectedRenter.verification_status === "pending" && (
                  <div>
                    <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                    <Textarea
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2">
            {selectedRenter?.verification_status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => handleRejectRenter(selectedRenter)}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveRenter(selectedRenter)}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Approve Renter
                </Button>
              </>
            )}
            {selectedRenter?.verification_status === "approved" && (
              <Button
                variant="destructive"
                onClick={() => handleSuspendRenter(selectedRenter)}
                disabled={updateStatus.isPending}
              >
                Suspend Renter
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
