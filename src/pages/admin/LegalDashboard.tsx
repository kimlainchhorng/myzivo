/**
 * ZIVO Admin Legal Dashboard
 * Manage policies, consents, SOT status, and disputes
 */

import { useState } from "react";
import {
  Scale,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Settings,
  Eye,
  Edit,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLegalSummary,
  useLegalPolicies,
  useSOTStatus,
  useUpdateSOTStatus,
  useAllConsentLogs,
  useLegalDisputes,
  useLegalAuditLogs,
} from "@/hooks/useLegalCompliance";
import { formatDistanceToNow, format } from "date-fns";
import { SellerOfTravelStatus } from "@/types/legal";

const SOT_STATUS_COLORS = {
  active: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  expired: "bg-red-500/10 text-red-600",
  exempt: "bg-blue-500/10 text-blue-600",
  not_required: "bg-gray-500/10 text-gray-600",
};

export default function LegalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editSOTOpen, setEditSOTOpen] = useState(false);
  const [selectedSOT, setSelectedSOT] = useState<SellerOfTravelStatus | null>(null);
  const [sotStatus, setSotStatus] = useState("");
  const [sotNumber, setSotNumber] = useState("");

  const { data: summary } = useLegalSummary();
  const { data: policies } = useLegalPolicies(false);
  const { data: sotStatuses } = useSOTStatus();
  const { data: consentLogs } = useAllConsentLogs(100);
  const { data: disputes } = useLegalDisputes();
  const { data: auditLogs } = useLegalAuditLogs(50);
  
  const updateSOT = useUpdateSOTStatus();

  const handleEditSOT = (sot: SellerOfTravelStatus) => {
    setSelectedSOT(sot);
    setSotStatus(sot.status);
    setSotNumber(sot.registration_number || "");
    setEditSOTOpen(true);
  };

  const handleSaveSOT = () => {
    if (selectedSOT) {
      updateSOT.mutate({
        stateCode: selectedSOT.state_code,
        updates: {
          status: sotStatus as any,
          registration_number: sotNumber || null,
        },
      });
      setEditSOTOpen(false);
    }
  };

  const exportConsentLogs = () => {
    if (!consentLogs) return;
    const csv = [
      ["User ID", "Policy Type", "Version", "Consent Given", "Method", "Timestamp", "IP Address"].join(","),
      ...consentLogs.map((log) =>
        [
          log.user_id,
          log.policy_type,
          log.policy_version,
          log.consent_given,
          log.consent_method,
          log.created_at,
          log.ip_address || "",
        ].join(",")
      ),
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consent-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary" />
            Legal Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage policies, consents, regulatory status, and disputes
          </p>
        </div>
        <Button variant="outline" onClick={exportConsentLogs} className="gap-2">
          <Download className="w-4 h-4" />
          Export Consent Logs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activePolicies || 0}</div>
            <p className="text-xs text-muted-foreground">Terms, Privacy, SOT, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SOT Status</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-lg font-bold">{summary?.sotStatesActive || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-lg font-bold">{summary?.sotStatesPending || 0}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Active / Pending registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.openDisputes || 0}</div>
            <p className="text-xs text-muted-foreground">Requiring resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.recentAuditLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Audit logs (7 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Scale className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2">
            <FileText className="w-4 h-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="sot" className="gap-2">
            <MapPin className="w-4 h-4" />
            Seller of Travel
          </TabsTrigger>
          <TabsTrigger value="consents" className="gap-2">
            <Users className="w-4 h-4" />
            Consents
          </TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Disputes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Update Terms of Service
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  Update Privacy Policy
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MapPin className="w-4 h-4" />
                  Update SOT Registrations
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Export All Consent Logs
                </Button>
              </CardContent>
            </Card>

            {/* Recent Audit Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs?.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium capitalize">{log.action_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{log.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                  {(!auditLogs || auditLogs.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Legal Policies</CardTitle>
              <CardDescription>Manage all platform policies and their versions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies?.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.title}</TableCell>
                      <TableCell>{policy.version}</TableCell>
                      <TableCell>
                        <Badge className={policy.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-600"}>
                          {policy.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.applies_to.slice(0, 3).map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {policy.applies_to.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{policy.applies_to.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(policy.effective_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOT Tab */}
        <TabsContent value="sot">
          <Card>
            <CardHeader>
              <CardTitle>Seller of Travel Registrations</CardTitle>
              <CardDescription>State-by-state registration status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sotStatuses?.map((sot) => (
                    <TableRow key={sot.state_code}>
                      <TableCell className="font-medium">{sot.state_name}</TableCell>
                      <TableCell>
                        <Badge className={SOT_STATUS_COLORS[sot.status]}>
                          {sot.status === "not_required" ? "Not Required" : sot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sot.registration_number || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(sot.updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSOT(sot)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consent Logs</CardTitle>
                  <CardDescription>User policy acceptances for audit</CardDescription>
                </div>
                <Button variant="outline" onClick={exportConsentLogs} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentLogs?.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{log.policy_type.replace(/_/g, " ")}</TableCell>
                      <TableCell>{log.policy_version}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.consent_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Legal Disputes</CardTitle>
              <CardDescription>Chargebacks, claims, and arbitration cases</CardDescription>
            </CardHeader>
            <CardContent>
              {disputes?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Open Disputes</p>
                  <p className="text-muted-foreground">All disputes have been resolved</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Filed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes?.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="capitalize">{dispute.dispute_type}</TableCell>
                        <TableCell className="capitalize">{dispute.service_type}</TableCell>
                        <TableCell>
                          {dispute.amount_disputed
                            ? `$${dispute.amount_disputed.toFixed(2)}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={dispute.status === "open" ? "destructive" : "secondary"}>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit SOT Dialog */}
      <Dialog open={editSOTOpen} onOpenChange={setEditSOTOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update SOT Status - {selectedSOT?.state_name}</DialogTitle>
            <DialogDescription>
              Update the Seller of Travel registration status for this state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={sotStatus} onValueChange={setSotStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="exempt">Exempt</SelectItem>
                  <SelectItem value="not_required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Registration Number</Label>
              <Input
                value={sotNumber}
                onChange={(e) => setSotNumber(e.target.value)}
                placeholder="e.g., CST-12345"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSOTOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSOT} disabled={updateSOT.isPending}>
              {updateSOT.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
