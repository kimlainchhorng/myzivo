/**
 * Campaigns Page
 * List and manage push notification campaigns
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ArrowLeft,
  Plus,
  MoreVertical,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Ban,
  Loader2,
} from "lucide-react";
import {
  usePushCampaigns,
  useDeletePushCampaign,
  useCancelPushCampaign,
  useSendPushCampaign,
} from "@/hooks/usePushBroadcast";
import { formatDistanceToNow, format } from "date-fns";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

type StatusFilter = "all" | "draft" | "scheduled" | "sent" | "failed";

function CampaignsPageContent() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = usePushCampaigns();
  const deleteMutation = useDeletePushCampaign();
  const cancelMutation = useCancelPushCampaign();
  const sendMutation = useSendPushCampaign();

  const filteredCampaigns = campaigns?.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Sent</Badge>;
      case "scheduled":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "sending":
        return <Badge variant="default"><Send className="h-3 w-3 mr-1 animate-pulse" />Sending</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "cancelled":
        return <Badge variant="outline"><Ban className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleSendNow = async () => {
    if (!sendId) return;
    await sendMutation.mutateAsync(sendId);
    setSendId(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/push")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage push notification campaigns
          </p>
        </div>
        <Button onClick={() => navigate("/admin/push/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {statusFilter === "all" ? "All Campaigns" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Campaigns`}
            {filteredCampaigns.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({filteredCampaigns.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/admin/push/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{campaign.name}</p>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {campaign.title}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {campaign.segment && (
                        <span>Segment: {campaign.segment.name}</span>
                      )}
                      {campaign.target_type === "all" && (
                        <span>Target: All Users</span>
                      )}
                      {campaign.status === "sent" && (
                        <span>{campaign.sent_count.toLocaleString()} delivered</span>
                      )}
                      {campaign.status === "scheduled" && campaign.send_at && (
                        <span>Scheduled: {format(new Date(campaign.send_at), "PPp")}</span>
                      )}
                      <span>
                        Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/push/campaigns/${campaign.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {campaign.status === "draft" && (
                        <DropdownMenuItem onClick={() => setSendId(campaign.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </DropdownMenuItem>
                      )}
                      {campaign.status === "scheduled" && (
                        <DropdownMenuItem onClick={() => cancelMutation.mutate(campaign.id)}>
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      {["draft", "cancelled", "failed"].includes(campaign.status) && (
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(campaign.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No campaigns found</p>
              <p className="text-sm">
                {statusFilter === "all" 
                  ? "Create your first campaign to start sending push notifications"
                  : `No ${statusFilter} campaigns`}
              </p>
              <Button className="mt-4" onClick={() => navigate("/admin/push/campaigns/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign and its delivery logs will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation */}
      <AlertDialog open={!!sendId} onOpenChange={(open) => !open && setSendId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign Now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately send push notifications to all targeted users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNow}>
              {sendMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
      <CampaignsPageContent />
    </AdminProtectedRoute>
  );
}
