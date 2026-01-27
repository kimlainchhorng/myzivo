import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Car, 
  Phone, 
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  Eye,
  ChevronRight
} from "lucide-react";
import { useDrivers, useUpdateDriverStatus, Driver } from "@/hooks/useDrivers";
import { useDriverDocuments } from "@/hooks/useDriverDocuments";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AdminDriverOnboardingQueue = () => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: drivers, isLoading } = useDrivers();
  const updateStatus = useUpdateDriverStatus();
  
  const pendingDrivers = drivers?.filter(d => d.status === "pending") || [];
  const recentApproved = drivers?.filter(d => d.status === "verified").slice(0, 5) || [];

  const handleApprove = (driver: Driver) => {
    updateStatus.mutate(
      { id: driver.id, status: "verified", documents_verified: true },
      {
        onSuccess: () => {
          setIsReviewDialogOpen(false);
          setSelectedDriver(null);
        }
      }
    );
  };

  const handleReject = (driver: Driver) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    updateStatus.mutate(
      { id: driver.id, status: "rejected", documents_verified: false },
      {
        onSuccess: () => {
          setIsReviewDialogOpen(false);
          setSelectedDriver(null);
          setRejectionReason("");
          setIsRejecting(false);
        }
      }
    );
  };

  const openReviewDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsReviewDialogOpen(true);
    setIsRejecting(false);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-amber-500">{pendingDrivers.length}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-3xl font-bold text-green-500">
                  {drivers?.filter(d => {
                    const today = new Date().toDateString();
                    return d.status === "verified" && new Date(d.updated_at).toDateString() === today;
                  }).length || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Review Time</p>
                <p className="text-3xl font-bold text-blue-500">2.4h</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <UserPlus className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
              <UserPlus className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Driver Onboarding Queue</CardTitle>
              <CardDescription>Review and approve new driver applications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32 mb-2" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingDrivers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending driver applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-amber-500/20">
                      <AvatarImage src={driver.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        {driver.full_name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{driver.full_name}</p>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1} in queue
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {driver.vehicle_type} • {driver.vehicle_model || driver.vehicle_plate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(driver.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(driver)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(driver)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Quick Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approvals */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Recently Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentApproved.map((driver) => (
              <div key={driver.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={driver.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {driver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{driver.full_name}</p>
                  <p className="text-xs text-muted-foreground">{driver.vehicle_type}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Verified
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Review Driver Application
            </DialogTitle>
            <DialogDescription>Review the driver's information and documents before approval</DialogDescription>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {selectedDriver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedDriver.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    {selectedDriver.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {selectedDriver.phone}
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium capitalize">{selectedDriver.vehicle_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">License Plate</p>
                  <p className="font-medium">{selectedDriver.vehicle_plate}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Vehicle Model</p>
                  <p className="font-medium">{selectedDriver.vehicle_model || "Not specified"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium">{selectedDriver.license_number}</p>
                </div>
              </div>

              {/* Documents Status */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Documents pending verification</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Review uploaded documents in the Documents tab for complete verification
                </p>
              </div>

              {/* Rejection Reason */}
              {isRejecting && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Explain why the application is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {isRejecting ? (
              <>
                <Button variant="ghost" onClick={() => setIsRejecting(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedDriver && handleReject(selectedDriver)}
                  disabled={updateStatus.isPending || !rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Confirm Rejection
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsRejecting(true)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => selectedDriver && handleApprove(selectedDriver)}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Driver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverOnboardingQueue;
