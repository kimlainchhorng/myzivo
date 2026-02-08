/**
 * Campaign Detail Page
 * View campaign stats, edit settings, and manage execution
 */
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Clock, Calendar, CheckCircle, Pause, Sparkles,
  Users, Bell, ShoppingCart, DollarSign, Play, Edit, Trash2,
  Send, Target, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import CampaignBuilder from "@/components/marketing/CampaignBuilder";
import { 
  useCampaign,
  useCampaignStats,
  useCampaignDeliveries,
  useDeleteCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useExecuteCampaign,
} from "@/hooks/useMarketing";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock, color: "text-gray-400" },
  scheduled: { label: "Scheduled", variant: "outline" as const, icon: Calendar, color: "text-blue-400" },
  running: { label: "Running", variant: "default" as const, icon: Sparkles, color: "text-emerald-400" },
  completed: { label: "Completed", variant: "secondary" as const, icon: CheckCircle, color: "text-white/60" },
  paused: { label: "Paused", variant: "destructive" as const, icon: Pause, color: "text-amber-400" },
};

const TYPE_LABELS = {
  promo: "Promo Campaign",
  push: "Push Notification",
  winback: "Win-back Campaign",
  restaurant_boost: "Restaurant Boost",
};

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading,
  description,
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  loading?: boolean;
  description?: string;
}) {
  return (
    <Card className="bg-zinc-900/80 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
            )}
            {description && (
              <p className="text-xs text-white/40 mt-1">{description}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

  const { data: campaign, isLoading } = useCampaign(isNew ? undefined : id);
  const { data: stats, isLoading: statsLoading } = useCampaignStats(isNew ? undefined : id);
  const { data: deliveries } = useCampaignDeliveries(isNew ? undefined : id, 20);

  const deleteMutation = useDeleteCampaign();
  const pauseMutation = usePauseCampaign();
  const resumeMutation = useResumeCampaign();
  const executeMutation = useExecuteCampaign();

  const handleDelete = () => {
    if (id && !isNew) {
      deleteMutation.mutate(id, {
        onSuccess: () => navigate("/admin/marketing/campaigns"),
      });
    }
  };

  const handleExecute = () => {
    if (id && !isNew) {
      executeMutation.mutate(id);
    }
  };

  if (isNew || isEditing) {
    return (
      <AdminProtectedRoute>
        <CampaignBuilder
          campaignId={isNew ? undefined : id}
          onClose={() => {
            if (isNew) {
              navigate("/admin/marketing/campaigns");
            } else {
              setIsEditing(false);
            }
          }}
        />
      </AdminProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-zinc-950 text-white">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (!campaign) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <Link to="/admin/marketing/campaigns">
              <Button variant="outline">Back to Campaigns</Button>
            </Link>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  const statusConfig = STATUS_CONFIG[campaign.status];
  const StatusIcon = statusConfig.icon;
  const conversionRate = stats?.conversion_rate || 0;

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-white/10 bg-zinc-900/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/admin/marketing/campaigns")}
                  className="mt-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold">{campaign.name}</h1>
                    <Badge variant={statusConfig.variant}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60">
                    {TYPE_LABELS[campaign.campaign_type]} • Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {campaign.status === "draft" && (
                  <Button onClick={handleExecute} disabled={executeMutation.isPending} className="gap-2">
                    <Send className="h-4 w-4" />
                    Launch Now
                  </Button>
                )}
                {campaign.status === "running" && (
                  <Button 
                    variant="outline" 
                    onClick={() => pauseMutation.mutate(campaign.id)}
                    disabled={pauseMutation.isPending}
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                {campaign.status === "paused" && (
                  <Button 
                    onClick={() => resumeMutation.mutate(campaign.id)}
                    disabled={resumeMutation.isPending}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                {(campaign.status === "draft" || campaign.status === "scheduled") && (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Users Targeted"
              value={(stats?.users_targeted || 0).toLocaleString()}
              icon={Target}
              loading={statsLoading}
            />
            <StatCard
              title="Notifications Sent"
              value={(stats?.notifications_sent || 0).toLocaleString()}
              icon={Bell}
              loading={statsLoading}
            />
            <StatCard
              title="Orders Generated"
              value={(stats?.orders_generated || 0).toLocaleString()}
              icon={ShoppingCart}
              loading={statsLoading}
            />
            <StatCard
              title="Revenue Impact"
              value={`$${((stats?.revenue_generated || 0) / 100).toLocaleString()}`}
              icon={DollarSign}
              loading={statsLoading}
            />
          </div>

          {/* Conversion Rate */}
          {stats && stats.notifications_sent > 0 && (
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{conversionRate.toFixed(1)}%</span>
                    <span className="text-sm text-white/60">
                      {stats.orders_generated} of {stats.notifications_sent} converted
                    </span>
                  </div>
                  <Progress value={conversionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Details */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-white/60">Notification Title</label>
                  <p className="text-white">{campaign.notification_title || "—"}</p>
                </div>
                <div>
                  <label className="text-sm text-white/60">Notification Body</label>
                  <p className="text-white">{campaign.notification_body || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Target Audience</label>
                    <p className="text-white capitalize">{campaign.target_audience.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Push Enabled</label>
                    <p className="text-white">{campaign.push_enabled ? "Yes" : "No"}</p>
                  </div>
                </div>
                {campaign.start_date && (
                  <div>
                    <label className="text-sm text-white/60">Scheduled Start</label>
                    <p className="text-white">
                      {format(new Date(campaign.start_date), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                )}
                {campaign.promo_code_id && (
                  <div>
                    <label className="text-sm text-white/60">Promo Code</label>
                    <p className="text-white">Attached</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Deliveries */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {!deliveries || deliveries.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No deliveries yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliveries.slice(0, 10).map(delivery => (
                      <div key={delivery.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-white/80 font-mono">
                            {delivery.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-white/40">
                            {format(new Date(delivery.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <Badge variant={
                          delivery.status === "converted" ? "default" :
                          delivery.status === "sent" ? "secondary" :
                          delivery.status === "failed" ? "destructive" : "outline"
                        }>
                          {delivery.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The campaign and all its delivery history will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminProtectedRoute>
  );
}
