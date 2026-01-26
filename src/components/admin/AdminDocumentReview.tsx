import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  FileCheck,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
} from "lucide-react";
import {
  useDriverDocuments,
  usePendingDocuments,
  useUpdateDocumentStatus,
  getDocumentUrl,
  getDocumentTypeLabel,
  DriverDocumentWithDriver,
} from "@/hooks/useDriverDocuments";
import { format } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const AdminDocumentReview = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDocument, setSelectedDocument] = useState<DriverDocumentWithDriver | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const { data: allDocuments, isLoading: isLoadingAll } = useDriverDocuments();
  const { data: pendingDocuments, isLoading: isLoadingPending } = usePendingDocuments();
  const updateStatus = useUpdateDocumentStatus();

  const pendingCount = pendingDocuments?.length || 0;
  const approvedCount = allDocuments?.filter((d) => d.status === "approved").length || 0;
  const rejectedCount = allDocuments?.filter((d) => d.status === "rejected").length || 0;

  const displayedDocuments =
    activeTab === "pending"
      ? pendingDocuments
      : activeTab === "approved"
      ? allDocuments?.filter((d) => d.status === "approved")
      : activeTab === "rejected"
      ? allDocuments?.filter((d) => d.status === "rejected")
      : allDocuments;

  const isLoading = activeTab === "pending" ? isLoadingPending : isLoadingAll;

  const handleViewDocument = async (document: DriverDocumentWithDriver) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
    setIsLoadingImage(true);
    setZoom(1);
    setRotation(0);

    const url = await getDocumentUrl(document.file_path);
    setImageUrl(url);
    setIsLoadingImage(false);
  };

  const handleApprove = async () => {
    if (!selectedDocument) return;
    await updateStatus.mutateAsync({
      id: selectedDocument.id,
      status: "approved",
    });
    setIsPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleReject = () => {
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedDocument) return;
    await updateStatus.mutateAsync({
      id: selectedDocument.id,
      status: "rejected",
      notes: rejectNotes,
    });
    setIsRejectDialogOpen(false);
    setRejectNotes("");
    setIsPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = () => {
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type === "profile_photo") {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Review</h1>
        <p className="text-muted-foreground">Review and verify driver uploaded documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                {isLoadingPending ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{pendingCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                {isLoadingAll ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{approvedCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                {isLoadingAll ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Documents</CardTitle>
          <CardDescription>Click on a document to preview and review</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !displayedDocuments || displayedDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No documents found</p>
                  <p className="text-muted-foreground">
                    {activeTab === "pending"
                      ? "No documents are waiting for review"
                      : `No ${activeTab} documents yet`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayedDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            {getDocumentIcon(doc.document_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {getDocumentTypeLabel(doc.document_type)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={doc.driver?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {doc.driver?.full_name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm text-muted-foreground truncate">
                                {doc.driver?.full_name || "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              {getStatusBadge(doc.status)}
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.document_type)}
              {selectedDocument && getDocumentTypeLabel(selectedDocument.document_type)}
            </DialogTitle>
            <DialogDescription>
              Uploaded by {selectedDocument?.driver?.full_name || "Unknown"} on{" "}
              {selectedDocument && format(new Date(selectedDocument.uploaded_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Document Info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedDocument?.driver?.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedDocument?.driver?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDocument?.driver?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDocument?.driver?.email}</p>
                </div>
              </div>
              {selectedDocument && getStatusBadge(selectedDocument.status)}
            </div>

            {/* Image Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-16 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Preview */}
            <div className="relative overflow-auto border rounded-lg bg-muted/30 min-h-[300px] max-h-[400px]">
              {isLoadingImage ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading document...</p>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="flex items-center justify-center p-4">
                  <img
                    src={imageUrl}
                    alt={selectedDocument?.file_name || "Document"}
                    className="max-w-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Failed to load document</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Notes (if rejected) */}
            {selectedDocument?.status === "rejected" && selectedDocument?.notes && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedDocument.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDocument?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={updateStatus.isPending}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Document
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={updateStatus.isPending}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Document
                </Button>
              </>
            )}
            {selectedDocument?.status !== "pending" && (
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Document</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this document. The driver will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason (e.g., 'Document is blurry', 'Expired license', etc.)"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectNotes("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={!rejectNotes.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDocumentReview;
