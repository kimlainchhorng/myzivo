/**
 * Admin P2P Owners Module
 * Admin interface for managing car owner applications
 */

import { useState } from "react";
import { useCarOwners, useAdminOwnerStats, useUpdateOwnerStatus, useAdminOwnerDocuments, useUpdateDocumentStatus, useUpdateDocumentsVerified } from "@/hooks/useAdminP2P";
import { useCreateTestOwner } from "@/hooks/useAdminP2PTestData";
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
  Users, Clock, CheckCircle, XCircle, AlertTriangle, Search, 
  Eye, UserCheck, UserX, FileText, ExternalLink, Loader2, Plus
} from "lucide-react";
import type { CarOwnerStatus, AdminOwnerListItem, CarOwnerDocument } from "@/types/p2p";
import OwnerStatusBadge from "@/components/owner/OwnerStatusBadge";
import { format } from "date-fns";

const statusFilters: { value: CarOwnerStatus | "all"; label: string }[] = [
  { value: "all", label: "All Owners" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminP2POwnersModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CarOwnerStatus | "all">("all");
  const [selectedOwner, setSelectedOwner] = useState<AdminOwnerListItem | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({});

  const { data: stats, isLoading: loadingStats } = useAdminOwnerStats();
  const { data: owners = [], isLoading: loadingOwners } = useCarOwners(
    statusFilter === "all" ? undefined : statusFilter
  );
  const { data: ownerDocuments = [], isLoading: loadingDocs } = useAdminOwnerDocuments(
    selectedOwner?.id || ""
  );
  const updateStatus = useUpdateOwnerStatus();
  const updateDocStatus = useUpdateDocumentStatus();
  const updateDocsVerified = useUpdateDocumentsVerified();
  const createTestOwner = useCreateTestOwner();

  // Filter owners by search
  const filteredOwners = owners.filter((owner) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      owner.full_name.toLowerCase().includes(query) ||
      owner.email?.toLowerCase().includes(query) ||
      owner.phone?.toLowerCase().includes(query)
    );
  });

  const handleApproveOwner = async (owner: AdminOwnerListItem) => {
    await updateStatus.mutateAsync({ ownerId: owner.id, status: "verified" });
    setSelectedOwner(null);
  };

  const handleRejectOwner = async (owner: AdminOwnerListItem) => {
    await updateStatus.mutateAsync({ ownerId: owner.id, status: "rejected" });
    setRejectionNote("");
    setSelectedOwner(null);
  };

  const handleDocumentAction = async (doc: CarOwnerDocument, action: "approved" | "rejected") => {
    await updateDocStatus.mutateAsync({
      documentId: doc.id,
      status: action,
      notes: documentNotes[doc.id],
    });
    
    // Check if all documents are now approved
    if (action === "approved" && selectedOwner) {
      const updatedDocs = ownerDocuments.map((d) =>
        d.id === doc.id ? { ...d, status: "approved" } : d
      );
      const allApproved = updatedDocs.every((d) => d.status === "approved");
      if (allApproved) {
        await updateDocsVerified.mutateAsync({
          ownerId: selectedOwner.id,
          verified: true,
        });
      }
    }
  };

  const statsCards = [
    { label: "Total Owners", value: stats?.total ?? 0, icon: Users, color: "text-primary" },
    { label: "Pending Review", value: stats?.pending ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Verified", value: stats?.verified ?? 0, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Suspended", value: stats?.suspended ?? 0, icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">P2P Car Owners</h1>
          <p className="text-muted-foreground">Manage car owner applications and verification</p>
        </div>
        <Button
          onClick={() => createTestOwner.mutate()}
          disabled={createTestOwner.isPending}
        >
          {createTestOwner.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Test Owner
        </Button>
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
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CarOwnerStatus | "all")}>
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

      {/* Owners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Applications</CardTitle>
          <CardDescription>
            {filteredOwners.length} owner{filteredOwners.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOwners ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredOwners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No owners found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOwners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <div className="font-medium">{owner.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {owner.city}, {owner.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{owner.email}</div>
                        <div className="text-sm text-muted-foreground">{owner.phone}</div>
                      </TableCell>
                      <TableCell>
                        <OwnerStatusBadge status={owner.status} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {owner.approvedDocumentsCount}/{owner.documentsCount}
                          </span>
                          {owner.documents_verified && (
                            <CheckCircle className="h-4 w-4 text-emerald-500 ml-1" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {owner.created_at ? format(new Date(owner.created_at), "MMM d, yyyy") : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOwner(owner)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Detail Modal */}
      <Dialog open={!!selectedOwner} onOpenChange={() => setSelectedOwner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedOwner?.full_name}
              {selectedOwner && <OwnerStatusBadge status={selectedOwner.status} size="sm" />}
            </DialogTitle>
            <DialogDescription>
              Review owner details and documents
            </DialogDescription>
          </DialogHeader>

          {selectedOwner && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedOwner.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{selectedOwner.phone}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">
                      {selectedOwner.date_of_birth 
                        ? format(new Date(selectedOwner.date_of_birth), "MMMM d, yyyy")
                        : "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Insurance</div>
                    <div className="font-medium capitalize">
                      {selectedOwner.insurance_option?.replace("_", " ") || "Not selected"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">Address</div>
                    <div className="font-medium">
                      {selectedOwner.address}, {selectedOwner.city}, {selectedOwner.state} {selectedOwner.zip_code}
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
                  ) : ownerDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ownerDocuments.map((doc) => (
                        <Card key={doc.id} className={`${
                          doc.status === "approved" ? "border-emerald-500/30" :
                          doc.status === "rejected" ? "border-destructive/30" : ""
                        }`}>
                          <CardContent className="py-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium capitalize">
                                    {doc.document_type.replace("_", " ")}
                                  </span>
                                  <Badge variant={
                                    doc.status === "approved" ? "default" :
                                    doc.status === "rejected" ? "destructive" : "secondary"
                                  } className="text-xs">
                                    {doc.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {doc.file_name}
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
                                    onChange={(e) => setDocumentNotes(prev => ({
                                      ...prev,
                                      [doc.id]: e.target.value
                                    }))}
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

                {/* Rejection Note (for rejecting owner) */}
                {selectedOwner.status === "pending" && (
                  <div>
                    <label className="text-sm font-medium">Rejection Note (optional)</label>
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedOwner?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleRejectOwner(selectedOwner)}
                  disabled={updateStatus.isPending}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleApproveOwner(selectedOwner)}
                  disabled={updateStatus.isPending || !selectedOwner.documents_verified}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  Approve Owner
                </Button>
              </>
            )}
            {selectedOwner?.status === "verified" && (
              <Button
                variant="outline"
                className="text-orange-600 hover:bg-orange-500/10"
                onClick={() => updateStatus.mutateAsync({ 
                  ownerId: selectedOwner.id, 
                  status: "suspended" 
                }).then(() => setSelectedOwner(null))}
                disabled={updateStatus.isPending}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Suspend Owner
              </Button>
            )}
            {selectedOwner?.status === "suspended" && (
              <Button
                onClick={() => updateStatus.mutateAsync({ 
                  ownerId: selectedOwner.id, 
                  status: "verified" 
                }).then(() => setSelectedOwner(null))}
                disabled={updateStatus.isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Reinstate Owner
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
