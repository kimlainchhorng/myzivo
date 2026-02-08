/**
 * Admin Safety Dashboard
 * Comprehensive moderation tools for incidents, blocks, fraud signals, and user holds
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  DollarSign, 
  FileWarning,
  CheckCircle2,
  XCircle,
  Eye,
  UserX,
  Unlock,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSafety } from "@/hooks/useAdminSafety";
import { format } from "date-fns";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

const severityColors: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/20 text-red-400",
  investigating: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-green-500/20 text-green-400",
  dismissed: "bg-zinc-500/20 text-zinc-400",
};

function AdminSafetyDashboard() {
  const {
    incidents,
    fraudSignals,
    payoutHolds,
    blockedUsers,
    resolveIncident,
    dismissIncident,
    suspendUser,
    unsuspendUser,
    applyPayoutHold,
    releasePayoutHold,
    removeBlock,
  } = useAdminSafety();

  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionDialog, setActionDialog] = useState<{
    type: "resolve" | "dismiss" | "suspend" | "hold" | "release" | "unblock" | null;
    targetId: string;
    targetName?: string;
  }>({ type: null, targetId: "" });

  // KPI calculations
  const openIncidents = incidents.data?.filter((i) => i.status === "open").length || 0;
  const todayFraudSignals = fraudSignals.data?.filter(
    (f) => new Date(f.created_at).toDateString() === new Date().toDateString()
  ).length || 0;
  const activeHolds = payoutHolds.data?.length || 0;
  const totalBlocks = blockedUsers.data?.length || 0;

  const handleAction = async () => {
    if (!actionDialog.type || !actionDialog.targetId) return;

    switch (actionDialog.type) {
      case "resolve":
        await resolveIncident.mutateAsync({ incidentId: actionDialog.targetId, notes: actionNotes });
        break;
      case "dismiss":
        await dismissIncident.mutateAsync({ incidentId: actionDialog.targetId, notes: actionNotes });
        break;
      case "suspend":
        await suspendUser.mutateAsync({ userId: actionDialog.targetId, reason: actionNotes });
        break;
      case "hold":
        await applyPayoutHold.mutateAsync({ userId: actionDialog.targetId, reason: actionNotes });
        break;
      case "release":
        await releasePayoutHold.mutateAsync({ userId: actionDialog.targetId, reason: actionNotes });
        break;
      case "unblock":
        await removeBlock.mutateAsync({ blockId: actionDialog.targetId, reason: actionNotes });
        break;
    }

    setActionDialog({ type: null, targetId: "" });
    setActionNotes("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trust & Safety</h1>
            <p className="text-zinc-400">Monitor incidents, fraud signals, and user moderation</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{openIncidents}</p>
                  <p className="text-xs text-zinc-500">Open Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <FileWarning className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{todayFraudSignals}</p>
                  <p className="text-xs text-zinc-500">Fraud Signals Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeHolds}</p>
                  <p className="text-xs text-zinc-500">Payout Holds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalBlocks}</p>
                  <p className="text-xs text-zinc-500">User Blocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="incidents" className="data-[state=active]:bg-zinc-800">
              Incidents
            </TabsTrigger>
            <TabsTrigger value="fraud" className="data-[state=active]:bg-zinc-800">
              Fraud Signals
            </TabsTrigger>
            <TabsTrigger value="holds" className="data-[state=active]:bg-zinc-800">
              Payout Holds
            </TabsTrigger>
            <TabsTrigger value="blocks" className="data-[state=active]:bg-zinc-800">
              Blocked Users
            </TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Incident Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {incidents.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-800" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-zinc-400">Category</TableHead>
                        <TableHead className="text-zinc-400">Severity</TableHead>
                        <TableHead className="text-zinc-400">Reporter</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Date</TableHead>
                        <TableHead className="text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.data?.map((incident) => (
                        <TableRow key={incident.id} className="border-zinc-800">
                          <TableCell className="text-white capitalize">
                            {incident.category}
                          </TableCell>
                          <TableCell>
                            <Badge className={severityColors[incident.severity] || ""}>
                              {incident.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400 capitalize">
                            {incident.reporter_role}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[incident.status] || ""}>
                              {incident.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {format(new Date(incident.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedIncident(incident.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {incident.status === "open" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-400"
                                    onClick={() => setActionDialog({ type: "resolve", targetId: incident.id })}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-zinc-400"
                                    onClick={() => setActionDialog({ type: "dismiss", targetId: incident.id })}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Signals Tab */}
          <TabsContent value="fraud">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Fraud Signals</CardTitle>
              </CardHeader>
              <CardContent>
                {fraudSignals.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-800" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-zinc-400">Event Type</TableHead>
                        <TableHead className="text-zinc-400">Severity</TableHead>
                        <TableHead className="text-zinc-400">Score</TableHead>
                        <TableHead className="text-zinc-400">Date</TableHead>
                        <TableHead className="text-zinc-400">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fraudSignals.data?.map((signal) => (
                        <TableRow key={signal.id} className="border-zinc-800">
                          <TableCell className="text-white font-mono text-sm">
                            {signal.event_type}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              signal.severity >= 4 ? "bg-red-500/20 text-red-400" :
                              signal.severity >= 3 ? "bg-orange-500/20 text-orange-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }>
                              {signal.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{signal.score}</TableCell>
                          <TableCell className="text-zinc-400">
                            {format(new Date(signal.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell className="text-zinc-400 text-sm max-w-xs truncate">
                            {JSON.stringify(signal.details).slice(0, 50)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Holds Tab */}
          <TabsContent value="holds">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Users with Payout Holds</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutHolds.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-800" />
                    ))}
                  </div>
                ) : payoutHolds.data?.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No users with payout holds</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-zinc-400">User</TableHead>
                        <TableHead className="text-zinc-400">Email</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutHolds.data?.map((user) => (
                        <TableRow key={user.id} className="border-zinc-800">
                          <TableCell className="text-white">
                            {user.full_name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={user.status === "suspended" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                              {user.status || "active"} + hold
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-400"
                                onClick={() => setActionDialog({ 
                                  type: "release", 
                                  targetId: user.user_id,
                                  targetName: user.full_name || "User"
                                })}
                              >
                                <Unlock className="w-4 h-4 mr-1" />
                                Release
                              </Button>
                              {user.status !== "suspended" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400"
                                  onClick={() => setActionDialog({ 
                                    type: "suspend", 
                                    targetId: user.user_id,
                                    targetName: user.full_name || "User"
                                  })}
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blocked Users Tab */}
          <TabsContent value="blocks">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">User Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                {blockedUsers.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-800" />
                    ))}
                  </div>
                ) : blockedUsers.data?.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No user blocks</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-zinc-400">Blocker</TableHead>
                        <TableHead className="text-zinc-400">Blocked User</TableHead>
                        <TableHead className="text-zinc-400">Reason</TableHead>
                        <TableHead className="text-zinc-400">Date</TableHead>
                        <TableHead className="text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedUsers.data?.map((block) => (
                        <TableRow key={block.id} className="border-zinc-800">
                          <TableCell className="text-white">
                            {block.blocker?.full_name || block.blocker_user_id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-white">
                            {block.blocked?.full_name || block.blocked_user_id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-zinc-400 max-w-xs truncate">
                            {block.reason || "No reason"}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {format(new Date(block.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-orange-400"
                              onClick={() => setActionDialog({ 
                                type: "unblock", 
                                targetId: block.id,
                              })}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
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

        {/* Action Dialog */}
        <Dialog 
          open={actionDialog.type !== null} 
          onOpenChange={(open) => !open && setActionDialog({ type: null, targetId: "" })}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white capitalize">
                {actionDialog.type === "resolve" && "Resolve Incident"}
                {actionDialog.type === "dismiss" && "Dismiss Incident"}
                {actionDialog.type === "suspend" && `Suspend ${actionDialog.targetName}`}
                {actionDialog.type === "hold" && `Apply Payout Hold`}
                {actionDialog.type === "release" && `Release Payout Hold`}
                {actionDialog.type === "unblock" && "Remove Block"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add notes to document this action (required for audit trail)
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Enter notes/reason for this action..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ type: null, targetId: "" })}
                className="border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={!actionNotes.trim()}
                className={
                  actionDialog.type === "dismiss" || actionDialog.type === "suspend"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Incident Detail Modal */}
        {selectedIncident && (
          <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Incident Details</DialogTitle>
              </DialogHeader>
              {(() => {
                const incident = incidents.data?.find((i) => i.id === selectedIncident);
                if (!incident) return null;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">Category</p>
                        <p className="text-white capitalize">{incident.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Severity</p>
                        <Badge className={severityColors[incident.severity] || ""}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Reporter Role</p>
                        <p className="text-white capitalize">{incident.reporter_role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Status</p>
                        <Badge className={statusColors[incident.status] || ""}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Description</p>
                      <p className="text-zinc-300 text-sm">{incident.description}</p>
                    </div>
                    {incident.resolution_notes && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Resolution Notes</p>
                        <p className="text-zinc-300 text-sm">{incident.resolution_notes}</p>
                      </div>
                    )}
                    <div className="text-xs text-zinc-500">
                      Reported: {format(new Date(incident.created_at), "PPpp")}
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default function AdminSafetyDashboardPage() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "support"]}>
      <AdminSafetyDashboard />
    </AdminProtectedRoute>
  );
}
