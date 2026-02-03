/**
 * Admin Insurance Claims Management
 * View, process, and resolve insurance claims
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Shield,
  Search,
  Filter,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useInsuranceClaims,
  useClaimsStats,
  useUpdateClaimStatus,
  type InsuranceClaim,
} from "@/hooks/useProtectionPlans";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: Clock },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  denied: { label: "Denied", color: "bg-red-100 text-red-700", icon: XCircle },
  paid_out: { label: "Paid Out", color: "bg-violet-100 text-violet-700", icon: DollarSign },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: FileText },
};

export default function InsuranceClaimsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [payoutAmounts, setPayoutAmounts] = useState({
    covered: "",
    renterResponsibility: "",
    ownerPayout: "",
  });

  const { data: claims, isLoading } = useInsuranceClaims(statusFilter);
  const { data: stats } = useClaimsStats();
  const updateStatus = useUpdateClaimStatus();

  // Filter by search
  const filteredClaims = claims?.filter((claim) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      claim.claim_number?.toLowerCase().includes(query) ||
      claim.booking_id.toLowerCase().includes(query)
    );
  });

  const handleUpdateStatus = (newStatus: InsuranceClaim["status"]) => {
    if (!selectedClaim) return;

    const updates: Partial<InsuranceClaim> = {
      admin_notes: adminNotes || selectedClaim.admin_notes,
    };

    if (newStatus === "approved" || newStatus === "paid_out") {
      updates.covered_amount = parseFloat(payoutAmounts.covered) || selectedClaim.covered_amount;
      updates.renter_responsibility = parseFloat(payoutAmounts.renterResponsibility) || selectedClaim.renter_responsibility;
      updates.owner_payout = parseFloat(payoutAmounts.ownerPayout) || selectedClaim.owner_payout;
    }

    updateStatus.mutate(
      { claimId: selectedClaim.id, status: newStatus, updates },
      {
        onSuccess: () => {
          setActionModal(null);
          setSelectedClaim(null);
          setAdminNotes("");
          setPayoutAmounts({ covered: "", renterResponsibility: "", ownerPayout: "" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Insurance Claims
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage protection claims and payouts
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Claims</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-600">{stats?.underReview || 0}</p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-emerald-600">{stats?.approved || 0}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">${(stats?.totalDamageAmount || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Damage</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">${(stats?.totalCovered || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Covered Amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by claim number or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="submitted">New</TabsTrigger>
              <TabsTrigger value="under_review">Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid_out">Paid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Claims Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClaims && filteredClaims.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Protection</TableHead>
                    <TableHead>Damage Amount</TableHead>
                    <TableHead>Deductible</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => {
                    const status = statusConfig[claim.status];
                    return (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono font-medium">
                          {claim.claim_number || claim.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", status.color)}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {claim.protection_tier || "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(claim.total_damage_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ${(claim.deductible_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(claim.submitted_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {claim.status === "submitted" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setActionModal("review");
                                }}
                              >
                                Review
                              </Button>
                            )}
                            {claim.status === "under_review" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-600"
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setPayoutAmounts({
                                      covered: String(claim.covered_amount || 0),
                                      renterResponsibility: String(claim.renter_responsibility || 0),
                                      ownerPayout: String(claim.owner_payout || 0),
                                    });
                                    setActionModal("approve");
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setActionModal("deny");
                                  }}
                                >
                                  Deny
                                </Button>
                              </>
                            )}
                            {claim.status === "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setActionModal("payout");
                                }}
                              >
                                Process Payout
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/cars/claims/${claim.id}`)}
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
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No claims found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Disclosure */}
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p>
            ZIVO does not provide insurance coverage. Protection plans are offered by 
            licensed third-party providers. All claim decisions are subject to policy 
            terms and conditions.
          </p>
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={actionModal === "review"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Claim Review</DialogTitle>
            <DialogDescription>
              Move claim {selectedClaim?.claim_number} to under review status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Damage:</span>
                <span className="font-medium">${(selectedClaim?.total_damage_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deductible:</span>
                <span>${(selectedClaim?.deductible_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Protection Tier:</span>
                <span className="capitalize">{selectedClaim?.protection_tier}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add notes for this review..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateStatus("under_review")}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Start Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={actionModal === "approve"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Claim</DialogTitle>
            <DialogDescription>
              Confirm payout amounts for claim {selectedClaim?.claim_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Insurance Covered</Label>
                <Input
                  type="number"
                  value={payoutAmounts.covered}
                  onChange={(e) => setPayoutAmounts({ ...payoutAmounts, covered: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Renter Responsibility</Label>
                <Input
                  type="number"
                  value={payoutAmounts.renterResponsibility}
                  onChange={(e) => setPayoutAmounts({ ...payoutAmounts, renterResponsibility: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Owner Payout</Label>
              <Input
                type="number"
                value={payoutAmounts.ownerPayout}
                onChange={(e) => setPayoutAmounts({ ...payoutAmounts, ownerPayout: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Approval notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateStatus("approved")}
              disabled={updateStatus.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Modal */}
      <Dialog open={actionModal === "deny"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Claim</DialogTitle>
            <DialogDescription>
              Provide reason for denying claim {selectedClaim?.claim_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Denial Reason</Label>
              <Textarea
                placeholder="Explain why this claim is being denied..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateStatus("denied")}
              disabled={updateStatus.isPending || !adminNotes}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Deny Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Modal */}
      <Dialog open={actionModal === "payout"} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Confirm payout for claim {selectedClaim?.claim_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Owner Payout:</span>
                <span className="font-bold text-emerald-700">
                  ${(selectedClaim?.owner_payout || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Insurance Covered:</span>
                <span>${(selectedClaim?.covered_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>From Renter Deposit:</span>
                <span>${(selectedClaim?.renter_responsibility || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payout Notes</Label>
              <Textarea
                placeholder="Transaction reference, notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateStatus("paid_out")}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
