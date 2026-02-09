/**
 * Push Dashboard
 * Main hub for push notification management
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Plus,
  Users,
  Send,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { usePushCampaigns, usePushStats, useSegments } from "@/hooks/usePushBroadcast";
import { formatDistanceToNow } from "date-fns";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

function PushDashboardContent() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading: campaignsLoading } = usePushCampaigns();
  const { data: stats, isLoading: statsLoading } = usePushStats();
  const { data: segments } = useSegments();

  const recentCampaigns = campaigns?.slice(0, 5) || [];

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
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Push Notifications
          </h1>
          <p className="text-muted-foreground">
            Send targeted push notifications to users
          </p>
        </div>
        <Button onClick={() => navigate("/admin/push/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalSent.toLocaleString() || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.activeSegments || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Active Segments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.scheduledCampaigns || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.deliveryRate.toFixed(1) || 0}%</p>
                )}
                <p className="text-xs text-muted-foreground">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/push/segments")}>
              <Users className="h-4 w-4 mr-2" />
              Manage Segments
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/push/campaigns")}>
              <Send className="h-4 w-4 mr-2" />
              All Campaigns
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/push/campaigns/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Campaigns</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin/push/campaigns")}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No campaigns yet</p>
              <Button 
                variant="link" 
                onClick={() => navigate("/admin/push/campaigns/new")}
              >
                Create your first campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/push/campaigns/${campaign.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {campaign.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(campaign.status)}
                    <div className="text-right text-sm">
                      {campaign.status === "sent" && campaign.sent_at ? (
                        <span className="text-muted-foreground">
                          {campaign.sent_count.toLocaleString()} delivered
                        </span>
                      ) : campaign.status === "scheduled" && campaign.send_at ? (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(campaign.send_at), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segments Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Saved Segments</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin/push/segments")}
          >
            Manage
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {segments && segments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {segments.slice(0, 8).map((segment) => (
                <Badge 
                  key={segment.id} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => navigate(`/admin/push/segments?edit=${segment.id}`)}
                >
                  {segment.name}
                  <span className="ml-1 text-muted-foreground">
                    (~{segment.estimated_count})
                  </span>
                </Badge>
              ))}
              {segments.length > 8 && (
                <Badge variant="outline">+{segments.length - 8} more</Badge>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No segments created yet. Create segments to target specific user groups.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PushDashboard() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
      <PushDashboardContent />
    </AdminProtectedRoute>
  );
}
